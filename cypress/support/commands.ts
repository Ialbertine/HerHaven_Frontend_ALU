/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as a user
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to login as guest
       * @example cy.loginAsGuest()
       */
      loginAsGuest(): Chainable<void>
      
      /**
       * Custom command to mock authentication
       * @example cy.mockAuth('user')
       */
      mockAuth(role: 'user' | 'guest' | 'counselor' | 'super_admin'): Chainable<void>
      
      /**
       * Custom command to check if element is visible in viewport
       * @example cy.get('.element').isInViewport()
       */
      isInViewport(): Chainable<boolean>
    }
  }
}

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to login as guest
Cypress.Commands.add('loginAsGuest', () => {
  cy.visit('/signup');
  cy.contains('Continue as Guest').click();
});

// Custom command to mock authentication
Cypress.Commands.add('mockAuth', (role: 'user' | 'guest' | 'counselor' | 'super_admin') => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', 'mock-token-for-testing');
    win.localStorage.setItem('userRole', role);
    if (role === 'guest') {
      win.localStorage.setItem('accessType', 'guest');
      win.localStorage.setItem('guestSessionId', 'mock-guest-session-id');
    }
  });
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  const isInViewport = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= Cypress.config('viewportHeight') &&
    rect.right <= Cypress.config('viewportWidth')
  );
  return cy.wrap(isInViewport);
});

export {};

