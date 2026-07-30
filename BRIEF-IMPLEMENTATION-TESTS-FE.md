# Brief d'implémentation — Tests Front-end (Gestion des étudiants, Angular 19)

> **Document destiné à Claude Code (modèle Sonnet).** Ce n'est pas une documentation à lire : c'est la spécification d'exécution à suivre lot par lot.
>
> Projet 2 OpenClassrooms — « Testez et améliorez une application existante ». Dépôt : `OPENCLASSROOMS-Testez-et-am-liorez-une-application-existante-FE`.
> **Révision 2.1** — découpage recalibré : 17 lots courts, squelettes de code fournis, rappels de règles répétés dans chaque lot. Les commits font partie des commandes que **je** lance : tu me proposes le message, tu ne commites jamais.

---

## 0. Règles de travail

### 0.1 RÈGLE ABSOLUE — tu n'exécutes aucune commande

**Je lance moi-même toutes les commandes.** Tu ne dois jamais exécuter, ni proposer d'exécuter, ni supposer avoir exécuté :

- `npm install`, `npm test`, `npm run …`, `npm start`, `npx …`
- `ng …`, `jest …`, `cypress …`
- `git add`, `git commit`, `git push`, `git diff`, ou toute autre commande git
- tout script shell, même « juste pour vérifier »

À la place, tu **me fournis** la commande dans un bloc dédié, prête à copier-coller, avec le résultat attendu. Format exact à respecter :

````
### ▶️ À lancer de mon côté

```bash
npm test -- src/app/core/service/auth.service.spec.ts
```

**Attendu** : 6 tests passants (A1 à A5, A12), 0 échec.
**Je te renvoie** : la sortie complète de la commande.
````

Puis **tu t'arrêtes et tu attends ma réponse.** Tu ne commences pas le lot suivant, tu ne pré-écris rien, tu n'anticipes rien.

**Le commit est une commande comme les autres : c'est moi qui le lance.** Tu ne fais que **me proposer le message**, dans le même type de bloc, avec le `git add` correspondant. Format exact :

````
### ▶️ À lancer de mon côté — commit du lot 1

```bash
git add src/app/core/service/auth.service.spec.ts
git commit -F - <<'EOF'
test(auth-service): couvrir le cycle de vie du token

- Tester getToken sans token puis avec un token présent au démarrage
- Vérifier isAuthenticated à l'état initial et avec un token valide
- Couvrir saveToken et logout (cas A1 à A5, A12)
EOF
```

**Je te renvoie** : « commit ok » ou le message d'erreur.
````

Règles sur ce bloc :

- `git add` avec les **chemins explicites** des fichiers du lot — jamais `git add .`, jamais `git add -A`.
- Message via `git commit -F - <<'EOF'` (heredoc) et non `-m` répété : le corps en liste à tirets doit arriver intact, et je travaille sous Git Bash.
- Le message est celui **fourni dans le lot**. Si tu as dû t'en écarter (fichier supplémentaire, cas décalé), tu me proposes le message ajusté **en me signalant l'écart et pourquoi**.
- Un seul commit par lot. Si tu penses qu'il en faudrait deux, tu me le dis et tu attends mon arbitrage.

### 0.2 Boucle de travail — 6 temps, un seul lot à la fois

1. **Annonce** : numéro du lot, fichiers créés ou modifiés, cas couverts.
2. **Lecture du code réel** : ouvre les fichiers source concernés (service, composant, **et son template HTML**) avant d'écrire le spec. Les noms de champs, libellés DOM et signatures viennent du code, jamais d'une supposition.
3. **Écriture** : les fichiers du lot, et rien d'autre.
4. **Bloc « ▶️ À lancer de mon côté »** avec la commande de test → **arrêt**.
5. **Sur mon retour vert** : bloc « ▶️ À lancer de mon côté — commit du lot N » contenant le `git add` explicite et le **message de commit proposé** (celui fourni dans le lot, au format heredoc du §0.1) → **arrêt**. Tu ne commites pas : je le fais.
6. **Sur mon accusé de commit** : lot suivant.

Si je te renvoie des échecs : tu corriges **le lot en cours uniquement**, et tu me redonnes la commande de test. Tu ne passes pas au lot suivant avec un test rouge.

### 0.3 Checklist de fin de lot — à imprimer systématiquement

Avant le bloc de commande de test, affiche cette checklist remplie :

```
✅ Fin de lot N
- Fichiers écrits : …
- Cas couverts : … (numéros)
- Cas hors plan ajoutés : aucun
- Fichiers de production modifiés : aucun
- Cases d'erreur HTTP (4xx/5xx) introduites : aucune
- Numéro de cas en commentaire au-dessus de chaque `it` : oui
- Message de commit proposé (non exécuté) : prêt, conforme au message du lot
```

Si une ligne ne peut pas être remplie ainsi, **arrête-toi et explique-moi pourquoi** au lieu de contourner.

### 0.4 Contraintes de code

- **Ne modifie aucun fichier de production** : `*.component.ts`, `*.service.ts`, guards, interceptor, templates HTML, `app.config.ts`, `app.routes.ts`, `environment*.ts`. Périmètre autorisé : `*.spec.ts`, `src/testing/`, configuration de test, `cypress/`, `package.json` (scripts + devDependencies), `README.md`. Si un test ne peut pas passer sans toucher au code de production → **arrête-toi et signale-le-moi**.
- **Aucun cas d'erreur HTTP** (cf. §4.1) : pas de `flush` ni d'`intercept` avec un statut 4xx/5xx.
- **Aucune assertion d'effet de bord** (cf. §4.3).
- **Applique les conventions du §6 telles quelles** : elles ont été vérifiées contre le code du dépôt, ce ne sont pas des suggestions.
- **Utilise les squelettes du §2** : ils fixent le `beforeEach`, les providers et les imports. N'invente pas une autre organisation.
- Libellés de `it` **exactement** ceux de la colonne « Nom du test ». Numéro du cas en commentaire au-dessus (`// A7`).
- **N'ajoute aucun cas non listé.** Si tu en identifies un pertinent, propose-le en fin de lot sans l'écrire.

### 0.5 Modèle et escalade

Ce chantier est calibré pour **Sonnet**. Si un lot reste rouge **après deux cycles de correction**, ne tente pas un troisième : signale-le-moi explicitement (`⚠️ Lot N bloqué après 2 corrections — escalade recommandée`) et résume ce que tu as compris du problème. Je rebasculerai ce lot sur un modèle plus capable. Deux échecs consécutifs signalent en général une incompréhension du mécanisme, pas une coquille.

### 0.6 Une session par lot

Je démarre une session Claude Code **neuve à chaque lot** (ou tous les deux lots pour les plus courts). Chaque lot de ce document est autosuffisant. Mon message d'amorçage sera de la forme :

> Lis `BRIEF-IMPLEMENTATION-TESTS-FE.md`. Applique le **lot N** uniquement, en respectant les §0 à §2. Rappel : tu ne lances aucune commande.

Tu n'as donc pas besoin de te souvenir des lots précédents : leur état est dans le dépôt (git log + fichiers de test existants). Si tu as besoin de vérifier ce qui a déjà été fait, **lis les fichiers**, ne me le demande pas.

---

## 1. État attendu du dépôt au démarrage

- Angular 19.2, standalone components, `strict` + `strictTemplates` + `noPropertyAccessFromIndexSignature` activés.
- Jest 29.7 + jest-preset-angular 14.5 déjà configurés (`jest.config.js`, `setup-jest.ts`, script `npm test`, `collectCoverage: true`). **`ng test` n'a aucune cible dans `angular.json`** : n'utilise jamais `ng test` dans les commandes que tu me fournis.
- Cypress **absent** : installé au lot 11.
- `environment.apiUrl = ''` dans les deux environnements → toutes les URLs API sont relatives (`/api/...`).
- Proxy de dev `proxy.conf.json` : `/api → http://localhost:8080`.

---

## 2. Squelettes de référence

Ces squelettes sont **imposés**. Ils évitent les erreurs de configuration qui ne se voient qu'à l'exécution. Complète-les, ne les réorganise pas.

### 2.1 Helper JWT — `src/testing/jwt.helper.ts` (lot 0)

Implémentation attendue, à écrire telle quelle :

```ts
function b64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fabrique un JWT de test à 3 segments.
 * @param expSeconds timestamp UNIX (secondes) du claim exp. `null` => aucun claim exp.
 * @param extraClaims claims additionnels à fusionner dans le payload.
 */
export function makeJwt(
  expSeconds: number | null = Math.floor(Date.now() / 1000) + 3600,
  extraClaims: Record<string, unknown> = {},
): string {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const payload = b64url({
    sub: 'test-user',
    ...(expSeconds === null ? {} : { exp: expSeconds }),
    ...extraClaims,
  });
  return `${header}.${payload}.signature-de-test`;
}
```

Notes : `btoa` gère l'ASCII ; pour le cas A11 (claim accentué) passe par `TextEncoder` + conversion binaire, ou encode le claim en échappement `\uXXXX` — vérifie que le token produit est bien décodable par le service avant de conclure.

> **Note (lot 0, session du 2026-07-30)** : `src/testing/jwt.helper.ts` existe déjà dans le dépôt avec une implémentation légèrement différente de ce squelette (elle passe systématiquement par `TextEncoder`/décomposition en octets, y compris pour les tokens sans accents, et `expSecondes` n'a pas de valeur par défaut — omis = aucun claim `exp`). Décision actée avec l'utilisateur : on **garde l'implémentation existante**, fonctionnellement équivalente (couvre nativement le cas A11), plutôt que de la réécrire pour coller au squelette au caractère près.

### 2.2 Spec de service HTTP (lots 3)

```ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('StudentService', () => {
  let service: StudentService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StudentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  // A17
  it("getAll émet GET /api/students et retourne la liste", () => { /* … */ });
});
```

### 2.3 Spec `AuthService` (lots 1, 2, 3)

Particularité : le signal `_token` est initialisé **à l'instanciation** depuis `localStorage`. Le service doit donc être injecté **après** avoir peuplé le stockage → pas d'`inject` dans le `beforeEach`, mais une fabrique appelée dans chaque test.

```ts
describe('AuthService', () => {
  let httpTesting: HttpTestingController;

  const createService = (): AuthService => {
    const service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    return service;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    httpTesting?.verify();
  });

  // A3
  it("getToken restitue le token présent au démarrage", () => {
    const token = makeJwt();
    localStorage.setItem('auth_token', token);   // AVANT createService()
    const service = createService();
    expect(service.getToken()).toBe(token);
  });
});
```

**Cas A7 — patron imposé** (le `computed()` est mémoïsé, l'égalité des signaux est `Object.is` : re-poser la même chaîne ne notifie rien) :

```ts
// A7
it("un token valide devient invalide après expiration", () => {
  const now = Date.now();
  jest.useFakeTimers().setSystemTime(now);
  const token = makeJwt(Math.floor(now / 1000) + 60);

  const service = createService();
  service.saveToken(token);
  expect(service.isAuthenticated()).toBe(true);

  jest.setSystemTime(now + 61_000);
  service.logout();          // passage à null : vrai changement de valeur
  service.saveToken(token);  // re-pose : le computed se recalcule à l'horloge avancée
  expect(service.isAuthenticated()).toBe(false);
});
```

### 2.4 Spec de guard (lot 4)

```ts
describe('authGuard', () => {
  const runGuard = (isAuth: boolean, url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => isAuth } },
      ],
    });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
    return { result, router };
  };

  // A23
  it("authGuard redirige un invité vers /login avec returnUrl", () => {
    const { result, router } = runGuard(false, '/students/5');
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fstudents%2F5');
  });
});
```

### 2.5 Spec d'interceptor (lot 5)

Ordre des providers **impératif** : `provideHttpClient(withInterceptors([...]))` **puis** `provideHttpClientTesting()`. `HTTP_INTERCEPTORS` ne fonctionne pas avec un interceptor fonctionnel.

```ts
beforeEach(() => {
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
    ],
  });
});
```

### 2.6 Spec de composant (lots 6 à 10)

```ts
describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let httpTesting: HttpTestingController;
  let router: Router;

  const setup = (params: Record<string, string> = {}, queryParams: Record<string, string> = {}) => {
    TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(params),
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(StudentFormComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    return fixture;
  };

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    httpTesting?.verify();
  });
});
```

Sélection DOM : `fixture.nativeElement.querySelector(...)` / `querySelectorAll(...)`. Saisie d'un champ :

```ts
const input = fixture.nativeElement.querySelector('#firstName') as HTMLInputElement;
input.value = ' Ada ';
input.dispatchEvent(new Event('input'));
fixture.detectChanges();
```

Soumission : `form.dispatchEvent(new Event('submit'))` sur l'élément `<form>`, pas un appel direct à la méthode du composant.

---

## 3. Convention de commits

Conventional Commits **en français**, corps en liste à tirets — style du dépôt :

```
feat(students): intégrer CRUD étudiants avec authentification JWT sécurisée

- Implémenter guards pour protéger les routes authentifiées
- Ajouter interceptors pour injecter automatiquement le JWT
```

Ici : type `test` (ou `chore` / `docs` pour l'outillage et la doc), scope = la brique testée. **Un commit par lot**, ni plus ni moins.

Les messages de chaque lot sont **prérédigés en section 5** : tu les reprends tels quels dans le bloc du §0.1, sans les reformuler. Ils sont déjà conformes à la convention (type, scope, corps en tirets, verbes à l'infinitif, mention des numéros de cas) — les réécrire ne peut que les dégrader.

Rappel : **le commit est exécuté par moi.** Ton livrable est le message + le `git add`, pas le commit.

---

## 4. Périmètre et outils

### 4.1 Périmètre

- **Inclus** : logique JWT de `AuthService`, services HTTP (`AuthService.login`, `UserService`, `StudentService`), guards `authGuard`/`guestGuard`, `authInterceptor`, composants standalone (navbar, landing, login, register, liste/détail/formulaire étudiant), parcours E2E nominaux.
- **Exclus (choix assumé, conforme au brief)** : tous les cas d'erreur HTTP (400/401/404), `HttpErrorService`, les messages d'erreur serveur, les états `errorMessage`/`loading` des composants, la branche 401 (`catchError`) de l'interceptor.
- **Cas limites conservés** (token expiré/malformé → non authentifié, formulaire invalide → aucune requête, guard qui redirige) : **comportements nominaux spécifiés** — une validation qui retourne `false` fait son travail, sans erreur HTTP ni exception.

### 4.2 Outils imposés

Jest 29 + jest-preset-angular (niveaux 1–2), Cypress (niveau 3, installé au lot 11).

### 4.3 Règles de la spécification

- Uniquement des **cas nominaux** ; chaque cas précise son **entrée** et sa **sortie attendue**.
- **Pas de vérification d'effets de bord** : les assertions portent sur une sortie observable — valeur émise par l'Observable, requête capturée par `HttpTestingController`, rendu DOM, URL passée au Router. `localStorage` n'est utilisé qu'en **entrée**, jamais inspecté en assertion ; la snackbar n'est pas assertée.

---

## 5. Séquence d'implémentation — 17 lots

Ordre imposé, du plus simple au plus complexe. Volumes courts et volontairement homogènes : 2 à 6 cas par lot, un thème unique par lot.

### Récapitulatif

| Lot | Objet | Cas | Volume | Commande de test | Commit |
| --- | --- | --- | --- | --- | --- |
| 0 | Réparation specs + helper JWT | — | 3 fichiers | `npm test` | `test(setup)` |
| 1 | `AuthService` — cycle du token | A1–A5, A12 | 6 | `npm test -- …/auth.service.spec.ts` | `test(auth-service)` |
| 2 | `AuthService` — validation JWT | A6–A11 | 6 | idem | `test(auth-service)` |
| 3 | Services HTTP | A13–A21 | 9 | `npm test -- src/app/core/service` | `test(services)` |
| 4 | Guards | A22–A25 | 4 | `npm test -- src/app/core/guards` | `test(guards)` |
| 5 | Interceptor | A26–A29 | 4 | `npm test -- src/app/core/interceptors` | `test(interceptor)` |
| 6 | Landing + navbar | B1–B4 | 4 | `npm test -- …/app.component.spec.ts …/landing` | `test(navbar-landing)` |
| 7 | `RegisterComponent` | B5–B6 | 2 | `npm test -- …/register` | `test(register)` |
| 8 | `LoginComponent` | B7–B11 | 5 | `npm test -- …/login` | `test(login)` |
| 9 | `StudentListComponent` | B12–B15 | 4 | `npm test -- …/student-list` | `test(student-list)` |
| 10 | Détail + formulaire étudiant | B16–B21 | 6 | `npm test` | `test(student-form)` |
| 11 | Outillage Cypress | — | config | `npm test` | `chore(cypress)` |
| 12 | E2E — protection des routes | §9.3 | 2 étapes | `npm start` + `npm run e2e` | `test(e2e)` |
| 13 | E2E — inscription/connexion | §9.1 | 2 étapes | idem | `test(e2e)` |
| 14 | E2E — CRUD étudiants | §9.2 | 4 étapes | idem | `test(e2e)` |
| 15 | E2E — smoke back réel | §9.4 | 4 étapes | back + `npm start` + `npm run e2e:smoke` | `test(e2e)` |
| 16 | Documentation | — | README | — | `docs(readme)` |

---

### Lot 0 — Réparation des specs existants + helper JWT

> Rappel : tu ne lances aucune commande. Tu ne touches à aucun fichier de production.

**Critère de sortie du chantier entier** : `npm test` au vert **avant** d'écrire tout nouveau cas.

| Fichier | Problème constaté | Action attendue |
| --- | --- | --- |
| `src/app/app.component.spec.ts` | **Cassé dès la compilation TS** : teste `app.title`, propriété qui n'existe plus sur `AppComponent` ; TestBed sans `provideHttpClient` ni `provideRouter` alors que le composant injecte `AuthService` (→ `HttpClient`) et `Router`, et que le template utilise `routerLink` | Réduire à un smoke test valide (les cas B2–B4 viendront au lot 6) |
| `src/app/pages/register/register.component.spec.ts` | Mock défectueux : `{ provide: UserService, useValue: UserMockService }` fournit la **classe**, pas une instance ; `provideRouter` manquant | Providers corrigés, smoke test valide (B5–B6 au lot 7) |
| `src/app/core/service/user.service.spec.ts` | Smoke test valide mais `provideHttpClient()` seul, sans backend de test | Ajouter `provideHttpClientTesting()` |

À créer : **`src/testing/jwt.helper.ts`** — implémentation du §2.1, telle quelle.

`src/app/core/service/user-mock.service.ts` deviendra inutilisé après le lot 7. **Ne le supprime pas** : signale-le-moi à ce moment-là.

**Commande de test** : `npm test` — **attendu** : suite verte, 0 échec.

**Commit** :
```
test(setup): réparer les specs existants et ajouter le helper JWT

- Réécrire le smoke test d'AppComponent (propriété title supprimée)
- Corriger les providers du spec RegisterComponent (instance au lieu de la classe)
- Ajouter provideHttpClientTesting au spec UserService
- Ajouter le helper partagé makeJwt pour la fabrication de JWT de test
```

---

### Lot 1 — `AuthService` : cycle du token

> Rappel : aucune commande lancée. Squelette du §2.3 imposé — le service s'injecte via `createService()`, après avoir peuplé `localStorage`.

**Fichier** : `src/app/core/service/auth.service.spec.ts` (à créer)
**Cas** : A1, A2, A3, A4, A5, A12 (§7.1) — 6 tests
**Vigilance** : peupler `localStorage` **avant** `createService()` ; `localStorage.clear()` en `beforeEach` et `afterEach`.

**Commande de test** : `npm test -- src/app/core/service/auth.service.spec.ts` — **attendu** : 6 tests passants.

**Commit** :
```
test(auth-service): couvrir le cycle de vie du token

- Tester getToken sans token puis avec un token présent au démarrage
- Vérifier isAuthenticated à l'état initial et avec un token valide
- Couvrir saveToken et logout (cas A1 à A5, A12)
```

---

### Lot 2 — `AuthService` : validation JWT et expiration

> Rappel : aucune commande lancée. **Le cas A7 suit le patron du §2.3, à la lettre** — `logout()` puis `saveToken()`, sinon le `computed` mémoïsé ne se recalcule pas et le test échouera.

**Fichier** : `src/app/core/service/auth.service.spec.ts` (compléter)
**Cas** : A6 → A11 (§7.1) — 6 tests
**Vigilance** : `jest.useRealTimers()` en `afterEach` ; A10 utilise `makeJwt(null)` ; A11 exige de vérifier que le token accentué produit est bien décodable (cf. note du §2.1) — si `btoa` échoue sur le caractère accentué, encode-le côté payload avant appel.

**Commande de test** : `npm test -- src/app/core/service/auth.service.spec.ts` — **attendu** : 12 tests passants (6 du lot 1 + 6).

**Commit** :
```
test(auth-service): couvrir la validation et l'expiration des JWT

- Tester un token expiré et le passage de valide à expiré (cas A6, A7)
- Couvrir les tokens malformés : segments manquants, payload non-JSON (cas A8, A9)
- Vérifier le rejet d'un payload sans claim exp (cas A10)
- Tester le décodage base64url avec caractères accentués (cas A11)
```

---

### Lot 3 — Services HTTP : `login`, `UserService`, `StudentService`

> Rappel : aucune commande lancée. Squelette du §2.2. Aucun statut d'erreur dans les `flush`.

**Fichiers** : `auth.service.spec.ts` (compléter), `user.service.spec.ts` (compléter), `student.service.spec.ts` (à créer)
**Cas** : A13–A14 (§7.1), A15–A16 (§7.2), A17–A21 (§7.3) — 9 tests
**Vigilance** : A14 flush une **chaîne** (`responseType: 'text'` côté service), pas un objet ; `delete` renvoie `Observable<void>` → `flush(null)` ; `httpTesting.verify()` en `afterEach` partout.

**Commande de test** : `npm test -- src/app/core/service` — **attendu** : 21 tests passants.

**Commit** :
```
test(services): couvrir les appels HTTP des trois services

- Tester la requête de connexion et le mapping de la réponse texte (cas A13, A14)
- Couvrir l'inscription via POST /api/register (cas A15, A16)
- Tester les cinq opérations CRUD de StudentService (cas A17 à A21)
- Vérifier URLs, verbes HTTP, payloads et valeurs émises
```

---

### Lot 4 — Guards

> Rappel : aucune commande lancée. Squelette du §2.4 — `runInInjectionContext` obligatoire, comparaison via `serializeUrl`.

**Fichiers** : `src/app/core/guards/auth.guard.spec.ts`, `src/app/core/guards/guest.guard.spec.ts` (à créer)
**Cas** : A22 → A25 (§7.4) — 4 tests

**Commande de test** : `npm test -- src/app/core/guards` — **attendu** : 4 tests passants.

**Commit** :
```
test(guards): couvrir la protection des routes

- Tester authGuard : accès autorisé pour un utilisateur authentifié (cas A22)
- Vérifier la redirection vers /login avec returnUrl (cas A23)
- Tester guestGuard : accès invité et redirection des connectés (cas A24, A25)
```

---

### Lot 5 — Interceptor

> Rappel : aucune commande lancée. Ordre des providers du §2.5 impératif.

**Fichier** : `src/app/core/interceptors/auth.interceptor.spec.ts` (à créer)
**Cas** : A26 → A29 (§7.5) — 4 tests
**Vigilance** : la branche 401 (`catchError`) est **hors périmètre**.

**Commande de test** : `npm test -- src/app/core/interceptors` — **attendu** : 4 tests passants.

**Commit** :
```
test(interceptor): couvrir l'injection du JWT dans les requêtes

- Vérifier l'ajout de l'en-tête Bearer sur un appel protégé (cas A26)
- Tester l'absence d'en-tête sans token stocké (cas A27)
- Vérifier l'exclusion des routes publiques /api/login et /api/register (cas A28, A29)
```

---

### Lot 6 — `LandingComponent` et navbar

> Rappel : aucune commande lancée. Squelette du §2.6. Lis les templates HTML avant d'écrire les sélecteurs.

**Fichiers** : `src/app/pages/landing/landing.component.spec.ts` (à créer), `src/app/app.component.spec.ts` (remplacer le smoke test du lot 0)
**Cas** : B1 (§8.1), B2 → B4 (§8.2) — 4 tests
**Vigilance** : B3 cible le lien via `a[href="/students"]` — le libellé « Étudiants » apparaît **deux fois** dans le template (marque de la navbar vers `/` + lien) ; peupler `localStorage` avant `createComponent`.

**Commande de test** : `npm test -- src/app/app.component.spec.ts src/app/pages/landing` — **attendu** : 4 tests passants.

**Commit** :
```
test(navbar-landing): couvrir l'affichage conditionnel selon l'authentification

- Tester les liens de la page d'accueil (cas B1)
- Vérifier la navbar en mode invité et en mode connecté (cas B2, B3)
- Tester la déconnexion et le retour en mode invité (cas B4)
```

---

### Lot 7 — `RegisterComponent`

> Rappel : aucune commande lancée. Soumission par `dispatchEvent(new Event('submit'))` sur le `<form>`.

**Fichier** : `src/app/pages/register/register.component.spec.ts` (réécrire)
**Cas** : B5 → B6 (§8.3) — 2 tests
**À signaler en fin de lot** : `user-mock.service.ts` devient inutilisé — tu me le signales, je tranche.

**Commande de test** : `npm test -- src/app/pages/register` — **attendu** : 2 tests passants.

**Commit** :
```
test(register): couvrir l'écran d'inscription

- Vérifier qu'un formulaire invalide n'émet aucune requête (cas B5)
- Tester la soumission et la redirection vers /login?registered=1 (cas B6)
```

---

### Lot 8 — `LoginComponent`

> Rappel : aucune commande lancée. `returnUrl` est lu dans `onSubmit()`, **pas** dans `ngOnInit` — le mock d'`ActivatedRoute` doit être en place dès la création, mais l'assertion porte sur la navigation après soumission.

**Fichier** : `src/app/pages/login/login.component.spec.ts` (à créer)
**Cas** : B7 → B11 (§8.4) — 5 tests
**Vigilance** : B10/B11 flushent une **chaîne** ; assertion sur `navigateByUrl`, **pas** `navigate`.

**Commande de test** : `npm test -- src/app/pages/login` — **attendu** : 5 tests passants.

**Commit** :
```
test(login): couvrir l'écran de connexion

- Couvrir l'affichage conditionnel de la bannière de confirmation (cas B7, B8)
- Vérifier qu'un formulaire invalide n'émet aucune requête (cas B9)
- Tester la navigation vers /students puis vers le returnUrl fourni (cas B10, B11)
```

---

### Lot 9 — `StudentListComponent`

> Rappel : aucune commande lancée. `confirm()` natif espionné, jamais appelé pour de vrai.

**Fichier** : `src/app/pages/students/student-list/student-list.component.spec.ts` (à créer)
**Cas** : B12 → B15 (§8.5) — 4 tests
**Vigilance** : compter `tbody tr` et non toutes les `tr` (le `thead` en contient une) ; B14 enchaîne **deux** requêtes à flusher dans l'ordre (`DELETE` puis `GET`).

**Commande de test** : `npm test -- src/app/pages/students/student-list` — **attendu** : 4 tests passants.

**Commit** :
```
test(student-list): couvrir l'écran de liste des étudiants

- Tester le chargement initial et l'affichage des lignes (cas B12)
- Vérifier l'état vide (cas B13)
- Couvrir la suppression confirmée avec rechargement de la liste (cas B14)
- Vérifier qu'une suppression annulée n'émet aucune requête (cas B15)
```

---

### Lot 10 — `StudentDetailComponent` et `StudentFormComponent`

> Rappel : aucune commande lancée. C'est le lot le plus dense du niveau 2 : écris les 6 cas, puis relis-les avant de me donner la commande.

**Fichiers** : `student-detail.component.spec.ts`, `student-form.component.spec.ts` (à créer)
**Cas** : B16 (§8.6), B17 → B21 (§8.7) — 6 tests
**Vigilance** : B17 utilise `expectNone` avec un **prédicat** (`expectNone` ne supporte pas les jokers) ; B20/B21 vérifient le payload **trimé** ; B21 part de l'état chargé de B18.

**Commande de test** : `npm test` — **attendu** : 50 tests passants (29 unitaires + 21 intégration), rapport de couverture dans `coverage/`.

**Commit** :
```
test(student-form): couvrir le détail et le formulaire étudiant

- Vérifier l'affichage du détail à partir du paramètre d'URL (cas B16)
- Couvrir les modes création et édition du formulaire (cas B17, B18)
- Tester le rejet d'une saisie composée d'espaces (cas B19)
- Vérifier le trim du payload et les navigations après soumission (cas B20, B21)
```

---

### Lot 11 — Installation et configuration de Cypress

> Rappel : **tu n'installes rien**. Tu me fournis les commandes, j'installe, puis tu écris les fichiers de configuration.

**Commandes à me fournir** (dans cet ordre, en précisant que la seconde ouvre une fenêtre et génère l'arborescence `cypress/`) :
```bash
npm install --save-dev cypress
npx cypress open
```

**Fichiers à écrire ensuite** :
- `cypress.config.ts` : `e2e.baseUrl = 'http://localhost:4200'`
- `cypress/tsconfig.json` dédié — sans quoi les types Mocha de Cypress entrent en conflit avec ceux de Jest sur `describe`/`it`
- `cypress/support/commands.ts` : commande custom `cy.makeJwt(expFutur)` posant un JWT valide dans `localStorage['auth_token']` (même logique que le helper du §2.1) + la déclaration de type associée
- `package.json`, trois scripts :

```jsonc
"e2e":       "cypress run --spec 'cypress/e2e/inscription-connexion.cy.ts,cypress/e2e/etudiants-crud.cy.ts,cypress/e2e/protection-routes.cy.ts'",
"e2e:smoke": "cypress run --spec 'cypress/e2e/smoke-back-reel.cy.ts'",
"e2e:open":  "cypress open"
```

Le découpage `e2e` / `e2e:smoke` est volontaire : les specs stubées tournent sans back, le smoke exige le back réel.

**Commande de vérification** : `npm test` — **attendu** : suite Jest toujours verte (contrôle que le `tsconfig` Cypress ne pollue pas Jest).

**Commit** :
```
chore(cypress): installer et configurer Cypress pour les tests E2E

- Ajouter Cypress en dépendance de développement
- Configurer baseUrl sur le serveur de développement Angular
- Isoler les types Cypress dans un tsconfig dédié pour éviter le conflit avec Jest
- Ajouter la commande custom makeJwt pour authentifier les parcours
- Ajouter les scripts e2e, e2e:smoke et e2e:open
```

---

### Lot 12 — E2E : protection des routes

> Rappel : aucune commande lancée. Aucun statut d'erreur dans les `intercept`.

**Fichier** : `cypress/e2e/protection-routes.cy.ts`
**Cas** : §9.3 — 2 étapes
**Vigilance** : à l'étape 2, l'intercept `GET /api/students` est **obligatoire** — après la redirection, la liste émet cette requête et, sans stub ni back, elle échouerait.

**Commandes à me fournir** — deux terminaux :
```bash
# Terminal 1 — laisser tourner
npm start
```
```bash
# Terminal 2 — une fois le serveur prêt
npm run e2e
```
**Attendu** : 1 spec passante (les deux autres specs du script n'existent pas encore — c'est normal, Cypress les ignore).

**Commit** :
```
test(e2e): couvrir les redirections des guards

- Vérifier la redirection d'un invité vers /login avec returnUrl
- Vérifier la redirection d'un utilisateur connecté vers /students
```

---

### Lot 13 — E2E : inscription puis connexion

> Rappel : aucune commande lancée.

**Fichier** : `cypress/e2e/inscription-connexion.cy.ts`
**Cas** : §9.1 — 2 étapes
**Vigilance** : le JWT stubé en réponse de `POST /api/login` doit être un **vrai** token à 3 segments avec `exp` futur (la navbar le re-valide après `saveToken`) et renvoyé en **texte**, pas en JSON.

**Commandes** : identiques au lot 12 — **attendu** : 2 specs passantes.

**Commit** :
```
test(e2e): couvrir le parcours inscription puis connexion

- Tester l'inscription et la redirection vers l'écran de connexion
- Vérifier la connexion, l'arrivée sur la liste et la navbar connectée
- Stuber les requêtes API pour une exécution déterministe sans back-end
```

---

### Lot 14 — E2E : CRUD étudiants

> Rappel : aucune commande lancée. Lot E2E le plus complexe : 4 étapes enchaînées dans un même parcours.

**Fichier** : `cypress/e2e/etudiants-crud.cy.ts`
**Cas** : §9.2 — 4 étapes
**Vigilance** : pré-condition `cy.makeJwt` avant chaque `cy.visit` ; à l'étape 3, **re-déclarer** l'intercept `GET /api/students/1` après le `PUT` (en Cypress, le dernier intercept déclaré est prioritaire) ; étape 4, accepter le `confirm` natif.

**Commandes** : identiques au lot 12 — **attendu** : 3 specs passantes.

**Commit** :
```
test(e2e): couvrir le CRUD étudiant de bout en bout

- Tester l'état vide, la création et l'affichage du détail
- Couvrir l'édition avec rechargement du détail modifié
- Vérifier la suppression et le retour à l'état vide
```

---

### Lot 15 — E2E : smoke test contre le back réel

> Rappel : aucune commande lancée. **Aucun `cy.intercept` dans ce fichier.**

**Fichier** : `cypress/e2e/smoke-back-reel.cy.ts`
**Cas** : §9.4 — 4 étapes
**Vigilance** : login **unique** à suffixe horodaté (contrainte d'unicité côté back) ; l'étudiant créé est supprimé en fin de parcours, l'utilisateur inscrit reste en base — assumé, à documenter au lot 16.

**Commandes à me fournir** — trois terminaux :
```bash
# Terminal 1 — back Spring + MySQL (cf. README du dépôt back)
docker compose up -d
# puis démarrer l'application Spring Boot
```
```bash
# Terminal 2 — front avec proxy /api -> localhost:8080
npm start
```
```bash
# Terminal 3
npm run e2e:smoke
```
**Attendu** : 1 spec passante, 4 étapes franchies.

**Commit** :
```
test(e2e): ajouter un smoke test du parcours critique contre le back réel

- Valider inscription, connexion, création et suppression sans stub
- Utiliser un login horodaté pour garantir l'unicité entre exécutions
- Isoler ce parcours du script e2e pour permettre son exécution sans back
```

---

### Lot 16 — Documentation et auto-vérification finale

> Rappel : aucune commande lancée — y compris `git diff` : si tu as besoin de vérifier l'état des fichiers, **lis-les**.

**Fichier** : `README.md`, section « Tests » à ajouter ou compléter.

Contenu attendu : la pyramide et les volumes (29 / 21 / 4 specs E2E), les trois commandes (`npm test`, `npm run e2e`, `npm run e2e:smoke`) avec leurs prérequis respectifs, l'emplacement du rapport de couverture, le périmètre assumé (aucun cas d'erreur HTTP — cf. §4.1), et la note sur le résidu de données du smoke test.

**À me restituer également** : le tableau d'auto-vérification du §10, rempli.

**Commit** :
```
docs(readme): documenter le dispositif de tests front-end

- Décrire les trois niveaux de tests et leurs volumes
- Détailler les commandes d'exécution et leurs prérequis
- Préciser le périmètre assumé et l'emplacement du rapport de couverture
```

---
---

# SPÉCIFICATION DES CAS

*Source de vérité. Les colonnes « Entrée » / « Sortie attendue » sont contractuelles.*

## 6. Conventions techniques transverses (Jest)

Vérifiées contre le code du dépôt. Non négociables.

- `AuthService` initialise son signal `_token` depuis `localStorage` **à l'instanciation** → peupler `localStorage` AVANT l'injection du service / la création du composant, et `localStorage.clear()` en `beforeEach`.
- Helper partagé `makeJwt` : `src/testing/jwt.helper.ts` (§2.1).
- **Signaux et égalité par défaut** : les signaux Angular utilisent `Object.is` — un `set` avec une valeur identique **ne notifie pas** les `computed` dépendants. Pour forcer une ré-évaluation : vrai changement de valeur (cf. patron A7, §2.3).
- Interceptor **fonctionnel** → `provideHttpClient(withInterceptors([authInterceptor]))` **puis** `provideHttpClientTesting()`, dans cet ordre. `HTTP_INTERCEPTORS` ne fonctionne pas.
- Guards **fonctionnels** → `TestBed.runInInjectionContext(() => authGuard(route, state))` ; comparer le `UrlTree` via `router.serializeUrl(...)`.
- `ActivatedRoute` mocké en **snapshot** uniquement (§2.6) — les lectures se font dans `ngOnInit`, sauf `returnUrl` lu dans `onSubmit()` du login : pas besoin de simuler des changements de params.
- `confirm()` natif → `jest.spyOn(window, 'confirm').mockReturnValue(true | false)`.
- Expiration JWT → `jest.useFakeTimers().setSystemTime(...)` ; **`jest.useRealTimers()` en `afterEach`** pour ne pas polluer les specs suivantes.
- Navigation = sortie observable : `jest.spyOn(router, 'navigate' | 'navigateByUrl')`, assertion sur les arguments.
- `httpTesting.verify()` en `afterEach` de chaque spec HTTP — contrôle d'hygiène (aucune requête en attente), pas une assertion d'effet de bord.
- Templates stricts (`noPropertyAccessFromIndexSignature`) : écrire `form['login']`, jamais `form.login`.

## 7. Niveau 1 — Tests unitaires

### 7.1 `AuthService` — `src/app/core/service/auth.service.spec.ts` — **lots 1, 2, 3**

Logique privée (`base64UrlDecode`/`readExp`/`isTokenValid`) testée via l'API publique `getToken()` / `isAuthenticated()`. Le `localStorage` pré-peuplé est une **entrée**.

| N° | Lot | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- | --- |
| A1 | 1 | `getToken retourne null sans token initial` | `localStorage` vide, puis injection du service | `getToken()` → `null` |
| A2 | 1 | `isAuthenticated retourne false sans token` | `localStorage` vide | `isAuthenticated()` → `false` |
| A3 | 1 | `getToken restitue le token présent au démarrage` | `localStorage['auth_token'] = makeJwt()` AVANT injection | `getToken()` → ce token |
| A4 | 1 | `isAuthenticated retourne true pour un token valide` | idem A3 | `isAuthenticated()` → `true` ; `isLoggedIn()` → `true` |
| A5 | 1 | `saveToken rend le token lisible via getToken` | `saveToken('abc.def.ghi')` | `getToken()` → `'abc.def.ghi'` |
| A12 | 1 | `logout rend l'utilisateur déconnecté` | `saveToken(makeJwt())` puis `logout()` | `getToken()` → `null` ; `isAuthenticated()` → `false` |
| A6 | 2 | `isAuthenticated retourne false pour un token expiré` | `setSystemTime(T)` ; `saveToken(makeJwt(T − 60 s))` | `isAuthenticated()` → `false` |
| A7 | 2 | `un token valide devient invalide après expiration` | patron du §2.3 : token à `T + 60 s`, lecture à `T`, puis `setSystemTime(T + 61 s)` + `logout()` + `saveToken(même token)` | `true` à `T`, puis `false` après ré-évaluation |
| A8 | 2 | `token à 2 segments → non authentifié` | `saveToken('aaa.bbb')` | `isAuthenticated()` → `false` |
| A9 | 2 | `payload non-JSON → non authentifié` | `saveToken` avec segment central = base64url de `'not-json'` | `isAuthenticated()` → `false` |
| A10 | 2 | `payload sans claim exp → non authentifié` | `saveToken(makeJwt(null))` | `isAuthenticated()` → `false` |
| A11 | 2 | `décode un payload base64url avec caractères accentués` | token dont le payload contient `-`/`_` et un claim accentué, `exp` futur (le service décode via `TextDecoder` : l'UTF-8 multi-octets est géré) | `isAuthenticated()` → `true` |
| A13 | 3 | `login émet un POST /api/login avec les identifiants` | `login({login:'jdoe', password:'pwd'}).subscribe()` | 1 requête `POST /api/login`, `request.body` = `{login:'jdoe', password:'pwd'}` |
| A14 | 3 | `login mappe la réponse texte en {token}` | idem A13, puis `flush('fake.jwt.token')` — le back répond en **texte brut** (`responseType:'text'`) : flush une chaîne, pas un objet | valeur émise = `{ token: 'fake.jwt.token' }` |

### 7.2 `UserService` — **lot 3**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| A15 | `register émet un POST /api/register avec l'utilisateur` | `register({firstName:'Ada', lastName:'Lovelace', login:'ada', password:'pwd'}).subscribe()` | 1 requête `POST /api/register`, body = l'objet complet |
| A16 | `register émet la réponse du serveur` | idem, `flush({})` | l'Observable émet `{}` puis complète |

### 7.3 `StudentService` — **lot 3**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| A17 | `getAll émet GET /api/students et retourne la liste` | `getAll().subscribe()` ; `flush([{id:1,…},{id:2,…}])` | requête `GET /api/students` ; valeur émise = tableau de 2 étudiants |
| A18 | `getById émet GET /api/students/1 et retourne l'étudiant` | `getById(1).subscribe()` ; `flush({id:1, firstName:'Ada', lastName:'Lovelace'})` | requête `GET /api/students/1` ; valeur émise = cet étudiant |
| A19 | `create émet POST /api/students avec le payload` | `create({firstName:'Ada', lastName:'Lovelace'}).subscribe()` ; `flush({id:3, …})` | `POST /api/students`, body = payload ; valeur émise = étudiant créé avec `id:3` |
| A20 | `update émet PUT /api/students/2 avec le payload` | `update(2, {firstName:'Grace', lastName:'Hopper'}).subscribe()` ; `flush({id:2, …})` | `PUT /api/students/2`, body = payload ; valeur émise = étudiant `id:2` |
| A21 | `delete émet DELETE /api/students/3` | `delete(3).subscribe()` ; `flush(null)` | requête `DELETE /api/students/3` ; l'Observable complète |

### 7.4 Guards — **lot 4**

`AuthService` mocké par `{ isAuthenticated: () => … }` ; exécution via `TestBed.runInInjectionContext`.

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| A22 | `authGuard autorise un utilisateur authentifié` | `isAuthenticated()` → `true` ; `authGuard(route, {url:'/students'})` | retour `true` |
| A23 | `authGuard redirige un invité vers /login avec returnUrl` | `isAuthenticated()` → `false` ; `state.url = '/students/5'` | retour = `UrlTree`, sérialisé `'/login?returnUrl=%2Fstudents%2F5'` |
| A24 | `guestGuard autorise un invité` | `isAuthenticated()` → `false` | retour `true` |
| A25 | `guestGuard redirige un connecté vers /students` | `isAuthenticated()` → `true` | retour = `UrlTree` sérialisé `'/students'` |

### 7.5 `authInterceptor` — **lot 5**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| A26 | `ajoute Bearer sur un appel protégé` | `localStorage['auth_token'] = makeJwt()` ; `http.get('/api/students')` | requête capturée : header `Authorization` = `Bearer <token>` |
| A27 | `n'ajoute pas de header sans token` | pas de token ; `http.get('/api/students')` | requête sans header `Authorization` |
| A28 | `n'ajoute pas de header sur /api/login` | token présent ; `http.post('/api/login', {})` | requête sans header `Authorization` |
| A29 | `n'ajoute pas de header sur /api/register` | token présent ; `http.post('/api/register', {})` | requête sans header `Authorization` |

## 8. Niveau 2 — Tests d'intégration

### 8.1 `LandingComponent` — **lot 6**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B1 | `affiche les liens vers la connexion et l'inscription` | création + `detectChanges()` (providers : `provideRouter([])`) | DOM : un lien `href="/login"` et un lien `href="/register"` |

### 8.2 `AppComponent` — **lot 6**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B2 | `affiche la navbar invité sans token` | `localStorage` vide ; providers `provideHttpClient`, `provideHttpClientTesting`, `provideRouter([])` ; `detectChanges()` | DOM : liens « Se connecter » et « S'enregistrer » présents ; bouton « Déconnexion » absent |
| B3 | `affiche la navbar connectée avec un token valide` | `localStorage['auth_token'] = makeJwt()` AVANT création ; `detectChanges()` | DOM : lien ciblé via `a[href="/students"]` présent (le libellé « Étudiants » existe aussi sur la marque de la navbar vers `/`) ; bouton « Déconnexion » présent ; « Se connecter » absent |
| B4 | `le clic sur Déconnexion navigue vers /login et repasse la navbar en mode invité` | état connecté (B3) ; spy `router.navigate` ; clic bouton « Déconnexion » ; `detectChanges()` | `router.navigate` appelé avec `['/login']` ; DOM affiche à nouveau « Se connecter » |

### 8.3 `RegisterComponent` — **lot 7**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B5 | `ne soumet rien si le formulaire est invalide` | formulaire vide ; submit du `<form>` | `httpTesting.expectNone('/api/register')` — aucune requête |
| B6 | `soumet l'inscription et navigue vers /login?registered=1` | saisir les 4 champs (`Ada`/`Lovelace`/`ada`/`pwd`) ; submit ; `flush({})` sur `POST /api/register` | body = les 4 valeurs ; `router.navigate` appelé avec `['/login'], {queryParams:{registered:'1'}}` |

### 8.4 `LoginComponent` — **lot 8**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B7 | `affiche la bannière après inscription` | `queryParamMap = convertToParamMap({registered:'1'})` ; `detectChanges()` | DOM : bannière « Compte créé. Connectez-vous. » visible |
| B8 | `n'affiche pas la bannière sans le paramètre` | `queryParamMap` vide | DOM : pas de bannière |
| B9 | `ne soumet rien si le formulaire est invalide` | champs vides ; submit | `expectNone('/api/login')` |
| B10 | `connexion réussie → navigue vers /students par défaut` | saisir `login`/`password` ; submit ; `flush('fake.jwt.token')` sur `POST /api/login` | body = `{login, password}` ; `router.navigateByUrl` appelé avec `'/students'` |
| B11 | `connexion réussie → navigue vers le returnUrl fourni` | `queryParamMap = convertToParamMap({returnUrl:'/students/5'})` ; submit valide ; flush | `router.navigateByUrl` appelé avec `'/students/5'` |

### 8.5 `StudentListComponent` — **lot 9**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B12 | `charge et affiche la liste au démarrage` | création ; `flush` de `GET /api/students` avec 2 étudiants ; `detectChanges()` | table DOM : 2 lignes `tbody tr` contenant prénoms/noms (ne pas compter la ligne d'en-tête du `thead`) |
| B13 | `affiche l'état vide` | `flush([])` | DOM : ligne « Aucun étudiant. » |
| B14 | `suppression confirmée → DELETE puis re-fetch et rendu à jour` | liste de 2 chargée ; `confirm` mocké à `true` ; clic « Supprimer » ligne 1 ; `flush(null)` sur `DELETE /api/students/1` ; `flush([étudiant 2])` sur le nouveau `GET /api/students` | séquence : `DELETE /api/students/1` puis `GET /api/students` ; table DOM : 1 seule ligne `tbody tr` restante |
| B15 | `suppression annulée → aucune requête` | liste chargée (flush du `GET` initial) ; `confirm` mocké à `false` ; clic « Supprimer » | `expectNone` sur `DELETE` — aucune requête émise |

### 8.6 `StudentDetailComponent` — **lot 10**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B16 | `charge l'étudiant de l'URL et l'affiche` | `paramMap = convertToParamMap({id:'7'})` ; `flush({id:7, firstName:'Ada', lastName:'Lovelace'})` sur `GET /api/students/7` ; `detectChanges()` | DOM contient « Ada » et « Lovelace » |

### 8.7 `StudentFormComponent` — **lot 10**

| N° | Nom du test | Entrée | Sortie attendue |
| --- | --- | --- | --- |
| B17 | `mode création : aucun chargement initial` | `paramMap` sans `id` ; `detectChanges()` | `expectNone(req => req.url.startsWith('/api/students/'))` — `expectNone` ne supporte pas les jokers ; inputs vides ; titre « Nouvel étudiant » |
| B18 | `mode édition : pré-remplit le formulaire` | `paramMap = convertToParamMap({id:'4'})` ; `flush({id:4, firstName:'Grace', lastName:'Hopper'})` sur `GET /api/students/4` ; `detectChanges()` | valeurs des `<input>` DOM = `'Grace'` / `'Hopper'` ; titre « Modifier un étudiant » |
| B19 | `refuse une saisie composée d'espaces` | saisir `'   '` / `'   '` ; submit | `expectNone('/api/students')` — aucune requête (validation `pattern(/\S/)`) |
| B20 | `création : soumet le payload trimé et navigue vers le détail` | saisir `' Ada '` / `' Lovelace '` ; submit ; `flush({id:9, firstName:'Ada', lastName:'Lovelace'})` sur `POST /api/students` | body = `{firstName:'Ada', lastName:'Lovelace'}` (**trimé**) ; `router.navigate` appelé avec `['/students', 9]` |
| B21 | `édition : soumet un PUT et navigue vers le détail` | mode édition `id=4` chargé (B18) ; modifier `lastName` en `'Hopper-Murray'` ; submit ; `flush({id:4, …})` sur `PUT /api/students/4` | body = valeurs trimées ; `router.navigate` appelé avec `['/students', 4]` |

## 9. Niveau 3 — Tests E2E (Cypress)

**Stratégie** : parcours **stubés avec `cy.intercept`** — déterministes, exécutables sans back démarré (les URLs `/api/...` sont relatives et same-origin puisque `environment.apiUrl = ''`) — **plus un smoke test contre le back réel** via le proxy, pour valider en vrai le chemin critique de l'authentification. Lancement séparé : `npm run e2e` (stubs) et `npm run e2e:smoke` (back réel).

### 9.1 `inscription-connexion.cy.ts` — **lot 13**

| Étape | Entrée | Sortie attendue |
| --- | --- | --- |
| 1 | `cy.intercept('POST','/api/register', {statusCode:201, body:{}})` ; visiter `/register` ; remplir les 4 champs ; soumettre | URL devient `/login?registered=1` ; bannière de confirmation visible |
| 2 | `cy.intercept('POST','/api/login', <JWT à 3 segments, exp futur, renvoyé en texte>)` ; `cy.intercept('GET','/api/students', [])` ; remplir login/password ; soumettre | URL devient `/students` ; titre « Étudiants » visible ; navbar affiche « Déconnexion » |

### 9.2 `etudiants-crud.cy.ts` — **lot 14**

Pré-condition : token JWT valide posé dans `localStorage` avant `cy.visit` (`cy.makeJwt`).

| Étape | Entrée | Sortie attendue |
| --- | --- | --- |
| 1 | intercept `GET /api/students` → `[]` ; visiter `/students` | table affiche « Aucun étudiant. » |
| 2 | cliquer « Nouvel étudiant » ; saisir `Ada` / `Lovelace` ; intercept `POST /api/students` → `{id:1,…}` et `GET /api/students/1` → `{id:1,…}` ; soumettre | URL `/students/1` ; détail affiche « Ada » et « Lovelace » |
| 3 | cliquer « Éditer » ; intercept `GET /api/students/1` (pré-remplissage) puis `PUT /api/students/1` → `{id:1, lastName:'Lovelace-King'}` ; **re-déclarer ensuite l'intercept `GET /api/students/1` avec le nom modifié** (la page détail recharge l'étudiant après la navigation ; le dernier intercept déclaré est prioritaire) ; modifier le nom ; soumettre | URL `/students/1` ; détail affiche le nom modifié |
| 4 | revenir à `/students` (intercept liste avec 1 étudiant) ; cliquer « Supprimer » ; accepter le `confirm` natif ; intercept `DELETE /api/students/1` → 204 et `GET /api/students` → `[]` | table repasse à « Aucun étudiant. » |

### 9.3 `protection-routes.cy.ts` — **lot 12**

Comportement nominal des guards, pas un cas d'erreur HTTP.

| Étape | Entrée | Sortie attendue |
| --- | --- | --- |
| 1 | `localStorage` vide ; visiter `/students` | URL devient `/login?returnUrl=%2Fstudents` |
| 2 | token JWT valide en `localStorage` ; **`cy.intercept('GET','/api/students', [])`** (après la redirection, la liste émet ce GET : sans intercept ni back, la requête échouerait) ; visiter `/login` | URL devient `/students` |

### 9.4 `smoke-back-reel.cy.ts` — **lot 15**

> ⚠️ **Section incomplète — le message d'origine a été tronqué ici par la limite de 50 000 caractères de l'outil.** Le contenu qui suivait (détail des 4 étapes du smoke test back réel, §10 « tableau d'auto-vérification finale », et l'instruction de clôture du document) n'a pas été reçu. **À obtenir de l'utilisateur avant d'attaquer le lot 15** (et idéalement avant le lot 16, qui référence le tableau du §10).

<!-- Fin du contenu reçu le 2026-07-30. Sections 9.4 (détail), 10 et au-delà manquantes : à compléter par l'utilisateur. -->
