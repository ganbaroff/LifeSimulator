import 'package:flame/game.dart';
import 'package:flutter/material.dart';

import 'game/stack_duel_game.dart';
import 'state/score_state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load the persisted best score before the game starts.
  final scoreState = ScoreState();
  await scoreState.load();

  runApp(StackDuelApp(scoreState: scoreState));
}

class StackDuelApp extends StatelessWidget {
  const StackDuelApp({super.key, required this.scoreState});

  final ScoreState scoreState;

  @override
  Widget build(BuildContext context) {
    final game = StackDuelGame(scoreState: scoreState);

    return MaterialApp(
      title: 'Stack Duel',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: GameWidget<StackDuelGame>(
          game: game,
          overlayBuilderMap: {
            'gameOver': (context, game) => GameOverOverlay(game: game),
          },
        ),
      ),
    );
  }
}

/// Shown on game over: final score, best score, and a restart button.
class GameOverOverlay extends StatelessWidget {
  const GameOverOverlay({super.key, required this.game});

  final StackDuelGame game;

  @override
  Widget build(BuildContext context) {
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
            const SizedBox(height: 24),
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
