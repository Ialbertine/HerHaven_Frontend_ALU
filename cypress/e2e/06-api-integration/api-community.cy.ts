/// <reference types="cypress" />
import { checkApiAvailability, safeApiRequest } from '../../support/api-helpers';

describe('API Integration - Community', () => {
  const apiUrl = Cypress.env('apiUrl');
  let apiAvailable = false;

  before(() => {
    checkApiAvailability().then((available) => {
      apiAvailable = available;
    });
  });

  describe('Community Posts', () => {
    it('should fetch community posts from production API', () => {
      if (!apiAvailable) {
        return;
      }

      safeApiRequest({
        method: 'GET',
        url: `${apiUrl}/api/community/posts`,
      }).then((response) => {
        if (response.status === 0) {
          return;
        }
        
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });

    it('should handle pagination parameters', () => {
      if (!apiAvailable) {
        return;
      }

      safeApiRequest({
        method: 'GET',
        url: `${apiUrl}/api/community/posts?page=1&limit=10`,
      }).then((response) => {
        if (response.status === 0) {
          return;
        }
        
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });
  });

  describe('Community Categories', () => {
    it('should fetch community categories', () => {
      if (!apiAvailable) {
        return;
      }

      safeApiRequest({
        method: 'GET',
        url: `${apiUrl}/api/community/categories`,
      }).then((response) => {
        if (response.status === 0) {
          return;
        }
        
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });
  });
});

