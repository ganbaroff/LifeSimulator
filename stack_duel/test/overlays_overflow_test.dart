// Widget render tests for the Start + Game-Over overlays on a SHORT screen.
//
// These overlays grew a lot (duel banner, streak, achievement toasts, revive,
// skins). A non-scrollable Column would RenderFlex-overflow on a short viewport;
// these tests pump the FULLEST version of each on a small surface and assert no
// FlutterError — the proof that the scroll wrappers fixed it.
//
//   flutter test test/overlays_overflow_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:stack_duel/game/achievements_overlay.dart';
import 'package:stack_duel/game/leaderboard_overlay.dart';
import 'package:stack_duel/main.dart';
import 'package:stack_duel/game/stack_duel_game.dart';
import 'package:stack_duel/state/achievements.dart';
import 'package:stack_duel/state/city_state.dart';
import 'package:stack_duel/state/coin_state.dart';
import 'package:stack_duel/state/crystal_state.dart';
import 'package:stack_duel/state/duel.dart';
import 'package:stack_duel/state/score_state.dart';
import 'package:stack_duel/state/settings_state.dart';
import 'package:stack_duel/state/skin_state.dart';
import 'package:stack_duel/state/streak_state.dart';

Future<StackDuelGame> _game() async {
  SharedPreferences.setMockInitialValues({});
  final score = ScoreState();
  await score.load();
  final coin = CoinState();
  await coin.load();
  final skin = SkinState();
  await skin.load();
  final city = CityState();
  await city.load();
  final crystal = CrystalState();
  await crystal.load();
  final ach = AchievementState();
  await ach.load();
  final streak = StreakState();
  await streak.load();
  final settings = SettingsState();
  await settings.load();
  return StackDuelGame(
    scoreState: score,
    coinState: coin,
    skinState: skin,
    cityState: city,
    crystalState: crystal,
    achievementState: ach,
    streakState: streak,
    settingsState: settings,
  );
}

void main() {
  // A deliberately SHORT screen, where a non-scrollable column would overflow.
  setUp(() {
    final view = TestWidgetsFlutterBinding.ensureInitialized()
        .platformDispatcher
        .views
        .first;
    view.physicalSize = const Size(360, 520);
    view.devicePixelRatio = 1.0;
  });
  tearDown(() {
    final view = TestWidgetsFlutterBinding.ensureInitialized()
        .platformDispatcher
        .views
        .first;
    view.resetPhysicalSize();
    view.resetDevicePixelRatio();
  });

  testWidgets('StartOverlay with duel + streak + city + achievements fits',
      (tester) async {
    final game = await _game();
    await game.cityState.addBuilding(40, 6); // enables the View City link
    game.streakState.current = 7; // streak row
    const duel = DuelChallenge(seed: 20260627, name: 'Alex', score: 219);
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: StartOverlay(game: game, duel: duel))),
    );
    expect(tester.takeException(), isNull, reason: 'no overflow on a short screen');
    expect(find.text('STACK CITY'), findsOneWidget);
    expect(find.text('Accept Duel'), findsOneWidget);
  });

  testWidgets('LeaderboardOverlay renders without overflow at 320×520',
      (tester) async {
    final game = await _game();
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: LeaderboardOverlay(game: game))),
    );
    // Advance microtask queue so the stub leaderboard future resolves.
    await tester.pump();
    expect(tester.takeException(), isNull,
        reason: 'no overflow or errors on a short screen');
    expect(find.text('DAILY LEADERBOARD'), findsOneWidget);
  });

  testWidgets('AchievementsOverlay with all 9 unlocked + long name fits',
      (tester) async {
    final game = await _game();
    await game.achievementState.recordEarned(AchId.values.toSet());
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: AchievementsOverlay(game: game))),
    );
    expect(tester.takeException(), isNull,
        reason: 'no overflow even with all achievements unlocked');
    expect(find.textContaining('ACHIEVEMENTS'), findsOneWidget);
  });

  testWidgets('GameOverOverlay with all 9 toasts + revive fits', (tester) async {
    final game = await _game();
    await game.crystalState.add(20); // affordable revive
    game.isGameOver = true; // canRevive -> revive button shown
    game.lastUnlocked = List.of(kAchievements); // 9 achievement toasts
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: GameOverOverlay(game: game))),
    );
    expect(tester.takeException(), isNull,
        reason: 'no overflow even with a full result card');
    expect(find.text('Game Over'), findsOneWidget);
    expect(find.textContaining('Revive'), findsOneWidget);
  });
}
