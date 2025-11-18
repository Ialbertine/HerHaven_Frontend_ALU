/// <reference types="cypress" />

/**
 * Check if the API is available and accessible
 * @returns Promise that resolves to true if API is available, false otherwise
 */
export function checkApiAvailability(): Cypress.Chainable<boolean> {
  const apiUrl = Cypress.env("apiUrl");

  if (!apiUrl) {
    cy.log("API URL not configured, skipping API tests");
    return cy.wrap(false);
  }

  return cy.then(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    return fetch(`${apiUrl}/api/health`, {
      method: "GET",
      signal: controller.signal,
    })
      .then((response) => {
        clearTimeout(timeoutId);
        const isAvailable =
          response.status !== undefined &&
          response.status !== 0 &&
          response.status < 600;

        if (isAvailable) {
          cy.log(`API is available (Status: ${response.status})`);
          return true;
        }

        cy.log(
          `API health check responded with status ${response.status}, marking as unavailable`
        );
        return false;
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        cy.log(`API health check failed: ${error.message}`);
        return false;
      });
  });
}

/**
 * Make a safe API request that handles network errors gracefully
 */
export function safeApiRequest<T = unknown>(options: {
  method: string;
  url: string;
  body?: Cypress.RequestBody;
  headers?: Record<string, string>;
}): Cypress.Chainable<Cypress.Response<T>> {
  return cy.request({
    ...options,
    failOnStatusCode: false,
    timeout: 30000,
  });
}

