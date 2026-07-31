import { buildJwt } from '../support/commands';

describe('Inscription puis connexion', () => {
  // Étape 1
  it("inscrit un nouvel utilisateur et redirige vers l'écran de connexion", () => {
    cy.intercept('POST', '/api/register', { statusCode: 201, body: {} }).as('register');

    cy.visit('/register');
    cy.get('input[formControlName="firstName"]').type('Ada');
    cy.get('input[formControlName="lastName"]').type('Lovelace');
    cy.get('input[formControlName="login"]').type('ada');
    cy.get('input[formControlName="password"]').type('pwd');
    cy.get('form').submit();

    cy.wait('@register');
    cy.url().should('eq', `${Cypress.config().baseUrl}/login?registered=1`);
    cy.contains('Compte créé. Connectez-vous.').should('be.visible');
  });

  // Étape 2
  it("connecte l'utilisateur et affiche la liste avec la navbar connectée", () => {
    const token = buildJwt(Math.floor(Date.now() / 1000) + 3600);

    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: token,
      headers: { 'content-type': 'text/plain' },
    }).as('login');
    cy.intercept('GET', '/api/students', []).as('getStudents');

    cy.visit('/login');
    cy.get('input[formControlName="login"]').type('ada');
    cy.get('input[formControlName="password"]').type('pwd');
    cy.get('form').submit();

    cy.wait('@login');
    cy.url().should('eq', `${Cypress.config().baseUrl}/students`);
    cy.contains('h2', 'Étudiants').should('be.visible');
    cy.contains('Déconnexion').should('be.visible');
  });
});
