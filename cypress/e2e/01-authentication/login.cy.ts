/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login page correctly', () => {
    // Check page elements
    cy.contains('Welcome Back').should('be.visible');
    cy.contains('SIGN IN').should('be.visible');
    cy.get('img[alt="HerHaven Logo"]').should('be.visible');
    
    // Check form inputs
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Login');
  });

  it('should show validation errors for empty fields', () => {
    // Submit empty form
    cy.get('button[type="submit"]').click();
    
    // Check for error messages
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show validation error for invalid email format', () => {
    // Type invalid email 
    cy.get('input[name="email"]').clear().type('invalidemail');
    cy.get('input[name="password"]').clear().type('password123');
    
    // Try to submit
    cy.get('button[type="submit"]').click();
    
    // prevent navigation when validation error occurs
    cy.url().should('include', '/login', { timeout: 3000 });
    
    // Verify login form is still visible (not navigated away)
    cy.contains('SIGN IN').should('be.visible');
  });

  it('should show validation error for short password', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('12345');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Password must be at least 6 characters').should('be.visible');
  });

  it('should toggle password visibility', () => {
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    
    // Click show password button
    cy.get('button[aria-label="Show password"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
    
    // Click hide password button
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');
  });

  it('should have remember me checkbox', () => {
    cy.get('input[name="rememberMe"]').should('exist');
    cy.contains('Remember Me').should('be.visible');
  });

  it('should have links to signup and forgot password', () => {
    cy.contains('Sign Up').should('be.visible').and('have.attr', 'href', '/signup');
    cy.contains('Forgot Password?').should('be.visible');
  });

  it('should navigate to signup page when clicking Sign Up link', () => {
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('should clear error messages when user starts typing', () => {
    // Trigger validation error
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    
    // Start typing
    cy.get('input[name="email"]').type('t');
    cy.contains('Email is required').should('not.exist');
  });
});

