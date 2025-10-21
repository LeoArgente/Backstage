// ***********************************************
// This example commands.js shows you how to create various custom commands
// and overwrite existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Comando para deletar usuários de teste
Cypress.Commands.add('deleteUsers', () => {
  cy.exec('python delete_users.py', { failOnNonZeroExit: false }).then((result) => {
    cy.log(result.stdout);
    if (result.stderr) {
      cy.log(result.stderr);
    }
  });
});

// Comando para criar usuário
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

// Comando para fazer login
Cypress.Commands.add('logar', () => {
  cy.visit('/');
  cy.get('a.btn-login').should('be.visible').click();
  cy.get('input[name="username"]').should('be.visible').type('TesteCypress');
  cy.get('input[name="password"]').type('senha123');
  cy.get('button[type="submit"]').click();
  cy.get('.user-avatar', { timeout: 10000 }).should('be.visible');
});

// Comando para criticar filme
Cypress.Commands.add('criticarFilme', () => {
  cy.visit('/movies/');
  cy.get('.movie-card').first().should('be.visible').click();
  cy.url().should('include', '/filmes/');
  cy.get('.expand-review-btn').should('be.visible').click();
  cy.get('#modal-star-rating .star[data-rating="5"]').click();
  cy.get('#modal-review-textarea').type('Filme excelente! Adorei a cinematografia e a trilha sonora. Super recomendo!');
  cy.get('.modal-submit-btn').click();
});

// Comando para adicionar série ao Watch Later
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

// Comando para criar lista
Cypress.Commands.add('criarLista', () => {
  cy.visit('/lists/');
  cy.get('#create-list-btn').should('be.visible').click();
  cy.get('#list-name').should('be.visible').type('Minha Lista de Filmes Favoritos');
  cy.get('#list-description').type('Lista com os melhores filmes que já assisti. Inclui clássicos e lançamentos recentes.');
  cy.get('#create-list-modal button[type="submit"]').click();
});