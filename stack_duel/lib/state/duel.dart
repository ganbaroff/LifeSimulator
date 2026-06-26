// Async Stack Duel — the name-justifying viral hook (research: async-social that
// works even when only one friend is online beats graphics; Polytopia/Super Auto
// Pets "ghost" duels). Client-only, no backend: a challenge is encoded into the
// share URL. The friend opens it, plays the SAME deterministic seed, and their
// score is compared to the challenger's.
//
// Pure (only dart:convert from core) so the encode/decode round-trip is
// unit-testable with a plain Dart SDK.

import 'dart:convert';

/// A challenge carried in a `?duel=<token>` link: play [seed] and try to beat
/// [score] (set by [name], '' if anonymous).
class DuelChallenge {
  const DuelChallenge({
    required this.seed,
    required this.name,
    required this.score,
  });

  final int seed;
  final String name;
  final int score;
}

/// Encode a challenge into a URL-safe token (base64url of "seed|name|score").
String encodeDuel(int seed, String name, int score) {
  final clean = name.replaceAll('|', ' ').trim();
  return base64Url.encode(utf8.encode('$seed|$clean|$score'));
}

/// Decode a `?duel=` token; null if malformed.
DuelChallenge? decodeDuel(String token) {
  try {
    // Restore any base64 padding the URL may have dropped.
    final padded = token.padRight((token.length + 3) & ~3, '=');
    final raw = utf8.decode(base64Url.decode(padded));
    final parts = raw.split('|');
    if (parts.length != 3) return null;
    final seed = int.tryParse(parts[0]);
    final score = int.tryParse(parts[2]);
    if (seed == null || score == null) return null;
    return DuelChallenge(seed: seed, name: parts[1], score: score);
  } catch (_) {
    return null;
  }
}

/// Friendly label for a (possibly anonymous) challenger.
String duelDisplayName(String name) =>
    name.trim().isEmpty ? 'a friend' : name.trim();

/// Outcome of [mine] vs [theirs]: 1 win, 0 tie, -1 loss.
int duelOutcome(int mine, int theirs) =>
    mine > theirs ? 1 : (mine == theirs ? 0 : -1);

/// One-line result, e.g. "You beat Alex  146 : 104" / "Alex wins  90 : 146".
String duelResultLine(String name, int mine, int theirs) {
  final who = duelDisplayName(name);
  final o = duelOutcome(mine, theirs);
  if (o > 0) return 'You beat $who   $mine : $theirs';
  if (o == 0) return 'Tie with $who   $mine : $theirs';
  return '$who wins   $mine : $theirs';
}
