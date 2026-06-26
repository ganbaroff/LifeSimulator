// Pure economy logic (coins + skins), no Flame needed.
//
//   flutter test test/economy_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:stack_duel/state/characters.dart';
import 'package:stack_duel/state/city_math.dart';
import 'package:stack_duel/state/city_state.dart';
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

  // --- City meta (P1) -------------------------------------------------------

  test('city: buildingTier bumps every 3 perfects, capped at top tier', () {
    expect(buildingTier(0), 0);
    expect(buildingTier(2), 0);
    expect(buildingTier(3), 1);
    expect(buildingTier(6), 2);
    expect(buildingTier(12), 4);
    expect(buildingTier(999), 4, reason: 'tier saturates at Skyscraper');
  });

  test('city: cityLevelName clears the highest threshold it can', () {
    expect(cityLevelName(0), 'Hamlet');
    expect(cityLevelName(9), 'Hamlet');
    expect(cityLevelName(10), 'Village');
    expect(cityLevelName(29), 'Village');
    expect(cityLevelName(30), 'Town');
    expect(cityLevelName(70), 'City');
    expect(cityLevelName(150), 'Metropolis');
    expect(cityLevelName(10000), 'Metropolis');
  });

  test('residents: pool rarity scales with building tier (P3)', () {
    expect(residentFor(0, 0).rarity, 0, reason: 'shacks/houses -> common');
    expect(residentFor(1, 0).rarity, 0);
    expect(residentFor(2, 0).rarity, 1, reason: 'mid tiers -> uncommon');
    expect(residentFor(3, 0).rarity, 1);
    expect(residentFor(4, 0).rarity, 2, reason: 'skyscrapers -> rare');
  });

  test('residents: collection is distinct across buildings (P3)', () {
    final residents = residentsOf(const [
      Building(3, 0), // tier 0 -> Mason
      Building(10, 1), // tier 1 -> Fern
      Building(40, 2), // tier 2 -> Hoot
      Building(60, 3), // tier 3 -> Wynn
      Building(80, 4), // tier 4 -> Ember
    ]);
    expect(residents.length, 5, reason: 'five distinct residents');
    expect(residents.map((c) => c.name),
        containsAll(['Mason', 'Fern', 'Wynn', 'Ember']));
    expect(kAllResidents.length, 9, reason: 'full collection size');
  });

  test('city: era advances with cumulative height (P2)', () {
    expect(cityEra(0).name, 'Rural');
    expect(cityEra(29).name, 'Rural');
    expect(cityEra(30).name, 'Classic');
    expect(cityEra(69).name, 'Classic');
    expect(cityEra(70).name, 'Modern');
    expect(cityEra(150).name, 'Neon');
    expect(cityEra(99999).name, 'Neon');
  });

  test('city: starts empty', () async {
    final city = CityState();
    await city.load();
    expect(city.totalBuildings, 0);
    expect(city.totalHeight, 0);
    expect(city.cityLevel, 'Hamlet');
  });

  test('city: addBuilding records height + tier and updates the level', () async {
    final city = CityState();
    await city.load();

    final b1 = await city.addBuilding(8, 0); // tier 0
    expect(b1.height, 8);
    expect(b1.tier, 0);
    expect(city.totalBuildings, 1);
    expect(city.totalHeight, 8);
    expect(city.cityLevel, 'Hamlet');

    final b2 = await city.addBuilding(25, 6); // tier 2; total height 33
    expect(b2.tier, 2);
    expect(city.totalBuildings, 2);
    expect(city.totalHeight, 33);
    expect(city.cityLevel, 'Town', reason: '33 >= 30');
  });

  test('city: buildings persist across reloads', () async {
    final city = CityState();
    await city.load();
    await city.addBuilding(12, 3);
    await city.addBuilding(20, 0);

    final reloaded = CityState();
    await reloaded.load();
    expect(reloaded.totalBuildings, 2);
    expect(reloaded.totalHeight, 32);
    expect(reloaded.buildings.first.height, 12);
    expect(reloaded.buildings.first.tier, 1);
    expect(reloaded.buildings.last.height, 20);
    expect(reloaded.cityLevel, 'Town');
  });
}
