// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Bloqueia alerts nativos do Chrome
Cypress.on('window:before:load', (win) => {
  const originalAlert = win.alert;
  const originalConfirm = win.confirm;
  const originalPrompt = win.prompt;

  win.alert = () => {};
  win.confirm = () => true;
  win.prompt = () => '';
});

// Handler global para prevenir falhas em exceções não críticas
Cypress.on('uncaught:exception', (err) => {
  // Ignora erros de recursos externos que não afetam os testes
  if (err.message.includes('fonts.googleapis.com') ||
      err.message.includes('fonts.gstatic.com')) {
    return false;
  }
  return true;
});