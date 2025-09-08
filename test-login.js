const axios = require('axios');

// Test the login endpoint
async function testLogin() {
  try {
    console.log('Testing login with attendee email...');
    
    // Test with an email from your CSV
    const response = await axios.post('https://api.rahulp.me/api/auth/login', {
      email: 'aniket.paul36074@paruluniversity.ac.in',
      password: ''
    });
    
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error:', error.response?.data);
  }
}

// Test health endpoint
async function testHealth() {
  try {
    console.log('Testing health endpoint...');
    const response = await axios.get('https://api.rahulp.me/health');
    console.log('Health check:', response.data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

async function runTests() {
  await testHealth();
  console.log('---');
  await testLogin();
}

runTests();