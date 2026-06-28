import 'package:flutter/material.dart';

import '../state/daily_seed.dart';
import '../state/leaderboard.dart';
import 'stack_duel_game.dart';

/// Today's Daily Challenge leaderboard (Sprint 4 — the proven "compete with
/// friends" retention lever). Everyone playing the same day shares a seed, so
/// scores are directly comparable. Reads live from Supabase; degrades to a
/// friendly empty state off-web / before the table exists.
class LeaderboardOverlay extends StatelessWidget {
  const LeaderboardOverlay({super.key, required this.game});

  final StackDuelGame game;

  int get _seed {
    final active = game.activeDaily?.seed;
    if (active != null) return active;
    final n = DateTime.now();
    return dailySeedForDate(n.year, n.month, n.day);
  }

  @override
  Widget build(BuildContext context) {
    final me = game.playerName;
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
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 2),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text('DAILY LEADERBOARD',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1)),
                    ),
                    IconButton(
                      onPressed: () => game.overlays.remove('leaderboard'),
                      icon: const Icon(Icons.close, color: Colors.white70),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text('Daily #$_seed',
                    style: const TextStyle(
                        color: Color(0xFFF1C40F),
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
              ),
              Expanded(
                child: FutureBuilder<List<LeaderEntry>>(
                  future: fetchLeaderboard(_seed),
                  builder: (context, snap) {
                    if (snap.connectionState != ConnectionState.done) {
                      return const Center(
                          child: CircularProgressIndicator(
                              color: Color(0xFF3498DB)));
                    }
                    final rows = snap.data ?? const [];
                    if (rows.isEmpty) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: Text(
                            'No scores yet today.\nPlay the Daily Challenge and be first!',
                            textAlign: TextAlign.center,
                            style:
                                TextStyle(color: Colors.white54, fontSize: 16),
                          ),
                        ),
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      itemCount: rows.length,
                      itemBuilder: (context, i) {
                        final e = rows[i];
                        final mine = me.isNotEmpty && e.name == me;
                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 3),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: mine
                                ? const Color(0xFF1E3A2A)
                                : const Color(0xFF11161E),
                            borderRadius: BorderRadius.circular(10),
                            border: mine
                                ? Border.all(color: const Color(0xFF2ECC71))
                                : null,
                          ),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 34,
                                child: Text('${i + 1}',
                                    style: TextStyle(
                                        color: i < 3
                                            ? const Color(0xFFF1C40F)
                                            : Colors.white54,
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold)),
                              ),
                              Expanded(
                                child: Text(
                                    e.name.isEmpty ? 'Player' : e.name,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                        color: Colors.white, fontSize: 16)),
                              ),
                              Text('${e.score}',
                                  style: const TextStyle(
                                      color: Color(0xFF2ECC71),
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 6, 20, 20),
                child: ElevatedButton(
                  onPressed: () => game.overlays.remove('leaderboard'),
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
