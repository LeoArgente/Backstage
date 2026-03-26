describe('Ver Detalhes do Filme - SCRUM-5', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve visualizar detalhes completos de um filme', () => {
    cy.verDetalhesFilme();

    // Verificar elementos da página de detalhes
    cy.get('.movie-title').should('be.visible');
    cy.get('.movie-duration').should('be.visible');
    cy.get('.movie-genres .genre-tag').should('have.length.at.least', 1);
    cy.get('.cast-section').should('be.visible');
    cy.get('.streaming-section').should('be.visible');
    cy.get('.movie-synopsis p').should('be.visible');
    cy.get('.movie-facts').should('be.visible');
  });

  it('deve navegar entre abas de Visão Geral, Equipe e Elenco', () => {
    cy.verDetalhesFilme();

    // Aguardar página carregar completamente
    cy.get('.tabs-nav').should('be.visible');
    cy.wait(1000);

    // Clicar na aba Equipe usando o atributo data-tab
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
