import 'dart:convert';

import '../game/leaderboard_bridge.dart';

/// One row of the daily leaderboard.
class LeaderEntry {
  const LeaderEntry({required this.name, required this.score, required this.height});

  final String name;
  final int score;
  final int height;
}

/// Parse the PostgREST JSON array into entries. Pure + defensive (any malformed
/// payload yields an empty list rather than throwing) so it is unit-testable.
List<LeaderEntry> parseLeaderboard(String json) {
  try {
    final decoded = jsonDecode(json);
    if (decoded is! List) return const [];
    final out = <LeaderEntry>[];
    for (final e in decoded) {
      if (e is! Map) continue;
      out.add(LeaderEntry(
        name: (e['name'] ?? '').toString(),
        score: (e['score'] is num) ? (e['score'] as num).toInt() : 0,
        height: (e['height'] is num) ? (e['height'] as num).toInt() : 0,
      ));
    }
    return out;
  } catch (_) {
    return const [];
  }
}

/// Submit a finished run to the daily leaderboard (fire-and-forget). No-op off
/// web / when the backend is unreachable.
void submitScore(int seed, String name, int score, int height) =>
    leaderboardSubmit(seed, name, score, height);

/// Fetch today's top scores for [seed]. Returns [] on any failure.
Future<List<LeaderEntry>> fetchLeaderboard(int seed) async =>
    parseLeaderboard(await leaderboardTopJson(seed));
