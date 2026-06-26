import 'dart:math' as math;

import 'package:flame/components.dart';
import 'package:flame/effects.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flame/particles.dart';
import 'package:flutter/material.dart';

import '../state/city_state.dart';
import '../state/coin_state.dart';
import '../state/score_state.dart';
import '../state/skin_state.dart';
import 'ads.dart';
import 'analytics.dart';
import 'falling_piece.dart';
import 'haptics.dart';
import 'slice_math.dart';
import 'sound.dart';
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
    required this.coinState,
    required this.skinState,
    required this.cityState,
    this.haptics = const DeviceHaptics(),
    this.analytics = const NoopAnalytics(),
    this.sound = const GameSound(),
    this.ads = const NoopAds(),
  });

  final ScoreState scoreState;

  /// Persisted soft currency (cosmetic-only; HANDOFF §12).
  final CoinState coinState;

  /// Owned/selected cosmetic skins (palette source).
  final SkinState skinState;

  /// Persistent city meta — each completed run adds a building (VISION.md, P1).
  final CityState cityState;

  /// Tactile feedback seam (injected so tests can use a fake).
  final Haptics haptics;

  /// Analytics seam (no-op by default; events are wired for Day 3).
  final Analytics analytics;

  /// Sound seam (real audio by default; tests inject silence).
  final Sound sound;

  /// Ads seam (no-op until the real AdMob impl drops in on Day 3).
  final Ads ads;

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

  /// How much width a perfect drop grows back (px), capped at the base width.
  /// Genre flow hook (§13 knob). Not immortality: capped + speed ramp + any
  /// non-perfect drop narrows.
  static const double _perfectRestore = 14;

  /// Flat colour palette cycled per height — sourced from the selected skin.
  List<Color> get _palette => skinState.palette;

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

  /// Perfects landed in the current run (coins earned on game over).
  int _perfectsThisRun = 0;

  /// Game-overs this session — drives the interstitial cadence.
  int _gameOvers = 0;

  /// Original base-block width; the cap for the perfect width-restore.
  late double _baseWidth;

  /// Screen-space gradient backdrop (its colours drift with height).
  late _Background _bg;

  late TextComponent _scoreText;
  late TextComponent _comboText;
  late TextComponent _coinText;
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

  /// Dim build badge (deployment proof, kept unobtrusive).
  final TextPaint _devPaint = TextPaint(
    style: const TextStyle(color: Color(0x55FFFFFF), fontSize: 11),
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
    await sound.preload();

    // Add the gradient backdrop at GAME level behind the camera, not in the
    // viewport — a viewport child renders ON TOP of the world and would hide the
    // tower. Low priority keeps it behind the world + HUD.
    _bg = _Background()..size = size;
    add(_bg);

    _scoreText = TextComponent(
      text: '',
      textRenderer: _hudPaint,
      position: Vector2(16, 24),
      anchor: Anchor.topLeft,
    );
    camera.viewport.add(_scoreText);

    // Build badge — kept (deployment proof) but dim and tucked bottom-left.
    camera.viewport.add(TextComponent(
      text: 'BUILD $kBuildTag',
      textRenderer: _devPaint,
      position: Vector2(8, size.y - 18),
      anchor: Anchor.topLeft,
    ));

    _comboText = TextComponent(
      text: '',
      textRenderer: _comboPaint,
      position: Vector2(16, 56),
      anchor: Anchor.topLeft,
    );
    camera.viewport.add(_comboText);

    _coinText = TextComponent(
      text: '',
      textRenderer: _buildPaint,
      position: Vector2(16, 88),
      anchor: Anchor.topLeft,
    );
    camera.viewport.add(_coinText);

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
    _perfectsThisRun = 0;
    scoreState.reset();

    _centerX = size.x / 2;

    // Base block.
    _baseWidth = size.x * 0.45;
    final base = StackBlock(
      position: Vector2(_centerX - _baseWidth / 2, 0),
      size: Vector2(_baseWidth, blockHeight),
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

    world.remove(moving);

    // Perfect = dropped centre within epsilon of the top centre.
    final topCenter = (top.left + top.right) / 2;
    final dropCenter = (moving.left + moving.right) / 2;
    final perfect = isPerfect(topCenter, dropCenter, _perfectEpsilon);

    // The resting block is the overlap; on a perfect it grows back a little
    // (capped at the base width, recentred on the overlap) — the genre flow hook.
    var restWidth = result.newWidth;
    var restLeft = result.newLeft;
    if (perfect) {
      restWidth = restoredWidth(result.newWidth, _baseWidth, _perfectRestore);
      restLeft = result.newCenterX - restWidth / 2;
    }
    final resting = StackBlock(
      position: Vector2(restLeft, y),
      size: Vector2(restWidth, blockHeight),
      color: moving.color,
    );
    _tower.add(resting);
    world.add(resting);
    _spawnLandingFlash(restLeft, y, restWidth, perfect);

    // Spawn the sliced overhang (part of the dropped block outside the overlap).
    if (result.hasOverhang) {
      world.add(FallingPiece(
        position: Vector2(result.overhangLeft, y),
        size: Vector2(result.overhangWidth, blockHeight),
        color: moving.color,
        removeBelowY: y + 2000,
      ));
    }

    final prevCombo = _combo;
    _combo = perfect ? _combo + 1 : 0;
    if (_combo != prevCombo) {
      analytics.event('combo_changed', {'combo': _combo});
    }
    if (perfect) {
      _perfectsThisRun += 1;
      analytics.event('perfect', {'combo': _combo});
      haptics.perfect();
      sound.perfect(_combo);
      _showPerfectFlash();
      _perfectBurst(restLeft + restWidth / 2, y + blockHeight / 2);
    } else {
      haptics.success();
      sound.drop();
    }

    // Combo multiplier feeds the score (capped — see comboMultiplier).
    scoreState.add(comboMultiplier(_combo));
    _updateHud();
    _spawnMovingBlock();
  }

  /// Brief, asset-free "PERFECT" flash near the top-centre of the screen.
  void _showPerfectFlash() {
    final grow = 1 + (_combo.clamp(1, 6) - 1) * 0.12; // bigger as the streak grows
    final flash = TextComponent(
      text: _combo >= 2 ? 'PERFECT ×$_combo' : 'PERFECT',
      textRenderer: _perfectPaint,
      position: Vector2(size.x / 2, size.y * 0.28),
      anchor: Anchor.center,
      scale: Vector2.all(grow),
    )..add(RemoveEffect(delay: 0.55));
    camera.viewport.add(flash);
  }

  /// Small white spark burst on a perfect (asset-free, Flame core particles).
  void _perfectBurst(double cx, double cy) {
    final rnd = math.Random();
    world.add(ParticleSystemComponent(
      position: Vector2(cx, cy),
      particle: Particle.generate(
        count: 10 + _combo.clamp(0, 8) * 3, // denser burst on bigger combos
        lifespan: 0.5,
        generator: (i) {
          final dir = rnd.nextDouble() * math.pi * 2;
          final speed = 80 + rnd.nextDouble() * 120;
          return AcceleratedParticle(
            speed: Vector2(math.cos(dir), math.sin(dir)) * speed,
            acceleration: Vector2(0, 280),
            child: CircleParticle(
              radius: 2.5,
              paint: Paint()..color = const Color(0xFFFFFFFF),
            ),
          );
        },
      ),
    ));
  }

  /// White flash over a just-placed block that fades out — landing juice.
  /// Brighter and slightly larger on a perfect.
  void _spawnLandingFlash(double left, double y, double width, bool perfect) {
    final pad = perfect ? 6.0 : 0.0;
    final dur = perfect ? 0.30 : 0.16;
    final flash = RectangleComponent(
      position: Vector2(left - pad, y - pad),
      size: Vector2(width + pad * 2, blockHeight + pad * 2),
      paint: Paint()
        ..color = Color(perfect ? 0xCCFFFFFF : 0x66FFFFFF),
    )
      ..add(OpacityEffect.fadeOut(EffectController(duration: dur)))
      ..add(RemoveEffect(delay: dur));
    world.add(flash);
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
    sound.gameOver();
    _screenFlash(const Color(0x55E74C3C), 0.4); // red game-over flash
    analytics.event('game_over', {
      'score': scoreState.current,
      'blocks': _tower.length,
    });

    // Economy: earn one coin per perfect this run (cosmetic-only; §12).
    if (_perfectsThisRun > 0) {
      coinState.add(_perfectsThisRun);
      analytics.event('coins_earned', {'coins': _perfectsThisRun});
    }

    // Interstitial cadence: every 3rd game over (not the 1st/2nd) — §12.
    _gameOvers += 1;
    if (_gameOvers % 3 == 0) {
      ads.showInterstitial();
      analytics.event('ad_interstitial', {'count': _gameOvers});
    }

    // City meta: this run becomes a building in the persistent city. Tower
    // height + perfects decide its size + quality tier (VISION.md, P1).
    final building =
        await cityState.addBuilding(_tower.length, _perfectsThisRun);
    analytics.event('building_added', {
      'height': building.height,
      'tier': building.tier,
      'city_level': cityState.cityLevel,
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
    _coinText.text = 'Coins: ${coinState.total}';

    // Background hue drifts as the tower climbs — a sense of journey.
    final hue = (212 + scoreState.current * 4) % 360.0;
    _bg.top = HSVColor.fromAHSV(1, hue, 0.40, 0.24).toColor();
    _bg.bottom = const Color(0xFF0A0E15);
  }

  @override
  void onGameResize(Vector2 newSize) {
    super.onGameResize(newSize);
    // Keep horizontal framing centered if the surface size changes.
    _centerX = newSize.x / 2;
  }

  /// Full-screen coloured flash (screen space) that fades out — game-over juice.
  void _screenFlash(Color color, double duration) {
    final flash = RectangleComponent(
      size: size.clone(),
      paint: Paint()..color = color,
      priority: 100,
    )
      ..add(OpacityEffect.fadeOut(EffectController(duration: duration)))
      ..add(RemoveEffect(delay: duration));
    camera.viewport.add(flash);
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

/// Screen-space vertical gradient backdrop. Colours are mutated by the game so
/// the background drifts in hue as the tower climbs.
class _Background extends PositionComponent {
  _Background() : super(priority: -1000);

  Color top = const Color(0xFF1B2430);
  Color bottom = const Color(0xFF0A0E15);

  @override
  void render(Canvas canvas) {
    final rect = Rect.fromLTWH(0, 0, size.x, size.y);
    final paint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [top, bottom],
      ).createShader(rect);
    canvas.drawRect(rect, paint);
  }

  @override
  void onGameResize(Vector2 newSize) {
    super.onGameResize(newSize);
    size = newSize;
  }
}
