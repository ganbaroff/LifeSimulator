import 'package:flame/game.dart';
import 'package:flutter/material.dart';

import 'game/stack_duel_game.dart';
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

  runApp(StackDuelApp(
    scoreState: scoreState,
    coinState: coinState,
    skinState: skinState,
  ));
}

class StackDuelApp extends StatelessWidget {
  const StackDuelApp({
    super.key,
    required this.scoreState,
    required this.coinState,
    required this.skinState,
  });

  final ScoreState scoreState;
  final CoinState coinState;
  final SkinState skinState;

  @override
  Widget build(BuildContext context) {
    final game = StackDuelGame(
      scoreState: scoreState,
      coinState: coinState,
      skinState: skinState,
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
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => game.overlays.remove('start'),
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
            const SizedBox(height: 40),
            const Text(
              'Tap to play',
              style: TextStyle(
                color: Color(0xFF2ECC71),
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
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
            const Text(
              'Game Over',
              style: TextStyle(
                color: Colors.white,
                fontSize: 30,
                fontWeight: FontWeight.bold,
              ),
            ),
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
            ElevatedButton(
              onPressed: game.restart,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2ECC71),
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              child: const Text('Restart', style: TextStyle(fontSize: 18)),
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
