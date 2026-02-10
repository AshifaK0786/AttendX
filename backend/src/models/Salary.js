const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  salaryPerDay: {
    type: Number,
    required: true,
  },
  overtimeRate: {
    type: Number,
    default: 0, // per hour
  },
  totalWorkingDays: {
    type: Number,
    default: 0,
  },
  presentDays: {
    type: Number,
    default: 0,
  },
  absentDays: {
    type: Number,
    default: 0,
  },
  lateDays: {
    type: Number,
    default: 0,
  },
  halfDays: {
    type: Number,
    default: 0,
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
  baseSalary: {
    type: Number,
    default: 0,
  },
  halfDaySalary: {
    type: Number,
    default: 0,
  },
  overtimeSalary: {
    type: Number,
    default: 0,
  },
  grossSalary: {
    type: Number,
    default: 0,
  },
  bonus: {
    type: Number,
    default: 0,
  },
  penalties: {
    type: Number,
    default: 0,
  },
  advanceDeduction: {
    type: Number,
    default: 0,
  },
  insuranceDeduction: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

// Index for unique salary record per employee per month
salarySchema.index({ employee_id: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
