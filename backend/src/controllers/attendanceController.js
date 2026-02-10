const Attendance = require('../models/Attendance');
const User = require('../models/User');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const HEADER_ALIASES = {
  employeeId: ['Employee ID', 'Employee Id', 'Emp ID', 'Emp Id'],
  employeeName: ['Employee Name', 'Name', 'Employee'],
  date: ['Date', 'Attendance Date'],
  inTime: ['In Time', 'InTime', 'Check In', 'In'],
  outTime: ['Out Time', 'OutTime', 'Check Out', 'Out'],
  status: ['Attendance Status', 'Status'],
};

const getRowValue = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return '';
};

const normalizeStatus = (value) => {
  if (!value) return '';
  const normalized = String(value).trim().toLowerCase();
  if (normalized.includes('present')) return 'Present';
  if (normalized.includes('absent')) return 'Absent';
  if (normalized.includes('incomplete') || normalized.includes('missing')) return 'Incomplete';
  if (normalized.includes('late')) return 'Late';
  if (normalized.includes('half')) return 'Half Day';
  return '';
};

const normalizeDate = (raw) => {
  if (!raw) return '';
  if (typeof raw === 'number') {
    const excelDate = new Date((raw - 25569) * 86400 * 1000);
    return excelDate.toISOString().split('T')[0];
  }

  const parsed = new Date(raw);
  if (!isNaN(parsed)) {
    return parsed.toISOString().split('T')[0];
  }

  return '';
};

// Upload and process attendance sheet
const uploadAttendanceSheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No data found in file' });
    }

    const firstRow = data[0] || {};
    const missingHeaders = [];

    if (!HEADER_ALIASES.employeeId.some((key) => key in firstRow)) {
      missingHeaders.push('Employee ID');
    }
    if (!HEADER_ALIASES.employeeName.some((key) => key in firstRow)) {
      missingHeaders.push('Employee Name');
    }
    if (!HEADER_ALIASES.date.some((key) => key in firstRow)) {
      missingHeaders.push('Date');
    }

    if (missingHeaders.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: 'Invalid sheet structure',
        missingHeaders,
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each row
    for (const row of data) {
      try {
        const employeeIdValue = getRowValue(row, HEADER_ALIASES.employeeId);
        const employeeNameValue = getRowValue(row, HEADER_ALIASES.employeeName);
        const dateValue = getRowValue(row, HEADER_ALIASES.date);
        const inTimeValue = getRowValue(row, HEADER_ALIASES.inTime);
        const outTimeValue = getRowValue(row, HEADER_ALIASES.outTime);
        const statusValue = getRowValue(row, HEADER_ALIASES.status);

        // Ensure required fields exist
        if (!employeeIdValue || !dateValue) {
          errorCount++;
          results.push({
            row: row,
            status: 'error',
            message: 'Missing Employee ID or Date',
          });
          continue;
        }

        // Validate Employee_ID exists in database
        const employeeExists = await User.findOne({ employee_id: String(employeeIdValue).trim() });
        if (!employeeExists) {
          errorCount++;
          results.push({
            employee_id: employeeIdValue,
            status: 'error',
            message: 'Employee ID not found in database - row ignored',
          });
          continue;
        }

        // Format date to YYYY-MM-DD
        const dateStr = normalizeDate(dateValue);
        if (!dateStr) {
          errorCount++;
          results.push({
            row: row,
            status: 'error',
            message: 'Invalid Date format',
          });
          continue;
        }

        const hasInTime = String(inTimeValue || '').trim() !== '';
        const hasOutTime = String(outTimeValue || '').trim() !== '';
        let status = normalizeStatus(statusValue);

        if (!status) {
          if (hasInTime && !hasOutTime) {
            status = 'Incomplete';
          } else if (!hasInTime && !hasOutTime) {
            status = 'Absent';
          } else {
            status = 'Present';
          }
        }

        if (hasInTime && !hasOutTime && status !== 'Absent') {
          status = 'Incomplete';
        }

        const attendanceRecord = {
          employee_id: String(employeeIdValue).trim(),
          name: employeeExists.name, // Use name from database, not from Excel
          date: dateStr,
          in_time: inTimeValue || '',
          out_time: outTimeValue || '',
          status,
        };

        // Upsert attendance record
        const existing = await Attendance.findOne({
          employee_id: attendanceRecord.employee_id,
          date: attendanceRecord.date,
        });

        if (existing) {
          await Attendance.updateOne(
            {
              employee_id: attendanceRecord.employee_id,
              date: attendanceRecord.date,
            },
            attendanceRecord
          );
        } else {
          await Attendance.create(attendanceRecord);
        }

        successCount++;
        results.push({
          employee_id: attendanceRecord.employee_id,
          status: 'success',
        });
      } catch (error) {
        errorCount++;
        results.push({
          row: row,
          status: 'error',
          message: error.message,
        });
      }
    }

    // Clean up file
    fs.unlinkSync(filePath);

    res.json({
      message: 'Sheet processed successfully',
      totalRecords: data.length,
      successCount,
      errorCount,
      details: results,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Get today's attendance for an employee
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
      employee_id: req.user.employee_id,
      date: today,
    });

    res.json({
      date: today,
      attendance: attendance || { status: 'Not Recorded' },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by date range
const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'startDate and endDate are required' });
    }

    const attendance = await Attendance.find({
      employee_id: req.user.employee_id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance for current employee
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee_id: req.user.employee_id,
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly attendance
const getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'month and year are required' });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const nextYear =
      parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const attendance = await Attendance.find({
      employee_id: req.user.employee_id,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      totalDays: attendance.length,
      present: attendance.filter((a) => a.status === 'Present').length,
      absent: attendance.filter((a) => a.status === 'Absent').length,
      late: attendance.filter((a) => a.status === 'Late').length,
      halfDay: attendance.filter((a) => a.status === 'Half Day').length,
    };

    res.json({ month, year, attendance, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee attendance (for admin)
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const attendance = await Attendance.find({ employee_id: employeeId }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all attendance (for admin)
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadAttendanceSheet,
  getTodayAttendance,
  getAttendanceByDateRange,
  getMonthlyAttendance,
  getMyAttendance,
  getEmployeeAttendance,
  getAllAttendance,
};
