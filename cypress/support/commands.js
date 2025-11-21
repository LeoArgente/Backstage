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
  cy.get('#username').type('TesteCypress');
  cy.get('#email').type('testeCypress@gmail.com');
  cy.get('#password1').type('senha123');
  cy.get('#password2').type('senha123');
  cy.get('button[type="submit"]').click();
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

// Comando para adicionar série a uma lista
Cypress.Commands.add('adicionarSerieWatchLater', () => {
  cy.visit('http://127.0.0.1:8000/series/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  // Aguardar cards carregarem
  cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
  cy.get('.movie-card').first().click();

  // Aguardar página de detalhes carregar
  cy.url().should('include', '/series/');
  cy.get('button.action-btn.list').should('be.visible').click();

  // Criar nova lista
  cy.get('#listPopupOverlay').should('have.class', 'show');
  cy.get('button.popup-option.create-list').click();
  cy.get('#listName').type('Minhas Series');

  cy.window().then((win) => {
    win.alert = () => {};
  });

  cy.get('#createListForm button[type="submit"]').click();

  // Aguardar lista ser criada e modal fechar
  cy.wait(1000);

  // Verificar se a lista foi criada visitando a página de listas
  cy.visit('http://127.0.0.1:8000/lists/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.contains('.list-card', 'Minhas Series').should('exist');
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

  // Aguardar página carregar e clicar no botão de criar lista
  cy.get('#create-list-btn').should('be.visible').click();

  // Aguardar modal aparecer
  cy.get('#create-list-modal').should('be.visible');

  // Preencher formulário
  cy.get('#list-name').type('Minha Lista de Filmes Favoritos');
  cy.get('#list-description').type('Lista com os melhores filmes que ja assisti. Inclui classicos e lancamentos recentes.');

  cy.window().then((win) => {
    win.alert = () => {};
  });

  // Submeter formulário
  cy.get('#create-list-form button[type="submit"]').click();

  // Aguardar modal fechar e lista aparecer
  cy.get('#create-list-modal').should('not.be.visible');
  cy.contains('.list-card', 'Minha Lista de Filmes Favoritos').should('exist');
});
