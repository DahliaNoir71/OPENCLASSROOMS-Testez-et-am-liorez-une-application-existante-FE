// Helper de test partagé : fabrique de faux JWT.
//
// AuthService ne vérifie aucune signature : il découpe le token en 3 segments,
// décode le payload en base64url et lit le claim `exp`. Un token à 3 segments
// dont le payload est du JSON suffit donc à piloter isTokenValid().

/**
 * Fabrique un JWT à 3 segments base64url.
 *
 * @param expSecondes valeur du claim `exp`, en SECONDES epoch (comme un vrai
 *                    JWT). Omis => aucun claim `exp` dans le payload, ce qui
 *                    permet de couvrir le cas du token sans expiration.
 * @param extraClaims claims additionnels fusionnés dans le payload (utile pour
 *                    tester le décodage de caractères accentués).
 */
export function makeJwt(expSecondes?: number, extraClaims: Record<string, unknown> = {}): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: Record<string, unknown> = { sub: 'jdoe', ...extraClaims };
  if (expSecondes !== undefined) {
    payload['exp'] = expSecondes;
  }

  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    base64UrlEncode('signature')
  ].join('.');
}

// btoa n'accepte que du latin1 : on passe par TextEncoder pour sérialiser
// l'UTF-8 octet par octet, puis on convertit le base64 en base64url
// (`+` -> `-`, `/` -> `_`, padding `=` retiré) comme le fait un vrai émetteur.
function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
