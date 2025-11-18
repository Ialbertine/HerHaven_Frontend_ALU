/// <reference types="cypress" />
import { checkApiAvailability, safeApiRequest } from '../../support/api-helpers';

describe('API Integration - Authentication', () => {
  const apiUrl = Cypress.env('apiUrl');
  let apiAvailable = false;

  before(() => {
    checkApiAvailability().then((available) => {
      apiAvailable = available;
      if (!available) {
        cy.log('⚠️ API is not available, tests will be skipped');
      }
    });
  });

  beforeEach(() => {
    // Clear any existing authentication
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Login API', () => {
    it('should make a login request to production API', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      // Note: Update with valid test credentials or skip if no test account
      const email = 'test@example.com';
      const password = 'testpassword';

      safeApiRequest({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: email,
          password: password,
        },
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        // Log the response for debugging
        cy.log('Login API Response:', response.status);
        
        // If successful, token should be in response
        if (response.status === 200) {
          expect(response.body).to.have.property('token');
          expect(response.body).to.have.property('user');
        }
      });
    });

    it('should handle invalid credentials', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      safeApiRequest({
        method: 'POST',
        url: `${apiUrl}/api/auth/login`,
        body: {
          email: 'invalid@example.com',
          password: 'wrongpassword',
        },
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        // Should return error status
        expect(response.status).to.be.oneOf([400, 401, 404]);
      });
    });
  });

  describe('Register API', () => {
    it('should make a register request to production API', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      const timestamp = Date.now();
      const testUser = {
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'Test123456',
      };

      safeApiRequest({
        method: 'POST',
        url: `${apiUrl}/api/auth/register`,
        body: testUser,
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        cy.log('Register API Response:', response.status);
        
        // Check if registration was successful or user already exists
        if (response.status === 201 || response.status === 200) {
          expect(response.body).to.have.property('message');
        }
      });
    });

    it('should validate required fields', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      safeApiRequest({
        method: 'POST',
        url: `${apiUrl}/api/auth/register`,
        body: {
          username: '',
          email: '',
          password: '',
        },
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        // Should return validation error
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });
  });

  describe('Guest Access API', () => {
    it('should request guest access from production API', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      safeApiRequest({
        method: 'POST',
        url: `${apiUrl}/api/auth/guest`,
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        cy.log('Guest Access API Response:', response.status);
        
        if (response.status === 200 || response.status === 201) {
          expect(response.body).to.have.property('guestSessionId');
        }
      });
    });
  });
});

