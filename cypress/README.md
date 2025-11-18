# HerHaven Cypress Testing Documentation

This document provides a comprehensive overview of all end-to-end tests implemented for the HerHaven application using Cypress.

## Test Organization

Tests are organized into six main categories:

1. Authentication Tests
2. Navigation Tests
3. Feature Tests
4. Admin Tests
5. Accessibility Tests
6. API Integration Tests

## Running Tests

### Run All Tests
```bash
npx cypress run
```

### Run Tests in Interactive Mode
```bash
npx cypress open
```

### Run Specific Test Category
```bash
npx cypress run --spec "cypress/e2e/01-authentication/**/*.cy.ts"
npx cypress run --spec "cypress/e2e/02-navigation/**/*.cy.ts"
npx cypress run --spec "cypress/e2e/03-features/**/*.cy.ts"
npx cypress run --spec "cypress/e2e/04-admin/**/*.cy.ts"
npx cypress run --spec "cypress/e2e/05-accessibility/**/*.cy.ts"
npx cypress run --spec "cypress/e2e/06-api-integration/**/*.cy.ts"
```

### Run Individual Test File
```bash
npx cypress run --spec "cypress/e2e/01-authentication/login.cy.ts"
```

## 1. Authentication Tests

### Login Page Testing (login.cy.ts)
- Page display and UI elements verification
- Logo, form inputs, and buttons visibility
- Empty field validation errors
- Invalid email format validation
- Short password validation
- Password visibility toggle functionality
- Remember me checkbox presence
- Navigation links to signup and forgot password
- Error message clearing when user starts typing

### Signup Page Testing (signup.cy.ts)
- Page display and UI elements verification
- Empty field validation for all required fields
- Username format validation (3-30 characters)
- Email format validation
- Password strength indicator
- Password requirements display
- Password visibility toggle
- Guest access option availability
- Terms and conditions acceptance requirement
- Navigation link to sign in page
- Username format hint display

### Protected Routes Testing (protected-routes.cy.ts)
- Unauthorized access to protected routes redirects to home
- User role access permissions:
  - Users can access user dashboard
  - Users cannot access admin or counselor dashboards
- Guest role access permissions:
  - Guests can access user dashboard
  - Guests cannot access admin dashboard or user appointments
- Admin role access permissions:
  - Admins can access admin dashboard
  - Admins cannot access user or counselor dashboards
- Counselor role access permissions:
  - Counselors can access counselor dashboard
  - Counselors cannot access admin or user dashboards

## 2. Navigation Tests

### Main Navigation Testing (navigation.cy.ts)
- Navbar visibility and display
- Navigation links presence (Home, About, Services, Resources, Contact)
- Navigation functionality to different pages
- Authentication buttons display when not logged in
- Footer display and content
- Responsive navigation for mobile and desktop viewports
- Language switcher availability

### Landing Pages Testing (landing-pages.cy.ts)
- Home page display with logo
- About Us page accessibility
- Services page accessibility
- Resources page accessibility and navigation
- Contact page with form elements
- Therapy service page display
- Counselor application form page with form elements

## 3. Feature Tests

### Assessments Testing (assessments.cy.ts)
- Public assessment list page accessibility
- User assessment dashboard access for authenticated users
- Assessment history page access
- Assessment analytics page access
- Counselor assessment access

### Chatbot Testing (chatbot.cy.ts)
- Chatbot page display and public accessibility
- Chatbot interface visibility
- Floating chatbot availability on home page

### Emergency Features Testing (emergency.cy.ts)
- Emergency SOS page public accessibility without authentication
- Emergency content visibility
- Emergency contacts manager access for authenticated users
- Guest restriction from emergency contacts
- Quick exit button availability for safety

### Community Testing (community.cy.ts)
- User community access
- Guest community access
- Admin community management access
- Counselor community access

### Therapy and Appointments Testing (therapy-appointments.cy.ts)
- User therapy page access
- User appointments page access
- Guest restrictions for therapy and appointments
- Counselor schedule access
- Counselor appointments/sessions access
- Counselor profile access

## 4. Admin Tests

### Admin Dashboard Testing (admin-dashboard.cy.ts)
- Admin dashboard access for super admin
- Admin dashboard content display
- Management pages access:
  - Therapy management
  - User management
  - Assessment management
  - Feedback management
  - Contact management
- Access restrictions for non-admin users (user, counselor, guest)

## 5. Accessibility Tests

### Accessibility Features Testing (accessibility.cy.ts)
- Page titles are properly set
- Images have alt text attributes
- Form labels are properly associated with inputs
- Buttons have aria-labels for screen readers
- Keyboard navigation support:
  - Form fields can be focused and navigated
  - Buttons can be focused and interacted with
- Responsive design testing across multiple viewports:
  - mobile
  - tablet
  - desktop
- Text size context provider availability
- Quick exit feature accessibility for vulnerable users

## 6. API Integration Tests

### Authentication API Testing (api-authentication.cy.ts)
- Login API endpoint testing with production API
- Invalid credentials handling
- Registration API endpoint testing
- Required fields validation
- Guest access API endpoint testing

### Assessments API Testing (api-assessments.cy.ts)
- Assessment list endpoint testing
- Single assessment retrieval by ID
- Assessment templates endpoint testing

### Community API Testing (api-community.cy.ts)
- Community posts endpoint testing
- Pagination parameters handling
- Community categories endpoint testing

All API tests include:
- API availability checking before running tests
- Graceful handling of network errors
- Safe API request wrapper for error handling

## Test Coverage Summary

### Total Test Categories: 6
### Total Test Files: 15

#### Authentication: 3 files
- login.cy.ts (10 tests)
- signup.cy.ts (13 tests)
- protected-routes.cy.ts (14 tests)

#### Navigation: 2 files
- navigation.cy.ts (13 tests)
- landing-pages.cy.ts (10 tests)

#### Features: 5 files
- assessments.cy.ts (6 tests)
- chatbot.cy.ts (3 tests)
- emergency.cy.ts (5 tests)
- community.cy.ts (4 tests)
- therapy-appointments.cy.ts (9 tests)

#### Admin: 1 file
- admin-dashboard.cy.ts (8 tests)

#### Accessibility: 1 file
- accessibility.cy.ts (8 tests)

#### API Integration: 3 files
- api-authentication.cy.ts (5 tests)
- api-assessments.cy.ts (3 tests)
- api-community.cy.ts (3 tests)

## Key Testing Features

### Role-Based Testing
The test suite uses a custom mockAuth command to simulate different user roles:
- super_admin
- user
- guest
- counselor

### Safe API Testing
API integration tests include:
- API availability checking
- Network error handling
- Graceful test skipping when API is unavailable
- Production API endpoint testing

### Responsive Testing
Tests verify functionality across multiple device viewports to ensure responsive design works correctly.

### Accessibility Testing
Comprehensive accessibility testing ensures the application is usable by:
- Screen reader users
- Keyboard-only users
- Users on different devices
- Vulnerable users requiring quick exit features

## CI/CD Integration

Tests are automatically run in the GitHub Actions workflow:
- Runs on push to main branch
- Runs on pull requests
- Uses Chrome browser
- Waits for preview server on localhost:4173
- Uploads screenshots on test failure
- Must pass before deployment to Netlify

## Test Maintenance Notes

### Adding New Tests
1. Place test files in appropriate category folder
2. Use descriptive test names
3. Include proper beforeEach hooks for setup
4. Use mockAuth for role-based tests
5. Follow existing test patterns

### Test Patterns Used
- Page object pattern for reusable elements
- Custom commands for authentication
- Safe API request wrapper for API tests
- Consistent test structure across all files

## Troubleshooting

### Tests Failing Locally
- Ensure dev server is running
- Check Cypress base URL configuration
- Verify authentication mock is working
- Clear browser cache and cookies

### API Tests Failing
- Verify API URL is correctly configured
- Check API is running and accessible
- Review API availability check results
- Ensure test credentials are valid

### Screenshot Evidence
Failed tests automatically capture screenshots saved to:
```
cypress/screenshots/
```

These are uploaded as artifacts in CI/CD for debugging.

