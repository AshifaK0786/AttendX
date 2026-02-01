const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadAttendanceSheet,
  getTodayAttendance,
  getAttendanceByDateRange,
  getMonthlyAttendance,
  getEmployeeAttendance,
  getAllAttendance,
} = require('../controllers/attendanceController');
const { auth, adminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!require('fs').existsSync(uploadsDir)) {
      require('fs').mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls' && ext !== '.csv') {
      return cb(new Error('Only Excel and CSV files are allowed'));
    }
    cb(null, true);
  },
});

// Routes
router.post('/upload', auth, adminAuth, upload.single('file'), uploadAttendanceSheet);
router.get('/today', auth, getTodayAttendance);
router.get('/by-date-range', auth, getAttendanceByDateRange);
router.get('/monthly', auth, getMonthlyAttendance);
router.get('/employee/:employeeId', auth, adminAuth, getEmployeeAttendance);
router.get('/all', auth, adminAuth, getAllAttendance);

module.exports = router;
