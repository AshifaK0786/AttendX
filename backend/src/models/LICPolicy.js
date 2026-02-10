const mongoose = require('mongoose');

const licPolicySchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true,
  },
  policyNumber: {
    type: String,
    required: true,
    unique: true,
  },
  policyName: {
    type: String,
    required: true,
  },
  premiumAmount: {
    type: Number,
    required: true,
  },
  premiumFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'],
    default: 'Monthly',
  },
  coverageAmount: {
    type: Number,
    required: true,
  },
  policyStartDate: {
    type: Date,
    required: true,
  },
  policyEndDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired', 'Cancelled'],
    default: 'Active',
  },
  providerName: {
    type: String,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('LICPolicy', licPolicySchema);
