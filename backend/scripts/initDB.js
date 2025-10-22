const mongoose = require('mongoose');
const Department = require('../models/department');
require('dotenv').config();

const initDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    const departments = [
      { name: 'Engineering' },
      { name: 'HR' },
      { name: 'Marketing' },
      { name: 'Sales' },
      { name: 'Finance' }
    ];

    for (const dept of departments) {
      await Department.findOneAndUpdate(
        { name: dept.name },
        dept,
        { upsert: true, new: true }
      );
    }

    console.log('Departments initialized successfully');

    await mongoose.connection.close();
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDB();
