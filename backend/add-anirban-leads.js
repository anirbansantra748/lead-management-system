const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Lead = require('./models/Lead');

// Sample data arrays
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'William', 'Jennifer',
  'James', 'Mary', 'Christopher', 'Patricia', 'Daniel', 'Linda', 'Matthew', 'Elizabeth', 'Anthony', 'Barbara',
  'Mark', 'Susan', 'Donald', 'Jessica', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Amy',
  'Joshua', 'Donna', 'Kenneth', 'Carol', 'Kevin', 'Ruth', 'Brian', 'Sharon', 'George', 'Michelle',
  'Edward', 'Laura', 'Ronald', 'Sarah', 'Timothy', 'Kimberly', 'Jason', 'Deborah', 'Jeffrey', 'Dorothy',
  'Ryan', 'Helen', 'Jacob', 'Sandra', 'Gary', 'Donna', 'Nicholas', 'Carol', 'Eric', 'Lisa'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const companies = [
  'TechCorp', 'DataFlow Inc', 'CloudVision', 'InnovateTech', 'DigitalSolutions', 'SmartTech',
  'TechPioneer', 'DataSystems', 'CloudExperts', 'TechElite', 'NextGen Software', 'TechFlow',
  'DataVault', 'TechGenius', 'DigitalCraft', 'TechMasters', 'DataStream', 'CloudSync',
  'TechNova', 'InnovateLab', 'DigitalEdge', 'TechSphere', 'DataBridge', 'CloudTech',
  'TechVision', 'DataCorp', 'DigitalWave', 'TechSolutions', 'InnovateNow', 'SmartData'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
  'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas',
  'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
  'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Colorado Springs', 'Raleigh'
];

const states = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'TX', 'OH',
  'NC', 'CA', 'IN', 'WA', 'CO', 'DC', 'MA', 'TX', 'TN', 'MI', 'OK', 'OR', 'NV',
  'TN', 'KY', 'MD', 'WI', 'NM', 'AZ', 'CA', 'CA', 'MO', 'AZ', 'GA', 'NE', 'CO', 'NC'
];

const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.org'];
  const emailTypes = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${getRandomNumber(1, 999)}`,
    `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`
  ];
  
  return `${getRandomElement(emailTypes)}@${getRandomElement(domains)}`;
}

function generatePhone() {
  const areaCodes = ['212', '415', '312', '713', '602', '215', '210', '619', '214', '408'];
  const areaCode = getRandomElement(areaCodes);
  const exchange = getRandomNumber(200, 999);
  const number = getRandomNumber(1000, 9999);
  return `+1${areaCode}${exchange}${number}`;
}

async function addLeadsForAnirban() {
  try {
    console.log('🚀 Starting to add 100 leads for Anirban...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmanagement');
    console.log('✅ Connected to MongoDB');

    // Find Anirban's user account
    let user = await User.findOne({ email: 'anirbansantra748@gmail.com' });
    
    if (!user) {
      console.log('❌ User anirbansantra748@gmail.com not found!');
      console.log('🔧 Creating user account...');
      
      // Create the user account
      const hashedPassword = await bcrypt.hash('1p3456', 12);
      const newUser = new User({
        firstName: 'Anirban',
        lastName: 'Santra',
        email: 'anirbansantra748@gmail.com',
        password: hashedPassword
      });
      
      user = await newUser.save();
      console.log('✅ User account created:', user.email);
    } else {
      console.log('✅ Found user:', user.email);
    }

    // Check existing leads count
    const existingLeadsCount = await Lead.countDocuments({ user: user._id });
    console.log(`📊 Current leads count for ${user.email}: ${existingLeadsCount}`);

    // Generate 100 new leads
    const leadsToCreate = [];
    const usedEmails = new Set();

    for (let i = 0; i < 100; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      let email;
      
      // Ensure unique emails
      do {
        email = generateEmail(firstName, lastName);
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const lead = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: generatePhone(),
        company: getRandomElement(companies),
        city: getRandomElement(cities),
        state: getRandomElement(states),
        source: getRandomElement(sources),
        status: getRandomElement(statuses),
        score: getRandomNumber(0, 100),
        lead_value: getRandomFloat(1000, 50000),
        is_qualified: Math.random() > 0.6, // 40% qualified
        user: user._id,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random dates within last 30 days
        updated_at: new Date()
      };

      // Sometimes add last_activity_at
      if (Math.random() > 0.3) {
        lead.last_activity_at = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Within last 7 days
      }

      leadsToCreate.push(lead);
    }

    // Batch insert leads
    console.log('💾 Inserting 100 leads...');
    const insertedLeads = await Lead.insertMany(leadsToCreate);
    console.log(`✅ Successfully inserted ${insertedLeads.length} leads!`);

    // Show summary
    const totalLeads = await Lead.countDocuments({ user: user._id });
    const leadsByStatus = await Lead.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const leadsBySource = await Lead.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 SUMMARY:');
    console.log(`👤 User: ${user.email}`);
    console.log(`📈 Total Leads: ${totalLeads}`);
    console.log(`🆕 Just Added: ${insertedLeads.length}`);
    
    console.log('\n📋 Leads by Status:');
    leadsByStatus.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n🎯 Leads by Source:');
    leadsBySource.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n🎉 All done! You can now login with:');
    console.log('   Email: anirbansantra748@gmail.com');
    console.log('   Password: 1p3456');
    console.log(`   And see ${totalLeads} leads in your dashboard!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
}

// Run the script
addLeadsForAnirban();