import 'dart:math' as math;

import 'package:flame/components.dart';
import 'package:flame/effects.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

import '../state/score_state.dart';
import 'analytics.dart';
import 'falling_piece.dart';
import 'haptics.dart';
import 'slice_math.dart';
import 'stack_block.dart';

/// Build identifier shown on screen so a player can confirm exactly which build
/// they are running (cache-proof deployment check). CI injects the commit sha
/// via `--dart-define=BUILD_TAG=<sha>`; defaults to 'dev' for local runs.
const String kBuildTag = String.fromEnvironment('BUILD_TAG', defaultValue: 'dev');

/// Stack Duel: tap to drop the moving block onto the tower. Misaligned drops
/// get sliced; missing entirely ends the run.
class StackDuelGame extends FlameGame {
  StackDuelGame({
    required this.scoreState,
    this.haptics = const DeviceHaptics(),
    this.analytics = const NoopAnalytics(),
  });

  final ScoreState scoreState;

  /// Tactile feedback seam (injected so tests can use a fake).
  final Haptics haptics;

  /// Analytics seam (no-op by default; events are wired for Day 3).
  final Analytics analytics;

  /// Height of every block (logical px).
  static const double blockHeight = 40;

  /// Speed tuning for the moving block.
  static const double _baseSpeed = 120;
  static const double _speedPerPoint = 8;
  static const double _maxSpeed = 460;

  /// How far down (as a fraction of viewport height) below the screen top the
  /// active moving block should sit. Drives the upward camera scroll.
  static const double _topMargin = 0.22;

  /// How long the sliced piece keeps falling (engine running) after a fatal
  /// drop before the game-over overlay appears. Pure feel.
  static const double _gameOverDelay = 0.6;

  /// Half-width (px) of the "perfect" window: a drop whose center is within this
  /// of the top block's center counts as perfect. DEVICE-TUNED KNOB (§13) — a
  /// starting value to be tuned by feel on the S24, not a final pick.
  static const double _perfectEpsilon = 8;

  /// Flat color palette cycled per height for visual variety.
  static const List<Color> _palette = [
    Color(0xFFE74C3C),
    Color(0xFFE67E22),
    Color(0xFFF1C40F),
    Color(0xFF2ECC71),
    Color(0xFF1ABC9C),
    Color(0xFF3498DB),
    Color(0xFF9B59B6),
  ];

  /// Tower blocks, base first. The last entry is the current top.
  final List<StackBlock> _tower = [];

  /// The block currently sliding across the screen (null while game over).
  StackBlock? _moving;

  /// Fixed world X around which the view is framed (screen center X).
  late double _centerX;

  bool isGameOver = false;

  /// True during the brief death animation (sliced piece falling) before the
  /// overlay is shown and the engine is paused. Taps are ignored throughout,
  /// so a rage-tap at death can't trigger an accidental drop or restart.
  bool _dying = false;
  double _deathTimer = 0;

  /// Consecutive-perfect streak. Drives the score multiplier (and future coins).
  int _combo = 0;

  late TextComponent _scoreText;
  late TextComponent _comboText;
  final TextPaint _hudPaint = TextPaint(
    style: const TextStyle(
      color: Colors.white,
      fontSize: 22,
      fontWeight: FontWeight.bold,
    ),
  );

  /// On-screen build badge (deployment proof).
  final TextPaint _buildPaint = TextPaint(
    style: const TextStyle(
      color: Color(0xFFF1C40F),
      fontSize: 16,
      fontWeight: FontWeight.bold,
    ),
  );

  /// Combo readout (shown only while a streak is active).
  final TextPaint _comboPaint = TextPaint(
    style: const TextStyle(
      color: Color(0xFF2ECC71),
      fontSize: 26,
      fontWeight: FontWeight.bold,
    ),
  );

  /// Transient "PERFECT" flash.
  final TextPaint _perfectPaint = TextPaint(
    style: const TextStyle(
      color: Colors.white,
      fontSize: 34,
      fontWeight: FontWeight.bold,
    ),
  );

  @override
  Color backgroundColor() => const Color(0xFF1B2430);

  @override
  Future<void> onLoad() async {
    _scoreText = TextComponent(
      text: '',
      textRenderer: _hudPaint,
      position: Vector2(16, 24),
      anchor: Anchor.topLeft,
    );
    camera.viewport.add(_scoreText);

    // Build badge so the player can confirm which build is actually installed.
    camera.viewport.add(TextComponent(
      text: 'BUILD $kBuildTag',
      textRenderer: _buildPaint,
      position: Vector2(16, 52),
      anchor: Anchor.topLeft,
    ));

    _comboText = TextComponent(
      text: '',
      textRenderer: _comboPaint,
      position: Vector2(16, 78),
      anchor: Anchor.topLeft,
    );
    camera.viewport.add(_comboText);

    // Full-screen tap catcher (component-based TapCallbacks). Lives in the
    // viewport so it covers the screen regardless of camera scroll.
    camera.viewport.add(_TapLayer(this));

    _startNewRun();
  }

  // ---------------------------------------------------------------------------
  // Run lifecycle
  // ---------------------------------------------------------------------------

  void _startNewRun() {
    // Clear any previous tower / pieces.
    world.removeAll(world.children.toList());
    _tower.clear();
    _moving = null;
    isGameOver = false;
    _dying = false;
    _combo = 0;
    scoreState.reset();

    _centerX = size.x / 2;

    // Base block.
    final baseWidth = size.x * 0.45;
    final base = StackBlock(
      position: Vector2(_centerX - baseWidth / 2, 0),
      size: Vector2(baseWidth, blockHeight),
      color: _palette[0],
    );
    _tower.add(base);
    world.add(base);

    _spawnMovingBlock();
    _snapCameraToTarget();
    _updateHud();
    analytics.event('game_start');
  }

  /// Resets the tower to a single base block. Called by the restart button.
  void restart() {
    analytics.event('restart');
    overlays.remove('gameOver');
    _startNewRun();
    resumeEngine();
  }

  // ---------------------------------------------------------------------------
  // Spawning
  // ---------------------------------------------------------------------------

  double get _currentSpeed =>
      math.min(_baseSpeed + scoreState.current * _speedPerPoint, _maxSpeed);

  void _spawnMovingBlock() {
    final top = _tower.last;
    final width = top.size.x;
    final y = top.position.y - blockHeight;

    const margin = 8.0;
    final minX = _centerX - size.x / 2 + margin;
    final maxX = _centerX + size.x / 2 - margin;

    final block = StackBlock(
      position: Vector2(minX, y),
      size: Vector2(width, blockHeight),
      color: _palette[(_tower.length) % _palette.length],
      moving: true,
      movingRight: true,
      speed: _currentSpeed,
    )
      ..minX = minX
      ..maxX = maxX;

    _moving = block;
    world.add(block);
  }

  // ---------------------------------------------------------------------------
  // Drop handling
  //
  // The core slice math lives in slice_math.dart (pure Dart, no Flame) so it
  // can be reviewed and unit-tested on its own. dropBlock just feeds it the
  // current world-space edges and applies the result.
  // ---------------------------------------------------------------------------

  /// Called when the player taps. Drops the moving block onto the tower.
  void dropBlock() {
    if (isGameOver) return;
    final moving = _moving;
    if (moving == null) return;

    final top = _tower.last;
    final y = moving.position.y;
    moving.moving = false;

    final result = computeOverlap(
      top.left,
      top.right,
      moving.left,
      moving.right,
    );

    if (result.gameOver) {
      // Let the missed block keep its position but tip it off as a falling
      // piece, then end the run.
      world.remove(moving);
      world.add(FallingPiece(
        position: Vector2(moving.position.x, y),
        size: moving.size.clone(),
        color: moving.color,
        removeBelowY: y + 2000,
      ));
      _moving = null;
      _endRun();
      return;
    }

    // Replace the moving block with the trimmed resting block (the overlap).
    world.remove(moving);
    final resting = StackBlock(
      position: Vector2(result.newLeft, y),
      size: Vector2(result.newWidth, blockHeight),
      color: moving.color,
    );
    _tower.add(resting);
    world.add(resting);

    // Spawn the sliced overhang as a falling piece.
    if (result.hasOverhang) {
      world.add(FallingPiece(
        position: Vector2(result.overhangLeft, y),
        size: Vector2(result.overhangWidth, blockHeight),
        color: moving.color,
        removeBelowY: y + 2000,
      ));
    }

    // Perfect = the dropped block's center is within the epsilon window of the
    // top block's center. It only grants feedback + combo; the slice above still
    // narrowed the tower normally (no width armor).
    final topCenter = (top.left + top.right) / 2;
    final dropCenter = (moving.left + moving.right) / 2;
    final perfect = isPerfect(topCenter, dropCenter, _perfectEpsilon);

    final prevCombo = _combo;
    _combo = perfect ? _combo + 1 : 0;
    if (_combo != prevCombo) {
      analytics.event('combo_changed', {'combo': _combo});
    }
    if (perfect) {
      analytics.event('perfect', {'combo': _combo});
      haptics.perfect();
      _showPerfectFlash();
    } else {
      haptics.success();
    }

    // Combo multiplier feeds the score (capped — see comboMultiplier).
    scoreState.add(comboMultiplier(_combo));
    _updateHud();
    _spawnMovingBlock();
  }

  /// Brief, asset-free "PERFECT" flash near the top-centre of the screen.
  void _showPerfectFlash() {
    final flash = TextComponent(
      text: 'PERFECT',
      textRenderer: _perfectPaint,
      position: Vector2(size.x / 2, size.y * 0.28),
      anchor: Anchor.center,
    )..add(RemoveEffect(delay: 0.55));
    camera.viewport.add(flash);
  }

  Future<void> _endRun() async {
    // Enter the "dying" window synchronously: this blocks further taps/drops
    // immediately, but the engine keeps running so the sliced piece visibly
    // falls. update() shows the overlay and pauses after [_gameOverDelay].
    isGameOver = true;
    _dying = true;
    _deathTimer = _gameOverDelay;
    _combo = 0;
    haptics.gameOver();
    analytics.event('game_over', {
      'score': scoreState.current,
      'blocks': _tower.length,
    });
    await scoreState.maybeUpdateBest();
    _updateHud();
  }

  // ---------------------------------------------------------------------------
  // Camera + HUD
  // ---------------------------------------------------------------------------

  /// Camera center Y that keeps the active block near the top of the screen.
  double get _targetCameraY {
    final activeTopY =
        _moving?.position.y ?? _tower.last.position.y - blockHeight;
    return activeTopY + (0.5 - _topMargin) * size.y;
  }

  void _snapCameraToTarget() {
    camera.viewfinder.position = Vector2(_centerX, _targetCameraY);
  }

  @override
  void update(double dt) {
    super.update(dt); // keeps animating the falling piece during the death window
    if (isGameOver) {
      if (_dying) {
        _deathTimer -= dt;
        if (_deathTimer <= 0) {
          _dying = false;
          overlays.add('gameOver');
          pauseEngine();
        }
      }
      return;
    }
    // Smoothly scroll the camera upward as the tower grows.
    final current = camera.viewfinder.position;
    final target = Vector2(_centerX, _targetCameraY);
    camera.viewfinder.position =
        current + (target - current) * math.min(1, dt * 6);
  }

  void _updateHud() {
    _scoreText.text =
        'Score: ${scoreState.current}    Best: ${scoreState.best}';
    _comboText.text = _combo > 0 ? 'Combo ×${comboMultiplier(_combo)}' : '';
  }

  @override
  void onGameResize(Vector2 newSize) {
    super.onGameResize(newSize);
    // Keep horizontal framing centered if the surface size changes.
    _centerX = newSize.x / 2;
  }
}

/// Invisible full-screen layer that turns taps anywhere into a block drop.
class _TapLayer extends PositionComponent with TapCallbacks {
  _TapLayer(this._game);

  final StackDuelGame _game;

  @override
  Future<void> onLoad() async {
    size = _game.size;
  }

  @override
  void onGameResize(Vector2 newSize) {
    super.onGameResize(newSize);
    size = newSize;
  }

  @override
  void onTapDown(TapDownEvent event) {
    _game.dropBlock();
  }
}
