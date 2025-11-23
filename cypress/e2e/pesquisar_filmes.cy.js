describe('Pesquisar Filmes - SCRUM-2', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve pesquisar filmes por título', () => {
    cy.pesquisarFilmePorTitulo('Matrix');
    cy.get('.search-query').should('contain', 'Matrix');
  });

  it('deve pesquisar filmes por gênero', () => {
    cy.pesquisarFilmePorGenero();
  });
});
