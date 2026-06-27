import 'package:shared_preferences/shared_preferences.dart';

/// Crystals — the hard currency (VISION.md P4 economy). Earned slowly from
/// achievements + golden blocks; spent on revives (and later premium cosmetics /
/// Telegram Stars top-ups). Kept separate from coins so the soft economy stays
/// cosmetic-only.
class CrystalState {
  static const String _key = 'stack_duel_crystals';

  int total = 0;
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    total = _prefs?.getInt(_key) ?? 0;
  }

  Future<void> add(int amount) async {
    if (amount <= 0) return;
    total += amount;
    await _prefs?.setInt(_key, total);
  }

  Future<bool> spend(int amount) async {
    if (amount <= 0 || total < amount) return false;
    total -= amount;
    await _prefs?.setInt(_key, total);
    return true;
  }
}
