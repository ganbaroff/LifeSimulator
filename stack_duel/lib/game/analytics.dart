/// Analytics event seam.
///
/// No provider is wired yet (out of scope until Day 3), but the call sites exist
/// now so that adding a real provider later is a one-line swap with zero
/// re-instrumentation. Events used: game_start, game_over, restart, perfect,
/// combo_changed (HANDOFF §10.6).
abstract class Analytics {
  void event(String name, [Map<String, Object?> params]);
}

/// Default no-op implementation (does nothing, costs nothing).
class NoopAnalytics implements Analytics {
  const NoopAnalytics();

  @override
  void event(String name, [Map<String, Object?> params = const {}]) {}
}
