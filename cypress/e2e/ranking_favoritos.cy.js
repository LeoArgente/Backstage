describe('Ranking de Filmes Favoritos - SCRUM-3', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve favoritar filme e visualizar ranking no perfil', () => {
    // 1. Fazer login
    cy.logar();

    // 2. Ir para página de filmes e clicar em um filme
    cy.visit('http://127.0.0.1:8000/movies/', {
      onBeforeLoad(win) {
        win.alert = () => {};
        win.confirm = () => true;
        win.prompt = () => '';
      }
    });

    cy.get('.movie-card', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('.movie-card').first().click();

    // 3. Favoritar o filme
    cy.wait(1000);
    cy.get('#favoritoBtn', { timeout: 10000 }).should('be.visible').click();

    // Aguardar modal aparecer (style display:flex)
    cy.get('#favoriteModalOverlay', { timeout: 5000 }).should('have.css', 'display', 'flex');

    // Clicar na estrela de avaliação
    cy.get('.favorite-star[data-rating="5"]').click();

    // Submeter favorito
    cy.get('.favorite-submit-btn').click();
    cy.wait(2000);

    // 4. Clicar no ícone de perfil para abrir dropdown
    cy.get('#userMenuBtn', { timeout: 10000 }).should('be.visible').click();

    // 5. Acessar o perfil pelo dropdown
    cy.get('.user-dropdown-item[href*="/perfil/"]', { timeout: 5000 }).click();

    // 6. Na tela de perfil, aguardar carregar
    cy.get('.profile-hero', { timeout: 10000 }).should('be.visible');

    // 7. Clicar na aba de favoritos
    cy.get('.tab-btn[data-tab="favoritos"]', { timeout: 10000 }).should('be.visible').click();

    // 8. Ver o ranking
    cy.get('#tab-favoritos').should('be.visible');
    cy.wait(2000);
    cy.get('.favoritos-toggle', { timeout: 5000 }).should('be.visible');
  });
});
