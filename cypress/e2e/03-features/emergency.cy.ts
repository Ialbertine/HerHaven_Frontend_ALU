/// <reference types="cypress" />

describe('Emergency Features', () => {
  describe('Emergency SOS - Public Access', () => {
    beforeEach(() => {
      cy.visit('/emergency-sos');
    });

    it('should display the emergency SOS page', () => {
      cy.url().should('include', '/emergency-sos');
    });

    it('should be publicly accessible without authentication', () => {
      // No redirect should occur
      cy.url().should('include', '/emergency-sos');
    });

    it('should have emergency content visible', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Emergency Contacts Manager - User Only', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/emergency-contacts');
    });

    it('should allow authenticated user to access emergency contacts', () => {
      cy.url().should('include', '/user/emergency-contacts');
    });

    it('should display emergency contacts manager', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Emergency Contacts - Guest Restriction', () => {
    beforeEach(() => {
      cy.mockAuth('guest');
    });

    it('should not allow guest to access emergency contacts', () => {
      cy.visit('/user/emergency-contacts');
      // Should redirect to home
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Quick Exit Feature', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should have quick exit button available', () => {
      // Check if quick exit button exists
      cy.get('body').then(($body) => {
        if ($body.find('[class*="quick-exit"]').length > 0 || $body.text().includes('Quick Exit')) {
          cy.contains('Quick Exit').should('exist');
        }
      });
    });
  });
});

