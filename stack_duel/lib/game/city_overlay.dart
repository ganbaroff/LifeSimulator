import 'package:flutter/material.dart';

import '../state/characters.dart';
import '../state/city_math.dart';
import 'stack_duel_game.dart';

/// The City screen (Stack City meta). P1 added a building per run; P2 makes the
/// city visibly EVOLVE: buildings grow windows/spires by quality tier, and the
/// whole city takes on an era theme (Rural -> Classic -> Modern -> Neon) as it
/// grows — the "civilization" progression (VISION.md). Flat-shape art only, no
/// assets, matching the game's aesthetic. Layered on top of the start /
/// game-over overlays; closing returns to whatever was behind it.
class CityOverlay extends StatelessWidget {
  const CityOverlay({super.key, required this.game});

  final StackDuelGame game;

  /// Flat colour per building quality tier (Shack -> Skyscraper).
  static const List<Color> _tierColors = [
    Color(0xFF7F8C8D), // Shack  — grey
    Color(0xFF2ECC71), // House  — green
    Color(0xFF3498DB), // Block  — blue
    Color(0xFF9B59B6), // Tower  — purple
    Color(0xFFF1C40F), // Skyscraper — gold
  ];

  @override
  Widget build(BuildContext context) {
    final city = game.cityState;
    final buildings = city.buildings;
    final era = cityEra(city.totalHeight);
    final residents = residentsOf(buildings);

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(era.skyTop), Color(era.skyBottom)],
        ),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 6),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'YOUR CITY',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => game.overlays.remove('city'),
                    icon: const Icon(Icons.close, color: Colors.white70),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                '${city.cityLevel}   ·   ${era.name} era',
                style: const TextStyle(
                  color: Color(0xFF3498DB),
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 2, 20, 0),
              child: Text(
                '${city.totalBuildings} buildings   ·   height ${city.totalHeight}',
                style: const TextStyle(color: Colors.white54, fontSize: 13),
              ),
            ),
            // Resident collection: who you've gathered so far.
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
              child: Row(
                children: [
                  Text(
                    'Residents ${residents.length}/${kAllResidents.length}  ',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Expanded(
                    child: Wrap(
                      spacing: 4,
                      runSpacing: 2,
                      children: [
                        for (final c in residents)
                          Text(c.glyph, style: const TextStyle(fontSize: 18)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: buildings.isEmpty
                  ? const Center(
                      child: Text(
                        'Play a run to build your first building.',
                        style: TextStyle(color: Colors.white54, fontSize: 16),
                      ),
                    )
                  : _Skyline(
                      buildings: buildings,
                      tierColors: _tierColors,
                      groundColor: Color(era.ground),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              child: ElevatedButton(
                onPressed: () => game.overlays.remove('city'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2ECC71),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                ),
                child: const Text('Back', style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Horizontally scrollable row of buildings, sitting on a ground line. Newest
/// building is highlighted; pixel-height scales with block height; colour +
/// detail encode the quality tier.
class _Skyline extends StatelessWidget {
  const _Skyline({
    required this.buildings,
    required this.tierColors,
    required this.groundColor,
  });

  final List<Building> buildings;
  final List<Color> tierColors;
  final Color groundColor;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      reverse: true, // keep the newest building in view
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: groundColor, width: 3)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            for (var i = 0; i < buildings.length; i++)
              _BuildingBar(
                building: buildings[i],
                color: tierColors[buildings[i].tier.clamp(0, 4)],
                isNewest: i == buildings.length - 1,
                resident: residentFor(buildings[i].tier, i),
              ),
          ],
        ),
      ),
    );
  }
}

/// One building: a flat tower whose height is its block count, with lit windows
/// and — at the top tier — a spire. Higher tiers light up gold. The newest gets
/// a subtle outline so a fresh run is easy to spot.
class _BuildingBar extends StatelessWidget {
  const _BuildingBar({
    required this.building,
    required this.color,
    required this.isNewest,
    required this.resident,
  });

  final Building building;
  final Color color;
  final bool isNewest;
  final Character resident;

  @override
  Widget build(BuildContext context) {
    // 1 block ~= 9 px tall, clamped so tiny and huge towers both stay on screen.
    final h = (building.height * 9.0).clamp(16.0, 340.0);
    final tier = building.tier.clamp(0, 4);
    final windowRows = (h / 18).floor().clamp(0, 16);
    final windowColor =
        tier >= 3 ? const Color(0xCCF1C40F) : Colors.white30;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // The building's resident, peeking over the roof.
          Text(resident.glyph, style: const TextStyle(fontSize: 16)),
          // Spire on the top tier (Skyscraper) — the "evolved" silhouette.
          if (tier >= 4)
            Container(width: 3, height: 14, color: Colors.white70),
          Container(
            width: 26,
            height: h,
            // borderRadius requires a UNIFORM border in Flutter, so the roof is
            // drawn as an inner strip and the "newest" highlight as a glow —
            // never as a per-side border (which throws at paint time).
            decoration: BoxDecoration(
              color: color,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(3)),
              boxShadow: isNewest
                  ? const [
                      BoxShadow(
                        color: Colors.white70,
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ]
                  : null,
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                // Roof cap.
                Container(
                  height: 3,
                  width: double.infinity,
                  color: isNewest ? Colors.white : Colors.white24,
                ),
                Expanded(
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: 5, horizontal: 5),
                    child: Column(
                      children: [
                        for (var r = 0; r < windowRows; r++)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                    width: 5, height: 5, color: windowColor),
                                Container(
                                    width: 5, height: 5, color: windowColor),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 3),
          Text(
            '${building.height}',
            style: const TextStyle(color: Colors.white38, fontSize: 10),
          ),
        ],
      ),
    );
  }
}
