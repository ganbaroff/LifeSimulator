// Facade for the Telegram WebApp bridge: re-exports the web implementation on
// web, the no-op stub everywhere else (tests/VM). Consumers just
// `import 'telegram_bridge.dart'` and call telegramUserName()/telegramShare().
export 'telegram_bridge_stub.dart'
    if (dart.library.js_interop) 'telegram_bridge_web.dart';
