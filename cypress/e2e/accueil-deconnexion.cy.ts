describe('Accueil et déconnexion', () => {
  // Étape 1 — l'écran d'accueil était visité par d'autres specs pour établir
  // l'origine, mais son contenu n'était jamais asserté.
  it("affiche la page d'accueil avec ses deux points d'entrée", () => {
    cy.visit('/');

    cy.contains('a', 'Se connecter').should('be.visible');
    cy.contains('a', "S'enregistrer").should('be.visible');
    cy.get('a[href="/login"]').should('exist');
    cy.get('a[href="/register"]').should('exist');
  });

  // Étape 2 — les autres specs vérifiaient que « Déconnexion » est visible,
  // sans jamais cliquer dessus : le parcours de sortie n'était pas couvert.
  it('déconnecte un utilisateur connecté et le renvoie vers la connexion', () => {
    // Pré-condition : JWT valide en localStorage avant la route protégée.
    cy.visit('/');
    cy.makeJwt(Math.floor(Date.now() / 1000) + 3600);

    cy.intercept('GET', '/api/students', []).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');
    cy.contains('Déconnexion').should('be.visible');

    cy.contains('Déconnexion').click();

    // La navbar repasse en mode invité et l'accès à /students est de nouveau refusé.
    cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
    cy.contains('a', 'Se connecter').should('be.visible');
    cy.contains('Déconnexion').should('not.exist');

    cy.window().its('localStorage.auth_token').should('be.undefined');

    cy.visit('/students');
    cy.url().should('eq', `${Cypress.config().baseUrl}/login?returnUrl=%2Fstudents`);
  });
});
