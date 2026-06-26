import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'game/city_overlay.dart';
import 'game/stack_duel_game.dart';
import 'state/city_state.dart';
import 'state/coin_state.dart';
import 'state/score_state.dart';
import 'state/skin_state.dart';

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

  runApp(StackDuelApp(
    scoreState: scoreState,
    coinState: coinState,
    skinState: skinState,
    cityState: cityState,
  ));
}

class StackDuelApp extends StatelessWidget {
  const StackDuelApp({
    super.key,
    required this.scoreState,
    required this.coinState,
    required this.skinState,
    required this.cityState,
  });

  final ScoreState scoreState;
  final CoinState coinState;
  final SkinState skinState;
  final CityState cityState;

  @override
  Widget build(BuildContext context) {
    final game = StackDuelGame(
      scoreState: scoreState,
      coinState: coinState,
      skinState: skinState,
      cityState: cityState,
    );

    return MaterialApp(
      title: 'Stack Duel',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: GameWidget<StackDuelGame>(
          game: game,
          initialActiveOverlays: const ['start'],
          overlayBuilderMap: {
            'start': (context, game) => StartOverlay(game: game),
            'gameOver': (context, game) => GameOverOverlay(game: game),
            'city': (context, game) => CityOverlay(game: game),
          },
        ),
      ),
    );
  }
}

/// Title screen shown on launch. Tap anywhere to start playing.
class StartOverlay extends StatelessWidget {
  const StartOverlay({super.key, required this.game});

  final StackDuelGame game;

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
      alignment: Alignment.center,
      child: Column(
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
            'STACK DUEL',
            style: TextStyle(
              color: Colors.white,
              fontSize: 40,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Best  ${game.scoreState.best}      ◆ ${game.coinState.total}',
            style: const TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 36),
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
        ],
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
    await Clipboard.setData(ClipboardData(text: game.dailyShareCard()));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Result copied — paste it into any chat!'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final skins = game.skinState;
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 28),
        decoration: BoxDecoration(
          color: const Color(0xFF11161E),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              game.isDaily ? 'Daily Done' : 'Game Over',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 30,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (game.isDaily) ...[
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
              'Coins: ${game.coinState.total}',
              style: const TextStyle(color: Color(0xFFF1C40F), fontSize: 18),
            ),
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
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (game.isDaily)
                  OutlinedButton.icon(
                    onPressed: _shareDaily,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFFF1C40F)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 12),
                    ),
                    icon: const Icon(Icons.share, size: 18),
                    label: const Text('Share', style: TextStyle(fontSize: 16)),
                  )
                else
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
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: game.restart,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2ECC71),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 28, vertical: 12),
                  ),
                  child: Text(game.isDaily ? 'Retry' : 'Restart',
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
