describe('Smoke test contre le back réel', () => {
  it("inscription, connexion, création et suppression d'un étudiant", () => {
    const login = `e2e-${Date.now()}`;
    const password = 'Passw0rd!';

    // Étape 1
    cy.visit('/register');
    cy.get('input[formControlName="firstName"]').type('Ada');
    cy.get('input[formControlName="lastName"]').type('Lovelace');
    cy.get('input[formControlName="login"]').type(login);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('form').submit();

    cy.url().should('eq', `${Cypress.config().baseUrl}/login?registered=1`);

    // Étape 2 (le formulaire de connexion est déjà à l'écran après la redirection)
    cy.get('input[formControlName="login"]').type(login);
    cy.get('input[formControlName="password"]').type(password);
    cy.get('form').submit();

    cy.url().should('eq', `${Cypress.config().baseUrl}/students`);
    cy.contains('Déconnexion').should('be.visible');

    // Étape 3
    cy.contains('a', 'Nouvel étudiant').click();
    cy.get('#firstName').type('Ada');
    cy.get('#lastName').type('Lovelace');
    cy.get('form').submit();

    cy.location('pathname').should('match', /^\/students\/\d+$/);
    cy.contains('Ada').should('be.visible');
    cy.contains('Lovelace').should('be.visible');

    // Étape 4 — suppression depuis la liste, en ciblant la ligne par id
    // (et non par nom, pour rester fiable si un run précédent a laissé une
    // autre ligne « Ada Lovelace » non nettoyée).
    cy.location('pathname').then((pathname) => {
      const studentId = pathname.split('/').pop();

      cy.contains('a', 'Retour à la liste').click();
      cy.url().should('eq', `${Cypress.config().baseUrl}/students`);

      cy.on('window:confirm', () => true);
      cy.contains('tr', studentId as string).within(() => {
        cy.contains('button', 'Supprimer').click();
      });

      cy.contains('td', studentId as string).should('not.exist');
    });
  });
});
