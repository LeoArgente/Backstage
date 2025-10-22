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
  cy.exec('python delete_users.py', { failOnNonZeroExit: false });
});

// Comando para criar usuário
Cypress.Commands.add('criarUser', () => {
  cy.visit('http://127.0.0.1:8000/login/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('.signup-link').click();
  cy.get('#signup-username').type('TesteCypress');
  cy.get('#signup-email').type('testeCypress@gmail.com');
  cy.get('#signup-password1').type('senha123');
  cy.get('#signup-password2').type('senha123');
  cy.get('#signup-submit').click();
  cy.url().should('not.include', '/login/');
  cy.url().should('not.include', '/registrar/');
});

// Comando para fazer login
Cypress.Commands.add('logar', () => {
  cy.visit('http://127.0.0.1:8000/login/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('input[name="username"]').type('TesteCypress');
  cy.get('input[name="password"]').type('senha123');
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login/');
});

// Comando para criticar filme
Cypress.Commands.add('criticarFilme', () => {
  cy.visit('http://127.0.0.1:8000/movies/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('.movie-card').first().click();
  cy.get('.expand-review-btn').click();
  cy.get('#modal-star-rating .star[data-rating="5"]').click();
  cy.get('#modal-review-textarea').type('Filme excelente! Adorei a cinematografia e a trilha sonora. Super recomendo!');
  cy.get('.modal-submit-btn').click();
});

// Comando para adicionar série ao Watch Later
Cypress.Commands.add('adicionarSerieWatchLater', () => {
  cy.visit('http://127.0.0.1:8000/series/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('.series-card').first().click();
  cy.get('button.action-btn.list').click();
  cy.window().then((win) => {
    win.alert = () => {};
  });
  cy.get('button.popup-option.watch-later').click();
  cy.visit('http://127.0.0.1:8000/lists/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.contains('.list-card', 'Assistir Mais Tarde').within(() => {
    cy.get('button.view-btn').click();
  });
  cy.get('#view-list-modal');
  cy.get('#series-tab').click();
  cy.get('#series-grid .movie-item').should('have.length.at.least', 1);
});

// Comando para criar lista
Cypress.Commands.add('criarLista', () => {
  cy.visit('http://127.0.0.1:8000/lists/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.wait(1000);
  cy.get('.create-list-btn').first().click();
  cy.get('#list-name').type('Minha Lista de Filmes Favoritos');
  cy.get('#list-description').type('Lista com os melhores filmes que já assisti. Inclui clássicos e lançamentos recentes.');
<<<<<<< HEAD
  cy.get('#create-list-modal button[type="submit"]').click();
=======
  cy.window().then((win) => {
    win.alert = () => {};
  });
  cy.get('#create-list-form button[type="submit"]').click();
>>>>>>> main
});