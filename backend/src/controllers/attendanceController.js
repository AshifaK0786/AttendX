const Attendance = require('../models/Attendance');
const User = require('../models/User');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

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

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each row
    for (const row of data) {
      try {
        // Ensure employee_id exists
        if (!row['Employee ID'] || !row['Date']) {
          errorCount++;
          results.push({
            row: row,
            status: 'error',
            message: 'Missing Employee ID or Date',
          });
          continue;
        }

        // Format date to YYYY-MM-DD
        let dateStr = row['Date'];
        if (typeof dateStr === 'number') {
          // Excel date number
          const excelDate = new Date((dateStr - 25569) * 86400 * 1000);
          dateStr = excelDate.toISOString().split('T')[0];
        } else if (typeof dateStr === 'string') {
          // Try to parse string date
          const parsed = new Date(dateStr);
          if (!isNaN(parsed)) {
            dateStr = parsed.toISOString().split('T')[0];
          }
        }

        const attendanceRecord = {
          employee_id: String(row['Employee ID']).trim(),
          name: row['Name'] || '',
          date: dateStr,
          in_time: row['In Time'] || '',
          out_time: row['Out Time'] || '',
          status: row['Status'] || 'Present',
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
  getEmployeeAttendance,
  getAllAttendance,
};
