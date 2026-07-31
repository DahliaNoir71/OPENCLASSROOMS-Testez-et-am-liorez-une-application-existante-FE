import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,

  // Chaque spec écrit son propre JSON dans cypress/reports/json (overwrite:false).
  // `npm run e2e:coverage` les fusionne, produit le rapport HTML d'exécution puis
  // en dérive la matrice de couverture des parcours utilisateurs.
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports/json',
    overwrite: false,
    html: false,
    json: true,
  },

  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
