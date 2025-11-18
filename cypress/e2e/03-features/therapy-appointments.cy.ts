/// <reference types="cypress" />

describe('Therapy and Appointments', () => {
  describe('User Therapy Access', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/therapy');
    });

    it('should allow user to access therapy page', () => {
      cy.url().should('include', '/user/therapy');
    });

    it('should display therapy page content', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('User Appointments', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/appointment');
    });

    it('should allow user to access appointments', () => {
      cy.url().should('include', '/user/appointment');
    });

    it('should display appointments page', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Guest Therapy Restriction', () => {
    beforeEach(() => {
      cy.mockAuth('guest');
    });

    it('should not allow guest to access therapy', () => {
      cy.visit('/user/therapy');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should not allow guest to access appointments', () => {
      cy.visit('/user/appointment');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Counselor Schedule', () => {
    beforeEach(() => {
      cy.mockAuth('counselor');
      cy.visit('/counselor/schedule');
    });

    it('should allow counselor to access schedule', () => {
      cy.url().should('include', '/counselor/schedule');
    });
  });

  describe('Counselor Appointments/Sessions', () => {
    beforeEach(() => {
      cy.mockAuth('counselor');
      cy.visit('/counselor/appointments');
    });

    it('should allow counselor to access appointments', () => {
      cy.url().should('include', '/counselor/appointments');
    });
  });

  describe('Counselor Profile', () => {
    beforeEach(() => {
      cy.mockAuth('counselor');
      cy.visit('/counselor/profile');
    });

    it('should allow counselor to access profile', () => {
      cy.url().should('include', '/counselor/profile');
    });
  });
});

