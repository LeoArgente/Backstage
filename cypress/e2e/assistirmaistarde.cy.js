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

Cypress.Commands.add('adicionarSerieWatchLater', () => {
  cy.visit('/series/');
  cy.get('.series-card').first().should('be.visible').click();
  cy.url().should('include', '/series/');
  cy.get('button.action-btn.list').should('be.visible').click();
  cy.get('button.popup-option.watch-later').should('be.visible').click();
  cy.wait(1000);
  cy.visit('/lists/');
  cy.contains('.list-card', 'Assistir Mais Tarde').should('be.visible').within(() => {
    cy.get('button.view-btn').click();
  });
  cy.get('#view-list-modal').should('be.visible');
  cy.get('#series-tab').should('be.visible').click();
  cy.get('#series-grid .movie-item').should('have.length.at.least', 1);
});

describe('Assistir Mais Tarde flow', () => {
  before(() => {
    cy.deleteUsers();
  });

  it('deve criar um usuario, adicionar série à lista Assistir Mais Tarde e verificar', () => {
    cy.criarUser();
    cy.adicionarSerieWatchLater();
  });
});
