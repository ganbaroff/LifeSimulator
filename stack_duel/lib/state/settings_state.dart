import 'package:shared_preferences/shared_preferences.dart';

/// Small persisted player settings: whether the one-time teach-by-doing tutorial
/// has run, and whether sound is muted. (Onboarding + feel — Sprint 1.)
class SettingsState {
  static const String _tutorialKey = 'stack_duel_tutorial_done';
  static const String _mutedKey = 'stack_duel_muted';

  bool tutorialDone = false;
  bool muted = false;
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    tutorialDone = _prefs?.getBool(_tutorialKey) ?? false;
    muted = _prefs?.getBool(_mutedKey) ?? false;
  }

  Future<void> markTutorialDone() async {
    if (tutorialDone) return;
    tutorialDone = true;
    await _prefs?.setBool(_tutorialKey, true);
  }

  Future<void> setMuted(bool value) async {
    muted = value;
    await _prefs?.setBool(_mutedKey, value);
  }
}
