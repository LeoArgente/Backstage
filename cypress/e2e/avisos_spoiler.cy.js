describe('Avisos sobre Spoilers - SCRUM-7', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve enviar uma review com spoiler', () => {
    cy.criarReviewComSpoiler();
  });
});
