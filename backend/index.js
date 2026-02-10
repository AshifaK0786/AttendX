const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
const authRoutes = require('./src/routes/authRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const salaryRoutes = require('./src/routes/salaryRoutes');
const licPolicyRoutes = require('./src/routes/licPolicyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/lic-policy', licPolicyRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Employee Attendance System API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📱 Available at: http://0.0.0.0:${PORT}`);
  console.log(`🤖 For Android Emulator: http://10.0.2.2:${PORT}`);
  console.log(`💻 For local machine: http://localhost:${PORT}`);
});
