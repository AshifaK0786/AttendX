const LICPolicy = require('../models/LICPolicy');
const User = require('../models/User');

// Assign LIC policy to an employee
const assignLICPolicy = async (req, res) => {
  try {
    const { employee_id, policyNumber, policyName, premiumAmount, premiumFrequency, coverageAmount, policyStartDate, policyEndDate, status, providerName, notes } = req.body;

    if (!employee_id || !policyNumber || !policyName || !premiumAmount || !coverageAmount || !policyStartDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if employee exists
    const employee = await User.findOne({ employee_id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if policy already exists for this employee
    const existingPolicy = await LICPolicy.findOne({ employee_id });
    if (existingPolicy) {
      return res.status(400).json({ message: 'Employee already has an LIC policy assigned' });
    }

    // Create new policy
    const licPolicy = new LICPolicy({
      employee_id,
      policyNumber,
      policyName,
      premiumAmount,
      premiumFrequency,
      coverageAmount,
      policyStartDate,
      policyEndDate,
      status,
      providerName,
      notes,
    });

    await licPolicy.save();

    res.status(201).json({
      message: 'LIC policy assigned successfully',
      policy: licPolicy,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Policy number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get LIC policy for an employee (employee can view own, admin can view any)
const getEmployeeLICPolicy = async (req, res) => {
  try {
    // If called with :employeeId param (admin access), use that; otherwise use authenticated user
    let targetEmployeeId = req.params.employeeId || req.user?.employee_id;

    if (!targetEmployeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Non-admin users can only view their own policy
    if (req.user?.role !== 'admin' && req.user?.employee_id !== targetEmployeeId) {
      return res.status(403).json({ message: 'You can only view your own policy' });
    }

    const policy = await LICPolicy.findOne({ employee_id: targetEmployeeId });
    if (!policy) {
      return res.status(404).json({ message: 'No LIC policy found for this employee' });
    }

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all LIC policies
const getAllLICPolicies = async (req, res) => {
  try {
    const policies = await LICPolicy.find().sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update LIC policy
const updateLICPolicy = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { policyNumber, policyName, premiumAmount, premiumFrequency, coverageAmount, policyStartDate, policyEndDate, status, providerName, notes } = req.body;

    const policy = await LICPolicy.findOne({ employee_id: employeeId });
    if (!policy) {
      return res.status(404).json({ message: 'LIC policy not found' });
    }

    // Update fields
    if (policyNumber) policy.policyNumber = policyNumber;
    if (policyName) policy.policyName = policyName;
    if (premiumAmount !== undefined) policy.premiumAmount = premiumAmount;
    if (premiumFrequency) policy.premiumFrequency = premiumFrequency;
    if (coverageAmount !== undefined) policy.coverageAmount = coverageAmount;
    if (policyStartDate) policy.policyStartDate = policyStartDate;
    if (policyEndDate !== undefined) policy.policyEndDate = policyEndDate;
    if (status) policy.status = status;
    if (providerName) policy.providerName = providerName;
    if (notes) policy.notes = notes;

    await policy.save();

    res.json({
      message: 'LIC policy updated successfully',
      policy,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Policy number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete LIC policy
const deleteLICPolicy = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const policy = await LICPolicy.findOneAndDelete({ employee_id: employeeId });
    if (!policy) {
      return res.status(404).json({ message: 'LIC policy not found' });
    }

    res.json({ message: 'LIC policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignLICPolicy,
  getEmployeeLICPolicy,
  getAllLICPolicies,
  updateLICPolicy,
  deleteLICPolicy,
};
