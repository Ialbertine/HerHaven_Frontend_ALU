/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Make an authenticated API request to production backend
       * @example cy.apiRequest('GET', '/api/users')
       */
      apiRequest<T = unknown>(method: string, endpoint: string, body?: unknown): Chainable<Response<T>>
      
      /**
       * Login via API and store token
       * @example cy.apiLogin('email@example.com', 'password')
       */
      apiLogin(email: string, password: string): Chainable<Response<{ token?: string; user?: { role?: string } }>>
      
      /**
       * Check API health
       * @example cy.checkApiHealth()
       */
      checkApiHealth(): Chainable<Response<{ error?: string }>>
    }
  }
}

// Make authenticated API request
Cypress.Commands.add('apiRequest', (method: string, endpoint: string, body?: unknown) => {
  const apiUrl = Cypress.env('apiUrl');
  const token = localStorage.getItem('token');
  
  return cy.request({
    method: method,
    url: `${apiUrl}${endpoint}`,
    body: body,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    failOnStatusCode: false,
  });
});

// Login via API
Cypress.Commands.add('apiLogin', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl');
  
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/api/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.token) {
      // Store token in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('token', response.body.token);
        win.localStorage.setItem('userRole', response.body.user?.role || 'user');
        win.localStorage.setItem('user', JSON.stringify(response.body.user));
      });
    }
    return cy.wrap(response);
  });
});

// Check API health
Cypress.Commands.add('checkApiHealth', () => {
  const apiUrl = Cypress.env('apiUrl');
  
  return cy.request({
    method: 'GET',
    url: `${apiUrl}/api/health`,
    failOnStatusCode: false,
    timeout: 30000,
  }).then((response) => {
    cy.log('API Health Check:', response.status === 200 ? 'Healthy' : 'Unhealthy');
    return cy.wrap(response);
  }).catch((error) => {
    // Handle network errors gracefully
    cy.log(`⚠️ API Health Check failed: ${error.message || 'Network error'}`);
    return cy.wrap({
      status: 0,
      statusText: 'Network Error',
      body: { error: 'API is not accessible' },
    } as Cypress.Response<{ error: string }>);
  });
});

export {};

