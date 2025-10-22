describe('User flow', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar um usuario e fazer login no site', () => {
    cy.criarUser();
  });
});
