// Non-web stub for the Telegram bridge (tests/VM/native): no Telegram context,
// so no name and no native share. The web implementation lives in
// telegram_bridge_web.dart, selected via a conditional import.

/// The current Telegram user's display name, or '' if unavailable.
String telegramUserName() => '';

/// The current Telegram user's numeric id as a string, or '' if unavailable.
String telegramUserId() => '';

/// The start_param passed when the Mini App was opened via a deep link,
/// e.g. 'ref_12345' from t.me/bot/app?startapp=ref_12345. Returns '' if none.
String telegramStartParam() => '';

/// Opens the native Telegram share sheet for [url]+[text]; returns true if it
/// actually opened (i.e. running inside Telegram), false to fall back.
bool telegramShare(String url, String text) => false;
