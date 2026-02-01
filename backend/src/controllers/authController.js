const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    const { employee_id, password } = req.body;
    const user = await User.findOne({ employee_id });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: user._id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// For initial setup, we might need a way to create an admin
const register = async (req, res) => {
  try {
    const { employee_id, name, password, role } = req.body;
    
    console.log('📝 Registration attempt:', { employee_id, name, role });
    
    // Validation
    if (!employee_id || !name || !password) {
      return res.status(400).json({ 
        error: 'employee_id, name, and password are required',
        message: 'Please fill in all required fields'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters',
        message: 'Password too short'
      });
    }

    // Check if employee already exists
    const existingUser = await User.findOne({ employee_id });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Employee ID already exists',
        message: `Employee with ID ${employee_id} already registered`
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('👤 Creating new user...');
    const user = new User({ 
      employee_id, 
      name, 
      password: hashedPassword,  // Store hashed password
      role 
    });
    
    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully!');
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      error: error.message,
      message: error.message || 'Failed to create account'
    });
  }
};

module.exports = { login, register };
