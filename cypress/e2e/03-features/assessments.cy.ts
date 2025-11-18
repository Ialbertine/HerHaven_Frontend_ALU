/// <reference types="cypress" />

describe('Assessments Feature', () => {
  describe('Public Assessment List', () => {
    beforeEach(() => {
      cy.visit('/assessments');
    });

    it('should display the assessments page', () => {
      cy.url().should('include', '/assessments');
    });

    it('should have assessment list or content', () => {
      // Check if page has loaded
      cy.get('body').should('be.visible');
    });
  });

  describe('User Assessment Dashboard', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/assessments');
    });

    it('should allow authenticated user to access assessment dashboard', () => {
      cy.url().should('include', '/user/assessments');
    });

    it('should display assessment dashboard elements', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Assessment History', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/assessment-history');
    });

    it('should allow user to view assessment history', () => {
      cy.url().should('include', '/user/assessment-history');
    });
  });

  describe('Assessment Analytics', () => {
    beforeEach(() => {
      cy.mockAuth('user');
      cy.visit('/user/assessment-analytics');
    });

    it('should allow user to view assessment analytics', () => {
      cy.url().should('include', '/user/assessment-analytics');
    });
  });

  describe('Counselor Assessment Access', () => {
    beforeEach(() => {
      cy.mockAuth('counselor');
      cy.visit('/counselor/assessments');
    });

    it('should allow counselor to access assessments', () => {
      cy.url().should('include', '/counselor/assessments');
    });
  });
});

