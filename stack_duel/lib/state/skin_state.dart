import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'coin_state.dart';

/// A cosmetic skin = a flat colour palette for the tower. No gameplay effect
/// (monetization contract, HANDOFF §12).
class Skin {
  const Skin(this.name, this.cost, this.palette);

  final String name;

  /// Coin cost; 0 = owned by default.
  final int cost;

  /// Flat colours cycled by tower height.
  final List<Color> palette;
}

/// Owned + selected skins, persisted. Coins (from perfect play) are the only way
/// to unlock paid skins — a cosmetic sink, never an advantage.
class SkinState {
  static const String _ownedKey = 'stack_duel_skins_owned';
  static const String _selectedKey = 'stack_duel_skin_selected';

  static const List<Skin> skins = [
    Skin('Sunset', 0, [
      Color(0xFFE74C3C),
      Color(0xFFE67E22),
      Color(0xFFF1C40F),
      Color(0xFF2ECC71),
      Color(0xFF1ABC9C),
      Color(0xFF3498DB),
      Color(0xFF9B59B6),
    ]),
    Skin('Ocean', 60, [
      Color(0xFF1ABC9C),
      Color(0xFF16A085),
      Color(0xFF2980B9),
      Color(0xFF3498DB),
      Color(0xFF6C5CE7),
      Color(0xFF00CEC9),
      Color(0xFF0984E3),
    ]),
    Skin('Mono', 150, [
      Color(0xFFECF0F1),
      Color(0xFFBDC3C7),
      Color(0xFF95A5A6),
      Color(0xFF7F8C8D),
      Color(0xFFCED6E0),
      Color(0xFFA4B0BE),
      Color(0xFFDFE4EA),
    ]),
  ];

  Set<int> owned = {0};
  int selected = 0;
  SharedPreferences? _prefs;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    final stored = _prefs?.getStringList(_ownedKey);
    owned = {0, if (stored != null) ...stored.map(int.tryParse).nonNulls};
    selected = _prefs?.getInt(_selectedKey) ?? 0;
  }

  /// Active palette for the current selection.
  List<Color> get palette => skins[selected].palette;

  bool isOwned(int index) => owned.contains(index);

  /// Buy [index] if not already owned and affordable (deducts coins).
  /// Returns true on a successful purchase.
  Future<bool> buy(int index, CoinState coins) async {
    if (index < 0 || index >= skins.length || isOwned(index)) return false;
    final ok = await coins.spend(skins[index].cost);
    if (!ok) return false;
    owned.add(index);
    await _prefs
        ?.setStringList(_ownedKey, owned.map((e) => e.toString()).toList());
    return true;
  }

  /// Select an owned skin (no-op if not owned).
  Future<void> select(int index) async {
    if (!isOwned(index)) return;
    selected = index;
    await _prefs?.setInt(_selectedKey, index);
  }
}
