describe('User flow', () => {

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar um usuario e fazer login no site', () => {
    cy.criarUser();
  });
});
