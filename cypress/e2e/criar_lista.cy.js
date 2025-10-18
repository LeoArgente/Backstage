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

Cypress.Commands.add('criarLista', () => {
  cy.visit('/lists/');
  cy.get('#create-list-btn').should('be.visible').click();
  cy.get('#list-name').should('be.visible').type('Minha Lista de Filmes Favoritos');
  cy.get('#list-description').type('Lista com os melhores filmes que já assisti. Inclui clássicos e lançamentos recentes.');
  cy.get('button[type="submit"]').click();
});

describe('Criar Lista', () => {

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar usuario, logar e criar uma lista', () => {
    cy.criarUser();
    cy.criarLista();
  });
});
