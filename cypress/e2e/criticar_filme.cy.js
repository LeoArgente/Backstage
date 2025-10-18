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

Cypress.Commands.add('criticarFilme', () => {
  cy.visit('/movies/');
  cy.get('.movie-card').first().should('be.visible').click();
  cy.url().should('include', '/filmes/');
  cy.get('.expand-review-btn').should('be.visible').click();
  cy.get('#modal-star-rating .star[data-rating="5"]').click();
  cy.get('#modal-review-textarea').type('Filme excelente! Adorei a cinematografia e a trilha sonora. Super recomendo!');
  cy.get('.modal-submit-btn').click();
});

describe('Criticar Filme', () => {

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar usuario, logar e criticar um filme', () => {
    cy.criarUser();
    cy.criticarFilme();
  });
});
