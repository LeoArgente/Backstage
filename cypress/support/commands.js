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

  // Aguardar redirecionamento completar
  cy.url().should('not.include', '/login/');
  cy.url().should('not.include', '/registrar/');
  cy.wait(1000);
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

  // Aguardar redirecionamento completar
  cy.url().should('not.include', '/login/');
  cy.wait(1000);
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
  // 1. Fazer login
  cy.logar();

  // 2. Ir para página de séries
  cy.visit('http://127.0.0.1:8000/series/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });

  // 3. Aguardar cards carregarem e clicar no primeiro
  cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
  cy.get('.movie-card').first().click();

  // 4. Aguardar página de detalhes carregar
  cy.url().should('include', '/series/');
  cy.wait(1000);

  // 5. Clicar no botão "Assistir Mais Tarde"
  cy.get('#watchLaterBtn', { timeout: 10000 }).should('be.visible').click();
  cy.wait(2000);
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

// Comando para pesquisar filmes por título
Cypress.Commands.add('pesquisarFilmePorTitulo', (titulo) => {
  cy.visit('http://127.0.0.1:8000/buscar/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('#radioTitulo').check();
  cy.get('#searchInput').type(titulo);
  cy.get('.advanced-search-form button[type="submit"]').click();
  cy.get('.movies-grid .movie-card').should('have.length.at.least', 1);
});

// Comando para pesquisar filmes por gênero
Cypress.Commands.add('pesquisarFilmePorGenero', () => {
  cy.visit('http://127.0.0.1:8000/buscar/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('#radioGenero').check();
  cy.get('#generoDropdown').should('be.visible');
  cy.get('.genero-dropdown-item').first().click();
  cy.get('.advanced-search-form button[type="submit"]').click();
  cy.get('.movies-grid').should('exist');
});

// Comando para visualizar detalhes de filme
Cypress.Commands.add('verDetalhesFilme', () => {
  cy.visit('http://127.0.0.1:8000/movies/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
  cy.get('.movie-card').first().click();
  cy.url().should('include', '/filmes/');
});

// Comando para visualizar detalhes de série
Cypress.Commands.add('verDetalhesSerie', () => {
  cy.visit('http://127.0.0.1:8000/series/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
  cy.get('.movie-card').first().click();
  cy.url().should('include', '/series/');
});

// Comando para adicionar filme ao diário
Cypress.Commands.add('adicionarFilmeDiario', () => {
  // 1. Fazer login
  cy.logar();

  // 2. Clicar no dropdown do usuário
  cy.get('#userMenuBtn', { timeout: 10000 }).should('be.visible').click();

  // 3. Clicar em "Meu Diário"
  cy.get('.user-dropdown-item[href*="/diary/"]', { timeout: 5000 }).should('be.visible').click();

  // 4. Aguardar página do diário carregar
  cy.url().should('include', '/diary/');
  cy.get('.btn-add-movie', { timeout: 10000 }).should('be.visible');

  // 5. Clicar no botão de adicionar filme/série ao diário
  cy.get('.btn-add-movie').click();

  // 6. Aguardar modal aparecer
  cy.get('#addMovieModal', { timeout: 5000 }).should('be.visible');

  // 7. Preencher o formulário
  cy.get('#movieDate').type('2024-01-15');
  cy.get('#movieSearch').type('Matrix');
  cy.wait(1000);

  // 8. Selecionar o primeiro resultado
  cy.get('.search-result-item', { timeout: 10000 }).first().click();
  cy.wait(500);

  // 9. Dar nota (opcional) - clicar no label da estrela 5
  cy.get('label[for="star5"]').click();

  // 10. Submeter formulário
  cy.get('#addMovieForm button[type="submit"]').click();
  cy.wait(2000);
});

// Comando para criar review com spoiler
Cypress.Commands.add('criarReviewComSpoiler', () => {
  // 1. Fazer login
  cy.logar();

  // 2. Ir para página de filmes
  cy.visit('http://127.0.0.1:8000/movies/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });

  // 3. Clicar no primeiro filme
  cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
  cy.get('.movie-card').first().click();
  cy.wait(1000);

  // 4. Clicar no botão de expandir review
  cy.get('.expand-review-btn', { timeout: 10000 }).should('be.visible').click();

  // 5. Aguardar modal aparecer
  cy.get('#reviewModalOverlay', { timeout: 5000 }).should('be.visible');

  // 6. Dar nota
  cy.get('#modal-star-rating .star[data-rating="5"]').click();

  // 7. Escrever review
  cy.get('#modal-review-textarea').type('ATENÇÃO: No final do filme o personagem principal descobre a verdade chocante!');

  // 8. Marcar como spoiler
  cy.get('#modal-spoiler-checkbox').check();

  // 9. Submeter
  cy.get('.modal-submit-btn').click();
  cy.wait(2000);
});

// Comando para adicionar filme aos favoritos
Cypress.Commands.add('adicionarFilmeFavorito', () => {
  cy.visit('http://127.0.0.1:8000/movies/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
  cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
  cy.get('.movie-card').first().click();
  cy.wait(1000);
  cy.get('#favoritoBtn').should('be.visible').click();
  cy.get('#favoriteModalOverlay', { timeout: 5000 }).should('be.visible');
  cy.get('.favorite-star[data-rating="5"]').click();
  cy.get('.favorite-submit-btn').click();
  cy.wait(2000);
});

// Comando para visitar página de comunidades
Cypress.Commands.add('visitarComunidades', () => {
  cy.visit('http://127.0.0.1:8000/comunidade/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
});

// Comando para visitar página inicial
Cypress.Commands.add('visitarInicio', () => {
  cy.visit('http://127.0.0.1:8000/', {
    onBeforeLoad(win) {
      win.alert = () => {};
      win.confirm = () => true;
      win.prompt = () => '';
    }
  });
});
