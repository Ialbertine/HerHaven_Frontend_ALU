/// <reference types="cypress" />

describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.mockAuth('super_admin');
  });

  describe('Admin Dashboard Access', () => {
    beforeEach(() => {
      cy.visit('/admin/dashboard');
    });

    it('should allow admin to access dashboard', () => {
      cy.url().should('include', '/admin/dashboard');
    });

    it('should display admin dashboard content', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Admin Management Pages', () => {
    it('should allow admin to access therapy management', () => {
      cy.visit('/admin/therapy-management');
      cy.url().should('include', '/admin/therapy-management');
    });

    it('should allow admin to access user management', () => {
      cy.visit('/admin/user-management');
      cy.url().should('include', '/admin/user-management');
    });

    it('should allow admin to access assessment management', () => {
      cy.visit('/admin/assessments');
      cy.url().should('include', '/admin/assessments');
    });

    it('should allow admin to access feedback management', () => {
      cy.visit('/admin/feedbacks');
      cy.url().should('include', '/admin/feedbacks');
    });

    it('should allow admin to access contact management', () => {
      cy.visit('/admin/contacts');
      cy.url().should('include', '/admin/contacts');
    });
  });

  describe('Non-Admin Access Restriction', () => {
    it('should not allow user to access admin dashboard', () => {
      cy.mockAuth('user');
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should not allow counselor to access admin dashboard', () => {
      cy.mockAuth('counselor');
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should not allow guest to access admin dashboard', () => {
      cy.mockAuth('guest');
      cy.visit('/admin/dashboard');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
});

