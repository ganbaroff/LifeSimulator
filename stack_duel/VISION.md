# Stack Duel → "Stack City" — Vision, Roadmap & Resume (durable memory)

> READ THIS FIRST after any context compaction. "Atlas, wake up" = read this
> file, then HANDOFF.md, then continue from "Current state" → "Next action".
> This is the durable plan; the conversation summary may be lossy.

## Why this exists
We built a polished one-tap stacker (Stack Duel) in a day, proved the build→ship
pipeline, and proved a frictionless distribution channel (Flutter **web** live on
GitHub Pages, ready as a **Telegram Mini App**). Owner verdict: the loop is fun
("заработало", "понравилось браузерная версия") BUT a Stack clone is **not a
hit** — it lacks depth, characters, progression, surprise, and a monetization
hook. Decision: stop treating "publish the clone" as the goal. Build something
**deep** on top of the proven mechanic + ship it where a solo dev actually has
distribution (Telegram). Spend a few more days to make it *good*, not just live.

## The core insight (research-grounded)
**Tower Bloxx** (Digital Chocolate, a real casual hit) is OUR EXACT mechanic +
a meta layer. Its "Quick Game" = our current arcade. Its "Build City" mode adds:
drop blocks to build a tower → towers evolve (residential 10 → commercial 20 →
office 30 → skyscraper 40) → the city levels up (Town → City → Metropolis…).
Same 10-second-to-learn core, but "weeks to master" depth.
→ Our Stack Duel is the "hello world"; the hit is **Stack City**: arcade core +
city/evolution meta + characters + continue economy + Telegram social.
Sources: Pocket Gamer / GameSpot (Tower Bloxx); PixelPlex / capermint (Telegram
viral mechanics: merge/idle/build + referral loop + leaderboards win in 2026).

## The deep game — "Stack City"
1. **Two modes.** (a) *Quick* = current arcade run (score/combo/perfect — keep it).
   (b) *City* = the meta: each good run ADDS a building to your persistent city;
   the city is the long-term collection/progression you return to.
2. **Evolution ladder** (owner's "building → moves → civilization"): block →
   building (by height/perfects) → district → city → civilization-tier skins/eras.
   Higher quality runs build taller/better buildings; city level unlocks new eras
   (medieval → modern → neon/cyber → space), each an art/palette theme.
3. **Characters** (owner's "персонажи с полок"): residents/mascots that populate
   finished buildings, pop out, react to perfects, appear as collectible
   characters (gacha-light). Drives collection + personality + surprise.
4. **Distraction / surprise factors**: moving hazards (wind, a bird, a passing
   blimp), bonus blocks, slow-mo on a near-miss, event days — variety so runs
   aren't identical.
5. **Continue economy** (owner's "оплата за кристаллы чтобы продолжить"):
   - soft currency **coins** (already built: earned per perfect; buys skins).
   - hard currency **crystals**: **continue/revive a run** (don't lose the tower),
     double coins, premium era-skins. Earned slowly + **rewarded ad** + IAP later.
   - **Continue = the monetization hook**: on game over, offer revive for crystals
     OR watch a rewarded ad. Interstitial cadence already scaffolded (every 3rd).
6. **Telegram social / viral** (the distribution engine): leaderboard among your
   chat friends, **referral** (invite a friend → both get crystals — the proven
   Notcoin loop), daily streak, shareable "I reached Metropolis" cards.

## Channel decision (settled)
**Telegram Mini App first** (web build done; live link works), APK secondary.
Reasons: zero publish gate, 1B built-in distribution (fixes "no test users"),
current growth market with real monetization (ads + TON/Stars). NOT Play-first
(personal account = 12-testers×14-days gate), NOT Unity (kills phone-only build).

## Roadmap (phased, one shippable milestone each; reuse the whole pipeline)
- **P1 — City meta MVP.** Persist a city; each run adds a building; show the city
  screen + city level. (Reuses ScoreState/CoinState pattern + a CityState.)
- **P2 — Evolution + eras.** Building tiers by run quality; 2-3 era themes
  (palette swaps via the existing skin system) unlocked by city level.
- **P3 — Characters + collection.** Residents populate buildings; a small
  collectible set; surprise pop-outs on perfects.
- **P4 — Continue economy.** Crystals; revive-on-game-over (crystals OR rewarded
  ad); double-coins; wire the real ad SDK (test ids first). Monetization live.
- **P5 — Telegram social.** Leaderboard (Telegram user data via WebApp SDK),
  referral loop, daily streak, share cards. Real analytics → **retention test**.
- **Gate:** after P5, read D1 retention from a real cohort. ≥~35% → invest more;
  else re-pick concept (keep the machine). Validate retention BEFORE heavy IAP.

## Operating protocols (carry forward — earned the hard way)
- **Deploy-first / build badge.** Every device/web build shows BUILD <sha>;
  verify the badge before judging. When owner says "no change", suspect a stale
  install/deploy, not the code. (Cost us ~3 builds via the signing bug.)
- **One feature per build → one device/web test.** Don't stack unjudged features.
- **Surface only at meaningful milestones**, not every increment. Owner has ADHD;
  short replies, no dispatching, fewer downloads.
- **Headless tests don't catch rendering.** (The gradient-over-world bug passed
  all tests.) For visual changes, the live build IS the test.
- **Honest market checks, not vibes.** Compare to genre standards / current data.
- **Validate retention before monetizing.** Don't pour ads into an unproven loop.
- **Pipeline is the asset, the title is disposable.** Reuse Flutter+Flame+CI for
  whatever concept wins.

## Current technical state (snapshot)
- Repo `ganbaroff/LifeSimulator`, branch `claude/stack-duel-flutter-game-dv0n5r`.
  Game in `stack_duel/` (isolated from the unrelated root RN project).
- Flutter+Flame. lib/game: stack_duel_game.dart (loop/camera/HUD), slice_math.dart
  (pure: computeOverlap/isPerfect/comboMultiplier/restoredWidth), stack_block,
  falling_piece, haptics, sound (synth WAVs), analytics (stub), ads (NoopAds stub).
  state: score_state, coin_state, skin_state. Tests: slice 24/24 + runtime 21/21
  + economy, `flutter analyze` clean.
- Built/feature: perfect+combo+width-restore, deferred game-over+tap-debounce,
  juice (flash/particles/screen-flash), audio, 3 skins (coin sink), start screen,
  premium gradient bg, real app icon, on-screen BUILD badge.
- **Ship pipelines (CI in .github/workflows/):**
  - APK: release arm64, stable signing (ci/debug.keystore), per-commit Release
    asset `stack-duel-<sha>.apk` (~16 MB). Owned `android/` (pkg com.volaura.
    stack_duel, minSdk 23, AdMob TEST app-id meta-data, VIBRATE).
  - Web: builds Flutter web, deploys to `gh-pages` branch → GitHub Pages.
    **Live: https://ganbaroff.github.io/LifeSimulator/** (owner confirmed it runs).
    Owned `web/` with branded loading screen, title, icon, Telegram Web App SDK.
- Local toolchain (sandbox): Flutter at /tmp/fl/flutter, Dart at /tmp/dart-sdk.
  Sandbox CANNOT reach github.io or dl.google.com (egress) — owner is the eyes for
  the live site; APK Android SDK build only happens in CI.

## Next action (post-compact resume)
1. Re-read this file + HANDOFF.md (§15 build log = latest state).
2. Start **P1 (City meta MVP)**: add `CityState` (persisted), an end-of-run
   "added a building to your city" step, and a simple City screen + city level.
   One feature → web build → owner plays the live link → judge.
3. Owner side, when ready (parallel, no rush): @BotFather `/newapp` → Web App URL
   = the Pages link → get the `t.me` Mini App link.
