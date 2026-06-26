// Daily Challenge — the "Wordle effect" for Stack City (research-grounded:
// everyone plays the SAME run on the same day, so scores are comparable and the
// result is shareable). Also the deterministic-seed foundation the async Duel
// reuses.
//
// Pure: no Flutter/Flame and NO dart:math Random — a tiny LCG makes the config
// fully deterministic from the seed, so it is unit-testable with a plain Dart
// SDK (see test/slice_math_check.dart).

/// Deterministic run configuration for one day's seed. Same seed -> identical
/// params + modifier for every player.
class DailyConfig {
  const DailyConfig({
    required this.seed,
    required this.modifier,
    required this.baseWidthFactor,
    required this.startSpeed,
    required this.speedPerPoint,
    required this.perfectEpsilon,
    required this.startRight,
  });

  /// The day seed (YYYYMMDD).
  final int seed;

  /// Named twist for the day (shown on the share card).
  final String modifier;

  /// Base-block width as a fraction of screen width.
  final double baseWidthFactor;

  /// Starting horizontal speed and per-point ramp.
  final double startSpeed;
  final double speedPerPoint;

  /// Half-width of the "perfect" window (smaller = stricter).
  final double perfectEpsilon;

  /// Which way the first moving block slides.
  final bool startRight;

  /// Short label like "#20260626".
  String get label => '#$seed';

  /// All possible daily modifiers, for tests/UI.
  static const List<String> modifiers = [
    'Calm',
    'Rush',
    'Narrow',
    'Wide',
    'Precise',
  ];

  /// Deterministically derive the day's config from its [seed].
  factory DailyConfig.fromSeed(int seed) {
    // Small LCG seeded by the day; pure + deterministic (no Random).
    var s = (seed ^ 0x5DEECE66D) & 0x7fffffff;
    int next(int mod) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s % mod;
    }

    final modifier = modifiers[next(modifiers.length)];
    var baseWidthFactor = 0.45;
    var startSpeed = 120.0 + next(40); // 120..159
    var speedPerPoint = 8.0;
    var perfectEpsilon = 8.0;
    final startRight = next(2) == 0;

    switch (modifier) {
      case 'Rush':
        startSpeed += 55;
        speedPerPoint = 10;
        break;
      case 'Narrow':
        baseWidthFactor = 0.34;
        break;
      case 'Wide':
        baseWidthFactor = 0.55;
        break;
      case 'Precise':
        perfectEpsilon = 5;
        break;
    }

    return DailyConfig(
      seed: seed,
      modifier: modifier,
      baseWidthFactor: baseWidthFactor,
      startSpeed: startSpeed,
      speedPerPoint: speedPerPoint,
      perfectEpsilon: perfectEpsilon,
      startRight: startRight,
    );
  }
}

/// The seed for a calendar date: YYYYMMDD as an int. Players in the same local
/// day share it.
int dailySeedForDate(int year, int month, int day) =>
    year * 10000 + month * 100 + day;

/// A 5-cell emoji bar for a run's perfect ratio — the shareable "Wordle grid".
String perfectBar(int perfects, int blocks) {
  if (blocks <= 1) return '⬜⬜⬜⬜⬜';
  final filled =
      ((perfects / (blocks - 1)) * 5).round().clamp(0, 5);
  return '🟩' * filled + '⬜' * (5 - filled);
}
