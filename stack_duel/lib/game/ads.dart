/// Ads seam.
///
/// No real ad SDK yet: the live AdMob integration (Day 3) needs the owner's
/// app/ad-unit ids and a manifest App ID, and can't run headless. This seam lets
/// the game wire the ad TRIGGER POINTS now, behind a no-op, so the real
/// `google_mobile_ads` implementation drops in later with zero call-site churn —
/// exactly like the Haptics / Sound / Analytics seams.
///
/// Cadence and eligibility are decided by the CALLER (the game), per the
/// monetization contract (HANDOFF §12): interstitial every 3rd eligible game
/// over; rewarded is opt-in (continue / double coins).
abstract class Ads {
  /// Show a full-screen interstitial. The caller has already decided it is due.
  void showInterstitial();
}

/// Default no-op (does nothing, costs nothing).
class NoopAds implements Ads {
  const NoopAds();

  @override
  void showInterstitial() {}
}
