const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');
require('dotenv').config();

// Sample data for generating leads
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 
  'James', 'Jennifer', 'William', 'Mary', 'Richard', 'Patricia', 'Charles',
  'Linda', 'Joseph', 'Barbara', 'Thomas', 'Elizabeth', 'Christopher', 'Helen',
  'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Dorothy', 'Mark', 'Sandra'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const companies = [
  'TechCorp', 'DataSystems Inc', 'CloudVision', 'InnovateTech', 'DigitalSolutions',
  'NextGen Software', 'SmartTech', 'FutureTech', 'TechPioneer', 'CyberTech',
  'CodeCraft', 'ByteForce', 'TechFlow', 'DataFlow', 'CloudSync', 'TechHub',
  'DigitalEdge', 'TechSphere', 'DataVault', 'CloudTech', 'InnovateNow',
  'TechGenius', 'SmartSolutions', 'DigitalPro', 'TechMasters', 'DataPro',
  'CloudExperts', 'TechElite', 'DigitalCraft', 'CodeMasters'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
  'Seattle', 'Denver', 'Washington', 'Boston', 'Nashville', 'Baltimore',
  'Miami', 'Detroit', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Milwaukee'
];

const states = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL',
  'TX', 'OH', 'NC', 'CA', 'IN', 'WA', 'CO', 'DC', 'MA', 'TN', 'MD',
  'FL', 'MI', 'OR', 'NV', 'TN', 'KY', 'WI'
];

const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];

// Helper function to get random element from array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to generate random number between min and max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random phone number
const generatePhoneNumber = () => {
  return `+1${getRandomNumber(100, 999)}${getRandomNumber(100, 999)}${getRandomNumber(1000, 9999)}`;
};

// Helper function to generate random email
const generateEmail = (firstName, lastName, company) => {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.com'];
  const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domain = Math.random() > 0.3 ? getRandomElement(domains) : `${cleanCompany}.com`;
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

// Helper function to generate random date in the last 6 months
const generateRandomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

// Generate leads data
const generateLeads = (userId, count = 120) => {
  const leads = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const company = getRandomElement(companies);
    
    let email;
    do {
      email = generateEmail(firstName, lastName, company);
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const cityIndex = getRandomNumber(0, cities.length - 1);
    const status = getRandomElement(statuses);
    const isQualified = status === 'qualified' || status === 'won' || Math.random() > 0.7;
    
    leads.push({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: generatePhoneNumber(),
      company: company,
      city: cities[cityIndex],
      state: states[cityIndex],
      source: getRandomElement(sources),
      status: status,
      score: getRandomNumber(0, 100),
      lead_value: Math.round(getRandomNumber(500, 50000) * 100) / 100, // Round to 2 decimal places
      last_activity_at: status !== 'new' ? generateRandomDate() : null,
      is_qualified: isQualified,
      user: userId,
      created_at: generateRandomDate()
    });
  }

  return leads;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmanagement', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await Lead.deleteMany({});
    await User.deleteMany({});

    // Create test user
    console.log('👤 Creating test user...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'password123', // Will be hashed automatically
      firstName: 'Test',
      lastName: 'User'
    });
    await testUser.save();
    console.log('✅ Test user created:', {
      email: testUser.email,
      id: testUser._id
    });

    // Generate and insert leads
    console.log('📊 Generating leads...');
    const leads = generateLeads(testUser._id, 120);
    
    console.log('💾 Inserting leads into database...');
    await Lead.insertMany(leads);
    
    console.log('✅ Successfully seeded database with:');
    console.log(`   - 1 test user (${testUser.email})`);
    console.log(`   - ${leads.length} leads`);
    
    // Display some statistics
    const stats = await Lead.aggregate([
      { $match: { user: testUser._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📈 Lead statistics by status:');
    stats.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} leads`);
    });

    // Test user credentials for reference
    console.log('\n🔑 Test User Credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    
    console.log('\n🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, generateLeads };