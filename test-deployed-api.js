// Test script for deployed backend API
const axios = require('axios');

const BACKEND_URL = 'https://lead-management-system-wlg0.onrender.com';

async function testAPI() {
  console.log('🧪 Testing Deployed Backend API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Test Registration Endpoint (should fail without data, but endpoint should exist)
    console.log('2️⃣ Testing Registration Endpoint...');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/register`, {});
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Registration endpoint exists (validation error expected)');
        console.log('📊 Response:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 3: Test CORS (this might fail due to CORS, but endpoint should exist)
    console.log('3️⃣ Testing Login Endpoint...');
    try {
      await axios.post(`${BACKEND_URL}/api/auth/login`, {});
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Login endpoint exists (validation error expected)');
        console.log('📊 Response:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    console.log('🎉 Backend API is deployed and responding!');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Add FRONTEND_URL environment variable in Render');
    console.log('2. Update frontend .env.production with correct API URL');
    console.log('3. Redeploy both frontend and backend');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔍 Backend might not be deployed or URL is incorrect');
    }
  }
}

testAPI();