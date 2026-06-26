// Residents — the collectible characters that populate the city (VISION.md, P3).
//
// Pure data + selection logic, no Flutter/Flame deps, so it is unit-testable
// with a plain Dart SDK (see test/slice_math_check.dart). Each finished building
// gets a resident; better runs (higher building tier) draw from rarer pools, so
// skill is rewarded with fancier characters. The set of residents living across
// your buildings is the collection.

import 'city_math.dart';

/// A collectible resident. [glyph] is an emoji (rendered as text in the UI);
/// [rarity] is 0 common / 1 uncommon / 2 rare.
class Character {
  const Character(this.name, this.glyph, this.rarity);

  final String name;
  final String glyph;
  final int rarity;
}

/// Common residents — fill ordinary buildings (tiers 0-1).
const List<Character> kCommonResidents = [
  Character('Mason', '👷', 0),
  Character('Fern', '🧑‍🌾', 0),
  Character('Sage', '🧑‍🍳', 0),
  Character('Cogs', '🧑‍🔧', 0),
];

/// Uncommon residents — mid-tier buildings (tiers 2-3).
const List<Character> kUncommonResidents = [
  Character('Wynn', '🧙', 1),
  Character('Bolt', '🤖', 1),
  Character('Hoot', '🦉', 1),
];

/// Rare residents — only the top-tier Skyscrapers (tier 4).
const List<Character> kRareResidents = [
  Character('Ember', '🐉', 2),
  Character('Zix', '👽', 2),
];

/// Every resident, in collection order (common -> rare).
const List<Character> kAllResidents = [
  ...kCommonResidents,
  ...kUncommonResidents,
  ...kRareResidents,
];

/// The resident pool unlocked by a building of [tier]. Better runs -> rarer.
List<Character> residentPool(int tier) {
  if (tier >= 4) return kRareResidents;
  if (tier >= 2) return kUncommonResidents;
  return kCommonResidents;
}

/// Deterministic resident for the building of [tier] at position [index] in the
/// city (stable because the city list is append-only). [index] varies which
/// resident of the pool moves in, for variety.
Character residentFor(int tier, int index) {
  final pool = residentPool(tier);
  return pool[index % pool.length];
}

/// Distinct residents living across [buildings] — the collection so far,
/// in the order they were first seen.
List<Character> residentsOf(List<Building> buildings) {
  final seen = <String>{};
  final out = <Character>[];
  for (var i = 0; i < buildings.length; i++) {
    final c = residentFor(buildings[i].tier, i);
    if (seen.add(c.name)) out.add(c);
  }
  return out;
}
