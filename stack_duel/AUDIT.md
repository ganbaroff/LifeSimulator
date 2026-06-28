# Stack City — Pre-Launch Audit (Sprint 1 of 2: AUDIT)

> Status: **DO NOT LAUNCH AS-IS.** The game *feel* is good; the **funnel,
> re-engagement, and measurement** are wired so most real players never traverse
> the growth loop, and the one success metric (D7 retention) is currently
> unmeasurable. Realistic D7 as shipped: **~5–9%** (below the 10% floor). With the
> CRITICAL/HIGH fixes, plausibly **10–14%** (investable). Fixes are mostly
> low-effort / high-leverage.
>
> Method: 3 independent read-only auditors (backend/security, frontend/UX,
> engagement/competitive) + maintainer review. Build state at audit:
> 1.12.0+30, 81 pure + 51 flutter tests green, `flutter analyze` clean.

---

## ⛔ FOR THE VERIFICATION AI (e.g. Antigravity) — READ FIRST

You are a **pre-launch QA / market-readiness reviewer, NOT a developer.** Your job
is to **confirm, extend, or refute** the findings below as a team that signs off
before a market release.

**HARD RULES:**
- **Do NOT modify, create, delete, or refactor a single line of code or config.**
  Read-only. No edits, no commits, no migrations, no PRs.
- Only **find and record**: verify each finding (confirm / refute / add nuance),
  and add any NEW issues you find, with `file:line`, severity
  (CRITICAL/HIGH/MEDIUM/LOW), and a concrete recommended fix.
- Think like the team that gates a market launch: would YOU sign off? What would
  embarrass us in front of the first 50 users?
- Output a written report only. Implementation happens in Sprint 2 by the dev,
  and only after the owner approves.

---

## CRITICAL (launch blockers)

**C1 — Retention is NOT measurable as wired.** `web/index.html` sets PostHog
`person_profiles:"identified_only"` and `posthog.identify()` is never called; the
distinct_id is anonymous + `persistence:"localStorage"`, which the Telegram
in-app WebView (esp. iOS) frequently clears between sessions → each open can mint
a new user. Result: **D1/D7 cohorts will be empty or wrong** — you'd launch blind
to the only metric that defines success.
→ Fix: read `Telegram.WebApp.initDataUnsafe.user.id` and call
`posthog.identify(<tg_id>)` once at startup (a small JS helper + one call in
`main.dart`). Stable TG id makes retention robust to localStorage loss.

**C2 — The viral/social loop is behind the wrong button.** Primary green **Play**
(`main.dart`) = *endless*, which does **not** submit to the leaderboard and shows
**no share card**. Only Daily/Duel runs do (`stack_duel_game.dart` submit + share
gated `if (isDaily || isDuel)`). 70–85% of casual players only press the primary
button → the growth atom (shareable duel link) is unreachable; the most-played
mode is a social dead-end. K-factor ≈ 0.
→ Fix: offer a share card on **every** game-over (incl. endless); make Daily the
primary CTA when not played today (badge "NEW").

**C3 — No referral/invite loop exists.** VISION names the Notcoin
"invite a friend → both get crystals" loop as the distribution engine, but there
is **no** `start_param` handling, no referral reward, no invite button (grep hits
VISION.md only). The duel link carries no incentive.
→ Fix (client-side is enough): read Telegram `start_param`, attribute the
referrer, grant both sides crystals on first run; add an "Invite (+💎)" button.

**C4 — CanvasKit (~7 MB wasm) loads from the gstatic CDN at runtime.** The web
build lacks `--no-web-resources-cdn` (`.github/workflows/stack_duel_web.yml`;
confirmed `"renderer":"canvaskit"` + gstatic loader in the built bootstrap). On a
mid-tier phone over mobile data inside Telegram, first load fetches `main.dart.js`
(~2.2 MB) **+** `canvaskit.wasm` (~7 MB) cross-origin → multi-second blank/splash
(the 8 s splash fallback hints this is already felt). Slow first load is a primary
D1 killer for casual.
→ Fix: build with `--no-web-resources-cdn` (self-host the local `canvaskit/`,
same-origin + cacheable); evaluate `--wasm`. Test cold-load on a throttled phone.

---

## HIGH

**H1 — Leaderboard public-insert is trivially spoofable + unthrottled.**
`supabase/leaderboard.sql` + `web/index.html` `sdLbSubmit`: anyone with devtools
can POST `{score:99999,name:"x"}` (only guard: `score<100000`, `name<=24`). No
auth, no `initData` HMAC check, no rate limit. One griefer ruins the daily board.
→ Fix (quick): tighten CHECK (e.g. `score<5000` and couple to height). Proper:
route writes through a Supabase Edge Function that validates `initData` HMAC
(bot token, server-side) + service-role write; revoke public insert.

**H2 — Leaderboard: no per-user/day dedup + no stable identity.** Submit fires on
**every** daily game-over (`stack_duel_game.dart`), schema keys only on a random
uuid, read is `order=score.desc&limit=50` with no `distinct on`. → the top-50 can
be one player's many attempts, the table grows unbounded, and identity is
`name` (TG first_name, default `'Player'`) so users collide/impersonate.
→ Fix: add `tg_user_id bigint`; upsert keep-max per `(seed, tg_user_id)`; dedupe
on read (view/RPC `distinct on (tg_user_id) ... order by ... score desc`).

**H3 — No crash/error reporting; every bridge swallows errors silently.** Empty
`catch{}` across `index.html`, `posthog_bridge_web.dart`,
`leaderboard_bridge_web.dart`, `telegram_bridge_web.dart`; no
`posthog.captureException`, no `FlutterError.onError` / `runZonedGuarded`. During
soft-launch you'd be blind to real-user crashes.
→ Fix: add a `sdCaptureException` helper + wire Flutter error hooks → PostHog.

**H4 — `first_perfect` fires per-RUN, not per-user** (`stack_duel_game.dart`:
`if (_perfectsThisRun==1)`), so the activation funnel `app_open→first_perfect`
massively over-counts and is meaningless.
→ Fix: gate a lifetime `first_perfect` behind a persisted flag (or rename to
`perfect_first_of_run`).

**H5 — First session never sells the meta.** Tutorial teaches tap + center only;
the city/eras/residents and the core↔meta **powers** loop are invisible (powers
unlock silently; "View City" only appears after a building exists, as a flat
link). No "play more to unlock Slow-Mo / reach Metropolis" teaser; no 60-second
"aha" beyond the perfect flash.
→ Fix: on first game-over, celebrate "🏙 You built your first building!" → push
the City overlay once with a locked teaser; show a "next unlock" line on title.

**H6 — Streak rewards nothing and hides at 0.** Shown only `if (current>0)`
(`main.dart`); `recordPlay` grants no crystals/escalation/"don't break it"
framing. A new player and a lapsed returner both see nothing — exactly when the
D1→D2 nudge matters most.
→ Fix: always show streak; escalating crystal payout; game-over "Come back
tomorrow to keep 🔥 N".

**H7 — No bot ⇒ no push ⇒ no re-engagement channel.** A Mini App can't ping users
without a bot. With no streak reminder / "duel answered" / "new daily" message,
D1 relies on spontaneous return — brutal for one-tap casual.
→ Fix: stand up the BotFather bot (already an owner action) and send the minimal
re-engagement messages.

**H8 — Brand leak in the viral artifact.** `stack_duel_game.dart` share header:
`'⚔️ Stack Duel ...'` while everything else is "Stack City". Every shared duel
message ships the wrong brand to new users. (Line 492 says "Stack Daily" — pick
one consistent string.)
→ Fix: "Stack City" / "Stack City Duel" in the card.

**H9 — Leaderboard + Achievements overlays have NO render test.** Only City,
Start, GameOver are render-tested. Both untested overlays are full-screen layouts
(Achievements header Row, Leaderboard rows) that could regress into
overflow/paint asserts unseen on a 320px phone.
→ Fix: add both to `overlays_overflow_test.dart` (pump 320×520, all achievements,
a long player name; assert `takeException()` isNull).

**H10 — Power bar has zero affordance.** `_PowerBar` shows emoji + a 9px
(borderline illegible) label + charge; the existing `Power.desc` strings are never
surfaced. New players don't know what Widen/Slow-Mo/Perfect/Shield do or that
they're 1-charge/run.
→ Fix: one-time `desc` reveal the first time each power appears; bump label font.

**H11 — Leaderboard reads empty/meaningless for a small cohort.** Keyed on the
local-day seed, global (not friends), endless players absent. A 20–50-person
cohort across time zones mostly sees "No scores yet today".
→ Fix: persist a multi-day board, seed it with the player's own past + incoming
duel opponents; add a friends/duel-history view; show rank delta.

---

## MEDIUM

- **M1 — Duels are flat:** static number, no ghost/replay, no W/L record kept
  (`duel.dart`). → persist per-opponent record; a simple ghost height marker.
- **M2 — Powers deck is fixed + free** (`powers.dart`): no scarcity/choice/upgrade
  past the unlock thresholds. → crystals buy charges/5th slot; daily rotation.
- **M3 — GameOver skin row is a non-scrollable `Row`** (`main.dart`): fits 3 skins
  on 320px but a 4th overflows. → `Wrap`/horizontal scroll.
- **M4 — Tutorial hint at y=0.42 can overlap the PERFECT flash (0.28)** in the
  first 30 s (`stack_duel_game.dart`). → raise to ~0.52 or hide during a flash.
- **M5 — Haptics are a hard no-op on web** (`haptics.dart`) — but the launch
  platform IS web/Telegram, which exposes `Telegram.WebApp.HapticFeedback`. Free
  feel left on the table. → add a Telegram haptics path.
- **M6 — Competitive position (strategic):** good feel (≈ Ketchapp Stack, > Tower
  Bloxx quick game), more depth than a clone — but vs Catizen/Notcoin you lack
  referral economy, social graph, live-ops, token meta. The stacker core is a
  low-novelty 2010-era mechanic; nothing is self-spreading "screenshot-worthy."
  Above-median solo project; a *hit* is unlikely without the referral + bot loop.

## LOW

- **L1 — No crystal SINK** (faucet only: achievements/golden) → crystals inflate,
  revive loses pressure. (By-design pre-bot; wire Stars/cosmetics post-gate.)
- **L2 — Coins are near-dead:** buy only 3 palette skins, then useless. → fold into
  city decor or retire to cut HUD noise.
- **L3 — Share card lacks city/era flavor** ("I built a Neon Metropolis") — the
  most distinctive brag never appears in the viral text.
- **L4 — Audio autoplay** may be muted until the first tap (mobile gesture gate) —
  usually self-resolves on the first drop.
- **L5 — No orientation lock / safe-area for the in-game HUD + power bar** (Flame
  positions are hardcoded; bottom bar/badge can sit under a notch/home indicator
  with `viewport-fit=cover`). Portrait-only TG mini-apps make this low risk.
- **L6 — `app_open` can double-fire** on the SW-purge reload (`index.html`).
- **L7 — pubspec `description` still "Stack Duel - a minimal stacking arcade
  game"** (IDE/metadata hygiene).

## ✅ Verified CORRECT (no action — auditors confirmed)
- Secrets hygiene clean: only PUBLIC keys committed (Supabase publishable, PostHog
  `phc_`); no `phx_`/`sk_`/`cfut_`/service-role/JWT in the tree.
- Defensive parsing everywhere (leaderboard/JSON/promise/telegram degrade to
  empty/false, never crash gameplay).
- Tap routing: all overlays absorb stray taps; `_PowerBar` stops propagation so a
  power tap never also drops a block.
- Overflow: Start (`SingleChildScrollView`+`ConstrainedBox`) + GameOver (92% cap +
  inner scroll) render-tested at 360×520; power bar (4 buttons = 282px) fits 320.
- No `borderRadius`+non-uniform-border paint trap (the prior bug stays fixed).
- City skyline proportions sound (`cityBuildingHeightPx` sqrt curve, centered
  small cities, newest-in-view scroll).
- SW-purge reload is sessionStorage loop-guarded.

---

## Sprint 2 — recommended fix order (after owner sign-off + Antigravity pass)
1. **C1** identify() by Telegram id — *without this the launch produces no usable
   retention data.* (Also fixes H4-adjacent measurement.)
2. **C2 + C3** route the social loop to the primary path + a referral reward — the
   growth fix that moves D7 from "core-loop problem" to "investable."
3. **C4** `--no-web-resources-cdn` (self-host CanvasKit) — first-load D1 risk.
4. **H8** brand in the share card · **H4** real funnel event · **H3** crash
   reporting · **H6** streak rewards/visibility · **H9** the two render tests.
5. **H1/H2** leaderboard integrity (tighten CHECK now; `tg_user_id` + dedupe).
6. **H5/H7** sell the meta first-session + stand up the bot for push.
7. MEDIUM/LOW as time permits.

Verdict: the engineering is sound and the feel is good — **this is a funnel +
re-engagement + measurement problem, not a fun problem.** Land the CRITICAL/HIGH
set, then soft-launch and read D7.
