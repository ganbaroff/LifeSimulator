import 'package:flame/components.dart';
import 'package:flutter/material.dart';

/// A single tower block. Used both for the resting blocks that make up the
/// tower and for the one block that is currently moving across the screen.
///
/// Positioning uses the component's own [position] as the TOP-LEFT corner
/// (the default [Anchor.topLeft]). All slice math is done in world X
/// coordinates via the [left] / [right] helpers.
class StackBlock extends PositionComponent {
  StackBlock({
    required Vector2 position,
    required Vector2 size,
    required this.color,
    this.moving = false,
    this.movingRight = true,
    this.speed = 0,
  }) : super(position: position, size: size, anchor: Anchor.topLeft);

  /// Flat fill color for this block.
  Color color;

  /// Whether this block is the active block sliding left<->right.
  bool moving;

  /// Current horizontal direction while [moving].
  bool movingRight;

  /// Horizontal speed in logical pixels/second while [moving].
  double speed;

  /// Horizontal bounds (world X) the moving block bounces between.
  double minX = 0;
  double maxX = 0;

  /// World-space left/right edges on the X axis.
  double get left => position.x;
  double get right => position.x + size.x;

  final Paint _paint = Paint();

  @override
  void update(double dt) {
    super.update(dt);
    if (!moving) return;

    final dx = speed * dt * (movingRight ? 1 : -1);
    position.x += dx;

    // Bounce off the configured bounds, clamping to stay inside them.
    if (position.x <= minX) {
      position.x = minX;
      movingRight = true;
    } else if (position.x + size.x >= maxX) {
      position.x = maxX - size.x;
      movingRight = false;
    }
  }

  @override
  void render(Canvas canvas) {
    _paint.color = color;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.x, size.y), _paint);
  }
}
