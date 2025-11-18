/// <reference types="cypress" />

describe('Community Feature', () => {
  describe('User Community Access', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/community');
    });

    it('should allow user to access community', () => {
      cy.url().should('include', '/user/community');
    });

    it('should display community page', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Guest Community Access', () => {
    beforeEach(() => {
      cy.mockAuth('guest');
      cy.visit('/user/community');
    });

    it('should allow guest to access community', () => {
      cy.url().should('include', '/user/community');
    });
  });

  describe('Admin Community Access', () => {
    beforeEach(() => {
      cy.mockAuth('super_admin');
      cy.visit('/admin/community');
    });

    it('should allow admin to access community', () => {
      cy.url().should('include', '/admin/community');
    });
  });

  describe('Counselor Community Access', () => {
    beforeEach(() => {
      cy.mockAuth('counselor');
      cy.visit('/counselor/community');
    });

    it('should allow counselor to access community', () => {
      cy.url().should('include', '/counselor/community');
    });
  });
});

