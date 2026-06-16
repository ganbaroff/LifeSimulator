# Stack Duel — Project Handoff

> Audience: another AI (or developer) picking this up cold. Read this top to
> bottom before touching code. It explains what exists, what is proven, how it
> is built/shipped, every deliberate scope decision, and a prioritized plan for
> what to do next.

Last updated: 2026-06-16. Branch: `claude/stack-duel-flutter-game-dv0n5r`.

---

## 1. What this is

**Stack Duel** is a minimal one-tap stacking arcade game (the classic "Stack"
mechanic): a block slides horizontally above a tower; you tap to drop it; the
non-overlapping part is sliced off and falls away; the tower narrows as you
misalign; miss completely and it's game over.

Built with **Flutter + Flame** (2D game engine). Target platform: **Android**
(verified on a Samsung S24). It is a self-contained project living in the
`stack_duel/` subfolder of the `ganbaroff/LifeSimulator` repo.

### Status: Day 1 = DONE and GAME-PROVEN
- Built in the cloud, sideloaded onto a real S24, and played.
- Reached **Best: 25** across multiple runs → tap, slicing, camera scroll,
  scoring, persistence, and restart all confirmed live, not just in tests.
- Owner verdict on the core loop: **"затягивает" (it's engaging)** — the Day-1
  success criterion ("do I want to play again?") is met.

What's intentionally NOT there yet (see §6 scope decisions): no sound, no
haptics, no menus, no juice/particles, no ads/shop/skins/analytics/backend.

---

## 2. Repository layout (important context)

The repo root is an **unrelated React Native / Expo project** ("Life
Simulator"). Stack Duel is deliberately isolated in `stack_duel/` so the two
toolchains never collide (a `flutter create .` at the root would scatter
Android/iOS files into the RN project). **Do all game work inside
`stack_duel/`.** The only file outside it that belongs to this game is the CI
workflow.

```
stack_duel/
  pubspec.yaml            # deps: flame, shared_preferences (+ flame_test dev)
  pubspec.lock            # pins the VERIFIED versions (see §4)
  .gitignore              # ignores generated tooling + platform scaffold
  lib/
    main.dart             # app entry, GameWidget, game-over overlay + Restart
    game/
      stack_duel_game.dart  # FlameGame: loop, input, camera, spawn, state
      stack_block.dart      # block component (moving + resting), bounce
      falling_piece.dart    # sliced overhang that falls under gravity
      slice_math.dart       # PURE Dart core slice math (no Flame) — reviewable
    state/
      score_state.dart      # current/best score + shared_preferences persistence
  test/
    slice_math_check.dart   # pure-Dart harness for the slice math (18 asserts)
    runtime_test.dart       # headless FlameGame runtime tests (flame_test, 7)
.github/workflows/
  stack_duel_apk.yml      # cloud build → debug APK → artifact + Release asset
```

Total game code ≈ 620 lines lib + 260 lines tests.

---

## 3. The core mechanic, precisely (the part to understand first)

All slicing is 1-D on the **X axis**. Coordinates are **world space** (see §5
for how that relates to the camera). Block components use `Anchor.topLeft`, so
`block.left = position.x` and `block.right = position.x + size.x`.

The entire slice decision is one pure function:
`computeOverlap(prevLeft, prevRight, dropLeft, dropRight)` in
**`lib/game/slice_math.dart`**.

```
overlapLeft  = max(prevLeft, dropLeft)
overlapRight = min(prevRight, dropRight)
overlapWidth = overlapRight - overlapLeft

if overlapWidth <= 0           -> GAME OVER (no overlap, or edge-touch)
else:
  new resting block = the overlap rectangle
    width   = overlapWidth
    x-center = (overlapLeft + overlapRight) / 2   # RECOMPUTED, not the old center
  overhang  = the part of the dropped block outside the overlap
    (dropped block has the SAME width as the top block, so it sticks out on at
     most ONE side; whichever side has positive overhang spawns a FallingPiece)
```

The tower monotonically narrows as misalignment accumulates — that's the whole
difficulty curve. `slice_math.dart` has **zero Flame/Flutter imports** on
purpose, so it can be reviewed and unit-tested in isolation. `dropBlock()` in
`stack_duel_game.dart` is the only caller: it reads the live block edges, calls
`computeOverlap`, then applies the result (replace top block, spawn overhang,
score, spawn next).

---

## 4. Dependencies (VERIFIED versions from pubspec.lock)

| Package | Version | Why |
|---|---|---|
| flame | **1.37.0** | game engine (FlameGame, World, CameraComponent, TapCallbacks) |
| shared_preferences | **2.5.5** | persist best score |
| flame_test | 1.x (dev) | mount the game headless for runtime tests |
| Dart SDK | 3.x (stable; verified on 3.12.2) | — |

Do not loosen these without re-running the test suite. `flutter analyze` is
clean (0 issues) against exactly this set.

---

## 5. How the pieces work (file-by-file)

### `state/score_state.dart`
- `current` (this run) and `best` (all-time).
- `load()` reads best from SharedPreferences at startup (`main()` awaits it).
- `increment()` on each successful drop; `reset()` on new run.
- `maybeUpdateBest()` writes best back to prefs on game over if beaten.
- **Confirmed live:** Best survived app restarts on device.

### `game/stack_block.dart`
- One component for both moving and resting blocks (`moving` flag).
- While moving: integrates `position.x` by `speed * dt`, bounces between
  `minX`/`maxX`. `left`/`right` getters are the slice inputs.
- Renders a flat-color `Rect.fromLTWH(0,0,size.x,size.y)` (no asset).

### `game/falling_piece.dart`
- The sliced overhang. Accelerates downward (`_gravity = 2200`), removes itself
  once it passes `removeBelowY`. Purely cosmetic; not part of the tower.

### `game/slice_math.dart`
- Pure core math (see §3). `OverlapResult` is a small value object with named
  ctors `placed(...)` / `gameOver()`.

### `game/stack_duel_game.dart` (the conductor)
Key responsibilities and the constants you'll tune:
- **Spawn:** new moving block has the top block's width, spawned one
  `blockHeight` (40) above it, starting at the left bound moving right.
- **Speed ramp:** `speed = min(120 + score*8, 460)` px/s
  (`_baseSpeed`, `_speedPerPoint`, `_maxSpeed`).
- **Camera:** world Y increases downward; the tower grows toward **negative Y**.
  The default `CameraComponent` + `World` are used. `camera.viewfinder.position`
  is the world point at the viewport center (viewfinder anchor = center). Each
  frame it lerps toward `_targetCameraY = activeTopY + (0.5 - 0.22)*height`,
  keeping the active block ~22% from the top. As the tower rises, `activeTopY`
  decreases → camera follows up. `_topMargin = 0.22` controls the framing.
- **Input:** a full-screen invisible `_TapLayer` (a `PositionComponent with
  TapCallbacks`) is added to the **viewport** (screen space, not the world), so a
  tap **anywhere** calls `dropBlock()`. Score HUD `TextComponent` also lives in
  the viewport.
- **Game over:** `pauseEngine()` + `overlays.add('gameOver')`. NOTE: the overlay
  *builder* is registered by `GameWidget.overlayBuilderMap` in `main.dart`
  (present on device). Headless tests must register a stub builder (they do).
- **Restart:** `restart()` clears the world, rebuilds a single base block, resets
  score, removes overlay, `resumeEngine()`.

### `main.dart`
- `WidgetsFlutterBinding.ensureInitialized()` → `ScoreState.load()` →
  `runApp`. `GameWidget<StackDuelGame>` with `overlayBuilderMap: {'gameOver':
  GameOverOverlay}`. The overlay shows final score, best, and a Restart button
  wired to `game.restart`.

---

## 6. Deliberate scope decisions (do NOT "fix" these without a reason)

These are intentional v1 omissions, not bugs. The owner confirmed them on device
("no sound, no vibration") and they are correct per the original brief:
- **No audio** — the brief explicitly forbade sound/asset files in v1.
- **No haptics/vibration** — never in scope; it's "juice" for later.
- **No particles, no screen shake, no menus, no settings.**
- **No ads, shop, skins, coins, analytics, share, or backend.**
- **Flat colors only**, plain dark background `#1B2430`, palette cycles per
  height. No external art/audio assets anywhere.

Architectural decisions worth keeping:
- Slice math is isolated and pure — keep it that way; test it independently.
- The game lives in `stack_duel/`, isolated from the root RN project.
- `android/` scaffold is gitignored and generated in CI (`flutter create
  --platforms=android .`) — the repo stays clean of platform boilerplate.

---

## 7. Verification status (what is proven, and how)

| Layer | Method | Result |
|---|---|---|
| Slice math | `dart run test/slice_math_check.dart` (real Dart 3.12) | **18/18 pass** — perfect/left/right/miss/edge-touch/cumulative narrowing |
| Whole project compiles | `flutter analyze` (flame 1.37.0) | **0 issues** |
| Runtime game loop | `flutter test` (flame_test mounts FlameGame headless) | **7/7 pass** — boot, full-screen tap layer, scoring drop, falling-piece spawn+self-cleanup, camera scroll-up, miss→overlay, restart reset |
| Real device | Sideloaded debug APK on Samsung S24, played | **Game-proven**, Best 25, loop is engaging |

The one thing tests can't prove and the device did: OS touch delivery and the
subjective "feel". Both confirmed good on device.

---

## 8. Build & ship (how to get an APK without a laptop)

The owner builds/plays on a **phone only** — no desktop, and the cloud sandbox
cannot reach `dl.google.com` (Android SDK), so local APK builds are impossible
in-session. The solution is **GitHub Actions**:

- Workflow: `.github/workflows/stack_duel_apk.yml`. Triggers on push to the
  feature branch (paths `stack_duel/**`) or manual `workflow_dispatch`.
- Steps: checkout → Java 17 → Flutter stable → `flutter pub get` →
  `flutter test` → `flutter analyze` → `flutter create --platforms=android .`
  (generate the gitignored scaffold) → `flutter build apk --debug` → upload as
  an artifact AND attach to a Release.
- **Phone-friendly download:** the APK is published as a **Release asset** at tag
  `stack-duel-latest` (no GitHub login, not zipped, installs in one tap):
  `https://github.com/ganbaroff/LifeSimulator/releases/download/stack-duel-latest/stack-duel-debug.apk`
  (Actions *artifacts* are zipped and require login — avoid those on mobile.)
- Debug APK is ~143 MB (universal, all ABIs, debug) — normal; a release build
  would be far smaller.

Local dev (if a desktop with Flutter ever exists):
```
cd stack_duel
flutter create .          # generate android/ (gitignored)
flutter pub get
flutter run               # device/emulator
flutter test              # 7 runtime tests
dart run test/slice_math_check.dart   # 18 math asserts, no flutter needed
```

---

## 9. Commit history (this effort)

```
038f641 Publish Stack Duel APK as a GitHub Release asset
e64ac3d Add GitHub Actions workflow to build Stack Duel debug APK
04bda5c Add headless runtime tests for Stack Duel game loop
c0e89ba Add stack_duel .gitignore and pubspec.lock
24758b4 Isolate Stack Duel into stack_duel/, extract pure slice math + tests
81bb11f Add Stack Duel: Flutter + Flame stacking arcade game
```
No PR opened yet (owner wanted live proof first; that's now done — a PR is
reasonable from here if desired).

---

## 10. Where we go next — roadmap & proposals

**Guiding rule from the owner:** the loop is engaging, so add depth carefully.
Do NOT dump content. Add ONE thing at a time, rebuild the APK, play on device,
keep it only if it improves feel. Never regress the verified core (don't touch
`slice_math.dart` behavior; keep tests green).

### Tier 1 — Juice + retention (make the proven loop *feel* better). Highest ROI.
The owner noticed the absence of feedback; this is the natural next step now that
the loop is fun. Implement ONE per build, verify on S24 (see §13 one-knob rule).
1. **Haptics on slice** — light `HapticFeedback` on a successful drop, heavier on
   game over. Tiny change, big perceived polish.
2. **"Perfect" placement + combo** — if `|drop center - top center|` is within a
   small epsilon, treat as perfect: a visual/score pop and (optionally) no
   narrowing on that drop. Two HARD constraints from the owner (do not violate):
   - **2a. Perfect must NOT remove fail-pressure.** Perfect is a *skill ceiling,
     not an immortality mode.* Keep the aggressive speed ramp so perfects get
     genuinely harder to land as score climbs; tension must never disappear.
   - **2b. Design Perfect → combo multiplier NOW**, even with no coins yet. A
     consecutive-perfect streak drives a score multiplier that LATER maps onto
     coins and feeds rewarded "double coins". Put both pure functions in
     `slice_math.dart`: `isPerfect(...)` and `comboMultiplier(streak)`, each with
     asserts in `slice_math_check.dart`. Designing combo now means the economy
     drops in later with zero rework.
3. **Deferred game over** — let the sliced piece fall ~0.5s *before* the overlay
   (today `pauseEngine()` freezes it instantly). Pure feel.
4. **Tap debounce during that ~0.5s fall** — while the game-over animation plays,
   ignore taps so a rage-tap at death is not mis-registered as a drop/restart.
   This is a real feel bug waiting to happen; ship it with #3.
5. **One-tap restart, <1s** — hyper-casual addiction is "die → tap → already
   playing". A menu or delay between death and the next block kills retention
   harder than missing sound. **Measure on S24:** taps and seconds from game over
   to the first moving block; target one tap, sub-second.
6. **Analytics event stubs (no provider yet)** — add empty hook calls now:
   `game_start`, `game_over(score, blocks, perfects)`, `restart`. When ads/
   analytics arrive the events are already wired → zero rework.
7. **Slice/placement animation polish & color progression** — brief scale/flash
   pop on placed block; smooth hue-by-height so climbing feels rewarding.

### Tier 2 — Game feel tuning (numbers, not features).
5. Tune `_speedPerPoint` / `_maxSpeed` and the perfect-window epsilon together on
   device until the difficulty curve feels fair-but-tense.
6. Camera easing: revisit `dt*6` lerp factor and `_topMargin` so fast stacks
   don't feel jumpy.

### Tier 3 — Light meta (only after Tier 1 feels great).
7. Combo counter for consecutive perfects (score multiplier).
8. Subtle background gradient that shifts with height/score.

### Day 3 (named explicitly — not "someday"): coins + skins + rewarded + interstitial.
The next milestone after Day 2 is a **revenue signal**, not more polish. Do not
let "feel-first" become "feel-forever". Day 3 implements: coins (cosmetic-only
currency), a skin or two, rewarded ad (continue + double coins), and an
interstitial cadence. See §12 for the contract these must honor.

### Deferred until Day 3+ (do not start earlier):
- Sound design, sharing, backend, leaderboards, iOS build, release signing.

### Engineering hygiene to keep:
- Any new slice-related rule (e.g. perfect window) goes into `slice_math.dart`
  with a matching assert in `slice_math_check.dart`.
- Any new runtime behavior gets a case in `runtime_test.dart`.
- Build the APK via CI and verify on device before declaring anything "done".

---

## 11. Quick start for the next AI

1. Read §3 (mechanic), §5 (`stack_duel_game.dart`), and §12–14 (monetization
   contract, tuning knobs, exit criteria) — those constrain what you may change.
2. Run `flutter test` and `dart run test/slice_math_check.dart` to confirm green
   baseline (25 checks total).
3. Pick exactly ONE Tier-1 item (§10) and change at most ONE tuning knob (§13).
   Implement it inside `stack_duel/`.
4. Keep tests green; add a test for the new behavior.
5. Push to the feature branch → CI builds the APK → owner installs the
   `stack-duel-latest` Release asset on the S24 → judge by feel.
6. Keep or revert based on device feel. Repeat.

The bar for "done" on this project is not "compiles" or "tests pass" — it is
**"played on the S24 and it feels better."**

---

## 12. Monetization contract (FUTURE — do not break)

This is the intended economic shape for Day 3+. It is written down now so that a
well-meaning refactor doesn't quietly make it impossible. **Any feel feature
added before Day 3 must stay compatible with this contract.**

- **Coins are cosmetic-only.** They buy skins, never gameplay advantage. No
  pay-to-win, no buying score/lives with hard or soft currency.
- **Perfect → combo → coins.** The combo multiplier (built in Tier 1, §10.2b) is
  the source of coin income. Keep `comboMultiplier(streak)` pure and the single
  source of truth so coins later derive from it directly.
- **Rewarded ad = continue + double coins.** Opt-in only. A rewarded view may
  revive the current run once and/or double the run's coin payout.
- **Interstitial cadence = every 3rd game over.** Not on every death (kills
  retention), not random.
- **Implication for anyone touching Perfect:** Perfect MUST remain tied to the
  combo system. Do **not** implement Perfect as a standalone "no-narrowing"
  bonus disconnected from `comboMultiplier`, or the economy has to be rebuilt.

If a proposed change conflicts with any bullet above, stop and flag it rather
than "improving" past it.

---

## 13. Tuning knobs (one knob per build)

**Rule:** change exactly ONE of these per build, then play on the S24. Turning
several at once makes it impossible to attribute a feel change. Record new values
here whenever one is changed.

| Knob | Where | Current value | Notes |
|---|---|---|---|
| Block speed ramp | `stack_duel_game.dart` `_baseSpeed/_speedPerPoint/_maxSpeed` | 120 / 8 / 460 px/s | the difficulty curve; keep aggressive (see §10.2a) |
| Perfect window (epsilon) | `slice_math.dart` (to be added) | — (not built yet) | how forgiving "perfect" is; smaller = harder |
| Camera lead / easing | `stack_duel_game.dart` `_topMargin` (0.22) + lerp `dt*6` | 0.22 / 6 | how far ahead the camera looks + how snappy it follows |

---

## 14. Exit criteria — time-box the "feel" (so polish doesn't run forever)

"Done = better on S24" is open-ended; polish can go on indefinitely. Day 2 has a
hard finish line. **Day 2 is CLOSED when ALL of:**
- (a) Perfect + combo read clearly on device (player understands when they nailed
  it and that a streak is building);
- (b) haptics present (slice + game over);
- (c) restart is one tap, under 1 second;
- (d) the owner replays **≥10 times in a row, unprompted**.

When (a)–(d) hold: **STOP polishing** and move to Day 3 (§10 / §12). Do not add a
12th juice tweak instead of starting monetization. The goal of the Day-3 build is
a revenue signal, full stop.
