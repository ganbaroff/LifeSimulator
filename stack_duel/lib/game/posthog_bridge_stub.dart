// Non-web stub for the PostHog bridge: analytics is a no-op off the web (tests,
// VM, future native builds). The web implementation lives in
// posthog_bridge_web.dart and is selected via a conditional import.
void posthogCapture(String name, Map<String, Object?> props) {}
