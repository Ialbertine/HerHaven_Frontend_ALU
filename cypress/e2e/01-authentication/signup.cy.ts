/// <reference types="cypress" />

describe('Signup Page', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should display the signup page correctly', () => {
    // Check page elements
    cy.contains('Welcome to HerHaven').should('be.visible');
    cy.contains('CREATE YOUR ACCOUNT').should('be.visible');
    cy.get('img[alt="HerHaven Logo"]').should('be.visible');
    
    // Check form inputs
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="agreeToTerms"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Register');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    
    cy.contains('Username is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    cy.contains('You must agree to the terms and conditions').should('be.visible');
  });

  it('should validate username format', () => {
    // Too short username
    cy.get('input[name="username"]').type('ab');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test123456');
    cy.get('input[name="agreeToTerms"]').check();
    cy.get('button[type="submit"]').click();
    
    cy.contains('Username must be 3-30 characters').should('be.visible');
  });

  it('should validate email format', () => {
    cy.get('input[name="username"]').clear().type('testuser');
    cy.get('input[name="email"]').clear().type('invalidemail');
    cy.get('input[name="password"]').clear().type('Test123456');
    cy.get('input[name="agreeToTerms"]').check();
    cy.get('button[type="submit"]').click();
    
    // Should remain on signup page (validation prevents submission)
    cy.url().should('include', '/signup', { timeout: 3000 });
    
    // Verify signup form is still visible (not navigated away)
    cy.contains('CREATE YOUR ACCOUNT').should('be.visible');
  });

  it('should validate password strength', () => {
    cy.get('input[name="password"]').type('weak');
    
    // Check password strength indicator appears
    cy.contains('Weak').should('be.visible');
  });

  it('should show password requirements', () => {
    cy.get('input[name="password"]').type('test');
    
    // Check password requirements are visible
    cy.contains('At least 6 characters').should('be.visible');
    cy.contains('Include uppercase & lowercase').should('be.visible');
    cy.contains('Include numbers').should('be.visible');
  });

  it('should toggle password visibility', () => {
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    
    cy.get('button[aria-label="Show password"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
  });

  it('should have guest access option', () => {
    cy.contains('Continue as Guest').should('be.visible');
    cy.contains('Access limited features without signup').should('be.visible');
  });

  it('should have link to sign in', () => {
    cy.contains('Sign In').should('be.visible').and('have.attr', 'href', '/login');
  });

  it('should navigate to login page when clicking Sign In link', () => {
    cy.contains('Sign In').click();
    cy.url().should('include', '/login');
  });

  it('should require terms and conditions acceptance', () => {
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test123456');
    // Don't check terms
    cy.get('button[type="submit"]').click();
    
    cy.contains('You must agree to the terms and conditions').should('be.visible');
  });

  it('should have terms and conditions link', () => {
    cy.contains('Terms & Conditions').should('have.attr', 'href', '/terms');
  });

  it('should display username format hint', () => {
    cy.contains('3-30 characters, letters/numbers/_').should('be.visible');
  });
});

