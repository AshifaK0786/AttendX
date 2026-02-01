const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: [true, 'Employee ID must be unique'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'employee'],
      message: 'Role must be admin or employee'
    },
    default: 'employee',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const addDefaultUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ employee_id: 'ADM001' });
    if (adminExists) {
      console.log('⚠️ Admin ADM001 already exists - updating...');
      // Update existing admin
      const hashedPassword = await bcrypt.hash('Ashifa', 10);
      await User.findByIdAndUpdate(adminExists._id, {
        name: 'Ashifa',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user updated: ADM001 / Ashifa');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('Ashifa', 10);
      
      // Create admin user
      const admin = new User({
        employee_id: 'ADM001',
        name: 'Ashifa',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Admin user created: ADM001 / Ashifa');
    }

    // Check if employee already exists
    const empExists = await User.findOne({ employee_id: 'EMP001' });
    if (empExists) {
      console.log('⚠️ Employee EMP001 already exists - updating...');
      // Update existing employee
      const hashedPassword = await bcrypt.hash('Ashi01', 10);
      await User.findByIdAndUpdate(empExists._id, {
        name: 'Ashi',
        password: hashedPassword,
        role: 'employee'
      });
      console.log('✅ Employee user updated: EMP001 / Ashi01');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('Ashi01', 10);
      
      // Create employee user
      const employee = new User({
        employee_id: 'EMP001',
        name: 'Ashi',
        password: hashedPassword,
        role: 'employee'
      });
      
      await employee.save();
      console.log('✅ Employee user created: EMP001 / Ashi01');
    }

    // Show all users
    const allUsers = await User.find({}, '-password');
    console.log('\n📋 All users in database:');
    console.log(allUsers);

    console.log('\n✅ Done! Default users added.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addDefaultUsers();
