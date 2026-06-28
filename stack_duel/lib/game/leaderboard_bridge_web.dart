// Web implementation of the leaderboard bridge. Calls the null-safe Supabase
// REST helpers (sdLbSubmit / sdLbTop) defined in web/index.html. Returns a JSON
// string for the top list (parsed by the pure parser in state/leaderboard.dart).
import 'dart:js_interop';

@JS('sdLbSubmit')
external void _sdLbSubmit(
    JSNumber seed, JSString name, JSNumber score, JSNumber height);

@JS('sdLbTop')
external JSPromise<JSString> _sdLbTop(JSNumber seed);

void leaderboardSubmit(int seed, String name, int score, int height) {
  try {
    _sdLbSubmit(seed.toJS, name.toJS, score.toJS, height.toJS);
  } catch (_) {}
}

Future<String> leaderboardTopJson(int seed) async {
  try {
    final result = await _sdLbTop(seed.toJS).toDart;
    return result.toDart;
  } catch (_) {
    return '[]';
  }
}
