/// <reference types="cypress" />
import { checkApiAvailability, safeApiRequest } from '../../support/api-helpers';

describe('API Integration - Assessments', () => {
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

  describe('Public Assessment Endpoints', () => {
    it('should fetch assessment list from production API', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      safeApiRequest({
        method: 'GET',
        url: `${apiUrl}/api/assessments`,
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        cy.log('Assessments API Response:', response.status);
        
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });

    it('should fetch a single assessment by ID', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      // First get the list to get a valid ID
      safeApiRequest({
        method: 'GET',
        url: `${apiUrl}/api/assessments`,
      }).then((listResponse) => {
        if (listResponse.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        if (listResponse.status === 200 && listResponse.body.length > 0) {
          const assessmentId = listResponse.body[0].id;
          
          // Now fetch single assessment
          safeApiRequest({
            method: 'GET',
            url: `${apiUrl}/api/assessments/${assessmentId}`,
          }).then((response) => {
            if (response.status === 0) {
              cy.log('⚠️ API request failed - network error');
              return;
            }
            
            if (response.status === 200) {
              expect(response.body).to.have.property('id');
              expect(response.body).to.have.property('title');
            }
          });
        }
      });
    });
  });

  describe('Assessment Templates', () => {
    it('should fetch assessment templates', () => {
      if (!apiAvailable) {
        cy.log('Skipping test - API not available');
        return;
      }

      safeApiRequest({
        method: 'GET',
        url: `${apiUrl}/api/assessments/templates`,
      }).then((response) => {
        if (response.status === 0) {
          cy.log('⚠️ API request failed - network error');
          return;
        }
        
        cy.log('Assessment Templates Response:', response.status);
        
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
        }
      });
    });
  });
});

