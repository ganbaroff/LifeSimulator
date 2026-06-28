import 'dart:math' as math;

import 'package:flame/components.dart';
import 'package:flame/effects.dart';
import 'package:flame/events.dart';
import 'package:flame/game.dart';
import 'package:flame/particles.dart';
import 'package:flutter/material.dart';

import '../state/achievements.dart';
import '../state/characters.dart';
import '../state/city_state.dart';
import '../state/coin_state.dart';
import '../state/crystal_state.dart';
import '../state/daily_seed.dart';
import '../state/duel.dart';
import '../state/leaderboard.dart';
import '../state/powers.dart';
import '../state/score_state.dart';
import '../state/settings_state.dart';
import '../state/skin_state.dart';
import '../state/streak_state.dart';
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
    required this.crystalState,
    required this.achievementState,
    required this.streakState,
    required this.settingsState,
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

  /// Hard currency (revives, premium). Earned from achievements + golden blocks.
  final CrystalState crystalState;

  /// Persisted achievement unlocks (the goal layer).
  final AchievementState achievementState;

  /// Daily streak (return hook).
  final StreakState streakState;

  /// One-time tutorial flag + mute (Sprint 1: onboarding + feel).
  final SettingsState settingsState;

  /// True while the first-ever run is being played (drives hints + an easier
  /// early pace so the player gets a guaranteed early "perfect" WOW).
  bool _tutorialRun = false;

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

  /// Active Daily Challenge config, or null for normal endless mode. Set via
  /// [playDaily]; everyone on the same day shares the same deterministic run.
  DailyConfig? activeDaily;

  /// True while playing today's Daily Challenge (drives the share card).
  bool get isDaily => activeDaily != null;

  /// The opponent when playing an incoming duel link, else null.
  DuelChallenge? activeOpponent;

  /// True while playing an async duel (vs a friend's seed + score).
  bool get isDuel => activeOpponent != null;

  /// Public base URL of the hosted game (used to build share/duel links).
  static const String siteUrl = 'https://ganbaroff.github.io/LifeSimulator/';

  /// The player's display name (from the Telegram WebApp on web; '' otherwise).
  /// Set once at startup; used so a duel challenge shows a real name, not
  /// "a friend" (Sprint 3).
  String playerName = '';

  /// Base-width fraction + perfect window, overridden by the daily config.
  double get _baseWidthFactor => activeDaily?.baseWidthFactor ?? 0.45;
  double get _epsilon => activeDaily?.perfectEpsilon ?? _perfectEpsilon;

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

  // --- Powers (the core<->meta loop): abilities unlocked by city progress,
  // one charge each per run, spent during play. -----------------------------
  /// True between run start and game over (drives the power bar visibility).
  bool runActive = false;

  /// Powers available this run + remaining charges.
  List<Power> _deck = [];
  final Map<PowerId, int> _charges = {};

  /// Armed/active effects.
  bool _widenArmed = false;
  bool _autoCenterArmed = false;
  bool _shieldArmed = false;
  double _slowmoTimer = 0;

  // --- Run stats + economy finalize (revive-safe). -------------------------
  /// Best combo reached this run (for achievements).
  int _bestComboThisRun = 0;

  /// Whether any power was used this run (achievement).
  bool _usedPowerThisRun = false;

  /// Guards once-per-run economy (the city building + ad cadence) across revives.
  bool _finalizedThisRun = false;

  /// Perfects already paid out as coins this run (so a revived run only tops up
  /// the delta instead of double-paying).
  int _coinsPaidThisRun = 0;

  /// Set once the async end-of-run finalize has completed; the game-over overlay
  /// waits for this so it never renders with stale economy / missing toasts.
  bool _finalizeComplete = false;

  /// Times revived this run (revive cost scales with it).
  int _reviveCount = 0;

  /// Achievements newly unlocked on the latest game over (shown on the overlay).
  List<Achievement> lastUnlocked = [];

  /// True if the current top moving block is a golden bonus block.
  bool _movingGolden = false;

  /// Transient camera zoom-punch amount on a perfect (decays to 0) — juice.
  double _zoomPunch = 0;

  /// Crystal cost to revive the current run (scales each revive).
  int get reviveCost => 2 + _reviveCount * 2;

  /// Whether a revive is currently offered (died, affordable, not too many).
  bool get canRevive =>
      isGameOver && _reviveCount < 3 && crystalState.total >= reviveCost;

  List<Power> get powerDeck => _deck;
  bool get powersVisible => runActive && !isGameOver;
  int chargesOf(PowerId id) => _charges[id] ?? 0;
  bool get _slowmoActive => _slowmoTimer > 0;

  /// Screen-space gradient backdrop (its colours drift with height).
  late _Background _bg;

  late TextComponent _scoreText;
  late TextComponent _comboText;
  late TextComponent _coinText;
  late TextComponent _vsText;
  late TextComponent _hintText;
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

  /// Resident emoji that pops on a perfect (P3).
  final TextPaint _emojiPaint = TextPaint(
    style: const TextStyle(fontSize: 26),
  );

  @override
  Color backgroundColor() => const Color(0xFF1B2430);

  /// Current mode label for analytics (endless / daily / duel).
  String get _mode => isDuel ? 'duel' : (isDaily ? 'daily' : 'endless');

  @override
  Future<void> onLoad() async {
    await sound.preload();
    analytics.event('app_open');

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

    // Duel target (shown only while playing an incoming challenge).
    _vsText = TextComponent(
      text: '',
      textRenderer: _comboPaint,
      position: Vector2(16, 120),
      anchor: Anchor.topLeft,
    );
    camera.viewport.add(_vsText);

    // First-run teach-by-doing hint (centred, above the tower).
    _hintText = TextComponent(
      text: '',
      textRenderer: _comboPaint,
      position: Vector2(size.x / 2, size.y * 0.42),
      anchor: Anchor.center,
    );
    camera.viewport.add(_hintText);

    // Full-screen tap catcher (component-based TapCallbacks). Lives in the
    // viewport so it covers the screen regardless of camera scroll.
    camera.viewport.add(_TapLayer(this));

    // Power bar sits on top (higher priority) so its buttons get taps before
    // the drop layer.
    camera.viewport.add(_PowerBar(this)..priority = 50);

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

    // Build this run's power deck from city progress (collection -> abilities).
    final residentCount = residentsOf(cityState.buildings).length;
    _deck = unlockedPowers(
        cityState.totalBuildings, cityState.totalHeight, residentCount);
    _charges
      ..clear()
      ..addEntries(_deck.map((p) => MapEntry(p.id, 1)));
    _widenArmed = false;
    _autoCenterArmed = false;
    _shieldArmed = false;
    _slowmoTimer = 0;
    _bestComboThisRun = 0;
    _usedPowerThisRun = false;
    _finalizedThisRun = false;
    _coinsPaidThisRun = 0;
    _finalizeComplete = false;
    _reviveCount = 0;
    _movingGolden = false;
    _zoomPunch = 0;
    camera.viewfinder.zoom = 1.0;
    lastUnlocked = [];
    _tutorialRun = !settingsState.tutorialDone;
    runActive = true;

    _centerX = size.x / 2;

    // Base block.
    _baseWidth = size.x * _baseWidthFactor;
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
  /// Keeps the current mode (endless or today's daily).
  void restart() {
    analytics.event('restart');
    overlays.remove('gameOver');
    _startNewRun();
    resumeEngine();
  }

  /// Start a normal endless run (from the title screen).
  void playEndless() {
    activeDaily = null;
    activeOpponent = null;
    overlays.remove('start');
    _startNewRun();
    resumeEngine();
  }

  /// Start today's Daily Challenge — a deterministic run shared by everyone
  /// playing on the same local day (the "Wordle effect").
  void playDaily() {
    final now = DateTime.now();
    activeDaily =
        DailyConfig.fromSeed(dailySeedForDate(now.year, now.month, now.day));
    activeOpponent = null;
    overlays.remove('start');
    _startNewRun();
    resumeEngine();
    analytics.event('daily_start', {'seed': activeDaily!.seed});
  }

  /// Accept an incoming duel: play the challenger's exact seed, racing to beat
  /// their score. Reuses the deterministic daily engine for fairness.
  void playDuel(DuelChallenge opponent) {
    activeDaily = DailyConfig.fromSeed(opponent.seed);
    activeOpponent = opponent;
    overlays.remove('start');
    _startNewRun();
    resumeEngine();
    analytics.event('duel_start', {'seed': opponent.seed});
  }

  /// A `?duel=` link that challenges a friend to beat THIS run on the same seed.
  /// Every shared result is therefore a challenge (the viral loop).
  String duelLink() {
    final d = activeDaily;
    if (d == null) return siteUrl;
    final token = encodeDuel(d.seed, playerName, scoreState.current);
    return '$siteUrl?duel=$token';
  }

  /// Return to the title screen.
  void goHome() {
    overlays.remove('gameOver');
    overlays.add('start');
  }

  /// Shareable result card for a finished Daily/Duel run (copy -> paste into a
  /// chat). The viral atom: same seed, comparable scores, an emoji grid like
  /// Wordle — and the link is a duel challenge, so every share recruits a player.
  String dailyShareCard() =>
      '${dailyShareText()}\nBeat me 👉 ${duelLink()}';

  /// The card body WITHOUT the link — for native Telegram share, where the URL
  /// is passed separately so it isn't duplicated.
  String dailyShareText() {
    final d = activeDaily;
    if (d == null) return '';
    final bar = perfectBar(_perfectsThisRun, _tower.length);
    final header = isDuel
        ? '⚔️ Stack Duel ${d.label}  ·  ${d.modifier}'
        : '🏙 Stack Daily ${d.label}  ·  ${d.modifier}';
    final result = isDuel
        ? '${duelResultLine(activeOpponent!.name, scoreState.current, activeOpponent!.score)}\n'
        : '';
    return '$header\n'
        '${result}Height ${_tower.length}  ·  Score ${scoreState.current}\n'
        '$bar';
  }

  /// One-line duel verdict for the result overlay (empty if not a duel).
  String duelResult() => isDuel
      ? duelResultLine(
          activeOpponent!.name, scoreState.current, activeOpponent!.score)
      : '';

  // ---------------------------------------------------------------------------
  // Spawning
  // ---------------------------------------------------------------------------

  double get _currentSpeed {
    final base = activeDaily?.startSpeed ?? _baseSpeed;
    final per = activeDaily?.speedPerPoint ?? _speedPerPoint;
    final speed = math.min(base + scoreState.current * per, _maxSpeed);
    // First-ever run: crawl the first few blocks so the player lands an easy
    // early perfect (teach-by-doing + a WOW moment).
    if (_tutorialRun && _tower.length <= 3) return speed * 0.5;
    return speed;
  }

  void _spawnMovingBlock() {
    final top = _tower.last;
    final width = top.size.x;
    final y = top.position.y - blockHeight;

    const margin = 8.0;
    final minX = _centerX - size.x / 2 + margin;
    final maxX = _centerX + size.x / 2 - margin;

    // Daily seed can start the sweep from the right (variety + comparability).
    final startRight = activeDaily?.startRight ?? true;

    // Every so often a golden bonus block appears (extra score + a crystal).
    _movingGolden = _tower.length > 0 && _tower.length % 11 == 0;
    final color = _movingGolden
        ? const Color(0xFFFFD54A)
        : _palette[(_tower.length) % _palette.length];

    final block = StackBlock(
      position: Vector2(startRight ? minX : maxX - width, y),
      size: Vector2(width, blockHeight),
      color: color,
      moving: true,
      movingRight: startRight,
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

  /// Spend a power (one charge) during a run. Returns true if it fired.
  bool activatePower(PowerId id) {
    if (!runActive || isGameOver) return false;
    if ((_charges[id] ?? 0) <= 0) return false;
    _charges[id] = _charges[id]! - 1;
    _usedPowerThisRun = true;
    switch (id) {
      case PowerId.widen:
        _widenArmed = true;
        break;
      case PowerId.slowmo:
        _slowmoTimer = 3.0;
        break;
      case PowerId.autocenter:
        _autoCenterArmed = true;
        break;
      case PowerId.shield:
        _shieldArmed = true;
        break;
    }
    haptics.success();
    analytics.event('power_used', {'id': id.name});
    return true;
  }

  /// Called when the player taps. Drops the moving block onto the tower.
  void dropBlock() {
    if (isGameOver) return;
    final moving = _moving;
    if (moving == null) return;

    final top = _tower.last;
    final y = moving.position.y;
    moving.moving = false;

    // Perfect power: snap the dropped block dead-centre over the top block.
    if (_autoCenterArmed) {
      final topCenterX = (top.left + top.right) / 2;
      moving.position.x = topCenterX - moving.size.x / 2;
      _autoCenterArmed = false;
    }

    final result = computeOverlap(
      top.left,
      top.right,
      moving.left,
      moving.right,
    );

    if (result.gameOver) {
      // Let the missed block keep its position but tip it off as a falling
      // piece.
      world.remove(moving);
      world.add(FallingPiece(
        position: Vector2(moving.position.x, y),
        size: moving.size.clone(),
        color: moving.color,
        removeBelowY: y + 2000,
      ));
      _moving = null;
      // Shield power: survive this miss and get the block back.
      if (_shieldArmed) {
        _shieldArmed = false;
        haptics.perfect();
        if (!settingsState.muted) sound.perfect(1);
        _floatText('🛡️ SAVED', size.y * 0.30);
        _spawnMovingBlock();
        return;
      }
      _endRun();
      return;
    }

    world.remove(moving);

    // Perfect = dropped centre within epsilon of the top centre.
    final topCenter = (top.left + top.right) / 2;
    final dropCenter = (moving.left + moving.right) / 2;
    final perfect = isPerfect(topCenter, dropCenter, _epsilon);

    // The resting block is the overlap; on a perfect it grows back a little
    // (capped at the base width, recentred on the overlap) — the genre flow hook.
    var restWidth = result.newWidth;
    var restLeft = result.newLeft;
    if (perfect) {
      restWidth = restoredWidth(result.newWidth, _baseWidth, _perfectRestore);
      restLeft = result.newCenterX - restWidth / 2;
    }
    // Widen power: this block snaps back to the full base width.
    if (_widenArmed) {
      restWidth = _baseWidth;
      restLeft = result.newCenterX - restWidth / 2;
      _widenArmed = false;
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
    if (_combo > _bestComboThisRun) _bestComboThisRun = _combo;
    if (_combo != prevCombo) {
      analytics.event('combo_changed', {'combo': _combo});
    }
    if (perfect) {
      _perfectsThisRun += 1;
      analytics.event('perfect', {'combo': _combo});
      if (_perfectsThisRun == 1) analytics.event('first_perfect', {'mode': _mode});
      haptics.perfect();
      if (!settingsState.muted) sound.perfect(_combo);
      _showPerfectFlash();
      _perfectBurst(restLeft + restWidth / 2, y + blockHeight / 2);
      _residentCheer(restLeft + restWidth / 2, y);
      _zoomPunch = 0.05; // quick camera punch-in on a perfect
      // Combo milestone fanfare.
      if (_combo == 5) _floatText('🔥 ON FIRE', size.y * 0.2);
      if (_combo == 8) _floatText('⚡ UNSTOPPABLE', size.y * 0.2);
    } else {
      haptics.success();
      if (!settingsState.muted) sound.drop();
    }

    // Combo multiplier feeds the score (capped — see comboMultiplier).
    scoreState.add(comboMultiplier(_combo));

    // Golden bonus block payout: extra score + a crystal.
    if (_movingGolden) {
      scoreState.add(3);
      crystalState.add(1);
      _floatText('💎 +1', size.y * 0.34);
      analytics.event('golden_block');
    }

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

  /// A transient floating text near the top-centre (asset-free fanfare).
  void _floatText(String text, double y) {
    final t = TextComponent(
      text: text,
      textRenderer: _perfectPaint,
      position: Vector2(size.x / 2, y),
      anchor: Anchor.center,
    )
      ..add(MoveEffect.by(Vector2(0, -24), EffectController(duration: 0.6)))
      ..add(RemoveEffect(delay: 0.7));
    camera.viewport.add(t);
  }

  /// A quick game-over screen shake (net-zero so the camera returns to rest).
  void _screenShake() {
    camera.viewfinder.add(SequenceEffect([
      MoveEffect.by(Vector2(0, 10), EffectController(duration: 0.04)),
      MoveEffect.by(Vector2(0, -18), EffectController(duration: 0.05)),
      MoveEffect.by(Vector2(0, 12), EffectController(duration: 0.05)),
      MoveEffect.by(Vector2(0, -4), EffectController(duration: 0.04)),
    ]));
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

  /// A resident character pops out of a perfectly-placed block and hops up —
  /// surprise + personality (VISION.md, P3). Cosmetic only; the building's real
  /// resident is assigned from its final tier on the City screen.
  void _residentCheer(double cx, double cy) {
    final c = kAllResidents[_perfectsThisRun % kAllResidents.length];
    final cheer = TextComponent(
      text: c.glyph,
      textRenderer: _emojiPaint,
      position: Vector2(cx, cy),
      anchor: Anchor.bottomCenter,
    )
      ..add(MoveEffect.by(Vector2(0, -46), EffectController(duration: 0.6)))
      ..add(RemoveEffect(delay: 0.6));
    world.add(cheer);
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
    _finalizeComplete = false;
    runActive = false;
    _slowmoTimer = 0;
    _combo = 0;
    if (_tutorialRun) {
      settingsState.markTutorialDone();
      analytics.event('tutorial_done');
    }
    haptics.gameOver();
    if (!settingsState.muted) sound.gameOver();
    _screenFlash(const Color(0x55E74C3C), 0.4); // red game-over flash
    _screenShake();
    analytics.event('game_over', {
      'score': scoreState.current,
      'blocks': _tower.length,
      'perfects': _perfectsThisRun,
      'mode': _mode,
      'revives': _reviveCount,
    });

    if (!_finalizedThisRun) {
      // First death of the run: bank coins, add the city building, run the
      // interstitial cadence (once per run, even across revives).
      _finalizedThisRun = true;
      _coinsPaidThisRun = _perfectsThisRun;
      if (_perfectsThisRun > 0) {
        coinState.add(_perfectsThisRun);
        analytics.event('coins_earned', {'coins': _perfectsThisRun});
      }
      _gameOvers += 1;
      if (_gameOvers % 3 == 0) {
        ads.showInterstitial();
        analytics.event('ad_interstitial', {'count': _gameOvers});
      }
      final building =
          await cityState.addBuilding(_tower.length, _perfectsThisRun);
      analytics.event('building_added', {
        'height': building.height,
        'tier': building.tier,
        'city_level': cityState.cityLevel,
      });
    } else {
      // The run continued past its first death (revive): top up coins for the
      // new perfects and grow the building to reflect the FINAL, taller tower.
      final delta = _perfectsThisRun - _coinsPaidThisRun;
      if (delta > 0) {
        coinState.add(delta);
        _coinsPaidThisRun = _perfectsThisRun;
      }
      await cityState.replaceLast(_tower.length, _perfectsThisRun);
    }

    // Goals re-evaluate every death (recordEarned dedups; pays crystals).
    await _evaluateAchievements();
    await streakState.recordPlay(_todayEpochDay());
    await scoreState.maybeUpdateBest();

    // Daily Challenge runs post to the shared leaderboard (not duels — they use
    // the challenger's seed). Fire-and-forget; no-op off web / if unreachable.
    if (isDaily && !isDuel) {
      submitScore(activeDaily!.seed,
          playerName.isEmpty ? 'Player' : playerName, scoreState.current,
          _tower.length);
    }

    _updateHud();
    _finalizeComplete = true; // overlay may now show with correct data
  }

  int _todayEpochDay() {
    final n = DateTime.now();
    return epochDayFor(n.year, n.month, n.day);
  }

  /// Unlock + pay out any achievements earned this run; stash the new ones for
  /// the game-over overlay to toast.
  Future<void> _evaluateAchievements() async {
    final stats = RunStats(
      perfects: _perfectsThisRun,
      bestCombo: _bestComboThisRun,
      height: _tower.length,
      cityIsMetropolis: cityState.cityLevel == 'Metropolis',
      duelWon: isDuel && scoreState.current > activeOpponent!.score,
      usedPower: _usedPowerThisRun,
      residentCount: residentsOf(cityState.buildings).length,
    );
    final fresh = await achievementState.recordEarned(achievementsEarned(stats));
    lastUnlocked = fresh;
    for (final a in fresh) {
      await crystalState.add(a.reward);
      analytics.event('achievement_unlock', {'id': a.id.name});
    }
  }

  /// Spend crystals to continue the current run with the tower intact — the
  /// genre's monetization hook (continue-for-currency).
  Future<bool> revive() async {
    if (!canRevive) return false;
    if (!await crystalState.spend(reviveCost)) return false;
    _reviveCount += 1;
    isGameOver = false;
    _dying = false;
    runActive = true;
    _combo = 0;
    lastUnlocked = [];
    overlays.remove('gameOver');
    _floatText('❤️ REVIVED', size.y * 0.28);
    _spawnMovingBlock();
    resumeEngine();
    analytics.event('revive', {'count': _reviveCount});
    return true;
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
        // Wait for BOTH the death animation AND the async finalize, so the
        // overlay never shows stale economy / a missing achievement toast.
        if (_deathTimer <= 0 && _finalizeComplete) {
          _dying = false;
          overlays.add('gameOver');
          pauseEngine();
        }
      }
      return;
    }
    // Slow-Mo power: count down + crawl the moving block while active.
    if (_slowmoTimer > 0) _slowmoTimer -= dt;
    final moving = _moving;
    if (moving != null) {
      moving.speed = _currentSpeed * (_slowmoActive ? 0.4 : 1.0);
    }
    // Camera punch on a perfect: a quick zoom-in that decays back to 1.0.
    if (_zoomPunch > 0.0008) {
      camera.viewfinder.zoom = 1.0 + _zoomPunch;
      _zoomPunch *= 0.80;
    } else if (_zoomPunch != 0) {
      _zoomPunch = 0;
      camera.viewfinder.zoom = 1.0;
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
    _coinText.text =
        'Coins: ${coinState.total}    💎 ${crystalState.total}';
    _vsText.text = isDuel
        ? 'vs ${duelDisplayName(activeOpponent!.name)}: ${activeOpponent!.score}'
        : '';

    // First-run hints: teach the tap, then teach the centre = perfect.
    if (_tutorialRun && !isGameOver) {
      if (_tower.length <= 1) {
        _hintText.text = '👆 TAP to drop the block';
      } else if (_tower.length <= 4) {
        _hintText.text = 'Line up the CENTER → PERFECT';
      } else {
        _hintText.text = '';
      }
    } else {
      _hintText.text = '';
    }

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

/// On-screen power bar: a row of tappable ability buttons at the bottom. Reads
/// the run's deck + charges from the game each frame; hidden when not in a run.
/// Tapping a button spends a charge (and marks the tap handled so it doesn't
/// also drop a block).
class _PowerBar extends PositionComponent with TapCallbacks {
  _PowerBar(this._game);

  final StackDuelGame _game;

  static const double _btn = 60;
  static const double _gap = 14;
  static const double _barH = 76;

  final TextPaint _glyphPaint = TextPaint(style: const TextStyle(fontSize: 26));
  final TextPaint _labelPaint = TextPaint(
    style: const TextStyle(color: Colors.white, fontSize: 9),
  );
  final TextPaint _chargePaint = TextPaint(
    style: const TextStyle(
        color: Color(0xFFF1C40F), fontSize: 12, fontWeight: FontWeight.bold),
  );

  @override
  Future<void> onLoad() async {
    size = Vector2(_game.size.x, _barH);
    position = Vector2(0, _game.size.y - _barH - 8);
  }

  @override
  void onGameResize(Vector2 newSize) {
    super.onGameResize(newSize);
    size = Vector2(newSize.x, _barH);
    position = Vector2(0, newSize.y - _barH - 8);
  }

  /// Button rectangles (local coords) paired with their power, centred in the bar.
  List<MapEntry<Rect, Power>> _layout() {
    final deck = _game.powerDeck;
    if (deck.isEmpty) return const [];
    final totalW = deck.length * _btn + (deck.length - 1) * _gap;
    var x = (size.x - totalW) / 2;
    final y = (size.y - _btn) / 2;
    final out = <MapEntry<Rect, Power>>[];
    for (final p in deck) {
      out.add(MapEntry(Rect.fromLTWH(x, y, _btn, _btn), p));
      x += _btn + _gap;
    }
    return out;
  }

  @override
  void render(Canvas canvas) {
    if (!_game.powersVisible) return;
    for (final e in _layout()) {
      final rect = e.key;
      final power = e.value;
      final charges = _game.chargesOf(power.id);
      final enabled = charges > 0;
      final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(12));
      canvas.drawRRect(
        rrect,
        Paint()
          ..color = enabled ? const Color(0xCC1B2A3A) : const Color(0x55121820),
      );
      canvas.drawRRect(
        rrect,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5
          ..color = enabled ? const Color(0xFF3498DB) : const Color(0x33FFFFFF),
      );
      final center = rect.center;
      _glyphPaint.render(
        canvas,
        power.glyph,
        Vector2(center.dx, rect.top + 22),
        anchor: Anchor.center,
      );
      _labelPaint.render(
        canvas,
        power.name,
        Vector2(center.dx, rect.bottom - 14),
        anchor: Anchor.center,
      );
      _chargePaint.render(
        canvas,
        '×$charges',
        Vector2(rect.right - 6, rect.top + 6),
        anchor: Anchor.topRight,
      );
    }
  }

  @override
  void onTapDown(TapDownEvent event) {
    if (!_game.powersVisible) return;
    // Flame stops tap propagation at the top-most component (this bar) by
    // default, so a tap that lands here never also drops a block — whether or
    // not it hits a button or the button has charge.
    final p = event.localPosition;
    for (final e in _layout()) {
      if (e.key.contains(Offset(p.x, p.y))) {
        _game.activatePower(e.value.id);
        return;
      }
    }
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
