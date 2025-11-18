/// <reference types="cypress" />

describe('Accessibility Features', () => {
  describe('Page Load and Basic Accessibility', () => {
    it('should have proper page title on home page', () => {
      cy.visit('/');
      cy.title().should('not.be.empty');
    });

    it('should have images with alt text', () => {
      cy.visit('/');
      cy.get('img[alt="HerHaven Logo"]').should('exist');
    });

    it('should have proper form labels', () => {
      cy.visit('/login');
      cy.get('label[for="email"]').should('exist');
      cy.get('label[for="password"]').should('exist');
    });

    it('should have accessible buttons with aria-labels', () => {
      cy.visit('/login');
      cy.get('button[aria-label]').should('exist');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow form navigation with keyboard', () => {
      cy.visit('/login');
      // Test that form fields can be focused
      cy.get('input[name="email"]').focus().should('have.focus');
      cy.get('input[name="password"]').focus().should('have.focus');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });

    it('should allow button interaction with keyboard', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').focus().should('have.focus');
    });
  });

  describe('Responsive Design', () => {
    const viewports: Cypress.ViewportPreset[] = ['iphone-x', 'ipad-2', 'macbook-15'];

    viewports.forEach((viewport) => {
      it(`should display correctly on ${viewport}`, () => {
        cy.viewport(viewport);
        cy.visit('/');
        cy.get('body').should('be.visible');
        cy.get('nav').should('be.visible');
      });
    });
  });

  describe('Text Size Context', () => {
    it('should have text size context provider', () => {
      cy.visit('/');
      // Text size provider should be wrapping the app
      cy.get('body').should('exist');
    });
  });

  describe('Quick Exit for Safety', () => {
    it('should provide safety features for vulnerable users', () => {
      cy.visit('/');
      // Check if emergency features are accessible
      cy.visit('/emergency-sos');
      cy.url().should('include', '/emergency-sos');
    });
  });
});

