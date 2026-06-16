import 'package:flutter/services.dart';

/// Tactile feedback seam for the game.
///
/// Kept behind a tiny interface so the game can fire haptics on the right events
/// while staying headless-testable: the real implementation hits a platform
/// channel that we do not want to invoke in `flutter test`. Tests inject a fake.
abstract class Haptics {
  /// A successful block drop landed.
  void success();

  /// The run ended (missed drop).
  void gameOver();
}

/// Real device haptics via Flutter's built-in [HapticFeedback]. No extra pub
/// dependency — `flutter/services` ships with the SDK.
class DeviceHaptics implements Haptics {
  const DeviceHaptics();

  @override
  void success() => HapticFeedback.mediumImpact();

  @override
  void gameOver() => HapticFeedback.heavyImpact();
}
