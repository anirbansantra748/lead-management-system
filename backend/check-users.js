const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmanagement');
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    const Lead = require('./models/Lead');

    // Get all users
    console.log('\n👥 All users in system:');
    const users = await User.find({}, { password: 0 }).lean();
    for (const user of users) {
      const leadCount = await Lead.countDocuments({ user: user._id });
      console.log(`   📋 ${user.firstName} ${user.lastName} (${user.email}) - ${leadCount} leads`);
      console.log(`       User ID: ${user._id}`);
      console.log(`       Created: ${new Date(user.createdAt).toLocaleString()}`);
    }

    // Show some sample leads for each user
    console.log('\n📊 Sample leads by user:');
    for (const user of users) {
      const leads = await Lead.find({ user: user._id }).limit(3).lean();
      console.log(`\n   User: ${user.firstName} ${user.lastName} (${leads.length > 0 ? leads.length : 'no'} leads shown)`);
      leads.forEach((lead, index) => {
        console.log(`     ${index + 1}. ${lead.first_name} ${lead.last_name} - ${lead.email} (${lead.status})`);
      });
    }

    console.log('\n🔍 Most recent user activity:');
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(3).lean();
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} (${new Date(user.createdAt).toLocaleString()})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

checkUsers();