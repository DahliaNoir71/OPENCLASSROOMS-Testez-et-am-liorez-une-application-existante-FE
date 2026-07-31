describe('Protection des routes', () => {
  // Étape 1
  it('redirige un invité vers /login avec returnUrl', () => {
    cy.visit('/students');

    cy.url().should('eq', `${Cypress.config().baseUrl}/login?returnUrl=%2Fstudents`);
  });

  // Étape 2
  it('redirige un utilisateur connecté vers /students', () => {
    // Un premier visit établit le contexte d'origine (localhost:4200) pour que
    // cy.makeJwt (via cy.window()) écrive dans le bon localStorage ; le second
    // visit recharge l'app avec le token déjà en place.
    cy.visit('/');
    cy.makeJwt(Math.floor(Date.now() / 1000) + 3600);

    cy.intercept('GET', '/api/students', []).as('getStudents');
    cy.visit('/login');

    cy.url().should('eq', `${Cypress.config().baseUrl}/students`);
  });
});
