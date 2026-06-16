import 'package:shared_preferences/shared_preferences.dart';

/// Holds the current run's score and the persisted all-time best score.
///
/// Best score is stored locally with [SharedPreferences] under [_bestKey].
/// Call [load] once at startup, then [maybeUpdateBest] on game over.
class ScoreState {
  static const String _bestKey = 'stack_duel_best_score';

  int current = 0;
  int best = 0;

  SharedPreferences? _prefs;

  /// Loads the persisted best score. Safe to call once at startup.
  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    best = _prefs?.getInt(_bestKey) ?? 0;
  }

  /// Resets the current score for a new run. Does not touch [best].
  void reset() {
    current = 0;
  }

  /// Adds one point for a successful drop.
  void increment() {
    current += 1;
  }

  /// If the current run beat the stored best, persist and update [best].
  /// Returns true when a new best was recorded.
  Future<bool> maybeUpdateBest() async {
    if (current > best) {
      best = current;
      await _prefs?.setInt(_bestKey, best);
      return true;
    }
    return false;
  }
}
