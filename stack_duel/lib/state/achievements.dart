import 'package:shared_preferences/shared_preferences.dart';

/// Achievements — the goal layer (my honest gap #3: "a carrot 30 seconds away").
/// Each unlock pays out crystals, so chasing them feeds the hard economy.
///
/// The catalogue + the [achievementsEarned] rule are pure (no Flutter), so they
/// are unit-testable; [AchievementState] just persists the unlocked set.

enum AchId {
  firstPerfect,
  combo5,
  combo8,
  height50,
  height100,
  metropolis,
  duelWin,
  powerUser,
  collector,
}

class Achievement {
  const Achievement(this.id, this.name, this.glyph, this.desc, this.reward);

  final AchId id;
  final String name;
  final String glyph;
  final String desc;

  /// Crystals paid on first unlock.
  final int reward;
}

const List<Achievement> kAchievements = [
  Achievement(AchId.firstPerfect, 'Bullseye', '🎯', 'Land your first perfect', 1),
  Achievement(AchId.combo5, 'On Fire', '🔥', 'Reach a ×5 combo', 2),
  Achievement(AchId.combo8, 'Unstoppable', '⚡', 'Reach a ×8 combo', 3),
  Achievement(AchId.height50, 'High Rise', '🏢', 'Stack a tower of 50', 2),
  Achievement(AchId.height100, 'Skyscraper', '🌆', 'Stack a tower of 100', 4),
  Achievement(AchId.metropolis, 'Mayor', '🏙', 'Grow a Metropolis', 5),
  Achievement(AchId.duelWin, 'Duelist', '⚔️', 'Win an async duel', 3),
  Achievement(AchId.powerUser, 'Tactician', '🧠', 'Use a power in a run', 1),
  Achievement(AchId.collector, 'Collector', '👑', 'Gather all 9 residents', 8),
];

Achievement achievementById(AchId id) =>
    kAchievements.firstWhere((a) => a.id == id);

/// Stats from one run / the city, used to decide which achievements are earned.
class RunStats {
  const RunStats({
    required this.perfects,
    required this.bestCombo,
    required this.height,
    required this.cityIsMetropolis,
    required this.duelWon,
    required this.usedPower,
    required this.residentCount,
  });

  final int perfects;
  final int bestCombo;
  final int height;
  final bool cityIsMetropolis;
  final bool duelWon;
  final bool usedPower;
  final int residentCount;
}

/// The set of achievement ids a run with [s] qualifies for (pure rule).
Set<AchId> achievementsEarned(RunStats s) {
  final out = <AchId>{};
  if (s.perfects >= 1) out.add(AchId.firstPerfect);
  if (s.bestCombo >= 5) out.add(AchId.combo5);
  if (s.bestCombo >= 8) out.add(AchId.combo8);
  if (s.height >= 50) out.add(AchId.height50);
  if (s.height >= 100) out.add(AchId.height100);
  if (s.cityIsMetropolis) out.add(AchId.metropolis);
  if (s.duelWon) out.add(AchId.duelWin);
  if (s.usedPower) out.add(AchId.powerUser);
  if (s.residentCount >= 9) out.add(AchId.collector);
  return out;
}

/// Persisted set of unlocked achievement ids.
class AchievementState {
  static const String _key = 'stack_duel_achievements';

  final Set<AchId> unlocked = {};
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    unlocked.clear();
    for (final name in _prefs?.getStringList(_key) ?? const <String>[]) {
      final id = AchId.values.where((e) => e.name == name);
      if (id.isNotEmpty) unlocked.add(id.first);
    }
  }

  bool isUnlocked(AchId id) => unlocked.contains(id);

  int get count => unlocked.length;

  /// Records any newly-earned achievements and returns just the NEW ones (so
  /// the caller can toast them + pay crystals). Persists the set.
  Future<List<Achievement>> recordEarned(Set<AchId> earned) async {
    final fresh = <Achievement>[];
    for (final id in earned) {
      if (unlocked.add(id)) fresh.add(achievementById(id));
    }
    if (fresh.isNotEmpty) {
      await _prefs?.setStringList(
          _key, unlocked.map((e) => e.name).toList());
    }
    return fresh;
  }
}
