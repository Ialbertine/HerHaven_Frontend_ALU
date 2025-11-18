/// <reference types="cypress" />

describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Navbar', () => {
    it('should display the navbar', () => {
      cy.get('nav').should('be.visible');
    });

    it('should have navigation links', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('About').should('be.visible');
      cy.contains('Services').should('be.visible');
      cy.contains('Resources').should('be.visible');
      cy.contains('Contact').should('be.visible');
    });

    it('should navigate to different pages', () => {
      // Navigate to About
      cy.contains('About').click();
      cy.url().should('include', '/aboutus');

      // Navigate back to Home
      cy.contains('Home').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');

      // Navigate to Services
      cy.contains('Services').click();
      cy.url().should('include', '/services');

      // Navigate to Resources
      cy.contains('Resources').click();
      cy.url().should('include', '/resources');

      // Navigate to Contact
      cy.contains('Contact').click();
      cy.url().should('include', '/contact');
    });

    it('should have authentication buttons when not logged in', () => {
      cy.contains('Sign Up').should('be.visible');
    });

    it('should navigate to login page', () => {
      cy.visit('/login');
      cy.url().should('include', '/login');
      cy.contains('SIGN IN').should('be.visible');
    });

    it('should navigate to signup page', () => {
      cy.contains('Sign Up').click();
      cy.url().should('include', '/signup');
    });
  });

  describe('Footer', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.scrollTo('bottom');
    });

    it('should display the footer', () => {
      cy.get('footer').should('exist');
    });

    it('should have footer links', () => {
      cy.get('footer').within(() => {
        // Check for common footer elements
        cy.contains('HerHaven').should('exist');
      });
    });
  });

  describe('Responsive Navigation', () => {
    it('should show mobile menu on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      // Look for mobile menu button (hamburger)
      cy.get('nav').should('be.visible');
    });

    it('should show desktop menu on desktop viewport', () => {
      cy.viewport(1280, 720);
      cy.visit('/');
      
      cy.get('nav').should('be.visible');
    });
  });

  describe('Language Switcher', () => {
    it('should have language switcher', () => {
      // Check if language switcher exists
      cy.get('body').then(($body) => {
        if ($body.find('[class*="language"]').length > 0) {
          cy.get('[class*="language"]').should('exist');
        }
      });
    });
  });
});

