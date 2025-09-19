const mongoose = require('mongoose');
require('dotenv').config();

async function resetUserPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leadmanagement');
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');

    // Reset password for the main user account
    const mainUserEmail = 'test@example.com';
    const newPassword = 'password123';

    console.log(`🔄 Resetting password for ${mainUserEmail}...`);

    const user = await User.findOne({ email: mainUserEmail });
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('👤 Found user:', {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Set new password (this will automatically hash it due to the pre-save middleware)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('🔑 New login credentials:');
    console.log(`   Email: ${mainUserEmail}`);
    console.log(`   Password: ${newPassword}`);

    // Also reset the second user password for completeness
    const secondUserEmail = 'test1758256134961@example.com';
    const secondUser = await User.findOne({ email: secondUserEmail });
    
    if (secondUser) {
      secondUser.password = newPassword;
      await secondUser.save();
      console.log(`✅ Also reset password for ${secondUserEmail}`);
    }

    console.log('\n🎉 Password reset completed! You can now log in with:');
    console.log(`📧 Email: ${mainUserEmail}`);
    console.log(`🔑 Password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

resetUserPassword();