const express = require('express');
const { assignLICPolicy, getEmployeeLICPolicy, getAllLICPolicies, updateLICPolicy, deleteLICPolicy } = require('../controllers/licPolicyController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Employee routes - for employees to view their own policy
router.get('/employee', auth, getEmployeeLICPolicy);

// Admin routes - require authentication and admin role
router.use(auth, adminAuth);

// Assign LIC policy
router.post('/', assignLICPolicy);

// Get employee's LIC policy (admin access)
router.get('/admin/:employeeId', getEmployeeLICPolicy);

// Get all LIC policies
router.get('/', getAllLICPolicies);

// Update LIC policy
router.put('/:employeeId', updateLICPolicy);

// Delete LIC policy
router.delete('/:employeeId', deleteLICPolicy);

module.exports = router;
