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
import 'package:stack_duel/game/analytics.dart';
import 'package:stack_duel/game/falling_piece.dart';
import 'package:stack_duel/game/haptics.dart';
import 'package:stack_duel/game/sound.dart';
import 'package:stack_duel/game/stack_block.dart';
import 'package:stack_duel/game/stack_duel_game.dart';
import 'package:stack_duel/state/achievements.dart';
import 'package:stack_duel/state/city_state.dart';
import 'package:stack_duel/state/crystal_state.dart';
import 'package:stack_duel/state/daily_seed.dart';
import 'package:stack_duel/state/duel.dart';
import 'package:stack_duel/state/powers.dart';
import 'package:stack_duel/state/settings_state.dart';
import 'package:stack_duel/state/streak_state.dart';
import 'package:stack_duel/state/coin_state.dart';
import 'package:stack_duel/state/score_state.dart';
import 'package:stack_duel/state/skin_state.dart';

/// Counts interstitial requests (no real ad SDK in tests).
class FakeAds implements Ads {
  int interstitialCount = 0;

  @override
  void showInterstitial() => interstitialCount++;
}

/// Records analytics events so tests can assert the funnel is instrumented.
class FakeAnalytics implements Analytics {
  final List<String> events = [];
  final Map<String, Map<String, Object?>> last = {};

  @override
  void event(String name, [Map<String, Object?> params = const {}]) {
    events.add(name);
    last[name] = params;
  }
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
  late CrystalState crystalState;
  late AchievementState achievementState;
  late StreakState streakState;
  late SettingsState settingsState;
  late FakeHaptics haptics;
  late FakeSound sound;
  late FakeAds ads;
  late FakeAnalytics analytics;

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
    crystalState = CrystalState();
    await crystalState.load();
    achievementState = AchievementState();
    await achievementState.load();
    streakState = StreakState();
    await streakState.load();
    settingsState = SettingsState();
    await settingsState.load();
    haptics = FakeHaptics();
    sound = FakeSound();
    ads = FakeAds();
    analytics = FakeAnalytics();
  });

  StackDuelGame create() => StackDuelGame(
        scoreState: scoreState,
        coinState: coinState,
        skinState: skinState,
        cityState: cityState,
        crystalState: crystalState,
        achievementState: achievementState,
        streakState: streakState,
        settingsState: settingsState,
        haptics: haptics,
        sound: sound,
        ads: ads,
        analytics: analytics,
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

    // After the death delay AND the async finalize, the overlay appears.
    // Interleave pumping with awaits so the timer counts down and the async
    // end-of-run finalize both complete.
    for (var i = 0; i < 60 && !game.overlays.isActive('gameOver'); i++) {
      _pump(game, 5);
      await game.ready();
    }
    expect(game.overlays.isActive('gameOver'), isTrue,
        reason: 'overlay appears after the death delay + finalize');
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

  testWithGame<StackDuelGame>(
      'daily: a daily config narrows the base + drives the share card', create,
      (game) async {
    await game.ready();
    final endlessBase = _top(game).size.x;
    expect(game.isDaily, isFalse);

    // Apply a deterministic "Narrow/Precise" daily and restart into it.
    game.activeDaily = const DailyConfig(
      seed: 20260101,
      modifier: 'Narrow',
      baseWidthFactor: 0.30,
      startSpeed: 200,
      speedPerPoint: 8,
      perfectEpsilon: 5,
      startRight: false,
    );
    game.restart();
    await game.ready();

    expect(game.isDaily, isTrue);
    expect(_top(game).size.x, lessThan(endlessBase),
        reason: 'narrow daily base is thinner than the default run');
    final card = game.dailyShareCard();
    expect(card, contains('Stack Daily #20260101'));
    expect(card, contains('Narrow'));

    // Returning to endless clears the daily.
    game.playEndless();
    await game.ready();
    expect(game.isDaily, isFalse);
  });

  testWithGame<StackDuelGame>(
      'duel: accepting a challenge plays the seed and builds a result + link',
      create, (game) async {
    await game.ready();
    const opponent = DuelChallenge(seed: 20260627, name: 'Alex', score: 50);

    game.playDuel(opponent);
    await game.ready();
    expect(game.isDuel, isTrue);
    expect(game.isDaily, isTrue, reason: 'duel reuses the daily seed engine');

    // Land a couple of perfect drops to put points on the board.
    _moving(game).position.x = _top(game).position.x;
    game.dropBlock();
    await game.ready();

    // The challenge-back link is a duel link carrying THIS run's seed.
    final link = game.duelLink();
    expect(link, contains('?duel='));
    final back = decodeDuel(Uri.parse(link).queryParameters['duel']!);
    expect(back, isNotNull);
    expect(back!.seed, 20260627, reason: 'rematch is on the same seed');

    // Verdict reflects our score vs the opponent's.
    expect(game.duelResult(), contains('Alex'));

    // Endless clears the duel.
    game.playEndless();
    await game.ready();
    expect(game.isDuel, isFalse);
  });

  testWithGame<StackDuelGame>(
      'powers: fresh city unlocks only Widen, which restores full width', create,
      (game) async {
    await game.ready();
    expect(game.powerDeck.length, 1, reason: 'fresh city: Widen only');
    expect(game.powerDeck.single.id, PowerId.widen);
    expect(game.chargesOf(PowerId.widen), 1);
    expect(game.powersVisible, isTrue, reason: 'bar shown during a run');
    final base = _top(game).size.x;

    // Arm Widen, then make an off-centre drop that would normally narrow.
    expect(game.activatePower(PowerId.widen), isTrue);
    expect(game.chargesOf(PowerId.widen), 0);
    expect(game.activatePower(PowerId.widen), isFalse, reason: 'no charge left');

    _moving(game).position.x = _top(game).position.x + 30; // off-centre
    game.dropBlock();
    await game.ready();
    expect(_top(game).size.x, closeTo(base, 0.5),
        reason: 'Widen snapped the block back to full base width');
  });

  testWithGame<StackDuelGame>(
      'powers: a grown city unlocks Perfect, which auto-centres a drop', create,
      (game) async {
    // Grow the city so the prestige power unlocks (height >= 150).
    await cityState.addBuilding(200, 12);
    game.restart();
    await game.ready();

    expect(game.powerDeck.length, 4,
        reason: 'slow-mo + shield + perfect now unlocked');
    expect(game.powerDeck.map((p) => p.id), contains(PowerId.autocenter));
    expect(game.powerDeck.map((p) => p.id), contains(PowerId.shield));

    // Arm Perfect, then deliberately drop off-centre — it should still be perfect.
    expect(game.activatePower(PowerId.autocenter), isTrue);
    _moving(game).position.x = _top(game).position.x + 30; // would miss centre
    game.dropBlock();
    await game.ready();
    expect(scoreState.current, 2, reason: 'auto-centre forced a x2 perfect');
    expect(haptics.perfectCount, 1);

    // Power bar hides once the run is over.
    _moving(game).position.x = _top(game).right + 60;
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    game.dropBlock();
    await game.ready();
    expect(game.powersVisible, isFalse, reason: 'no powers after game over');
  });

  testWithGame<StackDuelGame>(
      'powers: Shield survives one full miss, then the run can still end', create,
      (game) async {
    await cityState.addBuilding(200, 12); // unlock shield (height >= 70)
    game.restart();
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    expect(game.powerDeck.map((p) => p.id), contains(PowerId.shield));

    expect(game.activatePower(PowerId.shield), isTrue);

    // A full miss that would normally end the run.
    _moving(game).position.x = _top(game).right + 80;
    game.dropBlock();
    await game.ready();
    expect(game.isGameOver, isFalse, reason: 'shield saved the run');
    expect(game.runActive, isTrue);
    expect(_blocks(game).where((b) => b.moving).length, 1,
        reason: 'a fresh block to keep playing');

    // Shield is spent — the next full miss really ends it.
    _moving(game).position.x = _top(game).right + 80;
    game.dropBlock();
    await game.ready();
    expect(game.isGameOver, isTrue);
  });

  testWithGame<StackDuelGame>(
      'revive: spends crystals to continue the same run', create, (game) async {
    await crystalState.add(10);
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());

    // End the run.
    _moving(game).position.x = _top(game).right + 80;
    game.dropBlock();
    await game.ready();
    expect(game.isGameOver, isTrue);
    expect(game.canRevive, isTrue, reason: '10 crystals >= revive cost');
    final cost = game.reviveCost;

    final ok = await game.revive();
    expect(ok, isTrue);
    expect(game.crystalState.total, 10 - cost, reason: 'crystals spent');
    expect(game.isGameOver, isFalse, reason: 'run continues');
    expect(game.runActive, isTrue);
  });

  testWithGame<StackDuelGame>(
      'revive: the run gets full credit (coins + taller building) after reviving',
      create, (game) async {
    await crystalState.add(10);
    await game.ready();
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());

    // Segment 1: three perfects, then a miss (first death).
    for (var i = 0; i < 3; i++) {
      _moving(game).position.x = _top(game).position.x;
      game.dropBlock();
      await game.ready();
    }
    _moving(game).position.x = _top(game).right + 80;
    game.dropBlock();
    await game.ready();
    expect(coinState.total, 3, reason: 'first death banks 3 perfect-coins');
    expect(cityState.totalBuildings, 1);
    final firstHeight = cityState.buildings.single.height;

    // Revive and climb further: three more perfects, then the final miss.
    expect(await game.revive(), isTrue);
    await game.ready(); // let the revived moving block mount
    for (var i = 0; i < 3; i++) {
      _moving(game).position.x = _top(game).position.x;
      game.dropBlock();
      await game.ready();
    }
    _moving(game).position.x = _top(game).right + 80;
    game.dropBlock();
    await game.ready();

    // The run is credited for ALL of it: 6 coins, ONE building, taller than before.
    expect(coinState.total, 6, reason: 'delta coins topped up after revive');
    expect(cityState.totalBuildings, 1, reason: 'still one building for the run');
    expect(cityState.buildings.single.height, greaterThan(firstHeight),
        reason: 'building grew to the final tower height');
  });

  testWithGame<StackDuelGame>(
      'tutorial: first run shows the tap hint, then is marked done', create,
      (game) async {
    await game.ready();
    expect(settingsState.tutorialDone, isFalse);
    final hints = game.camera.viewport.children
        .whereType<TextComponent>()
        .map((t) => t.text)
        .toList();
    expect(hints.any((t) => t.contains('TAP')), isTrue,
        reason: 'first-run tap hint is shown');

    // End the first run -> tutorial is marked done (next run is normal).
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());
    _moving(game).position.x = _top(game).right + 80;
    game.dropBlock();
    await game.ready();
    expect(settingsState.tutorialDone, isTrue);
  });

  testWithGame<StackDuelGame>(
      'analytics: the funnel events fire with props (Sprint 2)', create,
      (game) async {
    await game.ready();
    expect(analytics.events, contains('app_open'));
    game.overlays.addEntry('gameOver', (_, __) => const SizedBox.shrink());

    _moving(game).position.x = _top(game).position.x; // perfect
    game.dropBlock();
    await game.ready();
    expect(analytics.events, contains('first_perfect'));

    _moving(game).position.x = _top(game).right + 80; // miss -> run ends
    game.dropBlock();
    await game.ready();
    expect(analytics.events, contains('game_over'));
    expect(analytics.last['game_over']!['mode'], 'endless');
    expect(analytics.last['game_over']!.containsKey('perfects'), isTrue);
    expect(analytics.events, contains('tutorial_done'),
        reason: 'first-ever run reports tutorial_done');
  });

  testWithGame<StackDuelGame>(
      'telegram: a duel link carries the real player name (Sprint 3)', create,
      (game) async {
    await game.ready();
    game.playerName = 'Yusif';
    game.activeDaily = DailyConfig.fromSeed(20260628);
    final back = decodeDuel(Uri.parse(game.duelLink()).queryParameters['duel']!);
    expect(back, isNotNull);
    expect(back!.name, 'Yusif', reason: 'no more anonymous "a friend"');
  });

  testWithGame<StackDuelGame>(
      'mute: a muted run plays no sound but still buzzes', create, (game) async {
    await game.ready();
    await game.settingsState.setMuted(true);

    _moving(game).position.x = _top(game).position.x; // perfect
    game.dropBlock();
    await game.ready();
    expect(sound.perfectCount, 0, reason: 'muted: no perfect tone');
    expect(haptics.perfectCount, 1, reason: 'haptics fire regardless of mute');
  });
}
