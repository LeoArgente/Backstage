describe('Assistir Mais Tarde flow', () => {
  before(() => {
    cy.deleteUsers();
  });

  it('deve criar um usuario, adicionar série à lista Assistir Mais Tarde e verificar', () => {
    cy.criarUser();
    cy.adicionarSerieWatchLater();
  });
});
