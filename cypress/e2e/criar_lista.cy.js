describe('Criar Lista', () => {

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar usuario, logar e criar uma lista', () => {
    cy.criarUser();
    cy.criarLista();
  });
});
