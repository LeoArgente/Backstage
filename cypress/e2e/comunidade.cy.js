describe('Comunidade com Amigos - SCRUM-1', () => {
  beforeEach(() => {
    cy.on('window:alert', (str) => {
      console.log('Alert bloqueado:', str);
    });
  });

  before(() => {
    cy.deleteUsers();
    cy.criarUser();
  });

  it('deve visualizar página de comunidades', () => {
    // 1. Fazer login
    cy.logar();

    // 2. Visitar página de comunidades
    cy.visit('http://127.0.0.1:8000/comunidade/', {
      onBeforeLoad(win) {
        win.alert = () => {};
        win.confirm = () => true;
        win.prompt = () => '';
      }
    });

    // 3. Verificar elementos da página
    cy.url().should('include', '/comunidade/');
    cy.get('#create-community-btn', { timeout: 10000 }).should('be.visible');
    cy.get('.communities-section', { timeout: 10000 }).should('be.visible');
  });
});
