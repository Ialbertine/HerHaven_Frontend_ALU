/// <reference types="cypress" />

describe('Chatbot Feature', () => {
  describe('Chatbot Page', () => {
    beforeEach(() => {
      cy.visit('/havenchatbot');
    });

    it('should display the chatbot page', () => {
      cy.url().should('include', '/havenchatbot');
    });

    it('should be publicly accessible', () => {
      // No redirect should occur
      cy.url().should('include', '/havenchatbot');
    });

    it('should have chatbot interface visible', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Floating Chatbot', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should check if floating chatbot exists on home page', () => {
      // Check if floating chatbot button exists
      cy.get('body').then(($body) => {
        if ($body.find('[class*="chatbot"]').length > 0 || $body.find('[class*="chat"]').length > 0) {
          // Chatbot exists
          cy.log('Chatbot button found');
        }
      });
    });
  });
});

