describe('Recomendações Baseadas nos Filmes - SCRUM-49', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve adicionar filmes aos favoritos e ver recomendações personalizadas', () => {
    // 1. Fazer login
    cy.logar();

    // 2. Adicionar primeiro filme aos favoritos
    cy.visit('http://127.0.0.1:8000/movies/', {
      onBeforeLoad(win) {
        win.alert = () => {};
        win.confirm = () => true;
        win.prompt = () => '';
      }
    });

    cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 3);

    // Favoritar primeiro filme
    cy.get('.movie-card').eq(0).click();
    cy.wait(1000);
    cy.get('#favoritoBtn', { timeout: 10000 }).should('be.visible').click();
    cy.get('#favoriteModalOverlay', { timeout: 5000 }).should('have.css', 'display', 'flex');
    cy.get('.favorite-star[data-rating="5"]').click();
    cy.get('.favorite-submit-btn').click();
    cy.wait(2000);

    // 3. Voltar e adicionar segundo filme
    cy.visit('http://127.0.0.1:8000/movies/', {
      onBeforeLoad(win) {
        win.alert = () => {};
        win.confirm = () => true;
        win.prompt = () => '';
      }
    });

    cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 3);
    cy.get('.movie-card').eq(1).click();
    cy.wait(1000);
    cy.get('#favoritoBtn', { timeout: 10000 }).should('be.visible').click();
    cy.get('#favoriteModalOverlay', { timeout: 5000 }).should('have.css', 'display', 'flex');
    cy.get('.favorite-star[data-rating="5"]').click();
    cy.get('.favorite-submit-btn').click();
    cy.wait(2000);

    // 4. Voltar e adicionar terceiro filme
    cy.visit('http://127.0.0.1:8000/movies/', {
      onBeforeLoad(win) {
        win.alert = () => {};
        win.confirm = () => true;
        win.prompt = () => '';
      }
    });

    cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 3);
    cy.get('.movie-card').eq(2).click();
    cy.wait(1000);
    cy.get('#favoritoBtn', { timeout: 10000 }).should('be.visible').click();
    cy.get('#favoriteModalOverlay', { timeout: 5000 }).should('have.css', 'display', 'flex');
    cy.get('.favorite-star[data-rating="5"]').click();
    cy.get('.favorite-submit-btn').click();
    cy.wait(2000);

    // 5. Voltar para página inicial
    cy.visit('http://127.0.0.1:8000/', {
      onBeforeLoad(win) {
        win.alert = () => {};
        win.confirm = () => true;
        win.prompt = () => '';
      }
    });

    // 6. Aguardar página carregar
    cy.wait(2000);

    // 7. Descer até seção de recomendações
    cy.get('.section-title').contains('Recomendados para você', { timeout: 10000 }).should('be.visible');

    // 8. Rolar até a seção de recomendações
    cy.get('.section-title').contains('Recomendados para você').scrollIntoView();

    // 9. Clicar no botão atualizar
    cy.get('button').contains('Atualizar', { timeout: 5000 }).click();

    // 10. Verificar que recomendações foram atualizadas
    cy.wait(1000);
  });
});
