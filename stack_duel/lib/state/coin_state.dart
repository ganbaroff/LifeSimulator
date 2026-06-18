import 'package:shared_preferences/shared_preferences.dart';

/// Persisted soft currency. Cosmetic-only — coins buy skins, never gameplay
/// advantage (monetization contract, HANDOFF §12). Earned from perfect play so
/// the capped combo system stays the single source of value.
class CoinState {
  static const String _key = 'stack_duel_coins';

  int total = 0;
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    total = _prefs?.getInt(_key) ?? 0;
  }

  /// Adds [amount] coins (ignored if non-positive) and persists.
  Future<void> add(int amount) async {
    if (amount <= 0) return;
    total += amount;
    await _prefs?.setInt(_key, total);
  }
}
