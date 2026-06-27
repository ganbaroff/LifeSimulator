import 'package:shared_preferences/shared_preferences.dart';

/// Daily streak — a return hook (research: streaks + daily loops drive
/// retention). Counts consecutive days played. The streak math is a pure
/// function so it is unit-testable; [StreakState] persists the numbers.

/// Next streak given the last-played day, today, and the current streak.
/// Days are "epoch days" (whole days since 1970) so calendar math is trivial.
///  - same day        -> unchanged
///  - the next day     -> +1
///  - any larger gap   -> reset to 1
int nextStreak(int lastEpochDay, int todayEpochDay, int currentStreak) {
  if (todayEpochDay == lastEpochDay) return currentStreak;
  if (todayEpochDay == lastEpochDay + 1) return currentStreak + 1;
  return 1;
}

/// Whole days since the Unix epoch for a local date (UTC-normalised).
int epochDayFor(int year, int month, int day) =>
    DateTime.utc(year, month, day).difference(DateTime.utc(1970, 1, 1)).inDays;

class StreakState {
  static const String _lastKey = 'stack_duel_streak_last';
  static const String _curKey = 'stack_duel_streak_current';
  static const String _bestKey = 'stack_duel_streak_best';

  int current = 0;
  int best = 0;
  int _lastDay = -1;
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    _lastDay = _prefs?.getInt(_lastKey) ?? -1;
    current = _prefs?.getInt(_curKey) ?? 0;
    best = _prefs?.getInt(_bestKey) ?? 0;
  }

  /// Record that the player played on [todayEpochDay]; updates + persists the
  /// streak. Returns the (possibly unchanged) current streak.
  Future<int> recordPlay(int todayEpochDay) async {
    current = _lastDay < 0 ? 1 : nextStreak(_lastDay, todayEpochDay, current);
    _lastDay = todayEpochDay;
    if (current > best) best = current;
    await _prefs?.setInt(_lastKey, _lastDay);
    await _prefs?.setInt(_curKey, current);
    await _prefs?.setInt(_bestKey, best);
    return current;
  }
}
