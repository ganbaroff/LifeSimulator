import 'dart:math' as math;

import 'package:flame/components.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

import '../state/score_state.dart';
import 'falling_piece.dart';
import 'haptics.dart';
import 'slice_math.dart';
import 'stack_block.dart';

/// Stack Duel: tap to drop the moving block onto the tower. Misaligned drops
/// get sliced; missing entirely ends the run.
class StackDuelGame extends FlameGame {
  StackDuelGame({required this.scoreState, this.haptics = const DeviceHaptics()});

  final ScoreState scoreState;

  /// Tactile feedback seam (injected so tests can use a fake).
  final Haptics haptics;

  /// Height of every block (logical px).
  static const double blockHeight = 40;

  /// Speed tuning for the moving block.
  static const double _baseSpeed = 120;
  static const double _speedPerPoint = 8;
  static const double _maxSpeed = 460;

  /// How far down (as a fraction of viewport height) below the screen top the
  /// active moving block should sit. Drives the upward camera scroll.
  static const double _topMargin = 0.22;

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

  late TextComponent _scoreText;
  final TextPaint _hudPaint = TextPaint(
    style: const TextStyle(
      color: Colors.white,
      fontSize: 22,
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
  }

  /// Resets the tower to a single base block. Called by the restart button.
  void restart() {
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

    scoreState.increment();
    haptics.success();
    _updateHud();
    _spawnMovingBlock();
  }

  Future<void> _endRun() async {
    isGameOver = true;
    haptics.gameOver();
    await scoreState.maybeUpdateBest();
    _updateHud();
    overlays.add('gameOver');
    pauseEngine();
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
    super.update(dt);
    if (isGameOver) return;
    // Smoothly scroll the camera upward as the tower grows.
    final current = camera.viewfinder.position;
    final target = Vector2(_centerX, _targetCameraY);
    camera.viewfinder.position =
        current + (target - current) * math.min(1, dt * 6);
  }

  void _updateHud() {
    _scoreText.text =
        'Score: ${scoreState.current}    Best: ${scoreState.best}';
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
