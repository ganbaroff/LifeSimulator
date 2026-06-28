// Pure city-meta math for "Stack City" — the first depth layer on top of the
// arcade core (see VISION.md: Tower Bloxx-style city/evolution meta).
//
// This file has NO Flame/Flutter/shared_preferences dependency on purpose, so
// the tier/level rules can be reviewed and unit-tested with a plain Dart SDK:
//
//   dart run test/slice_math_check.dart
//
// CityState (persistence) imports these; the game and overlays consume them.

import 'dart:math' as math;

/// A single building in the persistent city, produced by one completed run.
class Building {
  const Building(this.height, this.tier);

  /// How tall the building is, in blocks (the run's final tower length).
  final int height;

  /// Quality tier 0..4, derived from the perfects landed that run.
  final int tier;

  /// Display name for this building's quality tier.
  String get tierName =>
      kBuildingTierNames[tier.clamp(0, kBuildingTierNames.length - 1)];
}

/// Names for the 5 quality tiers, worst -> best. A run's perfects decide which
/// one its building gets (see [buildingTier]) — the "evolution" hook.
const List<String> kBuildingTierNames = [
  'Shack',
  'House',
  'Block',
  'Tower',
  'Skyscraper',
];

/// Quality tier (0..4) for a run that landed [perfects] perfect drops.
///
/// Every 3 perfects bumps the tier one rung; capped at the top tier. Pure +
/// saturating so it is the single source of truth for a building's quality
/// (mirrors how [comboMultiplier] gates score).
int buildingTier(int perfects) {
  if (perfects <= 0) return 0;
  return (perfects ~/ 3).clamp(0, kBuildingTierNames.length - 1);
}

/// A named city-size threshold by cumulative built height.
class CityLevel {
  const CityLevel(this.minHeight, this.name);

  /// Minimum cumulative built height (sum of building heights) to reach it.
  final int minHeight;
  final String name;
}

/// City-size ladder, ascending. The highest threshold a height clears wins.
/// This is the long-term progression the player returns to between runs.
const List<CityLevel> kCityLevels = [
  CityLevel(0, 'Hamlet'),
  CityLevel(10, 'Village'),
  CityLevel(30, 'Town'),
  CityLevel(70, 'City'),
  CityLevel(150, 'Metropolis'),
];

/// City-size name for a cumulative built [totalHeight] (sum of all building
/// heights). Clears the highest threshold it can; never below the first.
String cityLevelName(int totalHeight) {
  var name = kCityLevels.first.name;
  for (final level in kCityLevels) {
    if (totalHeight >= level.minHeight) {
      name = level.name;
    } else {
      break;
    }
  }
  return name;
}

/// A visual era the whole city takes on as it grows — the "civilization"
/// progression (VISION.md, P2). Colours are ARGB ints so this file stays
/// Flutter-free and unit-testable; the overlay wraps them in `Color`.
class CityEra {
  const CityEra(
    this.minHeight,
    this.name,
    this.skyTop,
    this.skyBottom,
    this.ground,
  );

  /// Minimum cumulative built height to reach this era.
  final int minHeight;
  final String name;

  /// Sky gradient (top -> bottom) and the ground line colour, as ARGB ints.
  final int skyTop;
  final int skyBottom;
  final int ground;
}

/// Era ladder by cumulative built height, ascending — rural village to a neon
/// metropolis. The highest threshold a height clears wins.
const List<CityEra> kCityEras = [
  CityEra(0, 'Rural', 0xFF3A2E26, 0xFF161009, 0xFF4A3B2A),
  CityEra(30, 'Classic', 0xFF243B55, 0xFF0A0E15, 0xFF394B5E),
  CityEra(70, 'Modern', 0xFF2C2150, 0xFF0A0814, 0xFF40346B),
  CityEra(150, 'Neon', 0xFF0B132B, 0xFF000000, 0xFF1C2541),
];

/// Perceptual on-screen height (px) for a building of [blocks] blocks, capped at
/// [maxPx]. A sqrt curve keeps a 3-block shack and a 120-block tower BOTH
/// readable and distinct — instead of every tall run slamming into a flat cap
/// (the old `blocks * 9` clamp made 58/89/115 look identical). Pure + testable.
double cityBuildingHeightPx(int blocks, {double maxPx = 300}) {
  final b = blocks < 1 ? 1 : blocks;
  final px = 28 + math.sqrt(b) * 26;
  return px > maxPx ? maxPx : px;
}

/// Visual era for a cumulative built [totalHeight].
CityEra cityEra(int totalHeight) {
  var era = kCityEras.first;
  for (final e in kCityEras) {
    if (totalHeight >= e.minHeight) {
      era = e;
    } else {
      break;
    }
  }
  return era;
}
