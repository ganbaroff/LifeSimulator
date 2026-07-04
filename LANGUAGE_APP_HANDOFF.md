# HANDOFF — Arabic Learning App (RU→AR) · Stack City · "MindShift"

> **Purpose:** self-contained context for a **new chat**. Paste this whole file (or link it)
> so the next session starts with full state. Written 2026-07-04. No secret values are in
> this document by design — see §9.
>
> **Author's model note:** produced by Claude in the `ganbaroff/LifeSimulator` session.
> State below is **verified** against the codebase (4-agent inventory pass), not from memory.

---

## 0. How to use this doc
1. Read §1 first — there's a **naming/repo mismatch** that will confuse a fresh session.
2. §2–§5 = the **new goal** (Russian→Arabic learning app) + product philosophy + strategy.
3. §6–§9 = **verified state** of the existing assets (game, RN app, git/CI, security).
4. §10–§11 = open decisions + suggested first moves.

---

## 1. ⚠️ CRITICAL: repo & naming reality

- **This session's repo:** `ganbaroff/LifeSimulator` (GitHub, private, org context "Volaura").
- **"MindShift" does NOT exist in this repo.** A case-insensitive search of the entire tree
  (code, docs, config, assets) returned **zero** matches. The app in this repo is named
  **"Life Simulator"** in code (`app.json` name/slug `LifeSimulator`, `package.json`
  `lifesimulator-stable`), with a marketing suffix "Life Simulator Azerbaijan" in docs.
- The owner (Yusif Ganbarov, ganbarov.y@gmail.com) refers to a separate app **"MindShift"**
  with a clear anti-Duolingo learning philosophy (see §3). **It is a different codebase**,
  not connected to this session. In a prior turn `add_repo ganbaroff/mindshift` → **not found /
  no access**.
- **ACTION for the new chat:** connect the real MindShift repo (ask owner for exact
  `owner/repo`, or have them push it / open its local folder). Until then, MindShift's actual
  code is unknown — everything about MindShift below is from the owner's verbal description.

**Three distinct things — do not conflate:**
| Name | What it actually is | Where | Framework |
|---|---|---|---|
| **Stack City** | Stacking arcade game, Telegram Mini App | `stack_duel/` in `LifeSimulator` | **Flutter/Flame** |
| **"Life Simulator"** | AI life-sim prototype (RN) | root of `LifeSimulator` | **React Native/Expo** |
| **MindShift** | Owner's serious-learning app (anti-Duolingo) | **NOT in this session** | **Unknown** |

---

## 2. The new goal (what the owner wants to build)

- Owner is **moving to Saudi Arabia** and wants to learn **Arabic from zero**, native language **Russian**.
- Wants to **build a product**: a **Russian→Arabic**, gamified-but-serious language course.
- Explicitly does **not** want a "dumb Duolingo clone." The bar is Pimsleur-level teaching
  quality with genuinely better UX/analytics and no dark patterns.
- Owner is building with **Claude Code + Fable 5** and wants to decide:
  1. Should language learning live **inside MindShift**? (leaning yes — see §4)
  2. Should the **Stack City** game be integrated? (recommendation: **no** — see §4)

---

## 3. MindShift principles — the product DNA (owner's own words, paraphrased faithfully)

This is the **spec for the anti-Duolingo learning app**. Design every decision against it:

1. **Explain context, don't dump.** Never throw a letter/word with no explanation — say what
   language/script it is, how it's read, where it comes from.
2. **Ask enough questions; use real tests** — not imitation-quizzes.
3. **Real, trackable knowledge levels** — not fake points. The user must see actual competence.
4. **Learning analytics:** time spent, where the mistakes are, **pie charts**, when the user
   learns better vs worse.
5. **User's own notes** — personal knowledge capture, not only vendor content.
6. **No manipulation:** no "you'll lose your streak!", no "you'll kill the bird", no
   subscription-pressure. The goal is to **teach**, not to sell premium.
7. **Non-annoying sound & notifications** — respect attention.
8. **Honest intent:** success = the user actually learned, measurable.

---

## 4. Strategic recommendations (3 decisions)

### 4a. ❌ Do NOT bolt the Stack City arcade into a learning app
- **Philosophy clash.** Stack City = dopamine arcade + Telegram virality. A learning app per
  §3 = deliberate practice, respect for time, anti-dark-patterns. Stacking blocks **teaches no
  language**. This is exactly the "gamification ≠ minigames" trap the owner objects to.
- **Framework barrier (decisive).** MindShift/RN would be React-Native-ish; Stack City is
  **Flutter**. Embedding Flutter into RN (add-to-app) is heavy and painful; not worth it for a
  minigame that adds no pedagogical value.
- Correct "gamification" for a learning app = mastery levels, progress visualization,
  **spaced-repetition** streaks **without** manipulation, clear analytics — not an arcade.

### 4b. ✅ Language learning belongs in the serious-learning shell (MindShift), if that's the flagship
- The analytics / notes / real-knowledge-tracking the owner wants **are literally the same
  system a language module needs**. Language = "another knowledge domain" in MindShift's
  tracking. Strong synergy — unlike the game.
- **Blocker:** we haven't seen MindShift's code, so we don't know if it has a lessons engine /
  SRS / analytics already, or is a shell. That gap decides **"2 weeks" vs "3 months."** First
  job in the new chat: audit MindShift.

### 4c. ♻️ What IS reusable from Stack City — the infrastructure, not the arcade
Even though the game shouldn't merge in, these **patterns/infra** transfer to any product:
- **Telegram Mini App bridge** (SDK init, `initDataUnsafe.user`, `start_param`, native share).
- **Supabase REST + RLS** leaderboard/data pattern (client→PostgREST, dedup view).
- **PostHog analytics seam** with `identify(tgUserId)` for stable **D1/D7 retention cohorts**.
- **Analytics/Ads/Sound/Haptics "seam" architecture** (Noop default, swap real impl).
- **Deterministic seed** pattern (daily shared content), conditional web/stub imports.
- **CI:** Flutter web → GitHub Pages, APK → GitHub Release (see §8).

### On Pimsleur-level effort (asked earlier)
- The **app/tech** (audio player + SRS + progress + analytics) is the **easy** part —
  ~2–4 weeks with Claude Code/Fable 5.
- The **content is the real product**: lesson scripts (linguist + **Gulf/Saudi** Arabic),
  native-speaker audio (studio ≈ $3k–15k, or AI voice like ElevenLabs Arabic = faster, lower
  quality), QA. MVP with AI voice ≈ **4–5 months solo**; true Pimsleur parity ≈ **1.5–2 yrs, team**.
- **MSA (فصحى) vs Gulf/Saudi dialect:** most apps teach MSA (understood, sounds "newscaster").
  For daily life in KSA, bias toward **Gulf/Hejazi** phrases.

---

## 5. Arabic learning — market research + build notes

**For the owner personally, before/for the trip (buy, don't build):**
| App | Verdict for KSA-from-zero | RU support | Dialect |
|---|---|---|---|
| **Pimsleur Arabic** | ★★★★★ best for speaking/pronunciation, audio-first | lang-agnostic (all audio) | Eastern/Gulf-ish |
| **Anki + Gulf deck** | ★★★★★ most efficient for vocab, free | yes | any (deck-dependent) |
| **Drops** | ★★★★☆ visual vocab | yes (RU) | MSA only |
| **Busuu / Mondly** | ★★★☆☆ | yes (RU) | MSA |
| **Duolingo Arabic** | ★★★☆☆ (the "dumb" one owner dislikes) | ❌ EN base | MSA only |

Recommended personal combo: **Pimsleur L1** (audio in transit) **+ Anki Gulf deck** (free).

**For the product (what would actually beat Duolingo, per §3):**
- Teach the **script explicitly** (each letter: name, sound, forms, how to read) before words.
- **Real placement + progress tests**, mastery bars per skill, **mistake heatmap + pie charts**.
- **Time-of-day performance analytics** ("you learn better in the morning").
- **User notes** attached to any card/lesson.
- **SRS** (spaced repetition) core; streaks **without** guilt notifications.
- Calm audio, opt-in gentle reminders — never manipulative.
- RU→AR, Gulf/Saudi-flavored phrasebook track for expats.

---

## 6. ASSET A — Stack City (Flutter/Flame Telegram game) · VERIFIED STATE

- **Path:** `stack_duel/` · **Version:** `1.15.0+33` · **Branch:** `claude/stack-duel-flutter-game-dv0n5r`
- **Live web (Telegram Mini App target):** https://ganbaroff.github.io/LifeSimulator/
- **APK (sideload):** https://github.com/ganbaroff/LifeSimulator/releases/download/stack-duel-latest/stack-duel-debug.apk
- **Bot:** `@CreatorBy_bot` (constant `StackDuelGame.botUsername`).
- **`siteUrl`** = the Pages URL; base for all share/duel/referral links.

**Features (built):** Endless + Daily Challenge (deterministic `seed=YYYYMMDD`, 5 modifiers) +
Async Duel (`?duel=<base64url seed|name|score|height>`); Powers (Widen/Slow-Mo/Perfect/Shield,
unlocked by city progress, 1 charge each); Revive (crystals, max 3/run); Golden blocks (every
11th, +crystal); 3 Skins (coin sink); persistent City (buildings/tiers/levels/eras); 9
collectible residents (3 rarities); 9 Achievements (pay crystals); daily Streaks (escalating
crystal reward); Referral/invite (+3💎 once via `start_param`/`?ref=`); Coins (soft) + Crystals
(hard); heavy juice (flashes, particles, camera punch, synth audio, haptics); onboarding
(first-run slow blocks + teach-by-doing); PostHog analytics + crash reporting; **Ads scaffolded
only** (Noop seam, no real SDK).

**Key files:** `lib/main.dart` (entry, decodes duel/referral, overlays), `lib/game/
stack_duel_game.dart` (FlameGame conductor, link builders, `siteUrl`+`botUsername`, most
analytics), `lib/game/slice_math.dart` (pure core, unit-tested), `lib/state/*.dart` (coin,
crystal, skin, city, characters, daily_seed, duel, powers, achievements, streak, settings),
seam files: `analytics*.dart`, `telegram_bridge*.dart`, `posthog_bridge*.dart`,
`leaderboard_bridge*.dart` (conditional web/stub imports).

**Analytics events (PostHog):** `app_open, game_start, restart, daily_start, duel_start,
power_used, combo_changed, perfect, first_perfect (once/user), golden_block, tutorial_done,
game_over{score,blocks,perfects,mode,revives}, coins_earned, ad_interstitial, building_added,
streak_reward, achievement_unlock, revive, referral_open, invite_share, share{mode}, $exception`.

**Supabase (project ref `dwdgzfusjsobnixgyzjk`, org Volaura):**
- Table `public.stack_scores` (seed, name, score, height, created_at, tg_user_id nullable; RLS
  on; read=public; insert check `score∈[0,5000) ∧ height∈[0,300) ∧ len(name)≤24`; partial
  UNIQUE on (seed,tg_user_id)).
- View `public.stack_scores_top` (dedup: best row per (seed, tg_user_id); read by `sdLbTop`).
- **Owner action:** re-run `stack_duel/supabase/leaderboard.sql` in Volaura SQL Editor to apply
  the `tg_user_id` + dedup-view migration (done by hand; MCP write blocked in sandbox).

**Telegram integration:** SDK from `telegram.org/js/telegram-web-app.js`; `ready()+expand()`;
`sdTgName/sdTgUserId/sdTgStartParam/sdTgShare`; `posthog.identify(user.id)` for D1/D7 cohorts;
leaderboard submit includes `tg_user_id`. **Native referral not yet active:** `referralLink()`
supports `t.me/CreatorBy_bot/{miniAppName}?startapp=ref_…` **only** when a BotFather Mini App
short name is passed, but `main.dart` calls it without one → falls back to web `?ref=` link.

**Pending / open (Stack City):**
- **Owner-gated:** BotFather `/newapp` short name (activates native `start_param` referral) +
  `setChatMenuButton` → game URL (the environment can't reach `api.telegram.org`; owner runs
  curl locally).
- **APK CI failed on HEAD `75c6e2f`** (resize fix); **web CI succeeded** for same HEAD, so
  Pages is current but the downloadable APK is one commit behind (last good = `2609c7e`).
  `flutter analyze` was clean locally → likely a release/keystore step, not code. Low priority
  (Telegram target = web).
- H1 leaderboard integrity only partial (RLS check is client-spoofable; proper fix = Edge
  Function validating Telegram `initData` HMAC server-side + revoke public insert — NOT done).
- H7 bot push / re-engagement — none. H11 leaderboard thin (local-day, global-only, no friends).
- Ads/rewarded not wired. Medium: M1 duels flat (no W/L history), M2 powers no scarcity,
  M4 tutorial hint can overlap PERFECT flash, M5 Telegram web haptics missing.
- Low: L1 no crystal sink beyond revive, L2 coins near-dead after 3 skins, L5 no safe-area/
  orientation lock, L6 `app_open` can double-fire on SW purge reload.
- **Doc drift:** `VISION.md`/`AUDIT.md`/`RELEASE.md` cite older builds (1.12–1.13) and "Stack
  Duel" / "no analytics SDK"; the app is **1.15.0+33, "Stack City", with PostHog+Supabase**.
- **Retention gate UNMET:** no soft-launch yet; D7 (target ~10–15%) unvalidated, zero real users.

---

## 7. ASSET B — "Life Simulator" (React Native/Expo) · HONEST STATE

**One line:** an early, heavily-scaffolded Expo/RN prototype with a lot of **aspirational docs**
and duplicated, half-wired code. The "AI-powered, Azerbaijan, 75%-ready" framing in the README
is marketing; the running product is a modest, **offline, Russian-language life-sim demo**.

**Stack:** RN 0.81 + Expo SDK 54 (+ react-native-web), TS ~5.1 (loose), Redux Toolkit 2 +
redux-persist, React Navigation v7, expo-av/localization, axios, crypto-js, Adapty + AdMob
(declared, stubbed).

**What actually works:** StartScreen menu → real 5-step character-creation wizard (dispatches
`createCharacter`+`startGame` into a real Redux store) → `GameScreenAgile` shell with a 5-tab
in-game navigator (Game/Stats/Travel/History/Profession, ~400–650 lines each). Redux
(character, game, gameLoop, activities) + persist are functional. Local `fallbackEvents.json` +
a hardcoded `eventGenerator` drive events.

**What's broken/fake (important):**
- 🔴 `src/components/game/EventCard.tsx` is a **0-byte EMPTY file**, but `GameScreenAgile`
  renders it on every event → **core "event happens → you choose" loop renders blank/broken**.
- 🔴 **Two divergent entry points:** `App.tsx` (Redux + Agile screens, what docs assume) and
  `App.js` (React Context + MainScreen/GameScreen). Both complete & contradictory; with Metro's
  default `.js`-before-`.tsx` resolution, **`App.js` may actually boot** — i.e. the Redux app
  most code targets might not be the one that runs.
- All AI/monetization/avatar/cloud integrations are **placeholder-keyed or mocked**:
  `AIEngine` (Gemini key = empty string → always local fallback; `.env.example` even says they
  moved to OpenAI, also unset), `MonetizationService`/Adapty (placeholder key, returns false),
  `AvatarService`/Avaturn (placeholder → returns ui-avatars.com URL), `AdService`/AdMob (Google
  TEST ids, real calls commented, `setTimeout` mock), `CloudSaveService`/Firebase (stub),
  `AnalyticsService` (console.log), `ErrorTrackingService`/Sentry (**imports missing npm pkg**).
- Missing-from-`package.json` imports: `@sentry/react-native`, `expo-haptics`,
  `expo-notifications` → won't bundle if their modules load.
- Massive duplication: ~13 GameScreen variants, ~7 CharacterCreation variants, **3 parallel
  Redux stores** (`store/slices` active, `store/enhanced`, `store/unified` orphaned),
  `.backup/.temp/.new` files, empty `EventCard.tsx`/`gameSliceNew.ts`/`DesignSystem.ts`, and a
  dead inline `TabNavigator` in `App.tsx` (literal "Coming soon" Activities).

**Docs-vs-reality gaps:** README claims Gemini AI, Azerbaijan branding, 85% test coverage,
CI/CD, one clean unified store, ~75% ready — reality: local fallback only, all-Russian UI, ~0
real tests, broken core UI, 3 competing stores, ~20 duplicate screens. Treat root docs as
unreliable.

**Verdict:** if the language product needs a serious foundation, this RN prototype is **not**
a clean base to build on without significant cleanup — and it is **not** MindShift. Decide
consciously whether to (a) build language in the real MindShift repo, (b) start fresh, or (c)
salvage pieces here.

---

## 8. Git / deploy / CI · VERIFIED

- **Working branch:** `claude/stack-duel-flutter-game-dv0n5r` (push here; branch policy).
- **Recent commits (HEAD→):** `75c6e2f` resize fix · `2609c7e` @CreatorBy_bot + referral link ·
  `c59a5fb` antigravity H5/H10/H12/M3/M7/M8 · `aa5026e` referral loop (C3) · `315377b` Sprint 2
  CRITICAL/HIGH fixes · Sprint 4 Supabase leaderboard · Sprint 3 Telegram-native · etc.
- **CI workflows** (`.github/workflows/`):
  - `stack_duel_web.yml` → Flutter web `--release --pwa-strategy=none --no-web-resources-cdn
    --base-href /LifeSimulator/` → force-push to **gh-pages** (public HTTPS / Telegram Mini App).
    **Succeeds** on HEAD.
  - `stack_duel_apk.yml` → release APK (arm64, pinned `ci/debug.keystore`, BUILD_TAG=sha) →
    GitHub Release `stack-duel-latest`. **Failed on HEAD `75c6e2f`** (see §6).
  - `ci-cd.yml` → **legacy** Expo/RN pipeline for "Life Simulator Azerbaijan" (Vercel + Expo +
    TestFlight + Play). **Predates and is unused by** the Flutter work.
- **Live:** https://ganbaroff.github.io/LifeSimulator/ · **APK:** Release tag `stack-duel-latest`.
- Container is **ephemeral** — commit & push anything to keep it.

---

## 9. 🔒 SECURITY — MUST READ (verified posture + rules)

**Verified now:** `secretsFoundInTrackedFiles = false`. `git grep` over 372 tracked files found
**no dangerous secret values**. Every incidental match is a placeholder/mock/CI-secret-name.

**Committed on purpose and SAFE (public client keys — leave them):**
- `phc_…` PostHog **public project token** — `stack_duel/web/index.html` (client-safe by design).
- `sb_publishable_…` Supabase **publishable/anon key** — `stack_duel/web/index.html` (RLS-gated).
- Only these two public keys; both are meant to ship in the browser.

**RULES (do not violate):**
- ✅ Only PUBLIC keys may ever be committed: `phc_` (PostHog), `sb_publishable_` (Supabase).
- ❌ NEVER commit or print in chat: `phx_` (PostHog personal), Clerk `sk_test_`/`sk_live_`,
  Cloudflare `cfut_`, Telegram **bot token**, Supabase `service_role`, any JWT secret.
- ❌ Never put a secret **value** as literal text in a shell command or chat reply — use env
  vars or file pipes. (A bot token was exposed in chat in a prior session — that's why.)
- 🔁 **Owner should ROTATE** (exposed in a prior session, independent of the clean tree):
  `phx_` PostHog personal token, Clerk `sk_test_`, **3× Cloudflare `cfut_`** tokens, and the
  **Telegram bot token**.
- 🛡️ Supabase: publishable key only grants RLS-gated anon access — **keep RLS enforced**; the
  H1 hardening (move writes server-side via Edge Function + revoke public insert) is still open.

---

## 10. Open decisions for the owner (resolve in the new chat)
1. **Where does the language app live?** (a) inside the real **MindShift** repo (needs access),
   (b) brand-new clean project, or (c) salvage the RN prototype here. → *default rec: (a) or (b).*
2. **MSA vs Gulf/Saudi dialect** as the primary track (rec: Gulf/Hejazi for daily KSA use, MSA
   for reading).
3. **Audio source:** native speakers (costly, best) vs **AI voice (ElevenLabs Arabic)** for MVP.
4. **Platform:** Telegram Mini App again (reuse §4c infra) vs native iOS/Android vs web.
5. **Fable 5 / framework:** confirm the target stack for the new app before writing code.

## 11. Suggested first steps (new chat)
1. **Connect MindShift** (`owner/repo`) → run a code audit like §7 (lessons engine? SRS?
   analytics? notes?). This decides scope/timeline.
2. Lock decisions in §10 (dialect, audio, platform, where it lives).
3. Draft the **content model** (script → letter → phonetics → word → SRS card → note → mastery)
   and the **analytics schema** (time, mistakes, time-of-day, mastery level) — that schema is
   the anti-Duolingo differentiator.
4. Build a **thin vertical slice**: Arabic alphabet module (explain each letter properly) +
   10-word Gulf survival set + SRS + mistake analytics + notes — validate the §3 feel before scaling content.
5. **Reuse** §4c infra (Telegram bridge, Supabase+RLS, PostHog identify/D1-D7, seam
   architecture); **do not** merge the Stack City arcade.

---
*End of handoff. Facts in §6–§9 verified against the codebase on 2026-07-04. §2–§5 strategy and
§3 principles are from the owner's stated intent. §1 mismatch is the single most important
thing to resolve first.*
