import 'package:flutter/material.dart';

import '../state/achievements.dart';
import 'stack_duel_game.dart';

/// The achievements screen: the full catalogue with unlocked ones lit up and
/// their crystal rewards. A goal board the player returns to.
class AchievementsOverlay extends StatelessWidget {
  const AchievementsOverlay({super.key, required this.game});

  final StackDuelGame game;

  @override
  Widget build(BuildContext context) {
    final ach = game.achievementState;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {},
      child: Container(
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
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'ACHIEVEMENTS  ${ach.count}/${kAchievements.length}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => game.overlays.remove('achievements'),
                      icon: const Icon(Icons.close, color: Colors.white70),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    for (final a in kAchievements)
                      _AchRow(ach: a, unlocked: ach.isUnlocked(a.id)),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                child: ElevatedButton(
                  onPressed: () => game.overlays.remove('achievements'),
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

class _AchRow extends StatelessWidget {
  const _AchRow({required this.ach, required this.unlocked});

  final Achievement ach;
  final bool unlocked;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: unlocked ? 1 : 0.45,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: unlocked ? const Color(0xFF1B2A3A) : const Color(0xFF141A22),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: unlocked ? const Color(0xFFF1C40F) : Colors.white24,
          ),
        ),
        child: Row(
          children: [
            Text(unlocked ? ach.glyph : '🔒',
                style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ach.name,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700)),
                  Text(ach.desc,
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 12)),
                ],
              ),
            ),
            Text('💎 ${ach.reward}',
                style: const TextStyle(
                    color: Color(0xFFF1C40F),
                    fontSize: 14,
                    fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
