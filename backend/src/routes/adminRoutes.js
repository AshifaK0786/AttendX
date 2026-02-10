const express = require('express');
const {
  getAllEmployees,
  getAllAttendanceRecords,
  updateAttendanceRecord,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  markAttendance,
  configureSalary,
  getEmployeeSalaryDetails,
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public endpoint to get employee list (for home screen)
router.get('/employees/public', getAllEmployees);

// All admin routes require authentication and admin role
router.use(auth, adminAuth);

// Employee management
router.get('/employees', getAllEmployees);
router.post('/employees', addEmployee);
router.put('/employees/:employeeId', updateEmployee);
router.delete('/employees/:employeeId', deleteEmployee);

// Attendance records
router.get('/attendance', getAllAttendanceRecords);
router.post('/attendance', markAttendance);
router.put('/attendance/:id', updateAttendanceRecord);

// Salary configuration & details
router.post('/salary/configure/:employeeId', configureSalary);
router.get('/salary/:employeeId', getEmployeeSalaryDetails);

module.exports = router;

