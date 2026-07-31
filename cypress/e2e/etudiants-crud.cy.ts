describe('CRUD étudiant de bout en bout', () => {
  it('parcourt état vide, création, édition et suppression', () => {
    // Pré-condition : JWT valide en localStorage avant de visiter une route protégée.
    cy.visit('/');
    cy.makeJwt(Math.floor(Date.now() / 1000) + 3600);

    // Étape 1
    cy.intercept('GET', '/api/students', []).as('getEmpty');
    cy.visit('/students');
    cy.wait('@getEmpty');
    cy.contains('Aucun étudiant.').should('be.visible');

    // Étape 2
    cy.contains('a', 'Nouvel étudiant').click();
    cy.get('#firstName').type('Ada');
    cy.get('#lastName').type('Lovelace');

    cy.intercept('POST', '/api/students', { id: 1, firstName: 'Ada', lastName: 'Lovelace' }).as('createStudent');
    cy.intercept('GET', '/api/students/1', { id: 1, firstName: 'Ada', lastName: 'Lovelace' }).as('getCreated');

    cy.get('form').submit();

    cy.wait('@createStudent');
    cy.url().should('eq', `${Cypress.config().baseUrl}/students/1`);
    cy.wait('@getCreated');
    cy.contains('Ada').should('be.visible');
    cy.contains('Lovelace').should('be.visible');

    // Étape 3
    cy.intercept('GET', '/api/students/1', { id: 1, firstName: 'Ada', lastName: 'Lovelace' }).as('getForEdit');
    cy.contains('a', 'Éditer').click();
    cy.wait('@getForEdit');

    cy.intercept('PUT', '/api/students/1', { id: 1, firstName: 'Ada', lastName: 'Lovelace-King' }).as('updateStudent');
    // Re-déclaré après le PUT : la page détail recharge l'étudiant après la
    // navigation, et le dernier intercept déclaré sur cette route est prioritaire.
    cy.intercept('GET', '/api/students/1', { id: 1, firstName: 'Ada', lastName: 'Lovelace-King' }).as('getUpdated');

    cy.get('#lastName').clear();
    cy.get('#lastName').type('Lovelace-King');
    cy.get('form').submit();

    cy.wait('@updateStudent');
    cy.url().should('eq', `${Cypress.config().baseUrl}/students/1`);
    cy.wait('@getUpdated');
    cy.contains('Lovelace-King').should('be.visible');

    // Étape 4
    cy.intercept('GET', '/api/students', [{ id: 1, firstName: 'Ada', lastName: 'Lovelace-King' }]).as('getListWithOne');
    cy.contains('a', 'Retour à la liste').click();
    cy.wait('@getListWithOne');

    cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('deleteStudent');
    cy.intercept('GET', '/api/students', []).as('getListEmpty');

    cy.on('window:confirm', () => true);
    cy.contains('button', 'Supprimer').click();

    cy.wait('@deleteStudent');
    cy.wait('@getListEmpty');
    cy.contains('Aucun étudiant.').should('be.visible');
  });
});
