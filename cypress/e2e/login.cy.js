Cypress.Commands.add('deleteUsers', () => {
  cy.exec('python delete_users.py', { failOnNonZeroExit: false }).then((result) => {
    console.log(result.stdout);
    if (result.stderr) {
      console.error(result.stderr);
    }
  });
});

Cypress.Commands.add('criarUser', () => {
  cy.visit('/');
  cy.get('a.btn-login').should('be.visible').click();
  cy.get('.signup-link').should('be.visible').click();
  cy.get('#signup-username').should('be.visible').type('TesteCypress');
  cy.get('#signup-email').type('testeCypress@gmail.com');
  cy.get('#signup-password1').type('senha123');
  cy.get('#signup-password2').type('senha123');
  cy.get('#signup-submit').click();
  cy.get('.user-avatar', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('logar', () => {
  cy.visit('/');
  cy.get('a.btn-login').should('be.visible').click();
  cy.get('input[name="username"]').should('be.visible').type('TesteCypress');
  cy.get('input[name="password"]').type('senha123');
  cy.get('button[type="submit"]').click();
  cy.get('.user-avatar', { timeout: 10000 }).should('be.visible');
});

describe('User flow', () => {

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar um usuario e fazer login no site', () => {
    cy.criarUser();
  });
});
