import 'package:flame/components.dart';
import 'package:flutter/material.dart';

/// The sliced-off overhang of a drop. It is not part of the tower; it simply
/// accelerates downward under gravity and removes itself once it falls well
/// below the visible area.
class FallingPiece extends PositionComponent {
  FallingPiece({
    required Vector2 position,
    required Vector2 size,
    required this.color,
    this.removeBelowY = 5000,
  }) : super(position: position, size: size, anchor: Anchor.topLeft);

  final Color color;

  /// Once the piece's top passes this world Y it is removed.
  final double removeBelowY;

  /// Downward velocity (px/s), grows under [_gravity].
  double _vy = 0;
  static const double _gravity = 2200;

  final Paint _paint = Paint();

  @override
  void update(double dt) {
    super.update(dt);
    _vy += _gravity * dt;
    position.y += _vy * dt;
    if (position.y > removeBelowY) {
      removeFromParent();
    }
  }

  @override
  void render(Canvas canvas) {
    _paint.color = color;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.x, size.y), _paint);
  }
}
