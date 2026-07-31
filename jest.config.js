
module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  // Tout le code applicatif est instrumenté, y compris les fichiers qu'aucun
  // spec n'importe : le taux publié reflète alors la couverture réelle.
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.spec.ts'],
  coverageReporters: ['html', 'text-summary'],
};
