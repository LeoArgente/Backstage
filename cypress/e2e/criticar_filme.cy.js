describe('Criticar Filme', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar usuario, logar e criticar um filme', () => {
    cy.criarUser();
    cy.criticarFilme();
  });
});
