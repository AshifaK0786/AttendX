const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  date: {
    type: String, // Format: YYYY-MM-DD for easier filtering
    required: true,
  },
  in_time: {
    type: String,
  },
  out_time: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day'],
    default: 'Present',
  },
}, { timestamps: true });

// Index for faster queries
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
