// Powers — the missing stem: the city/residents you collect grant ABILITIES you
// spend inside a run (VISION.md design note). This closes the core<->meta loop —
// progression stops being a trophy shelf and becomes a deck of tools that make
// runs richer, which builds a bigger city, which unlocks more powers.
//
// Pure: unlock rules are plain functions of city progress, unit-testable with a
// plain Dart SDK (see test/slice_math_check.dart).

enum PowerId { widen, slowmo, autocenter }

/// A deployable in-run ability.
class Power {
  const Power(this.id, this.name, this.glyph, this.desc);

  final PowerId id;
  final String name;
  final String glyph;
  final String desc;
}

const Power kWiden =
    Power(PowerId.widen, 'Widen', '🧱', 'Next block snaps back to full width');
const Power kSlowmo =
    Power(PowerId.slowmo, 'Slow-Mo', '⏳', 'The block crawls for a moment');
const Power kAutocenter =
    Power(PowerId.autocenter, 'Perfect', '🎯', 'Next drop auto-centers');

/// All powers, in deck order.
const List<Power> kAllPowers = [kWiden, kSlowmo, kAutocenter];

/// Powers unlocked for a run, given city progress. The loop made explicit:
///  - Widen is always available (teaches the mechanic on run one).
///  - Slow-Mo unlocks once the city is a real town (height >= 30, ~5 runs).
///  - Perfect (auto-center) is the prestige power — earned by collecting
///    residents (>= 4 distinct) or reaching a Metropolis (height >= 150).
List<Power> unlockedPowers(
  int totalBuildings,
  int totalHeight,
  int residentCount,
) {
  final out = <Power>[kWiden];
  if (totalHeight >= 30 || totalBuildings >= 5) out.add(kSlowmo);
  if (residentCount >= 4 || totalHeight >= 150) out.add(kAutocenter);
  return out;
}
