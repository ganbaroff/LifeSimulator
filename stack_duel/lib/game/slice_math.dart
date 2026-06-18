import 'dart:math' as math;

/// Result of slicing the dropped block against the current top block.
///
/// All values are in world-space X coordinates. When [gameOver] is true the
/// drop missed entirely and the remaining fields are unused.
///
/// This file has NO Flame/Flutter dependency on purpose: the slice math is the
/// heart of the game, so it lives in plain Dart where it can be reviewed and
/// unit-tested in isolation.
class OverlapResult {
  OverlapResult.gameOver()
      : gameOver = true,
        newLeft = 0,
        newRight = 0,
        newWidth = 0,
        newCenterX = 0,
        hasOverhang = false,
        overhangLeft = 0,
        overhangWidth = 0;

  OverlapResult.placed({
    required this.newLeft,
    required this.newRight,
    required this.newWidth,
    required this.newCenterX,
    required this.hasOverhang,
    required this.overhangLeft,
    required this.overhangWidth,
  }) : gameOver = false;

  final bool gameOver;

  /// Resting (overlap) rectangle on the X axis.
  final double newLeft;
  final double newRight;
  final double newWidth;
  final double newCenterX;

  /// The sliced-off overhang, if any (the part that stuck out).
  final bool hasOverhang;
  final double overhangLeft;
  final double overhangWidth;
}

/// Slices the dropped block against the current top block on the X axis.
///
///  * prevLeft/prevRight  – edges of the block already on top of the tower.
///  * dropLeft/dropRight  – edges of the dropped block at the tap moment.
///
/// The new resting block is exactly the overlap rectangle; its center is
/// recomputed to the overlap midpoint. The non-overlapping part becomes an
/// overhang that falls away. Zero/negative overlap is a game over.
OverlapResult computeOverlap(
  double prevLeft,
  double prevRight,
  double dropLeft,
  double dropRight,
) {
  final overlapLeft = math.max(prevLeft, dropLeft);
  final overlapRight = math.min(prevRight, dropRight);
  final overlapWidth = overlapRight - overlapLeft;

  if (overlapWidth <= 0) {
    return OverlapResult.gameOver();
  }

  final newCenterX = (overlapLeft + overlapRight) / 2;

  // The dropped block has the same width as the top block, so it sticks out on
  // at most one side. Detect whichever side overhangs.
  final leftOverhang = overlapLeft - dropLeft; // > 0 if it stuck out left
  final rightOverhang = dropRight - overlapRight; // > 0 if it stuck out right

  var hasOverhang = false;
  var overhangLeft = 0.0;
  var overhangWidth = 0.0;
  if (leftOverhang > 0) {
    hasOverhang = true;
    overhangLeft = dropLeft;
    overhangWidth = leftOverhang;
  } else if (rightOverhang > 0) {
    hasOverhang = true;
    overhangLeft = overlapRight;
    overhangWidth = rightOverhang;
  }

  return OverlapResult.placed(
    newLeft: overlapLeft,
    newRight: overlapRight,
    newWidth: overlapWidth,
    newCenterX: newCenterX,
    hasOverhang: hasOverhang,
    overhangLeft: overhangLeft,
    overhangWidth: overhangWidth,
  );
}

/// Whether a drop counts as "perfect": the dropped block's center is within
/// [epsilon] of the top block's center.
///
/// Perfect is feedback + combo only — it does NOT preserve width. The slice in
/// [computeOverlap] still runs normally, so the tower keeps narrowing by the
/// tiny misalignment (audit delta #1: Perfect is a skill ceiling, not armor).
bool isPerfect(double prevCenter, double dropCenter, double epsilon) =>
    (prevCenter - dropCenter).abs() <= epsilon;

/// Score multiplier for a run of [streak] consecutive perfects.
///
/// streak 0 -> 1x (a normal, non-perfect drop). Each perfect adds 1x. The
/// multiplier is **capped** so it can't inflate coins once combos feed the
/// rewarded "double coins" economy (audit delta #2). Pure + saturating so it is
/// the single source of truth for future coin payouts (§12).
int comboMultiplier(int streak) {
  if (streak <= 0) return 1;
  const maxMultiplier = 8;
  final m = 1 + streak;
  return m > maxMultiplier ? maxMultiplier : m;
}

/// Width the resting block grows back to on a perfect drop.
///
/// Genre standard (original "Stack"): a perfect placement nudges the block wider
/// again by [restoreStep], CAPPED at [baseWidth]. This is the flow hook — perfect
/// has a tangible gameplay payoff, not just a score pop. It is NOT immortality:
/// growth is capped at the base width, any non-perfect drop still narrows the
/// tower, and the speed ramp keeps landing perfects genuinely hard.
double restoredWidth(double overlapWidth, double baseWidth, double restoreStep) {
  final w = overlapWidth + restoreStep;
  return w > baseWidth ? baseWidth : w;
}
