// Web implementation of the Telegram bridge. Routes through small null-safe
// helpers defined in web/index.html (sdTgName / sdTgShare) so this stays tiny
// and never throws if the Telegram WebApp context is absent.
import 'dart:js_interop';

@JS('sdTgName')
external JSString _sdTgName();

@JS('sdTgUserId')
external JSString _sdTgUserId();

@JS('sdTgStartParam')
external JSString _sdTgStartParam();

@JS('sdTgShare')
external JSBoolean _sdTgShare(JSString url, JSString text);

String telegramUserName() {
  try {
    return _sdTgName().toDart;
  } catch (_) {
    return '';
  }
}

String telegramUserId() {
  try {
    return _sdTgUserId().toDart;
  } catch (_) {
    return '';
  }
}

String telegramStartParam() {
  try {
    return _sdTgStartParam().toDart;
  } catch (_) {
    return '';
  }
}

bool telegramShare(String url, String text) {
  try {
    return _sdTgShare(url.toJS, text.toJS).toDart;
  } catch (_) {
    return false;
  }
}
