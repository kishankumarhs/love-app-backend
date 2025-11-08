// Auto-authentication script for Love App Backend API
// Add this to Collection Pre-request Script in Postman

const baseUrl =
  pm.collectionVariables.get('baseUrl') || 'http://localhost:3000';
const currentToken = pm.collectionVariables.get('authToken');

// Skip auth for login/register endpoints
const skipAuthEndpoints = ['/auth/login', '/auth/register', '/health'];

const currentUrl = pm.request.url.toString();
const shouldSkipAuth = skipAuthEndpoints.some((endpoint) =>
  currentUrl.includes(endpoint),
);

if (shouldSkipAuth) {
  console.log('Skipping auto-auth for:', currentUrl);
  return;
}

// Check if we have a valid token
if (!currentToken) {
  console.log('No auth token found, attempting auto-login...');
  autoLogin();
} else {
  // Verify token is still valid
  verifyToken();
}

function autoLogin() {
  const loginRequest = {
    url: `${baseUrl}/auth/login`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
    },
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    },
  };

  pm.sendRequest(loginRequest, (err, response) => {
    if (err) {
      console.error('Auto-login failed:', err);
      return;
    }

    if (response.code === 200) {
      const responseJson = response.json();
      pm.collectionVariables.set('authToken', responseJson.access_token);
      pm.collectionVariables.set('userId', responseJson.user.id);
      console.log('Auto-login successful');
    } else {
      console.error('Auto-login failed with status:', response.code);
      // Try to register if login fails
      autoRegister();
    }
  });
}

function autoRegister() {
  const registerRequest = {
    url: `${baseUrl}/auth/register`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
    },
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
      }),
    },
  };

  pm.sendRequest(registerRequest, (err, response) => {
    if (err) {
      console.error('Auto-register failed:', err);
      return;
    }

    if (response.code === 201) {
      const responseJson = response.json();
      pm.collectionVariables.set('authToken', responseJson.access_token);
      pm.collectionVariables.set('userId', responseJson.user.id);
      console.log('Auto-register successful');
    } else {
      console.error('Auto-register failed with status:', response.code);
    }
  });
}

function verifyToken() {
  const verifyRequest = {
    url: `${baseUrl}/users/profile`,
    method: 'GET',
    header: {
      Authorization: `Bearer ${currentToken}`,
    },
  };

  pm.sendRequest(verifyRequest, (err, response) => {
    if (err || response.code === 401) {
      console.log('Token expired or invalid, re-authenticating...');
      pm.collectionVariables.set('authToken', '');
      autoLogin();
    } else {
      console.log('Token is valid');
    }
  });
}

// Admin auto-login function (call manually when needed)
function adminLogin() {
  const adminLoginRequest = {
    url: `${baseUrl}/auth/login`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
    },
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        email: 'admin@loveapp.com',
        password: 'admin123',
      }),
    },
  };

  pm.sendRequest(adminLoginRequest, (err, response) => {
    if (err) {
      console.error('Admin login failed:', err);
      return;
    }

    if (response.code === 200) {
      const responseJson = response.json();
      pm.collectionVariables.set('authToken', responseJson.access_token);
      console.log('Admin login successful');
    } else {
      console.error('Admin login failed with status:', response.code);
    }
  });
}
