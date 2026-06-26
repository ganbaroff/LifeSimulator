# Stack Duel — Release & Retention-test checklist

## The point (protocol)
The build is done and polished (start screen, juice, audio, skins, real icon;
all tests green; CI ships a signed 15.6 MB APK). The ONLY thing that advances the
project now is a **real retention signal from real users**. That needs a Google
Play **closed/internal test**, which needs a few items only the owner can do.
More code right now is polishing a <5% bet — so we go for the signal.

Best practice: **validate retention FIRST, monetize after.** Ads are NOT required
for the first signal — Play Console reports D1/D7 retention + sessions for free.

---

## THE ONE BLOCKER
- **Google Play Developer account** — $25 one-time + ID verification (~1–2 days).
  Nothing publishes without it. Start: https://play.google.com/console/signup

---

## Minimal path to a retention signal
1. **[You]** Create the Play Developer account (the blocker above).
2. **[You]** Confirm the final **package name** — it is PERMANENT after first
   upload. Proposed: `com.volaura.stackduel` (currently `com.volaura.stack_duel`).
   Say the word and I lock it in `android/`.
3. **[You] Signing — use Play App Signing** (Google holds the real key; you keep an
   upload key). Generate the upload key once (keep it + passwords secret):
   ```
   keytool -genkey -v -keystore upload.jks -keyalg RSA -keysize 2048 \
     -validity 10000 -alias upload
   ```
   Do NOT send me the keystore or passwords. Instead add them as **GitHub repo
   Secrets**: `KEYSTORE_BASE64` (`base64 upload.jks`), `STORE_PASSWORD`,
   `KEY_PASSWORD`, `KEY_ALIAS`. I wire CI to build a signed bundle from them.
4. **[Me]** CI builds a signed **AAB** (`flutter build appbundle`) — the Play
   upload format.
5. **[You]** Upload the AAB to **Internal testing**; add testers (you + a few
   friends/their emails).
6. **[Play Console]** shows install→retention (D1/D7) + sessions automatically.
   **Target: D1 ≥ ~35%.** That number decides whether this game is worth
   monetizing or whether we move on. THAT is the real go/no-go.

---

## After retention clears the bar → monetize (needs your AdMob)
- AdMob account → app + ad units → gives the App ID + interstitial/rewarded unit
  IDs. I then swap the real `AdMobAds` impl in for `NoopAds` (interstitial every
  3rd game over; rewarded = double coins) and put the real App ID in the manifest
  (replacing the test id already there).

---

## What I'll do NOW without you (say "go")
- Lock the package name (on your confirm).
- Generate store screenshots + a feature graphic (from the game visuals).
- Wire the signed-AAB CI job behind the Secrets above (inert until you add them).

---

## Privacy policy (Play requires a URL). Host this text anywhere public
(GitHub Pages / Notion public page / a free host) and paste the URL into the
listing.

> **Stack Duel — Privacy Policy**
> Stack Duel does not collect, store, or share any personal data. Your best
> score, coins, and selected skin are saved only on your device (local storage)
> and never leave it. The app has no account system and no analytics SDK.
> If advertising is added in a future version, it will use Google AdMob, which
> may collect device identifiers as described in Google's policy
> (https://policies.google.com/privacy); this policy will be updated at that time.
> Contact: ganbarov.y@gmail.com

---

## Store listing draft
- **Name:** Stack Duel
- **Short description:** Tap to stack. Hit the centre for a perfect combo. How
  high can you climb?
- **Full description:** A one-tap stacking arcade game. A block slides; tap to
  drop it. Land it dead-centre for a PERFECT — build a combo, grow your tower back,
  and rack up coins for new skins. Miss the centre and the tower narrows; miss it
  entirely and it's over. Simple to start, hard to master. No timers, instant
  restart, just one more run.
- **Category:** Games → Arcade
- **Content rating:** Everyone
