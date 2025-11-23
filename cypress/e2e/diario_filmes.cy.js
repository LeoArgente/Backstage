describe('Histórico de Filmes (Diário) - SCRUM-6', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve adicionar um filme ao diário', () => {
    cy.adicionarFilmeDiario();

    // Verificar que foi adicionado ao diário
    cy.get('.calendar-section', { timeout: 5000 }).should('be.visible');
  });

  it('deve visualizar o diário de filmes assistidos', () => {
    // 1. Fazer login
    cy.logar();

    // 2. Clicar no dropdown do usuário
    cy.get('#userMenuBtn', { timeout: 10000 }).should('be.visible').click();

    // 3. Clicar em "Meu Diário"
    cy.get('.user-dropdown-item[href*="/diary/"]', { timeout: 5000 }).should('be.visible').click();

    // 4. Verificar elementos da página do diário
    cy.url().should('include', '/diary/');
    cy.get('.diary-stats', { timeout: 10000 }).should('be.visible');
    cy.get('.calendar-section').should('be.visible');
    cy.get('.btn-add-movie').should('be.visible');
  });
});
