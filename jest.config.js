
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  // Tout le code applicatif est instrumenté, y compris les fichiers qu'aucun
  // spec n'importe : le taux publié reflète alors la couverture réelle.
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.spec.ts'],
  // 'text' détaille la couverture fichier par fichier dans le terminal et
  // marque en rouge toute métrique sous le seuil ; 'text-summary' donne le
  // total ; 'html' produit le rapport navigable dans coverage/.
  coverageReporters: ['html', 'text', 'text-summary'],
  // Garde-fou : `npm test` ÉCHOUE si l'une des métriques repasse sous 80 %.
  // Le seuil cesse d'être une affirmation du README pour devenir une
  // contrainte vérifiée à chaque exécution.
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
