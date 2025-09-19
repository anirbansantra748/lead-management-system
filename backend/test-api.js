const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAPI() {
  try {
    console.log('🔍 Testing API connectivity...');
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get('http://localhost:5001/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test auth endpoints
    const testEmail = `test${Date.now()}@example.com`;
    console.log('\n📝 Testing registration with:', testEmail);
    try {
      // Test registration
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        email: testEmail,
        password: 'testpassword',
        firstName: 'Test',
        lastName: 'User'
      }, { withCredentials: true });
      
      console.log('✅ Registration successful:', registerResponse.data);
      
      // Test login
      console.log('\n🔐 Testing login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'testpassword'
      }, { withCredentials: true });
      
      console.log('✅ Login successful:', loginResponse.data);
      
      // Get cookies from login response
      const cookies = loginResponse.headers['set-cookie'];
      let cookieHeader = '';
      if (cookies) {
        cookieHeader = cookies.join('; ');
      }
      
      // Test leads endpoint
      console.log('\n📊 Testing leads endpoint...');
      const leadsResponse = await axios.get(`${API_BASE}/leads`, {
        withCredentials: true,
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      console.log('✅ Leads fetch successful:', {
        total: leadsResponse.data.total,
        count: leadsResponse.data.data.length
      });
      
      // Test creating a lead
      console.log('\n➕ Testing lead creation...');
      const createResponse = await axios.post(`${API_BASE}/leads`, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        city: 'New York',
        state: 'NY',
        source: 'website',
        status: 'new',
        score: 75,
        lead_value: 1000,
        is_qualified: true
      }, {
        withCredentials: true,
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      console.log('✅ Lead creation successful:', createResponse.data);
      
      // Test fetching leads again
      console.log('\n🔄 Testing leads fetch after creation...');
      const leadsAfterResponse = await axios.get(`${API_BASE}/leads`, {
        withCredentials: true,
        headers: {
          'Cookie': cookieHeader
        }
      });
      
      console.log('✅ Leads fetch after creation:', {
        total: leadsAfterResponse.data.total,
        count: leadsAfterResponse.data.data.length
      });
      
    } catch (error) {
      console.log('❌ Registration/Login failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();