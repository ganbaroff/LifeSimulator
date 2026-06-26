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

import 'package:stack_duel/game/ads.dart';
import 'package:stack_duel/game/falling_piece.dart';
import 'package:stack_duel/game/haptics.dart';
import 'package:stack_duel/game/sound.dart';
import 'package:stack_duel/game/stack_block.dart';
import 'package:stack_duel/game/stack_duel_game.dart';
import 'package:stack_duel/state/city_state.dart';
import 'package:stack_duel/state/coin_state.dart';
import 'package:stack_duel/state/score_state.dart';
import 'package:stack_duel/state/skin_state.dart';

/// Counts interstitial requests (no real ad SDK in tests).
class FakeAds implements Ads {
  int interstitialCount = 0;

  @override
  void showInterstitial() => interstitialCount++;
}

/// Counts sound calls (no real audio in headless tests).
class FakeSound implements Sound {
  int dropCount = 0;
  int perfectCount = 0;
  int gameOverCount = 0;
  int lastComboLevel = 0;

  @override
  Future<void> preload() async {}

  @override
  void drop() => dropCount++;

  @override
  void perfect(int comboLevel) {
    perfectCount++;
    lastComboLevel = comboLevel;
  }

  @override
  void gameOver() => gameOverCount++;
}

/// Counts haptic calls so tests can assert feedback fires on the right events
/// (without invoking a real platform channel).
class FakeHaptics implements Haptics {
  int successCount = 0;
  int perfectCount = 0;
  int gameOverCount = 0;

  @override
  void success() => successCount++;

  @override
  void perfect() => perfectCount++;

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
  late CoinState coinState;
  late SkinState skinState;
  late CityState cityState;
  late FakeHaptics haptics;
  late FakeSound sound;
  late FakeAds ads;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    scoreState = ScoreState();
    await scoreState.load();
    coinState = CoinState();
    await coinState.load();
    skinState = SkinState();
    await skinState.load();
    cityState = CityState();
    await cityState.load();
    haptics = FakeHaptics();
    sound = FakeSound();
    ads = FakeAds();
  });

  StackDuelGame create() => StackDuelGame(
        scoreState: scoreState,
        coinState: coinState,
        skinState: skinState,
        cityState: cityState,
        haptics: haptics,
        sound: sound,
        ads: ads,
      );

  testWithGame<StackDuelGame>('boots with a base + one moving block', create,
      (game) async {
    await game.ready();
    expect(_resting(game), 1, reason: 'exactly one base block');
    expect(_blocks(game).where((b) => b.moving).length, 1,
        reason: 'exactly one moving block');
    expect(scoreState.current, 0);
    expect(game.overlays.isActive('gameOver'), isFalse);
  });

  testWithGame<StackDuelGame>('skin: blocks use the selected skin palette',
      create, (game) async {
    await game.ready();
    final base = _blocks(game).firstWhere((b) => !b.moving);
    expect(base.color, skinState.palette[0],
        reason: 'block colours come from the selected skin');
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

  testWithGame<StackDuelGame>('1: a perfect drop pops combo and scores x2',
      create, (game) async {
    await game.ready();
    final m = _moving(game);
    m.position.x = _top(game).position.x; // exact centre = perfect
    game.dropBlock();
    await game.ready();

    // First perfect: combo 1 -> multiplier 2x.
    expect(scoreState.current, 2, reason: 'perfect drop scores via x2 combo');
    expect(haptics.perfectCount, 1, reason: 'perfect haptic fired');
    expect(haptics.successCount, 0, reason: 'not a plain success');
    expect(_resting(game), 2, reason: 'base + newly placed block');
    expect(_falling(game), 0, reason: 'no overhang on an exact drop');
    expect(game.overlays.isActive('gameOver'), isFalse);
  });

  testWithGame<StackDuelGame>(
      'combo: builds on consecutive perfects, resets on a non-perfect drop',
      create, (game) async {
    await game.ready();
    // Two exact (perfect) drops: +2 then +3 = 5.
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();
    expect(scoreState.current, 5, reason: '2x then 3x combo');
    expect(haptics.perfectCount, 2);

    // A clearly off-centre drop breaks the streak: +1 only.
    _moving(game).position.x = _top(game).position.x + 30; // > epsilon
    game.dropBlock();
    await game.ready();
    expect(scoreState.current, 6, reason: 'non-perfect resets combo, +1');
    expect(haptics.successCount, 1, reason: 'plain success on the broken streak');
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
      '5: a full miss ends the run; overlay is deferred + taps are debounced',
      create, (game) async {
    await game.ready();
    // The real overlay builder is supplied by GameWidget on device; register a
    // stub so the headless harness can exercise the game-over signal.
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    _moving(game).position.x = _top(game).right + 40; // no overlap at all
    game.dropBlock();
    await game.ready();

    // Death starts immediately (run over, taps blocked) but the overlay is NOT
    // shown yet — the sliced piece is still falling.
    expect(game.isGameOver, isTrue);
    expect(game.overlays.isActive('gameOver'), isFalse,
        reason: 'overlay is deferred during the ~0.6s death animation');
    expect(_falling(game), 1, reason: 'the missed piece is falling');
    expect(scoreState.current, 0, reason: 'a miss does not score');

    // A rage-tap during the death window must do nothing (no drop, no restart).
    game.dropBlock();
    await game.ready();
    expect(scoreState.current, 0, reason: 'tap is debounced while dying');

    // After the delay (0.6s) the overlay appears.
    _pump(game, 45); // 0.75s > _gameOverDelay
    await game.ready();
    expect(game.overlays.isActive('gameOver'), isTrue,
        reason: 'overlay appears after the death delay');
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
      'build badge is shown on screen (deployment proof)', create,
      (game) async {
    await game.ready();
    final texts = game.camera.viewport.children
        .whereType<TextComponent>()
        .map((t) => t.text)
        .toList();
    expect(texts.any((t) => t.startsWith('BUILD ')), isTrue,
        reason: 'a BUILD <tag> badge must be visible to confirm the build');
  });

  testWithGame<StackDuelGame>(
      'perfect restores width back (capped at base, no immortality)', create,
      (game) async {
    await game.ready();
    final base = _top(game).size.x;

    // A non-perfect drop narrows the tower.
    _moving(game).position.x = _top(game).position.x + 30;
    game.dropBlock();
    await game.ready();
    final narrowed = _top(game).size.x;
    expect(narrowed, lessThan(base), reason: 'non-perfect narrows');

    // A perfect drop grows it back a little — but never beyond the base width.
    _moving(game).position.x = _top(game).position.x; // aligned to new top centre
    game.dropBlock();
    await game.ready();
    final restored = _top(game).size.x;
    expect(restored, greaterThan(narrowed), reason: 'perfect restores width');
    expect(restored, lessThanOrEqualTo(base + 0.001),
        reason: 'restore is capped at the base width');
  });

  testWithGame<StackDuelGame>(
      'haptics: success fires on a non-perfect scoring drop, not game over',
      create, (game) async {
    await game.ready();
    _moving(game).position.x = _top(game).position.x + 30; // off-centre -> plain success
    game.dropBlock();
    await game.ready();

    expect(haptics.successCount, 1, reason: 'one success buzz per scoring drop');
    expect(haptics.perfectCount, 0);
    expect(haptics.gameOverCount, 0);
  });

  testWithGame<StackDuelGame>(
      'sound: rising perfect tone on perfect, tick on non-perfect, thud on death',
      create, (game) async {
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());

    // Perfect -> rising perfect tone keyed to combo level.
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();
    expect(sound.perfectCount, 1);
    expect(sound.lastComboLevel, 1, reason: 'pitch rises with the streak');
    expect(sound.dropCount, 0);

    // Non-perfect -> plain tick.
    _moving(game).position.x = _top(game).position.x + 30;
    game.dropBlock();
    await game.ready();
    expect(sound.dropCount, 1);

    // Miss -> game-over thud.
    _moving(game).position.x = _top(game).right + 40;
    game.dropBlock();
    await game.ready();
    expect(sound.gameOverCount, 1);
  });

  testWithGame<StackDuelGame>(
      'coins: earn one coin per perfect, banked on game over', create,
      (game) async {
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());

    _moving(game).position.x = _top(game).position.x; // perfect 1
    game.dropBlock();
    await game.ready();
    _moving(game).position.x = _top(game).position.x; // perfect 2
    game.dropBlock();
    await game.ready();
    expect(coinState.total, 0, reason: 'coins bank on game over, not mid-run');

    _moving(game).position.x = _top(game).right + 60; // miss
    game.dropBlock();
    await game.ready();
    expect(coinState.total, 2, reason: 'two perfects -> two coins');
  });

  testWithGame<StackDuelGame>(
      'ads: interstitial only every 3rd game over (not 1st/2nd)', create,
      (game) async {
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());

    Future<void> dieAndRestart() async {
      _moving(game).position.x = _top(game).right + 60;
      game.dropBlock();
      await game.ready();
      game.restart();
      await game.ready();
    }

    await dieAndRestart(); // 1st game over
    expect(ads.interstitialCount, 0);
    await dieAndRestart(); // 2nd
    expect(ads.interstitialCount, 0);
    await dieAndRestart(); // 3rd -> interstitial
    expect(ads.interstitialCount, 1);
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

  testWithGame<StackDuelGame>(
      'city: a completed run adds one building sized by tower + perfects', create,
      (game) async {
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    expect(cityState.totalBuildings, 0, reason: 'no buildings before any run');

    // Two perfect drops -> tower of base + 2 = height 3; perfects = 2.
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();
    expect(cityState.totalBuildings, 0,
        reason: 'building is banked on game over, not mid-run');

    // Miss -> run ends, building is recorded.
    _moving(game).position.x = _top(game).right + 60;
    game.dropBlock();
    await game.ready();

    expect(cityState.totalBuildings, 1, reason: 'one run -> one building');
    final b = cityState.buildings.single;
    expect(b.height, 3, reason: 'base + 2 placed blocks');
    expect(b.tier, 0, reason: '2 perfects is still tier 0 (3 perfects = tier 1)');
    expect(cityState.totalHeight, 3);
    expect(cityState.cityLevel, 'Hamlet', reason: 'height 3 is a Hamlet');
  });
}
