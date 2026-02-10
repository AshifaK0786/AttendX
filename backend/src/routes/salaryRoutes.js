const express = require('express');
const { calculateMonthlySalary, getEmployeeSalary, getMonthlySalaries, generateSalaryReport } = require('../controllers/salaryController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Employee routes - for employees to view their own salary
router.get('/employee', auth, getEmployeeSalary);

// Admin routes - require authentication and admin role
router.use(auth, adminAuth);

// Calculate monthly salary for all employees
router.post('/calculate', calculateMonthlySalary);

// Get all salaries for a specific month
router.get('/monthly', getMonthlySalaries);

// Generate Excel report
router.get('/report', generateSalaryReport);

module.exports = router;
