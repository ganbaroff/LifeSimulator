// Facade for the Supabase leaderboard bridge: web impl on web, no-op stub
// elsewhere (tests/VM). Consumers call leaderboardSubmit()/leaderboardTopJson().
export 'leaderboard_bridge_stub.dart'
    if (dart.library.js_interop) 'leaderboard_bridge_web.dart';
