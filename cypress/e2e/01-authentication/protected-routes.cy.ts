/// <reference types="cypress" />

describe('Protected Routes', () => {
  beforeEach(() => {
    // Clear any existing authentication
    cy.clearLocalStorage();
  });

  describe('Unauthorized Access', () => {
    it('should redirect to home when accessing admin dashboard without auth', () => {
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect to home when accessing user dashboard without auth', () => {
      cy.visit('/user/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect to home when accessing counselor dashboard without auth', () => {
      cy.visit('/counselor/dashboard', { timeout: 60000 });
      cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 15000 });
    });

    it('should redirect to home when accessing user appointments without auth', () => {
      cy.visit('/user/appointment');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Role-Based Access - User Role', () => {
    beforeEach(() => {
      cy.mockAuth('user');
    });

    it('should allow user to access user dashboard', () => {
      cy.visit('/user/dashboard');
      cy.url().should('include', '/user/dashboard');
    });

    it('should redirect user from admin dashboard', () => {
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect user from counselor dashboard', () => {
      cy.visit('/counselor/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Role-Based Access - Guest Role', () => {
    beforeEach(() => {
      cy.mockAuth('guest');
    });

    it('should allow guest to access user dashboard', () => {
      cy.visit('/user/dashboard');
      cy.url().should('include', '/user/dashboard');
    });

    it('should redirect guest from admin dashboard', () => {
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect guest from user appointments (user-only route)', () => {
      cy.visit('/user/appointment');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Role-Based Access - Admin Role', () => {
    beforeEach(() => {
      cy.mockAuth('super_admin');
    });

    it('should allow admin to access admin dashboard', () => {
      cy.visit('/admin/dashboard');
      cy.url().should('include', '/admin/dashboard');
    });

    it('should redirect admin from user dashboard', () => {
      cy.visit('/user/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect admin from counselor dashboard', () => {
      cy.visit('/counselor/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Role-Based Access - Counselor Role', () => {
    beforeEach(() => {
      cy.mockAuth('counselor');
    });

    it('should allow counselor to access counselor dashboard', () => {
      cy.visit('/counselor/dashboard');
      cy.url().should('include', '/counselor/dashboard');
    });

    it('should redirect counselor from admin dashboard', () => {
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should redirect counselor from user dashboard', () => {
      cy.visit('/user/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});

