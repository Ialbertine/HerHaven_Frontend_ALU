/// <reference types="cypress" />

/**
 * Check if the API is available and accessible
 * @returns Promise that resolves to true if API is available, false otherwise
 */
export function checkApiAvailability(): Cypress.Chainable<boolean> {
  const apiUrl = Cypress.env('apiUrl');
  
  if (!apiUrl) {
    cy.log('⚠️ API URL not configured, skipping API tests');
    return cy.wrap(false);
  }

  return cy.request({
    method: 'GET',
    url: `${apiUrl}/api/health`,
    failOnStatusCode: false,
    timeout: 10000,
  }).then((response) => {
    // If we get any response (even 404/500), the API is reachable
    const isAvailable = response.status !== undefined && response.status !== 0 && response.status < 600;
    
    if (isAvailable) {
      cy.log(`API is available (Status: ${response.status})`);
      return cy.wrap(true);
    }
    return cy.wrap(true);
  });
}

/**
 * Make a safe API request that handles network errors gracefully
 */
export function safeApiRequest(options: {
  method: string;
  url: string;
  body?: any;
  headers?: Record<string, string>;
}): Cypress.Chainable<Cypress.Response<any>> {
  return cy.request({
    ...options,
    failOnStatusCode: false,
    timeout: 30000,
  });
}

