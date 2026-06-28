import 'dart:async';

import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Conditional import: real PostHog on web, no-op stub in tests / VM.
import 'game/posthog_bridge_stub.dart'
    if (dart.library.js_interop) 'game/posthog_bridge_web.dart';

import 'game/achievements_overlay.dart';
import 'game/analytics_posthog.dart';
import 'game/city_overlay.dart';
import 'game/leaderboard_overlay.dart';
import 'game/stack_duel_game.dart';
import 'game/telegram_bridge.dart';
import 'state/achievements.dart';
import 'state/city_state.dart';
import 'state/coin_state.dart';
import 'state/crystal_state.dart';
import 'state/duel.dart';
import 'state/score_state.dart';
import 'state/settings_state.dart';
import 'state/skin_state.dart';
import 'state/streak_state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load persisted progress before the game starts.
  final scoreState = ScoreState();
  await scoreState.load();
  final coinState = CoinState();
  await coinState.load();
  final skinState = SkinState();
  await skinState.load();
  final cityState = CityState();
  await cityState.load();
  final crystalState = CrystalState();
  await crystalState.load();
  final achievementState = AchievementState();
  await achievementState.load();
  final streakState = StreakState();
  await streakState.load();
  final settingsState = SettingsState();
  await settingsState.load();

  // If the page was opened from a duel link (?duel=token), decode the challenge.
  DuelChallenge? incomingDuel;
  try {
    final token = Uri.base.queryParameters['duel'];
    if (token != null && token.isNotEmpty) incomingDuel = decodeDuel(token);
  } catch (_) {}

  // Referral: detect incoming ref code from Telegram start_param or ?ref= URL
  // param. Grant +3 💎 crystals to the new player exactly once (C3 fix).
  String incomingRefCode = '';
  try {
    incomingRefCode = telegramStartParam(); // Telegram Mini App deep link
    if (incomingRefCode.isEmpty) {
      incomingRefCode = Uri.base.queryParameters['ref'] ?? '';
    }
  } catch (_) {}
  if (incomingRefCode.startsWith('ref_') && !settingsState.referralGranted) {
    await crystalState.add(3);
    await settingsState.markReferralGranted();
  }

  // Crash reporting (AUDIT H3): wire Flutter errors + uncaught async errors
  // to PostHog so soft-launch issues are visible without a native crash reporter.
  FlutterError.onError = (FlutterErrorDetails d) {
    posthogException(d.exceptionAsString(), d.stack?.toString() ?? '');
  };

  final tgUserId = telegramUserId();

  runZonedGuarded(
    () => runApp(StackDuelApp(
      scoreState: scoreState,
      coinState: coinState,
      skinState: skinState,
      cityState: cityState,
      crystalState: crystalState,
      achievementState: achievementState,
      streakState: streakState,
      settingsState: settingsState,
      incomingDuel: incomingDuel,
      incomingRefCode: incomingRefCode,
      tgUserId: tgUserId,
    )),
    (error, stack) => posthogException(error.toString(), stack.toString()),
  );
}

class StackDuelApp extends StatelessWidget {
  const StackDuelApp({
    super.key,
    required this.scoreState,
    required this.coinState,
    required this.skinState,
    required this.cityState,
    required this.crystalState,
    required this.achievementState,
    required this.streakState,
    required this.settingsState,
    this.incomingDuel,
    this.incomingRefCode = '',
    this.tgUserId = '',
  });

  final ScoreState scoreState;
  final CoinState coinState;
  final SkinState skinState;
  final CityState cityState;
  final CrystalState crystalState;
  final AchievementState achievementState;
  final StreakState streakState;
  final SettingsState settingsState;
  final DuelChallenge? incomingDuel;
  /// Non-empty when the app was opened via a referral link (C3).
  final String incomingRefCode;
  /// Telegram user id string — passed through so invite links use the real id.
  final String tgUserId;

  @override
  Widget build(BuildContext context) {
    final game = StackDuelGame(
      scoreState: scoreState,
      coinState: coinState,
      skinState: skinState,
      cityState: cityState,
      crystalState: crystalState,
      achievementState: achievementState,
      streakState: streakState,
      settingsState: settingsState,
      analytics: const PostHogAnalytics(),
    )..playerName = telegramUserName();

    // Track referral open so the funnel is visible in PostHog (C3).
    if (incomingRefCode.isNotEmpty) {
      game.analytics.event('referral_open', {'ref': incomingRefCode});
    }

    return MaterialApp(
      title: 'Stack City',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: GameWidget<StackDuelGame>(
          game: game,
          initialActiveOverlays: const ['start'],
          overlayBuilderMap: {
            'start': (context, game) => StartOverlay(
                  game: game,
                  duel: incomingDuel,
                  showReferralBonus: incomingRefCode.isNotEmpty &&
                      settingsState.referralGranted,
                  tgUserId: tgUserId,
                ),
            'gameOver': (context, game) => GameOverOverlay(game: game),
            'city': (context, game) => CityOverlay(game: game),
            'achievements': (context, game) => AchievementsOverlay(game: game),
            'leaderboard': (context, game) => LeaderboardOverlay(game: game),
          },
        ),
      ),
    );
  }
}

/// Title screen shown on launch: Play, Daily Challenge, and — if the page was
/// opened from a duel link — an Accept-the-duel banner.
class StartOverlay extends StatefulWidget {
  const StartOverlay({
    super.key,
    required this.game,
    this.duel,
    this.showReferralBonus = false,
    this.tgUserId = '',
  });

  final StackDuelGame game;
  final DuelChallenge? duel;
  /// True when the player just got +3 💎 from a referral link (C3).
  final bool showReferralBonus;
  /// Telegram user id for building outbound referral links (C3).
  final String tgUserId;

  @override
  State<StartOverlay> createState() => _StartOverlayState();
}

class _StartOverlayState extends State<StartOverlay> {
  StackDuelGame get game => widget.game;
  DuelChallenge? get duel => widget.duel;

  Future<void> _shareInvite() async {
    game.analytics.event('invite_share', {});
    final link = game.referralLink(tgUserId: widget.tgUserId);
    final text = game.referralShareText();
    final shared = telegramShare(link, text);
    if (shared) return;
    await Clipboard.setData(ClipboardData(text: '$text\n$link'));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Invite link copied — share it in any chat!'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Absorb background taps so they don't fall through to the running game
    // (only the buttons should act).
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {},
      child: Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF243B55), Color(0xFF0A0E15)],
        ),
      ),
      child: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight - 40),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Three stacked bars echoing the game's tower (slightly offset).
          Container(width: 120, height: 26, color: const Color(0xFFE74C3C)),
          Container(
            width: 150,
            height: 26,
            margin: const EdgeInsets.only(top: 3, left: 30),
            color: const Color(0xFFE67E22),
          ),
          Container(
            width: 132,
            height: 26,
            margin: const EdgeInsets.only(top: 3),
            color: const Color(0xFFF1C40F),
          ),
          const SizedBox(height: 28),
          const Text(
            'STACK CITY',
            style: TextStyle(
              color: Colors.white,
              fontSize: 40,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Best  ${game.scoreState.best}      ◆ ${game.coinState.total}      💎 ${game.crystalState.total}',
            style: const TextStyle(color: Colors.white70, fontSize: 16),
          ),
          // Always show streak — contextual text nudges new players (H6 fix).
          const SizedBox(height: 6),
          Text(
            game.streakState.current > 0
                ? '🔥 ${game.streakState.current}-day streak'
                : 'Play daily to build a streak 🔥',
            style: const TextStyle(color: Color(0xFFE67E22), fontSize: 14),
          ),
          // Referral bonus banner — shown once when a new player opens via an
          // invite link and the crystals have been granted (C3).
          if (widget.showReferralBonus) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0D2B18),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF2ECC71), width: 1.5),
              ),
              child: const Text(
                '🎁 +3 💎 bonus crystals — thanks for joining!',
                style: TextStyle(color: Color(0xFF2ECC71), fontSize: 14),
                textAlign: TextAlign.center,
              ),
            ),
          ],
          const SizedBox(height: 28),
          // Incoming duel: prominent Accept banner.
          if (duel != null) ...[
            Container(
              margin: const EdgeInsets.only(bottom: 18),
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFF2A1E12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1C40F), width: 2),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '⚔️ ${duelDisplayName(duel!.name)} challenged you!',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Beat their score of ${duel!.score} on the same run',
                    style: const TextStyle(
                        color: Colors.white70, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => game.playDuel(duel!),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF1C40F),
                      foregroundColor: Colors.black,
                      minimumSize: const Size(200, 48),
                    ),
                    child: const Text('Accept Duel',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
          ElevatedButton(
            onPressed: game.playEndless,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2ECC71),
              foregroundColor: Colors.white,
              minimumSize: const Size(220, 52),
            ),
            child: const Text('Play',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 14),
          OutlinedButton(
            onPressed: game.playDaily,
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: const BorderSide(color: Color(0xFFF1C40F), width: 2),
              minimumSize: const Size(220, 52),
            ),
            child: const Text('Daily Challenge',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          ),
          if (game.cityState.totalBuildings > 0) ...[
            const SizedBox(height: 22),
            GestureDetector(
              onTap: () => game.overlays.add('city'),
              child: Text(
                'View City  ·  ${game.cityState.cityLevel}',
                style: const TextStyle(
                  color: Color(0xFF3498DB),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
          const SizedBox(height: 14),
          GestureDetector(
            onTap: () => game.overlays.add('leaderboard'),
            child: const Text(
              '🥇 Daily Leaderboard',
              style: TextStyle(
                color: Color(0xFF3498DB),
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: () => game.overlays.add('achievements'),
            child: Text(
              '🏆 Achievements  ${game.achievementState.count}/${kAchievements.length}',
              style: const TextStyle(
                color: Color(0xFFF1C40F),
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Invite button — the viral referral hook (C3).
          GestureDetector(
            onTap: _shareInvite,
            child: const Text(
              '🎁 Invite friends  (+💎 for them)',
              style: TextStyle(
                color: Color(0xFF2ECC71),
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 14),
          StatefulBuilder(
            builder: (context, setLocal) => GestureDetector(
              onTap: () => setLocal(
                  () => game.settingsState.setMuted(!game.settingsState.muted)),
              child: Text(
                game.settingsState.muted ? '🔇 Sound: Off' : '🔊 Sound: On',
                style: const TextStyle(color: Colors.white54, fontSize: 14),
              ),
            ),
          ),
                ],
              ),
            ),
          ),
        ),
      ),
      ),
    );
  }
}

/// Shown on game over: score, best, coins, a skins picker, and Restart.
class GameOverOverlay extends StatefulWidget {
  const GameOverOverlay({super.key, required this.game});

  final StackDuelGame game;

  @override
  State<GameOverOverlay> createState() => _GameOverOverlayState();
}

class _GameOverOverlayState extends State<GameOverOverlay> {
  StackDuelGame get game => widget.game;

  Future<void> _tapSkin(int index) async {
    final skins = game.skinState;
    if (skins.isOwned(index)) {
      await skins.select(index);
    } else {
      final bought = await skins.buy(index, game.coinState);
      if (bought) await skins.select(index);
    }
    if (mounted) setState(() {});
  }

  Future<void> _shareDaily() async {
    game.analytics.event('share', {'mode': game.isDuel ? 'duel' : 'daily'});
    // Inside Telegram: open the native chat picker. Elsewhere: copy to clipboard.
    final shared = telegramShare(game.duelLink(), game.dailyShareText());
    if (shared) return;
    await Clipboard.setData(ClipboardData(text: game.dailyShareCard()));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Result copied — paste it into any chat!'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  // C2 fix: endless mode now creates a challenge using today's daily seed so
  // the primary Play button is no longer a social dead-end.
  Future<void> _shareEndless() async {
    game.analytics.event('share', {'mode': 'endless'});
    final link = game.endlessChallengeLink();
    final text = game.endlessDuelShareText();
    final shared = telegramShare(link, text);
    if (shared) return;
    await Clipboard.setData(ClipboardData(text: '$text\nChallenge me 👉 $link'));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Challenge copied — paste into any chat!'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final skins = game.skinState;
    return Center(
      child: ConstrainedBox(
        // Cap the card height so a tall result (many achievement toasts + revive
        // + skins) scrolls inside the card instead of overflowing the screen.
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.92,
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
          decoration: BoxDecoration(
            color: const Color(0xFF11161E),
            borderRadius: BorderRadius.circular(16),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
            Text(
              game.isDuel
                  ? 'Duel Done'
                  : (game.isDaily ? 'Daily Done' : 'Game Over'),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 30,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (game.isDuel) ...[
              const SizedBox(height: 8),
              Text(
                game.duelResult(),
                style: TextStyle(
                  color: game.scoreState.current > game.activeOpponent!.score
                      ? const Color(0xFF2ECC71)
                      : (game.scoreState.current == game.activeOpponent!.score
                          ? Colors.white
                          : const Color(0xFFE74C3C)),
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ] else if (game.isDaily) ...[
              const SizedBox(height: 6),
              Text(
                'Daily ${game.activeDaily!.label}  ·  ${game.activeDaily!.modifier}',
                style: const TextStyle(color: Color(0xFFF1C40F), fontSize: 14),
              ),
            ],
            const SizedBox(height: 16),
            Text(
              'Score: ${game.scoreState.current}',
              style: const TextStyle(color: Colors.white, fontSize: 22),
            ),
            const SizedBox(height: 6),
            Text(
              'Best: ${game.scoreState.best}',
              style: const TextStyle(color: Colors.white70, fontSize: 18),
            ),
            const SizedBox(height: 6),
            Text(
              'Coins: ${game.coinState.total}      💎 ${game.crystalState.total}',
              style: const TextStyle(color: Color(0xFFF1C40F), fontSize: 18),
            ),
            // Freshly-unlocked achievements (with their crystal payouts).
            if (game.lastUnlocked.isNotEmpty) ...[
              const SizedBox(height: 12),
              for (final a in game.lastUnlocked)
                Text('🏆 ${a.glyph} ${a.name}  +💎${a.reward}',
                    style: const TextStyle(
                        color: Color(0xFF2ECC71),
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
            ],
            // Revive: spend crystals to continue this run (the monetization hook).
            if (game.canRevive) ...[
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () async {
                  await game.revive();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE74C3C),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(220, 48),
                ),
                icon: const Icon(Icons.favorite, size: 18),
                label: Text('Revive  💎${game.reviveCost}',
                    style: const TextStyle(
                        fontSize: 17, fontWeight: FontWeight.bold)),
              ),
            ],
            const SizedBox(height: 18),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < SkinState.skins.length; i++)
                  _SkinChip(
                    skin: SkinState.skins[i],
                    owned: skins.isOwned(i),
                    selected: skins.selected == i,
                    onTap: () => _tapSkin(i),
                  ),
              ],
            ),
            const SizedBox(height: 22),
            Wrap(
              spacing: 12,
              runSpacing: 10,
              alignment: WrapAlignment.center,
              children: [
                if (game.isDaily || game.isDuel)
                  OutlinedButton.icon(
                    onPressed: _shareDaily,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFFF1C40F)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 12),
                    ),
                    icon: const Icon(Icons.share, size: 18),
                    label: Text(game.isDuel ? 'Challenge back' : 'Share',
                        style: const TextStyle(fontSize: 16)),
                  )
                else ...[
                  // Endless game-over: surface the challenge/viral loop (C2 fix).
                  OutlinedButton.icon(
                    onPressed: _shareEndless,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFFF1C40F)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 12),
                    ),
                    icon: const Icon(Icons.share, size: 18),
                    label: const Text('Challenge friends',
                        style: TextStyle(fontSize: 16)),
                  ),
                  OutlinedButton(
                    onPressed: () => game.overlays.add('city'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFF3498DB)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                    ),
                    child: Text('View City  (${game.cityState.totalBuildings})',
                        style: const TextStyle(fontSize: 16)),
                  ),
                ],
                if (game.isDaily && !game.isDuel)
                  OutlinedButton(
                    onPressed: () => game.overlays.add('leaderboard'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFF3498DB)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 12),
                    ),
                    child: const Text('🥇 Ranks',
                        style: TextStyle(fontSize: 16)),
                  ),
                ElevatedButton(
                  onPressed: game.restart,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2ECC71),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 28, vertical: 12),
                  ),
                  child: Text(game.isDaily || game.isDuel ? 'Retry' : 'Restart',
                      style: const TextStyle(fontSize: 18)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: game.goHome,
              child: const Text('Home',
                  style: TextStyle(color: Colors.white54, fontSize: 14)),
            ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// A tappable skin swatch: select if owned, buy (with coins) if not.
class _SkinChip extends StatelessWidget {
  const _SkinChip({
    required this.skin,
    required this.owned,
    required this.selected,
    required this.onTap,
  });

  final Skin skin;
  final bool owned;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          children: [
            Container(
              width: 52,
              height: 36,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: selected ? Colors.white : Colors.transparent,
                  width: 2,
                ),
              ),
              clipBehavior: Clip.antiAlias,
              child: Row(
                children: [
                  for (final c in skin.palette.take(3))
                    Expanded(child: Container(color: c)),
                ],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              skin.name,
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
            Text(
              selected ? 'Selected' : (owned ? 'Owned' : '${skin.cost}c'),
              style: TextStyle(
                color: selected
                    ? Colors.white
                    : (owned ? Colors.white54 : const Color(0xFFF1C40F)),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
