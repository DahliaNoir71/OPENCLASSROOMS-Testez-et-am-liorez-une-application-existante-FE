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
| End-to-end | Cypress | 3 specs stubées (7 tests) + 1 smoke test (1 test) | Parcours utilisateur complets, dans un vrai navigateur |

### Tests unitaires et d'intégration (Jest)

```bash
npm test
```

Aucun prérequis particulier au-delà de `npm install`. Un rapport de couverture est généré à chaque exécution dans `coverage/` ; ouvrir `coverage/index.html` dans un navigateur pour le consulter.

| Métrique | Couverture |
| --- | --- |
| Branches | **100 %** (57/57) |
| Fonctions | **100 %** (64/64) |
| Instructions | 98,44 % (381/387) |
| Lignes | 98,32 % (353/359) |

`collectCoverageFrom` instrumente tout `src/app/**`, y compris les fichiers qu'aucun spec n'importe : le taux publié n'est pas restreint au code déjà testé. Les 6 instructions restantes sont celles d'[app.config.ts](src/app/app.config.ts), la racine de composition (providers du bootstrap) : elle n'est exécutée que par `main.ts` et se trouve validée de bout en bout par les parcours Cypress.

### Tests end-to-end stubés (Cypress)

```bash
npm run e2e
```

**Prérequis** : le serveur de développement Angular doit tourner (`npm start`, sur `http://localhost:4200`). Ces specs (`inscription-connexion`, `etudiants-crud`, `protection-routes`) stubent toutes les réponses API avec `cy.intercept` : aucun back-end n'est nécessaire.

### Smoke test end-to-end contre le back réel (Cypress)

```bash
npm run e2e:smoke
```

**Prérequis** : en plus du serveur front (`npm start`), le back-end Spring Boot doit tourner sur `http://localhost:8080` (le proxy de dev route `/api` vers ce port — voir `proxy.conf.json`). Ce parcours (`smoke-back-reel.cy.ts`) n'utilise aucun stub : inscription, connexion, création et suppression d'un étudiant se font contre l'API réelle.

Pour garantir l'unicité entre exécutions, le login utilisé est suffixé par un timestamp. **Résidu de données connu** : l'étudiant créé est supprimé en fin de parcours, mais l'utilisateur inscrit reste en base (aucun endpoint de suppression de compte n'est exposé côté front).

### Convention d'écriture

Les 111 tests suivent le découpage `// GIVEN` (entrée et état de départ) → `// WHEN` (action mesurée) → `// THEN` (sortie attendue), de sorte que l'entrée et la sortie de chaque cas soient identifiables sans lire l'implémentation. Chaque test porte en commentaire son identifiant de plan (`A1`–`A58` pour l'unitaire, `B1`–`B52` pour l'intégration).

### Périmètre assumé

Les cas d'erreur HTTP sont couverts au même titre que les cas nominaux : les 16 règles de traduction d'`HttpErrorService` (status 0, 401, 400 « Invalid credentials », overrides par écran, corps texte ou JSON), la propagation des `HttpErrorResponse` par les trois services, la branche 401 de l'intercepteur (déconnexion + redirection, et non-interception sur `/api/login`), et les états `errorMessage`/`loading` de chaque écran (404, 400 de validation, 500, back injoignable).

Reste hors périmètre des tests Jest : le rendu visuel (CSS, thème Material) et les providers de bootstrap d'[app.config.ts](src/app/app.config.ts), couverts par les parcours Cypress.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
