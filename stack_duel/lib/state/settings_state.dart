import 'package:shared_preferences/shared_preferences.dart';

/// Persisted player settings: tutorial completion, mute, and first-ever
/// perfect (so the analytics funnel event fires exactly once per user).
class SettingsState {
  static const String _tutorialKey = 'stack_duel_tutorial_done';
  static const String _mutedKey = 'stack_duel_muted';
  static const String _firstPerfectKey = 'stack_duel_first_perfect_done';
  static const String _referralKey = 'stack_duel_referral_granted';

  bool tutorialDone = false;
  bool muted = false;
  bool firstPerfectDone = false;
  /// True once referral crystals have been granted so they fire at most once
  /// regardless of how many times the app is opened with a ref param.
  bool referralGranted = false;
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    tutorialDone = _prefs?.getBool(_tutorialKey) ?? false;
    muted = _prefs?.getBool(_mutedKey) ?? false;
    firstPerfectDone = _prefs?.getBool(_firstPerfectKey) ?? false;
    referralGranted = _prefs?.getBool(_referralKey) ?? false;
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

  Future<void> markFirstPerfectDone() async {
    if (firstPerfectDone) return;
    firstPerfectDone = true;
    await _prefs?.setBool(_firstPerfectKey, true);
  }

  Future<void> markReferralGranted() async {
    if (referralGranted) return;
    referralGranted = true;
    await _prefs?.setBool(_referralKey, true);
  }
}
