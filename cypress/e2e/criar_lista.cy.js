describe('Criar Lista', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar usuario, logar e criar uma lista', () => {
    cy.criarUser();
    cy.criarLista();
  });
});
