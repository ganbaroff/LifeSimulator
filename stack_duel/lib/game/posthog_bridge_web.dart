// Web implementation of the PostHog bridge. Routes events through the global
// `window.sdTrack(name, props)` helper defined in web/index.html, which guards
// against PostHog not being initialised (no key set yet) — so this is always
// safe to call.
import 'dart:js_interop';

@JS('sdTrack')
external void _sdTrack(JSString name, JSAny? props);

void posthogCapture(String name, Map<String, Object?> props) {
  try {
    _sdTrack(name.toJS, props.jsify());
  } catch (_) {
    // Never let analytics break gameplay.
  }
}
