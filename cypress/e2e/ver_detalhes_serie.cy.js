describe('Ver Detalhes de Série - SCRUM-13', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve visualizar detalhes completos de uma série', () => {
    cy.verDetalhesSerie();

    // Verificar elementos da página de detalhes
    cy.get('.movie-title').should('be.visible');
    cy.get('.series-seasons').should('be.visible');
    cy.get('.series-episodes').should('be.visible');
    cy.get('.series-status').should('be.visible');
    cy.get('.movie-genres .genre-tag').should('have.length.at.least', 1);
    cy.get('.cast-section').should('exist'); // Existe no DOM mas pode ter opacity: 0
    cy.get('.movie-synopsis p').should('be.visible');
    cy.get('.movie-facts').should('be.visible');
  });

  it('deve navegar entre abas incluindo Temporadas', () => {
    cy.verDetalhesSerie();

    // Aguardar página carregar completamente
    cy.get('.tabs-nav').should('be.visible');
    cy.wait(1000);

    // Clicar na aba Temporadas
    cy.get('.tab-btn[data-tab="seasons"]').should('be.visible').click();
    cy.wait(1000);

    // Verificar que a aba Temporadas está ativa
    cy.get('.tab-btn[data-tab="seasons"]').should('have.class', 'active');
    cy.get('#seasons').should('have.class', 'active');

    // Clicar na aba Equipe
    cy.get('.tab-btn[data-tab="crew"]').should('be.visible').click();
    cy.wait(1000);

    // Verificar que a aba Equipe está ativa
    cy.get('.tab-btn[data-tab="crew"]').should('have.class', 'active');
    cy.get('#crew').should('have.class', 'active');

    // Clicar na aba Elenco
    cy.get('.tab-btn[data-tab="cast"]').should('be.visible').click();
    cy.wait(1000);

    // Verificar que a aba Elenco está ativa
    cy.get('.tab-btn[data-tab="cast"]').should('have.class', 'active');
    cy.get('#cast').should('have.class', 'active');
  });
});
