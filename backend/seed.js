const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

// Import the Lead model
const Lead = require('./models/Lead');

// Your test user ObjectId
const TEST_USER_ID = "68ccfd32aee2e787aeb08e63";

// Enum values for randomization
const SOURCES = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const STATUSES = ['new', 'contacted', 'qualified', 'lost', 'won'];

// Helper function to get random enum value
function getRandomEnum(enumArray) {
  return enumArray[Math.floor(Math.random() * enumArray.length)];
}

// Helper function to get random number in range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random float with decimals
function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Helper function to get random recent date or null for last_activity_at
function getRandomActivityDate() {
  // 30% chance of null, 70% chance of recent date (within last 14 days)
  if (Math.random() < 0.3) {
    return null;
  }
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 14); // 0-14 days ago
  const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
  const minutesAgo = Math.floor(Math.random() * 60); // 0-60 minutes ago
  
  const activityDate = new Date(now);
  activityDate.setDate(activityDate.getDate() - daysAgo);
  activityDate.setHours(activityDate.getHours() - hoursAgo);
  activityDate.setMinutes(activityDate.getMinutes() - minutesAgo);
  
  return activityDate;
}

// Function to generate a single lead
function generateLead() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    first_name: firstName,
    last_name: lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    company: faker.company.name(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: false }),
    source: getRandomEnum(SOURCES),
    status: getRandomEnum(STATUSES),
    score: getRandomNumber(0, 100),
    lead_value: getRandomFloat(1000, 75000),
    last_activity_at: getRandomActivityDate(),
    is_qualified: Math.random() > 0.4, // 60% chance of being qualified
    user: new mongoose.Types.ObjectId(TEST_USER_ID),
    created_at: new Date(),
    updated_at: new Date()
  };
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding process...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI or MONGO_URI environment variable is required');
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');
    
    // Check if user exists (optional verification)
    console.log(`🔍 Verifying user ID: ${TEST_USER_ID}`);
    
    // Generate 100 leads
    console.log('📊 Generating 100 fake leads...');
    const leadsToInsert = [];
    
    for (let i = 0; i < 100; i++) {
      leadsToInsert.push(generateLead());
    }
    
    console.log('💾 Inserting leads into database...');
    
    // Insert all leads at once
    const insertedLeads = await Lead.insertMany(leadsToInsert);
    
    console.log(`✅ Successfully inserted ${insertedLeads.length} leads!`);
    
    // Show some statistics
    const totalLeadsForUser = await Lead.countDocuments({ user: TEST_USER_ID });
    
    // Get statistics by status
    const statusStats = await Lead.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(TEST_USER_ID) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get statistics by source
    const sourceStats = await Lead.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(TEST_USER_ID) } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get qualified vs non-qualified count
    const qualifiedStats = await Lead.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(TEST_USER_ID) } },
      { $group: { _id: '$is_qualified', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 SEEDING SUMMARY:');
    console.log('='.repeat(50));
    console.log(`👤 User ID: ${TEST_USER_ID}`);
    console.log(`📊 Total leads for this user: ${totalLeadsForUser}`);
    console.log(`🆕 Just added: ${insertedLeads.length} leads`);
    
    console.log('\n📋 Distribution by Status:');
    statusStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} leads`);
    });
    
    console.log('\n🎯 Distribution by Source:');
    sourceStats.forEach(stat => {
      const displayName = stat._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`   ${displayName}: ${stat.count} leads`);
    });
    
    console.log('\n✅ Qualified Status:');
    qualifiedStats.forEach(stat => {
      const status = stat._id ? 'Qualified' : 'Not Qualified';
      console.log(`   ${status}: ${stat.count} leads`);
    });
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('💡 You can now use your application with realistic test data.');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    if (error.name === 'ValidationError') {
      console.error('📝 Validation details:', error.errors);
    }
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
    process.exit(0);
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⚠️ Received SIGINT, closing database connection...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Received SIGTERM, closing database connection...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the seeding function
console.log('🌱 Lead Management System - Database Seeder');
console.log('==========================================');
seedDatabase();