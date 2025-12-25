# Love App Backend - Postman Collection

This directory contains Postman collection and environment files for testing the Love App Backend API.

## Files

- `Love-App-Backend.postman_collection.json` - Complete API collection with all endpoints
- `Love-App-Environment.postman_environment.json` - Environment variables
- `auto-auth-script.js` - Auto-authentication script
- `README.md` - This documentation

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click "Import" button
3. Import `Love-App-Backend.postman_collection.json`
4. Import `Love-App-Environment.postman_environment.json`
5. Select "Love App Environment" from the environment dropdown

### 2. Setup Auto-Authentication

1. Right-click on "Love App Backend API" collection
2. Select "Edit"
3. Go to "Pre-request Script" tab
4. Copy and paste the content from `auto-auth-script.js`
5. Save the collection

### 3. Configure Environment Variables

Update these variables in the environment as needed:

- `baseUrl` - API base URL (default: <http://localhost:3000>)
- `authToken` - JWT token (auto-populated by scripts)
- `userId` - User ID (auto-populated by scripts)
- `providerId` - Provider ID (auto-populated by scripts)
- `campaignId` - Campaign ID (auto-populated by scripts)

## Usage

### Auto-Authentication

The collection includes auto-authentication that:

1. Automatically logs in with default credentials before each request
2. Handles token refresh when expired
3. Registers a new user if login fails
4. Skips authentication for public endpoints

### Default Test Credentials

**Regular User:**

- Email: `user@example.com`
- Password: `password123`

**Admin User:**

- Email: `admin@loveapp.com`
- Password: `admin123`

### Testing Workflow

1. **Start with Authentication folder** - Register or login to get tokens
2. **Test core features** - Users, Providers, Campaigns
3. **Test advanced features** - SOS, Donations, Volunteers
4. **Test admin features** - Admin panel endpoints (requires admin login)

### Collection Structure

```text
Love App Backend API/
├── Authentication/
│   ├── Register User
│   ├── Login User
│   └── Admin Login
├── Users/
│   ├── Get Profile
│   ├── Update Profile
│   └── Get Nearby Users
├── Providers/
│   ├── Register Provider
│   ├── Get All Providers
│   └── Search Providers
├── Campaigns/
│   ├── Create Campaign
│   ├── Get All Campaigns
│   ├── Get Campaign by ID
│   └── Search Campaigns
├── SOS/
│   ├── Create SOS Alert
│   ├── Get My SOS Alerts
│   └── Get Nearby SOS Alerts
├── Donations/
│   ├── Create Donation
│   ├── Get My Donations
│   └── Get Campaign Donations
├── Volunteers/
│   ├── Apply as Volunteer
│   ├── Get Volunteer Opportunities
│   └── Join Opportunity
├── Reviews/
│   ├── Create Review
│   └── Get Provider Reviews
├── Notifications/
│   ├── Get My Notifications
│   ├── Mark as Read
│   └── Update Preferences
├── Admin/
│   ├── Get Dashboard Analytics
│   ├── Get All Users
│   ├── Update User Status
│   ├── Approve Provider
│   └── Get System Settings
└── Health Check/
    └── Health Check
```

### Auto-Variable Population

The collection automatically populates variables from responses:

- User registration/login → `userId`, `authToken`
- Provider registration → `providerId`
- Campaign creation → `campaignId`
- Other entity creation → respective IDs

### Manual Admin Testing

For admin endpoints:

1. Run "Admin Login" request first
2. Or call `adminLogin()` function in pre-request script
3. Admin token will be set automatically

### Environment Switching

Create multiple environments for different stages:

- **Development** - `http://localhost:3000`
- **Staging** - `https://staging-api.loveapp.com`
- **Production** - `https://api.loveapp.com`

### Tips

1. **Run requests in order** - Some requests depend on previous ones
2. **Check Console** - Auto-auth logs are visible in Postman Console
3. **Update credentials** - Modify auto-auth script for different test users
4. **Use Test tab** - Add custom test scripts for validation
5. **Export results** - Use Postman's test runner for automated testing

## Troubleshooting

### Authentication Issues

- Check if backend is running on correct port
- Verify credentials in auto-auth script
- Clear `authToken` variable to force re-authentication

### Variable Issues

- Ensure environment is selected
- Check if previous requests completed successfully
- Manually set variables if auto-population fails

### Network Issues

- Verify `baseUrl` in environment
- Check if backend server is accessible
- Review CORS settings if testing from browser

## Advanced Usage

### Custom Test Scripts

Add to individual requests' "Tests" tab:

```javascript
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Response has required fields', function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('id');
});
```

### Batch Testing

Use Postman's Collection Runner:

1. Click "Runner" button
2. Select collection and environment
3. Configure iterations and delay
4. Run automated tests

### CI/CD Integration

Export collection and use with Newman:

```bash
npm install -g newman
newman run Love-App-Backend.postman_collection.json \
  -e Love-App-Environment.postman_environment.json \
  --reporters cli,json
```
