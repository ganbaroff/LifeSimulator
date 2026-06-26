// Widget-level rendering test for the City screen.
//
// The Flame headless tests drive game logic but never paint Flutter widgets, so
// they can't catch layout/paint errors (RenderFlex overflow, the "borderRadius
// needs a uniform border" assertion, etc.). This pumps the real CityOverlay and
// asserts it lays out + paints cleanly for an empty city and a full skyline that
// spans every quality tier and reaches the final era.
//
//   flutter test test/city_overlay_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:stack_duel/game/city_overlay.dart';
import 'package:stack_duel/game/stack_duel_game.dart';
import 'package:stack_duel/state/city_state.dart';
import 'package:stack_duel/state/coin_state.dart';
import 'package:stack_duel/state/score_state.dart';
import 'package:stack_duel/state/skin_state.dart';

Future<StackDuelGame> _gameWithCity(List<List<int>> runs) async {
  SharedPreferences.setMockInitialValues({});
  final score = ScoreState();
  await score.load();
  final coin = CoinState();
  await coin.load();
  final skin = SkinState();
  await skin.load();
  final city = CityState();
  await city.load();
  for (final r in runs) {
    await city.addBuilding(r[0], r[1]); // [height, perfects]
  }
  return StackDuelGame(
    scoreState: score,
    coinState: coin,
    skinState: skin,
    cityState: city,
  );
}

void main() {
  // A roomy surface so a tall skyline isn't a false overflow.
  setUp(() {
    final view = TestWidgetsFlutterBinding.ensureInitialized().platformDispatcher
        .views.first;
    view.physicalSize = const Size(900, 1200);
    view.devicePixelRatio = 1.0;
  });
  tearDown(() {
    final view = TestWidgetsFlutterBinding.ensureInitialized().platformDispatcher
        .views.first;
    view.resetPhysicalSize();
    view.resetDevicePixelRatio();
  });

  testWidgets('empty city renders cleanly with a prompt', (tester) async {
    final game = await _gameWithCity(const []);
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: CityOverlay(game: game))),
    );
    expect(tester.takeException(), isNull);
    expect(find.text('YOUR CITY'), findsOneWidget);
    expect(find.textContaining('first building'), findsOneWidget);
  });

  testWidgets('skyline spanning all tiers + final era paints without errors',
      (tester) async {
    // tiers 0..4 (perfects 0,3,6,9,12) and >=150 total height -> Neon era.
    final game = await _gameWithCity(const [
      [3, 0],
      [10, 3],
      [40, 6],
      [60, 9],
      [80, 12],
    ]);
    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: CityOverlay(game: game))),
    );
    // The real proof: layout + paint produced no FlutterError.
    expect(tester.takeException(), isNull,
        reason: 'no overflow / border-radius paint errors in the skyline');
    expect(find.textContaining('Neon era'), findsOneWidget);
    expect(find.textContaining('5 buildings'), findsOneWidget);
  });
}
