import 'package:shared_preferences/shared_preferences.dart';

import 'city_math.dart';

/// The persistent city: the meta-progression Stack City adds on top of the
/// arcade run. Each completed run appends one [Building]; the city grows and
/// levels up (Hamlet -> ... -> Metropolis) the more you play. Local-only via
/// [SharedPreferences] — no account needed (VISION.md, P1).
class CityState {
  static const String _key = 'stack_duel_city_buildings';

  /// Buildings in the order they were built (oldest first).
  final List<Building> buildings = [];

  SharedPreferences? _prefs;

  /// Loads the persisted city. Each entry is encoded as "height:tier".
  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    buildings.clear();
    final stored = _prefs?.getStringList(_key) ?? const [];
    for (final s in stored) {
      final parts = s.split(':');
      if (parts.length != 2) continue;
      final h = int.tryParse(parts[0]);
      final t = int.tryParse(parts[1]);
      if (h != null && t != null) buildings.add(Building(h, t));
    }
  }

  int get totalBuildings => buildings.length;

  /// Sum of all building heights — drives the city level.
  int get totalHeight =>
      buildings.fold(0, (sum, b) => sum + b.height);

  /// Current city-size name (Hamlet -> Metropolis).
  String get cityLevel => cityLevelName(totalHeight);

  /// Appends a building from a completed run and persists. [blocks] is the
  /// run's tower height; [perfects] decides its quality tier. Returns the
  /// building that was added (so the UI can celebrate it).
  Future<Building> addBuilding(int blocks, int perfects) async {
    final building = Building(blocks, buildingTier(perfects));
    buildings.add(building);
    await _persist();
    return building;
  }

  /// Replaces the most recent building (used when a run continues past its
  /// first death via revive, so the building reflects the FINAL tower).
  Future<void> replaceLast(int blocks, int perfects) async {
    if (buildings.isEmpty) return;
    buildings[buildings.length - 1] = Building(blocks, buildingTier(perfects));
    await _persist();
  }

  Future<void> _persist() async {
    await _prefs?.setStringList(
      _key,
      buildings.map((b) => '${b.height}:${b.tier}').toList(),
    );
  }
}
