# API Integration Tests

This folder contains tests that make actual requests to your production backend API.

## 🌐 API URL

These tests use the production API URL configured in `cypress.env.json`:

```json
{
  "apiUrl": "https://ialbertine-herhaven-backend.onrender.com"
}
```

## 📋 API Tests Included

### 1. Authentication API (`api-authentication.cy.ts`)
- ✅ Login endpoint
- ✅ Register endpoint
- ✅ Guest access endpoint
- ✅ Invalid credentials handling
- ✅ Field validation

### 2. Assessments API (`api-assessments.cy.ts`)
- ✅ Fetch assessment list
- ✅ Fetch single assessment by ID
- ✅ Assessment templates

### 3. Community API (`api-community.cy.ts`)
- ✅ Fetch community posts
- ✅ Pagination support
- ✅ Community categories

### 4. Chatbot API (`api-chatbot.cy.ts`)
- ✅ Send messages to chatbot
- ✅ Message validation
- ✅ Chatbot sessions

### 5. Emergency API (`api-emergency.cy.ts`)
- ✅ Emergency contacts
- ✅ SOS alerts
- ✅ Emergency resources

## 🚀 Running API Tests

### Run All API Tests
```bash
npx cypress run --spec "cypress/e2e/06-api-integration/**/*"
```

### Run Specific API Test
```bash
npx cypress run --spec "cypress/e2e/06-api-integration/api-authentication.cy.ts"
```

### Run in Interactive Mode
```bash
npm run test:open
# Then select tests from 06-api-integration folder
```

## 🛠️ Custom API Commands

### `cy.apiRequest(method, endpoint, body)`
Make authenticated API requests:

```typescript
cy.apiRequest('GET', '/api/users').then((response) => {
  expect(response.status).to.eq(200);
});
```

### `cy.apiLogin(email, password)`
Login via API and store token:

```typescript
cy.apiLogin('test@example.com', 'password123').then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body).to.have.property('token');
});
```

### `cy.checkApiHealth()`
Check if API is accessible:

```typescript
cy.checkApiHealth().then((response) => {
  expect(response.status).to.eq(200);
});
```

## 📝 Usage Examples

### Example 1: Test Authentication Flow
```typescript
describe('User Login Flow', () => {
  it('should login and access protected resource', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    // Login
    cy.apiLogin('user@example.com', 'password').then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);
      
      // Use token to access protected endpoint
      cy.apiRequest('GET', '/api/user/profile').then((profileResponse) => {
        expect(profileResponse.status).to.eq(200);
        expect(profileResponse.body).to.have.property('email');
      });
    });
  });
});
```

### Example 2: Test Data Creation
```typescript
it('should create a community post', () => {
  const apiUrl = Cypress.env('apiUrl');
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/community/posts`,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: {
      title: 'Test Post',
      content: 'This is a test post',
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body).to.have.property('id');
  });
});
```

### Example 3: Direct API Access
```typescript
it('should fetch assessments from production', () => {
  const apiUrl = Cypress.env('apiUrl');
  
  cy.request(`${apiUrl}/api/assessments`).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.be.an('array');
  });
});
```

## ⚙️ Configuration

### Update API URL
Edit `cypress.env.json` to change the API URL:

```json
{
  "apiUrl": "http://localhost:3000",  // For local backend
  "apiUrl": "https://your-api.com",   // For production backend
}
```

### Environment-Specific URLs
You can create multiple environment files:

- `cypress.env.json` - Default
- `cypress.env.local.json` - Local testing
- `cypress.env.production.json` - Production testing

Then specify which to use:
```bash
cypress run --env configFile=cypress.env.local.json
```

## 🔍 Important Notes

### Test Data
- ⚠️ These tests hit the production API
- ⚠️ Use test accounts, not real user data
- ⚠️ Consider creating a dedicated test environment

### API Authentication
Most endpoints require authentication:
1. Use `cy.apiLogin()` to get a token
2. Token is automatically stored in localStorage
3. Use `cy.apiRequest()` for authenticated requests

### Error Handling
All tests use `failOnStatusCode: false` to handle various API responses:
```typescript
cy.request({
  url: `${apiUrl}/api/endpoint`,
  failOnStatusCode: false,  // Don't fail on 4xx/5xx
}).then((response) => {
  // Handle different status codes
  if (response.status === 200) {
    // Success
  } else if (response.status === 401) {
    // Unauthorized
  }
});
```

### Rate Limiting
Be aware of API rate limits:
- Tests may fail if you run them too frequently
- Consider adding delays between requests
- Use mock data for most tests, API for integration tests

## 🧪 Test Strategy

### When to Use API Tests
✅ Testing actual backend integration
✅ Verifying API endpoints exist and respond correctly
✅ End-to-end flow testing with real data
✅ CI/CD pipeline integration tests

### When to Use Mock Tests
✅ Testing UI behavior and validation
✅ Fast feedback during development
✅ Testing edge cases without backend dependency
✅ Isolated frontend functionality testing

## 📊 Running Both Test Types

### Mock Tests (Fast, No Backend Required)
```bash
npm run test:open
# Select tests from 01-05 folders
```

### API Tests (Slower, Requires Backend)
```bash
npm run test:open
# Select tests from 06-api-integration folder
```

### All Tests Together
```bash
npm test
```

## 🐛 Troubleshooting

### API Not Responding
```typescript
cy.checkApiHealth().then((response) => {
  if (response.status !== 200) {
    cy.log('API is not available');
    this.skip(); // Skip test if API is down
  }
});
```

### CORS Issues
If you get CORS errors:
1. Check backend CORS configuration
2. Ensure `withCredentials: true` in axios config
3. API must allow requests from your test domain

### Authentication Failures
1. Verify test credentials are correct
2. Check if test account exists in database
3. Ensure token is being stored correctly
4. Check token expiration

## 📚 Resources

- [Cypress Network Requests](https://docs.cypress.io/guides/guides/network-requests)
- [API Testing Guide](https://docs.cypress.io/guides/guides/network-requests#Testing-Strategies)
- [Request Documentation](https://docs.cypress.io/api/commands/request)

## 🎯 Best Practices

1. ✅ Always use `failOnStatusCode: false` for API tests
2. ✅ Check multiple status codes (200, 201, 400, 401, etc.)
3. ✅ Log responses for debugging
4. ✅ Use descriptive test names
5. ✅ Clean up test data after tests
6. ✅ Use environment variables for sensitive data
7. ✅ Handle network errors gracefully

---

**Ready to test your API! 🚀**

Run: `npx cypress run --spec "cypress/e2e/06-api-integration/**/*"`

