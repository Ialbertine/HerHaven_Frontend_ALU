/// <reference types="cypress" />

describe('Landing Pages', () => {
  describe('Home Page', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should display the home page correctly', () => {
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.get('img[alt="HerHaven Logo"]').should('be.visible');
    });

    it('should have navigation menu', () => {
      // Check for common navigation items
      cy.contains('Home').should('be.visible');
    });

    it('should have footer', () => {
      cy.scrollTo('bottom');
      // Footer should exist at bottom of page
      cy.get('footer').should('exist');
    });
  });

  describe('About Us Page', () => {
    beforeEach(() => {
      cy.visit('/aboutus');
    });

    it('should display the about page', () => {
      cy.url().should('include', '/aboutus');
    });

    it('should have navigation back to home', () => {
      cy.contains('Home').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Services Page', () => {
    beforeEach(() => {
      cy.visit('/services');
    });

    it('should display the services page', () => {
      cy.url().should('include', '/services');
    });

    it('should be accessible from navigation', () => {
      cy.visit('/');
      cy.contains('Services').click();
      cy.url().should('include', '/services');
    });
  });

  describe('Resources Page', () => {
    it('should display the resources page', () => {
      cy.visit('/resources', { timeout: 60000 });
      cy.url().should('include', '/resources');
    });

    it('should be accessible from navigation', () => {
      cy.visit('/', { timeout: 60000 });
      // Wait for page to be fully loaded
      cy.get('body').should('be.visible');
      cy.contains('Resources').should('be.visible').click();
      cy.url().should('include', '/resources', { timeout: 15000 });
    });
  });

  describe('Contact Page', () => {
    beforeEach(() => {
      cy.visit('/contact');
    });

    it('should display the contact page', () => {
      cy.url().should('include', '/contact');
    });

    it('should have contact form elements', () => {
      // Check for typical contact form elements
      cy.get('form').should('exist');
    });
  });

  describe('Therapy Service Page', () => {
    beforeEach(() => {
      cy.visit('/therapy');
    });

    it('should display the therapy page', () => {
      cy.url().should('include', '/therapy');
    });
  });

  describe('Counselor Form Page', () => {
    beforeEach(() => {
      cy.visit('/counselorform');
    });

    it('should display the counselor application form', () => {
      cy.url().should('include', '/counselorform');
      cy.get('form').should('exist');
    });
  });
});

