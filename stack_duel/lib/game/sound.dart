import 'package:flame_audio/flame_audio.dart';

/// Sound seam.
///
/// Injectable like [Haptics]/[Analytics] so the game can fire sounds without
/// real audio in headless tests (tests inject [SilentSound] / a fake). All clips
/// are self-synthesised WAVs in `assets/audio/` — no third-party assets, so no
/// licensing risk.
abstract class Sound {
  /// Warm the cache before play (call once at startup).
  Future<void> preload();

  /// A normal (non-perfect) drop landed.
  void drop();

  /// A perfect drop landed; [comboLevel] (>=1) raises the pitch — the genre's
  /// signature rising-tone-per-perfect.
  void perfect(int comboLevel);

  /// The run ended.
  void gameOver();
}

/// Real audio via flame_audio (clips under `assets/audio/`).
class GameSound implements Sound {
  const GameSound();

  static const List<String> _files = [
    'tick.wav',
    'perfect1.wav',
    'perfect2.wav',
    'perfect3.wav',
    'perfect4.wav',
    'perfect5.wav',
    'over.wav',
  ];

  @override
  Future<void> preload() => FlameAudio.audioCache.loadAll(_files);

  @override
  void drop() => FlameAudio.play('tick.wav', volume: 0.5);

  @override
  void perfect(int comboLevel) {
    final i = comboLevel.clamp(1, 5);
    FlameAudio.play('perfect$i.wav', volume: 0.65);
  }

  @override
  void gameOver() => FlameAudio.play('over.wav', volume: 0.7);
}

/// No-op implementation (tests / muted).
class SilentSound implements Sound {
  const SilentSound();

  @override
  Future<void> preload() async {}

  @override
  void drop() {}

  @override
  void perfect(int comboLevel) {}

  @override
  void gameOver() {}
}
