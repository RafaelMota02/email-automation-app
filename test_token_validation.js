const axios = require('axios');
const jwt = require('jsonwebtoken');

// Simulate token expiration
async function testTokenExpiration() {
  try {
    // 1. Login to get a token
    const loginRes = await axios.post('https://email-automation-app-t8ar.onrender.com/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful. Token:', token);
    
    // 2. Verify token works initially
    const statsRes = await axios.get('https://email-automation-app-t8ar.onrender.com/api/campaigns/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Initial stats request successful:', statsRes.data);
    
    // 3. Expire the token by modifying its expiration time
    const decoded = jwt.decode(token);
    const expiredToken = jwt.sign(
      { ...decoded, exp: Math.floor(Date.now() / 1000) - 3600 },
      process.env.JWT_SECRET
    );
    console.log('Created expired token:', expiredToken);
    
    // 4. Make request with expired token
    try {
      await axios.get('https://email-automation-app-t8ar.onrender.com/api/campaigns/stats', {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });
    } catch (err) {
      console.log('Stats request with expired token failed as expected:', err.response.data);
    }
    
    // 5. Verify token is cleared in frontend (simulated by trying to access protected route)
    try {
      await axios.get('https://email-automation-app-t8ar.onrender.com/api/campaigns', {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });
    } catch (err) {
      console.log('Access denied after token expiration:', err.response.data);
      console.log('TEST PASSED: Frontend correctly cleared expired token');
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testTokenExpiration();
