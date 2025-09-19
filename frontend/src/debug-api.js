// Debug script to test API calls
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function testAPI() {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login with test user
    console.log('\n2. Testing login with test user...');
    const loginResponse = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    // Get current user info
    console.log('\n3. Getting current user info...');
    const userResponse = await api.get('/auth/me');
    console.log('✅ Current user:', userResponse.data.user);
    
    // Test leads endpoint for this user
    console.log('\n4. Testing leads endpoint for current user...');
    const leadsResponse = await api.get('/leads');
    console.log('✅ Leads fetched for current user:', {
      total: leadsResponse.data.total,
      count: leadsResponse.data.data.length,
      page: leadsResponse.data.page
    });
    
    // Show first few leads
    if (leadsResponse.data.data.length > 0) {
      console.log('\n📋 Sample leads:');
      leadsResponse.data.data.slice(0, 3).forEach((lead, index) => {
        console.log(`   ${index + 1}. ${lead.first_name} ${lead.last_name} - ${lead.company} (${lead.status})`);
      });
    } else {
      console.log('\n📋 No leads found for current user');
    }
    
    // Test creating a new lead
    console.log('\n5. Testing lead creation...');
    const newLead = {
      first_name: 'Debug',
      last_name: 'Test',
      email: `debug_test_${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Debug Company',
      city: 'Test City',
      state: 'Test State',
      source: 'website',
      status: 'new',
      score: 75,
      lead_value: 1000,
      is_qualified: false
    };
    
    const createResponse = await api.post('/leads', newLead);
    console.log('✅ Lead created successfully:', createResponse.data);
    
    // Get leads again to confirm
    console.log('\n6. Fetching leads again after creation...');
    const updatedLeadsResponse = await api.get('/leads');
    console.log('✅ Updated leads count:', {
      total: updatedLeadsResponse.data.total,
      count: updatedLeadsResponse.data.data.length
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testAPI();