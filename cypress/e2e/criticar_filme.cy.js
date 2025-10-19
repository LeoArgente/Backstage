describe('Criticar Filme', () => {

  before(() => {
    cy.deleteUsers();
  });

  it('deve criar usuario, logar e criticar um filme', () => {
    cy.criarUser();
    cy.criticarFilme();
  });
});
