import 'analytics.dart';
// Selects the web bridge on web, the no-op stub everywhere else (tests/VM).
import 'posthog_bridge_stub.dart'
    if (dart.library.js_interop) 'posthog_bridge_web.dart';

/// Real analytics: forwards events to PostHog on web (Sprint 2), no-op
/// elsewhere. Wired behind the existing [Analytics] seam — one-line swap, zero
/// re-instrumentation at the call sites.
class PostHogAnalytics implements Analytics {
  const PostHogAnalytics();

  @override
  void event(String name, [Map<String, Object?> params = const {}]) {
    posthogCapture(name, params);
  }
}
