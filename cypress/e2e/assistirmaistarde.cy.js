describe('Assistir Mais Tarde flow', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar um usuario, adicionar série à lista Assistir Mais Tarde e verificar', () => {
    cy.criarUser();
    cy.adicionarSerieWatchLater();
  });
});
