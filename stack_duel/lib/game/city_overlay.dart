import 'package:flutter/material.dart';

import '../state/city_math.dart';
import 'stack_duel_game.dart';

/// The City screen (Stack City meta, P1): a skyline built from every run you've
/// completed. Each run is one building; taller/higher-quality runs make bigger,
/// better buildings, and the whole city levels up as it grows. Layered on top of
/// the start / game-over overlays; closing returns to whatever was behind it.
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

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF243B55), Color(0xFF0A0E15)],
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
                '${city.cityLevel}   ·   ${city.totalBuildings} buildings'
                '   ·   height ${city.totalHeight}',
                style: const TextStyle(
                  color: Color(0xFF3498DB),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
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
                  : _Skyline(buildings: buildings, tierColors: _tierColors),
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

/// Horizontally scrollable row of buildings, sitting on a ground line. Building
/// pixel-height scales with its block height; colour encodes its quality tier.
class _Skyline extends StatelessWidget {
  const _Skyline({required this.buildings, required this.tierColors});

  final List<Building> buildings;
  final List<Color> tierColors;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Color(0xFF394B5E), width: 2),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            for (final b in buildings)
              _BuildingBar(building: b, color: tierColors[b.tier.clamp(0, 4)]),
          ],
        ),
      ),
    );
  }
}

class _BuildingBar extends StatelessWidget {
  const _BuildingBar({required this.building, required this.color});

  final Building building;
  final Color color;

  @override
  Widget build(BuildContext context) {
    // 1 block ~= 9 px tall, clamped so tiny and huge towers both stay on screen.
    final h = (building.height * 9.0).clamp(16.0, 340.0);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 3),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 26,
            height: h,
            decoration: BoxDecoration(
              color: color,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(3)),
              // A lighter cap for a roof-light feel.
              border: const Border(
                top: BorderSide(color: Colors.white24, width: 3),
              ),
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
