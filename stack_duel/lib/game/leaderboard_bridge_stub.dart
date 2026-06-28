// Non-web stub for the leaderboard bridge (tests/VM): no network, so submit is a
// no-op and the top list is empty. The web implementation lives in
// leaderboard_bridge_web.dart, selected via a conditional import.

void leaderboardSubmit(int seed, String name, int score, int height) {}

Future<String> leaderboardTopJson(int seed) async => '[]';
