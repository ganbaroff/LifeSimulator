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

    return GestureDetector(
      // Absorb stray taps so they don't fall through to the game underneath.
      behavior: HitTestBehavior.opaque,
      onTap: () {},
      child: Container(
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
      ),
    );
  }
}

/// The skyline: buildings sit on a ground line, sized by a perceptual sqrt scale
/// so heights read clearly. A small city is centred; a big one scrolls with the
/// newest building kept in view.
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
    return LayoutBuilder(
      builder: (context, c) {
        // Reserve room for the resident glyph + roof + the number label.
        final maxPx = (c.maxHeight - 60).clamp(60.0, 320.0);
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          reverse: true, // newest stays in view when the skyline overflows
          child: ConstrainedBox(
            // Fill the width so a small city is centred, not jammed to one side.
            constraints: BoxConstraints(minWidth: c.maxWidth),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                border:
                    Border(bottom: BorderSide(color: groundColor, width: 3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  for (var i = 0; i < buildings.length; i++)
                    _BuildingBar(
                      building: buildings[i],
                      color: tierColors[buildings[i].tier.clamp(0, 4)],
                      isNewest: i == buildings.length - 1,
                      resident: residentFor(buildings[i].tier, i),
                      maxPx: maxPx,
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// One building: a tower whose height uses the perceptual scale, with evenly
/// spaced lit "floors", a top-light gradient for depth, a spire on the top tier,
/// and a glow on the newest. Width grows a little with tier so skyscrapers read
/// as grander.
class _BuildingBar extends StatelessWidget {
  const _BuildingBar({
    required this.building,
    required this.color,
    required this.isNewest,
    required this.resident,
    required this.maxPx,
  });

  final Building building;
  final Color color;
  final bool isNewest;
  final Character resident;
  final double maxPx;

  @override
  Widget build(BuildContext context) {
    final tier = building.tier.clamp(0, 4);
    final h = cityBuildingHeightPx(building.height, maxPx: maxPx);
    final width = 26.0 + tier * 2.5; // grander towers for higher tiers
    final floors = (h / 22).floor().clamp(1, 14);
    final windowColor =
        tier >= 3 ? const Color(0xFFFFE082) : const Color(0x66FFFFFF);
    final topColor = Color.lerp(color, Colors.white, 0.16) ?? color;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2.5),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(resident.glyph, style: const TextStyle(fontSize: 15)),
          if (tier >= 4)
            Container(width: 3, height: 12, color: Colors.white70),
          Container(
            width: width,
            height: h,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [topColor, color],
              ),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(4)),
              boxShadow: isNewest
                  ? const [
                      BoxShadow(
                          color: Colors.white70,
                          blurRadius: 9,
                          spreadRadius: 1),
                    ]
                  : null,
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                Container(
                  height: 3,
                  width: double.infinity,
                  color: isNewest ? Colors.white : Colors.white24,
                ),
                Expanded(
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: 6, horizontal: 5),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        for (var r = 0; r < floors; r++)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                  width: 4, height: 4, color: windowColor),
                              Container(
                                  width: 4, height: 4, color: windowColor),
                            ],
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
            style: const TextStyle(color: Colors.white24, fontSize: 9),
          ),
        ],
      ),
    );
  }
}
