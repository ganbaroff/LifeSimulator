// Standalone verification harness for the core slice math.
//
// It imports only slice_math.dart (pure Dart, no Flame), so it runs with a
// plain Dart SDK and needs no `flutter pub get`:
//
//   dart run test/slice_math_check.dart
//
// Exits non-zero if any case fails.

import '../lib/game/slice_math.dart';
import '../lib/state/characters.dart';
import '../lib/state/city_math.dart';
import '../lib/state/daily_seed.dart';

int _pass = 0;
int _fail = 0;

void check(String name, bool ok, [String detail = '']) {
  if (ok) {
    _pass++;
    print('  PASS  $name');
  } else {
    _fail++;
    print('  FAIL  $name  $detail');
  }
}

bool near(double a, double b) => (a - b).abs() < 1e-9;

void main() {
  // Top block sits at [100, 200] (width 100) for cases 1-5.

  // 1) Perfect alignment.
  {
    final r = computeOverlap(100, 200, 100, 200);
    check('perfect: not game over', !r.gameOver);
    check('perfect: width preserved', near(r.newWidth, 100));
    check('perfect: center unchanged', near(r.newCenterX, 150));
    check('perfect: no overhang', !r.hasOverhang);
  }

  // 2) Shifted RIGHT by 30 -> dropped [130, 230].
  {
    final r = computeOverlap(100, 200, 130, 230);
    check('right: width 70', near(r.newWidth, 70));
    check('right: center recomputed to 165', near(r.newCenterX, 165));
    check('right: overhang [200..230]',
        r.hasOverhang && near(r.overhangLeft, 200) && near(r.overhangWidth, 30));
  }

  // 3) Shifted LEFT by 40 -> dropped [60, 160].
  {
    final r = computeOverlap(100, 200, 60, 160);
    check('left: width 60', near(r.newWidth, 60));
    check('left: center recomputed to 130', near(r.newCenterX, 130));
    check('left: overhang [60..100]',
        r.hasOverhang && near(r.overhangLeft, 60) && near(r.overhangWidth, 40));
  }

  // 4) Complete miss to the right.
  check('miss-right: game over', computeOverlap(100, 200, 210, 310).gameOver);

  // 5) Edge-touching only (zero overlap) must be game over.
  check('touch: zero width is game over',
      computeOverlap(100, 200, 200, 300).gameOver);

  // 6) Cumulative narrowing: repeated off-by drops shrink the tower.
  {
    double left = 100, right = 200, width = 100;
    var ok = true;
    for (var i = 0; i < 5; i++) {
      final r = computeOverlap(left, right, left + 10, right + 10);
      if (r.gameOver || r.newWidth >= width) {
        ok = false;
        break;
      }
      left = r.newLeft;
      right = r.newRight;
      width = r.newWidth;
    }
    check('cumulative: tower strictly narrows to 50', ok && near(width, 50));
  }

  // 7) isPerfect: within / outside the epsilon window.
  check('perfect: exact centre is perfect', isPerfect(100, 100, 8));
  check('perfect: within epsilon is perfect', isPerfect(100, 106, 8));
  check('perfect: at epsilon edge is perfect', isPerfect(100, 108, 8));
  check('perfect: beyond epsilon is NOT perfect', !isPerfect(100, 120, 8));

  // 8) comboMultiplier: grows, then saturates at the cap (audit delta #2).
  check('combo: streak 0 -> 1x', comboMultiplier(0) == 1);
  check('combo: streak 1 -> 2x', comboMultiplier(1) == 2);
  check('combo: streak 2 -> 3x', comboMultiplier(2) == 3);
  check('combo: caps at 8x', comboMultiplier(7) == 8 && comboMultiplier(100) == 8);

  // 9) restoredWidth: a perfect grows width by step, capped at base.
  check('restore: grows by step', near(restoredWidth(50, 100, 14), 64));
  check('restore: caps at base', near(restoredWidth(95, 100, 14), 100));
  check('restore: at base stays base', near(restoredWidth(100, 100, 14), 100));

  // 10) City meta (P1): building tier bumps every 3 perfects, capped.
  check('city: 0 perfects -> tier 0', buildingTier(0) == 0);
  check('city: 2 perfects -> tier 0', buildingTier(2) == 0);
  check('city: 3 perfects -> tier 1', buildingTier(3) == 1);
  check('city: 6 perfects -> tier 2', buildingTier(6) == 2);
  check('city: tier caps at 4', buildingTier(12) == 4 && buildingTier(999) == 4);

  // 11) City level name clears the highest threshold it can.
  check('city: height 0 -> Hamlet', cityLevelName(0) == 'Hamlet');
  check('city: height 9 -> Hamlet', cityLevelName(9) == 'Hamlet');
  check('city: height 10 -> Village', cityLevelName(10) == 'Village');
  check('city: height 30 -> Town', cityLevelName(30) == 'Town');
  check('city: height 70 -> City', cityLevelName(70) == 'City');
  check('city: height 150 -> Metropolis', cityLevelName(150) == 'Metropolis');

  // 12) City era (P2): the city's visual theme advances as it grows.
  check('era: height 0 -> Rural', cityEra(0).name == 'Rural');
  check('era: height 29 -> Rural', cityEra(29).name == 'Rural');
  check('era: height 30 -> Classic', cityEra(30).name == 'Classic');
  check('era: height 70 -> Modern', cityEra(70).name == 'Modern');
  check('era: height 149 -> Modern', cityEra(149).name == 'Modern');
  check('era: height 150 -> Neon', cityEra(150).name == 'Neon');

  // 13) Residents (P3): better buildings draw rarer residents; collection dedupes.
  check('resident: tier 0 -> common', residentFor(0, 0).rarity == 0);
  check('resident: tier 1 -> common', residentFor(1, 0).rarity == 0);
  check('resident: tier 2 -> uncommon', residentFor(2, 0).rarity == 1);
  check('resident: tier 3 -> uncommon', residentFor(3, 0).rarity == 1);
  check('resident: tier 4 -> rare', residentFor(4, 0).rarity == 2);
  {
    // Five tier-0 buildings cycle the 4 common residents; index 0 and 4 are the
    // same (4 % 4 == 0), so the collection must dedupe to 4 unique entries.
    final list = residentsOf(const [
      Building(5, 0),
      Building(9, 0),
      Building(9, 0),
      Building(9, 0),
      Building(7, 0),
    ]);
    check('residents: collection dedupes by name (5 buildings -> 4 unique)',
        list.length == 4, 'got ${list.length}');
  }

  // 14) Daily Challenge (Wordle effect): config is deterministic per seed,
  // varied across seeds, and always in valid ranges.
  check('daily: seed = YYYYMMDD', dailySeedForDate(2026, 6, 26) == 20260626);
  {
    final a = DailyConfig.fromSeed(20260626);
    final b = DailyConfig.fromSeed(20260626);
    check('daily: same seed -> same modifier', a.modifier == b.modifier);
    check('daily: same seed -> same speed', near(a.startSpeed, b.startSpeed));
    check('daily: modifier is valid',
        DailyConfig.modifiers.contains(a.modifier));
    check('daily: epsilon is 5 or 8',
        a.perfectEpsilon == 5 || a.perfectEpsilon == 8);
    check('daily: base width in range',
        a.baseWidthFactor >= 0.30 && a.baseWidthFactor <= 0.60);
  }
  {
    // Variety: scanning a month of seeds yields more than one modifier.
    final mods = <String>{};
    for (var d = 1; d <= 28; d++) {
      mods.add(DailyConfig.fromSeed(dailySeedForDate(2026, 6, d)).modifier);
    }
    check('daily: modifiers vary across days', mods.length >= 2,
        'got ${mods.length}');
  }
  // 15) Share card emoji bar.
  check('bar: all perfect -> 5 green', perfectBar(10, 11) == '🟩🟩🟩🟩🟩');
  check('bar: none -> 5 white', perfectBar(0, 11) == '⬜⬜⬜⬜⬜');
  check('bar: trivial run -> empty bar', perfectBar(0, 1) == '⬜⬜⬜⬜⬜');

  print('\n$_pass passed, $_fail failed');
  if (_fail > 0) {
    throw StateError('slice math verification failed');
  }
}
