# EtudiantFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.16.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Tests

Le projet suit une pyramide de tests à trois niveaux :

| Niveau | Outil | Volume | Périmètre |
| --- | --- | --- | --- |
| Unitaire | Jest | 62 tests | `AuthService`, `UserService`, `StudentService`, `HttpErrorService`, guards, interceptor, table de routage |
| Intégration | Jest + Angular TestBed | 49 tests | Composants standalone (navbar, landing, login, register, liste/détail/formulaire étudiant) |
| End-to-end | Cypress | 4 specs stubées (7 tests) + 1 smoke test (1 test) | Parcours utilisateur complets, dans un vrai navigateur |

### Tests unitaires et d'intégration (Jest)

```bash
npm test
```

Aucun prérequis particulier au-delà de `npm install`.

**Seuil exigé : 80 % minimum sur chaque métrique.** Il n'est pas déclaratif : le `coverageThreshold` de [jest.config.js](jest.config.js) le fait appliquer à chaque exécution — `npm test` échoue si une métrique repasse en dessous, même quand tous les tests passent.

| Métrique | Seuil requis | Mesuré | Statut |
| --- | --- | --- | --- |
| Branches | ≥ 80 % | **100 %** (57/57) | ✅ +20 pts |
| Fonctions | ≥ 80 % | **100 %** (64/64) | ✅ +20 pts |
| Instructions | ≥ 80 % | **98,44 %** (381/387) | ✅ +18 pts |
| Lignes | ≥ 80 % | **98,32 %** (353/359) | ✅ +18 pts |

`npm test` produit trois sorties : le détail fichier par fichier dans le terminal, le total (`Coverage summary`), et le rapport navigable `coverage/index.html`. En cas de dépassement par le bas, le message nomme la métrique fautive :

```
Jest: "global" coverage threshold for statements (99%) not met: 98.44%
```

`collectCoverageFrom` instrumente tout `src/app/**`, y compris les fichiers qu'aucun spec n'importe : le taux publié n'est pas restreint au code déjà testé. Les 6 instructions restantes sont celles d'[app.config.ts](src/app/app.config.ts), la racine de composition (providers du bootstrap) : elle n'est exécutée que par `main.ts` et se trouve validée de bout en bout par les parcours Cypress.

### Tests end-to-end stubés (Cypress)

```bash
npm run e2e
```

**Prérequis** : le serveur de développement Angular doit tourner (`npm start`, sur `http://localhost:4200`). Ces specs (`accueil-deconnexion`, `inscription-connexion`, `etudiants-crud`, `protection-routes`) stubent toutes les réponses API avec `cy.intercept` : aucun back-end n'est nécessaire.

### Smoke test end-to-end contre le back réel (Cypress)

```bash
npm run e2e:smoke
```

**Prérequis** : en plus du serveur front (`npm start`), le back-end Spring Boot doit tourner sur `http://localhost:8080` (le proxy de dev route `/api` vers ce port — voir `proxy.conf.json`). Ce parcours (`smoke-back-reel.cy.ts`) n'utilise aucun stub : inscription, connexion, création et suppression d'un étudiant se font contre l'API réelle.

Pour garantir l'unicité entre exécutions, le login utilisé est suffixé par un timestamp. **Résidu de données connu** : l'étudiant créé est supprimé en fin de parcours, mais l'utilisateur inscrit reste en base (aucun endpoint de suppression de compte n'est exposé côté front).

### Rapports et couverture E2E (Cypress)

```bash
npm run e2e:coverage        # 4 specs stubées, sans back-end
npm run e2e:coverage:full   # + le smoke test contre l'API réelle
```

La commande enchaîne quatre étapes : nettoyage des rapports, exécution des specs, fusion des résultats en un rapport HTML d'exécution, puis calcul de la couverture des parcours utilisateurs.

**Seuil exigé : 80 % minimum.** Il est appliqué par [scripts/e2e-coverage.mjs](scripts/e2e-coverage.mjs), qui sort en code 1 si un taux passe en dessous — ou si un test E2E échoue.

| Dimension | Seuil requis | Mesuré | Statut |
| --- | --- | --- | --- |
| Parcours utilisateurs | ≥ 80 % | **100 %** (11/11) | ✅ +20 pts |
| Écrans de l'application | ≥ 80 % | **100 %** (6/6) | ✅ +20 pts |

Trois artefacts sont produits dans `cypress/reports/` :

| Fichier | Contenu |
| --- | --- |
| `html/execution.html` | rapport d'exécution mochawesome : specs, tests, durées, échecs |
| `e2e-coverage.html` | matrice de couverture : chaque parcours et chaque écran, avec les tests qui le couvrent |
| `e2e-coverage.json` | mêmes données, exploitables par une chaîne d'intégration continue |

**Ce que cette mesure est, et ce qu'elle n'est pas.** Il s'agit d'une couverture **fonctionnelle** : la proportion des parcours utilisateurs et des écrans exercés par un test E2E qui passe. Ce n'est pas une couverture de code — celle-là est mesurée par Jest (`coverage/index.html`) et par JaCoCo côté back-end. Le builder Angular `application` (esbuild) n'expose aucun point d'entrée pour instrumenter les sources avec istanbul, ce qui exclut `@cypress/code-coverage` sans repasser l'application sur le builder webpack déprécié.

La mesure est **dérivée des résultats réels** de Cypress, pas déclarée à la main : l'inventaire associe chaque parcours aux tests qui le couvrent, et un parcours n'est compté que si au moins un de ces tests a effectivement passé. Un test supprimé, renommé ou en échec fait baisser le taux :

```
✖ Seuil de couverture E2E non atteint : parcours 9.1 % < 80 % ; écrans 16.7 % < 80 %
```

Les 11 parcours inventoriés : consulter l'accueil, créer un compte, se connecter, se déconnecter, consulter la liste, voir la liste vide, consulter un détail, créer / modifier / supprimer un étudiant, être redirigé quand l'accès est refusé.

### Convention d'écriture

Les 111 tests suivent le découpage `// GIVEN` (entrée et état de départ) → `// WHEN` (action mesurée) → `// THEN` (sortie attendue), de sorte que l'entrée et la sortie de chaque cas soient identifiables sans lire l'implémentation. Chaque test porte en commentaire son identifiant de plan (`A1`–`A58` pour l'unitaire, `B1`–`B52` pour l'intégration).

### Périmètre assumé

Les cas d'erreur HTTP sont couverts au même titre que les cas nominaux : les 16 règles de traduction d'`HttpErrorService` (status 0, 401, 400 « Invalid credentials », overrides par écran, corps texte ou JSON), la propagation des `HttpErrorResponse` par les trois services, la branche 401 de l'intercepteur (déconnexion + redirection, et non-interception sur `/api/login`), et les états `errorMessage`/`loading` de chaque écran (404, 400 de validation, 500, back injoignable).

Reste hors périmètre des tests Jest : le rendu visuel (CSS, thème Material) et les providers de bootstrap d'[app.config.ts](src/app/app.config.ts), couverts par les parcours Cypress.

Reste hors périmètre des tests E2E : la couverture de code par les parcours Cypress, pour la raison d'outillage exposée ci-dessus. Les trois niveaux de la pyramide sont néanmoins tous couverts par un seuil de 80 % vérifié automatiquement — Jest pour le code front, JaCoCo pour le code back, `e2e-coverage.mjs` pour les parcours.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
