// Headless runtime verification for Stack Duel.
//
// This is NOT a device run — there is no touchscreen and no Android here — but
// it mounts the real FlameGame and drives the real component loop (spawn, drop,
// slice, camera, restart) so the runtime wiring is exercised, not just compiled.
// Touch *delivery* through the OS is the one thing only a real device proves.
//
//   flutter test
//
// Maps to the five Day-1 checks:
//   1. tap input pathway works           -> dropBlock places a block; full-screen
//                                            TapCallbacks layer is mounted.
//   2. camera follows the tower           -> viewfinder scrolls up as tower grows.
//   3. restart resets state cleanly       -> tower back to one base, score 0.
//   4. falling slice pieces render/clean  -> overhang spawns a FallingPiece that
//                                            falls and removes itself.
//   5. game-over overlay only after miss  -> overlay absent on success, present
//                                            only after a real miss.

import 'package:flame/components.dart';
import 'package:flame_test/flame_test.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:stack_duel/game/falling_piece.dart';
import 'package:stack_duel/game/haptics.dart';
import 'package:stack_duel/game/stack_block.dart';
import 'package:stack_duel/game/stack_duel_game.dart';
import 'package:stack_duel/state/score_state.dart';

/// Counts haptic calls so tests can assert feedback fires on the right events
/// (without invoking a real platform channel).
class FakeHaptics implements Haptics {
  int successCount = 0;
  int gameOverCount = 0;

  @override
  void success() => successCount++;

  @override
  void gameOver() => gameOverCount++;
}

List<StackBlock> _blocks(StackDuelGame g) =>
    g.world.children.whereType<StackBlock>().toList();

StackBlock _moving(StackDuelGame g) => _blocks(g).firstWhere((b) => b.moving);

/// Highest resting block (smallest Y) = current tower top.
StackBlock _top(StackDuelGame g) => _blocks(g)
    .where((b) => !b.moving)
    .reduce((a, b) => a.position.y <= b.position.y ? a : b);

int _resting(StackDuelGame g) => _blocks(g).where((b) => !b.moving).length;

int _falling(StackDuelGame g) =>
    g.world.children.whereType<FallingPiece>().length;

void _pump(StackDuelGame g, int frames) {
  for (var i = 0; i < frames; i++) {
    g.update(1 / 60);
  }
}

void main() {
  late ScoreState scoreState;
  late FakeHaptics haptics;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    scoreState = ScoreState();
    await scoreState.load();
    haptics = FakeHaptics();
  });

  StackDuelGame create() =>
      StackDuelGame(scoreState: scoreState, haptics: haptics);

  testWithGame<StackDuelGame>('boots with a base + one moving block', create,
      (game) async {
    await game.ready();
    expect(_resting(game), 1, reason: 'exactly one base block');
    expect(_blocks(game).where((b) => b.moving).length, 1,
        reason: 'exactly one moving block');
    expect(scoreState.current, 0);
    expect(game.overlays.isActive('gameOver'), isFalse);
  });

  testWithGame<StackDuelGame>(
      '1: full-screen tap input layer is mounted in the viewport', create,
      (game) async {
    await game.ready();
    final fullScreen = game.camera.viewport.children
        .whereType<PositionComponent>()
        .where((c) =>
            (c.size.x - game.size.x).abs() < 0.5 &&
            (c.size.y - game.size.y).abs() < 0.5)
        .toList();
    expect(fullScreen, isNotEmpty,
        reason: 'a viewport-sized component must catch taps anywhere');
  });

  testWithGame<StackDuelGame>('1: a perfectly aligned drop scores and stacks',
      create, (game) async {
    await game.ready();
    final m = _moving(game);
    m.position.x = _top(game).position.x; // perfect alignment
    game.dropBlock();
    await game.ready();

    expect(scoreState.current, 1, reason: 'successful drop scores +1');
    expect(_resting(game), 2, reason: 'base + newly placed block');
    expect(_falling(game), 0, reason: 'no overhang on a perfect drop');
    expect(game.overlays.isActive('gameOver'), isFalse);
  });

  testWithGame<StackDuelGame>(
      '4: an offset drop spawns a falling piece that cleans itself up', create,
      (game) async {
    await game.ready();
    final top = _top(game);
    _moving(game).position.x = top.position.x + 12; // partial overlap
    game.dropBlock();
    await game.ready();

    expect(scoreState.current, 1);
    expect(_falling(game), 1, reason: 'overhang becomes a falling piece');

    _pump(game, 150); // ~2.5s: piece falls past removeBelowY
    await game.ready();
    expect(_falling(game), 0, reason: 'falling piece removes itself off-screen');
  });

  testWithGame<StackDuelGame>('2: camera scrolls up as the tower grows', create,
      (game) async {
    await game.ready();
    final startY = game.camera.viewfinder.position.y;

    for (var i = 0; i < 4; i++) {
      _moving(game).position.x = _top(game).position.x; // keep stacking
      game.dropBlock();
      await game.ready();
      _pump(game, 40); // let the camera lerp toward its target
    }

    expect(game.camera.viewfinder.position.y, lessThan(startY),
        reason: 'up is -Y; camera must move up as blocks are added');
  });

  testWithGame<StackDuelGame>(
      '5: a full miss ends the run and shows the overlay', create,
      (game) async {
    await game.ready();
    // The real overlay builder is supplied by GameWidget on device; register a
    // stub so the headless harness can exercise the game-over signal.
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    final top = _top(game);
    _moving(game).position.x = top.right + 40; // no overlap at all
    game.dropBlock();
    await game.ready();

    expect(game.isGameOver, isTrue);
    expect(game.overlays.isActive('gameOver'), isTrue);
    expect(scoreState.current, 0, reason: 'a miss does not score');
  });

  testWithGame<StackDuelGame>('3: restart resets to a single base block', create,
      (game) async {
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    // Stack a couple, then miss to reach game over.
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();
    _moving(game).position.x = _top(game).right + 40;
    game.dropBlock();
    await game.ready();
    expect(game.isGameOver, isTrue);

    game.restart();
    await game.ready();

    expect(scoreState.current, 0, reason: 'score reset');
    expect(game.isGameOver, isFalse);
    expect(game.overlays.isActive('gameOver'), isFalse);
    expect(_resting(game), 1, reason: 'tower back to a single base');
    expect(_blocks(game).where((b) => b.moving).length, 1);
    expect(_falling(game), 0);
  });

  testWithGame<StackDuelGame>(
      'haptics: success fires on a scoring drop, not game over', create,
      (game) async {
    await game.ready();
    _moving(game).position.x = _top(game).position.x; // aligned -> scores
    game.dropBlock();
    await game.ready();

    expect(haptics.successCount, 1, reason: 'one success buzz per scoring drop');
    expect(haptics.gameOverCount, 0);
  });

  testWithGame<StackDuelGame>(
      'haptics: game over fires on a miss, not success', create, (game) async {
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    _moving(game).position.x = _top(game).right + 40; // no overlap -> miss
    game.dropBlock();
    await game.ready();

    expect(haptics.gameOverCount, 1, reason: 'one heavy buzz on death');
    expect(haptics.successCount, 0, reason: 'a miss is not a success');
  });
}
