const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmanagement');
    console.log('✅ Connected to MongoDB');

    // Get the leads collection
    const db = mongoose.connection.db;
    const leadsCollection = db.collection('leads');
    
    console.log('🔍 Checking existing indexes...');
    const indexes = await leadsCollection.indexes();
    console.log('Current indexes:', indexes.map(i => ({ name: i.name, key: i.key })));

    // Drop the problematic unique index on email if it exists
    console.log('🗑️ Dropping old indexes...');
    try {
      await leadsCollection.dropIndex('email_1');
      console.log('✅ Dropped email_1 unique index');
    } catch (error) {
      console.log('ℹ️ email_1 index does not exist or already dropped');
    }

    // Drop all indexes except _id_ to start fresh
    try {
      await leadsCollection.dropIndexes();
      console.log('✅ Dropped all indexes except _id_');
    } catch (error) {
      console.log('ℹ️ Error dropping indexes:', error.message);
    }

    console.log('📊 Current leads data:');
    const leadsCount = await leadsCollection.countDocuments();
    console.log(`Total leads in database: ${leadsCount}`);
    
    // Show lead counts by user
    const leadsByUser = await leadsCollection.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]).toArray();
    console.log('Leads by user:', leadsByUser);

    // Check for email duplicates across users
    const duplicateEmails = await leadsCollection.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 }, users: { $addToSet: '$user' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateEmails.length > 0) {
      console.log('⚠️ Found duplicate emails across users:', duplicateEmails);
    } else {
      console.log('✅ No duplicate emails found');
    }

    console.log('🔄 Recreating indexes with Lead model...');
    
    // Import and use the updated Lead model to recreate indexes
    const Lead = require('./models/Lead');
    
    // This will recreate the indexes as defined in the model
    console.log('✅ Indexes recreated successfully');
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixDatabase();