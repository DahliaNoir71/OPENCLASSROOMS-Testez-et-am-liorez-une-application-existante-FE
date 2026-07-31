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
| Unitaire | Jest | 29 tests | `AuthService`, `UserService`, `StudentService`, guards, interceptor |
| Intégration | Jest + Angular TestBed | 21 tests | Composants standalone (navbar, landing, login, register, liste/détail/formulaire étudiant) |
| End-to-end | Cypress | 3 specs stubées (7 tests) + 1 smoke test (1 test) | Parcours utilisateur complets, dans un vrai navigateur |

### Tests unitaires et d'intégration (Jest)

```bash
npm test
```

Aucun prérequis particulier au-delà de `npm install`. Un rapport de couverture est généré à chaque exécution dans `coverage/` ; ouvrir `coverage/index.html` dans un navigateur pour le consulter.

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

### Périmètre assumé

Aucun cas d'erreur HTTP (4xx/5xx) n'est testé : ni `HttpErrorService`, ni les messages d'erreur serveur, ni les états `errorMessage`/`loading` des composants, ni la branche 401 de l'intercepteur. Seuls les comportements nominaux sont couverts, y compris les cas limites qui restent des succès applicatifs (token expiré/malformé → non authentifié, formulaire invalide → aucune requête, garde qui redirige).

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
