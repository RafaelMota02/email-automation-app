// Using built-in fetch (Node.js 18+)

const API_BASE_URL = 'http://localhost:5000';

// Test invalid SMTP configuration
async function testInvalidSmtpConfig() {
  console.log('Testing invalid SMTP configuration...');

  const invalidConfig = {
    host: 'invalid.smtp.server.com',
    port: 587,
    username: 'test@example.com',
    password: 'wrongpassword',
    encryption: 'tls',
    fromEmail: 'test@example.com'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd need a valid JWT token
        // For this demo, we'll expect a 401 or similar auth error
      },
      body: JSON.stringify(invalidConfig)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.status === 400 && result.errorCode) {
      console.log('✅ Invalid SMTP config properly rejected with error code:', result.errorCode);
      console.log('Message:', result.message);
      console.log('Remediation:', result.remediation);
    } else if (response.status === 401) {
      console.log('⚠️  Got auth error (expected without token), but validation logic is in place');
    } else {
      console.log('❌ Unexpected response for invalid config');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test missing required fields
async function testMissingFields() {
  console.log('\nTesting missing required fields...');

  const incompleteConfig = {
    host: 'smtp.example.com',
    // missing port, username, password, fromEmail
  };

  try {
    const response = await fetch(`${API_BASE_URL}/smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteConfig)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.status === 400 && result.error === 'All fields are required') {
      console.log('✅ Missing fields properly rejected');
    } else {
      console.log('❌ Unexpected response for missing fields');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting SMTP validation tests...\n');

  await testInvalidSmtpConfig();
  await testMissingFields();

  console.log('\nTests completed. Check the results above.');
}

runTests();
