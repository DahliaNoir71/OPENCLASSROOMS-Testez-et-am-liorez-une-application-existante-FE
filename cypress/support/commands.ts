/// <reference types="cypress" />

// Même logique d'encodage que src/testing/jwt.helper.ts (côté Jest), réimplémentée
// ici car cypress/ a son propre tsconfig, isolé de celui du reste du projet.
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

function buildJwt(expSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { sub: 'e2e-user', exp: expSeconds };

  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    base64UrlEncode('signature'),
  ].join('.');
}

// Pose un JWT valide (claim exp = expFutur, timestamp UNIX en secondes) dans
// localStorage['auth_token'], pour authentifier un parcours sans passer par /api/login.
Cypress.Commands.add('makeJwt', (expFutur: number) => {
  const token = buildJwt(expFutur);
  return cy.window().then((win) => {
    win.localStorage.setItem('auth_token', token);
    return token;
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      makeJwt(expFutur: number): Chainable<string>;
    }
  }
}

export {};
