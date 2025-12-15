// Fix Database - Run this to clean old indexes
const mongoose = require('mongoose');

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sanskar');
    console.log('✅ Connected to MongoDB');

    // Drop the entire database (fresh start)
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped - fresh start!');

    console.log('\n🎉 Database cleaned successfully!');
    console.log('Now run: npm run seed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixDatabase();
