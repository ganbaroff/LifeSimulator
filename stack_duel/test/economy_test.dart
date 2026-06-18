// Pure economy logic (coins + skins), no Flame needed.
//
//   flutter test test/economy_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:stack_duel/state/coin_state.dart';
import 'package:stack_duel/state/skin_state.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('coins: add and spend, never negative', () async {
    final coins = CoinState();
    await coins.load();
    await coins.add(10);
    expect(coins.total, 10);
    expect(await coins.spend(4), isTrue);
    expect(coins.total, 6);
    expect(await coins.spend(99), isFalse, reason: 'cannot overspend');
    expect(coins.total, 6);
  });

  test('skins: default owns only skin 0', () async {
    final skins = SkinState();
    await skins.load();
    expect(skins.isOwned(0), isTrue);
    expect(skins.isOwned(1), isFalse);
    expect(skins.selected, 0);
  });

  test('skins: buy needs enough coins, then deducts + owns + selects', () async {
    final coins = CoinState();
    await coins.load();
    final skins = SkinState();
    await skins.load();

    // Not enough for Ocean (cost 60).
    expect(await skins.buy(1, coins), isFalse);
    expect(skins.isOwned(1), isFalse);

    await coins.add(60);
    expect(await skins.buy(1, coins), isTrue);
    expect(coins.total, 0, reason: 'cost deducted');
    expect(skins.isOwned(1), isTrue);

    await skins.select(1);
    expect(skins.selected, 1);
    expect(skins.palette, SkinState.skins[1].palette);

    // Buying again does nothing (already owned).
    expect(await skins.buy(1, coins), isFalse);
  });

  test('skins: selecting an unowned skin is a no-op', () async {
    final skins = SkinState();
    await skins.load();
    await skins.select(2); // not owned
    expect(skins.selected, 0);
  });

  test('skins: ownership + selection persist across reloads', () async {
    final coins = CoinState();
    await coins.load();
    await coins.add(60);
    final skins = SkinState();
    await skins.load();
    await skins.buy(1, coins);
    await skins.select(1);

    final reloaded = SkinState();
    await reloaded.load();
    expect(reloaded.isOwned(1), isTrue);
    expect(reloaded.selected, 1);
  });
}
