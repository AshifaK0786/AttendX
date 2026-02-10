const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth middleware - Authorization header:', authHeader ? 'present' : 'missing');
    
    if (!authHeader) {
      console.log('❌ No Authorization header found');
      return res.status(401).send({ error: 'Please authenticate.' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted, verifying...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.id);
    
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      console.log('❌ User not found in database');
      throw new Error('User not found');
    }

    console.log('✅ User found:', user.employee_id);
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = { auth, adminAuth };
