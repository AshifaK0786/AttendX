const Salary = require('../models/Salary');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const XLSX = require('xlsx');
const path = require('path');

// Calculate and save salary for all employees for a given month
const calculateMonthlySalary = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    // Get all employees
    const employees = await User.find({ role: 'employee' });

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const nextYear =
      parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const results = [];

    for (const employee of employees) {
      try {
        // Get attendance records for the month
        const attendanceRecords = await Attendance.find({
          employee_id: employee.employee_id,
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        });

        // Calculate statistics
        const presentDays = attendanceRecords.filter(
          (a) => a.status === 'Present'
        ).length;
        const absentDays = attendanceRecords.filter(
          (a) => a.status === 'Absent'
        ).length;
        const lateDays = attendanceRecords.filter(
          (a) => a.status === 'Late'
        ).length;
        const halfDays = attendanceRecords.filter(
          (a) => a.status === 'Half Day'
        ).length;
        const totalWorkingDays = attendanceRecords.length;

        // Get existing salary record for updates
        const existingSalary = await Salary.findOne({
          employee_id: employee.employee_id,
          month,
          year,
        });

        // Use existing values or defaults
        const overtimeHours = existingSalary?.overtimeHours || 0;
        const overtimeRate = existingSalary?.overtimeRate || 0;
        const bonus = existingSalary?.bonus || 0;
        const penalties = existingSalary?.penalties || 0;
        const advanceDeduction = existingSalary?.advanceDeduction || 0;

        // Calculate salaries
        const baseSalary = presentDays * employee.salaryPerDay;
        const halfDaySalary = halfDays * 0.5 * employee.salaryPerDay;
        const overtimeSalary = overtimeHours * overtimeRate;
        const grossSalary = baseSalary + halfDaySalary + overtimeSalary;

        // Get insurance deduction
        const LICPolicy = require('../models/LICPolicy');
        const licPolicy = await LICPolicy.findOne({
          employee_id: employee.employee_id,
        });
        const insuranceDeduction = licPolicy ? licPolicy.premiumAmount : 0;

        // Calculate total deductions and net salary
        const totalDeductions = insuranceDeduction + penalties + advanceDeduction;
        const netSalary = grossSalary + bonus - totalDeductions;

        // Create or update salary record
        const salaryData = {
          employee_id: employee.employee_id,
          month,
          year,
          salaryPerDay: employee.salaryPerDay,
          overtimeRate,
          totalWorkingDays,
          presentDays,
          absentDays,
          lateDays,
          halfDays,
          overtimeHours,
          baseSalary,
          halfDaySalary,
          overtimeSalary,
          grossSalary,
          bonus,
          penalties,
          advanceDeduction,
          insuranceDeduction,
          totalDeductions,
          netSalary,
        };

        if (existingSalary) {
          await Salary.updateOne(
            { _id: existingSalary._id },
            salaryData
          );
        } else {
          await Salary.create(salaryData);
        }

        results.push({
          employee_id: employee.employee_id,
          name: employee.name,
          status: 'success',
          netSalary,
        });
      } catch (error) {
        results.push({
          employee_id: employee.employee_id,
          status: 'error',
          message: error.message,
        });
      }
    }

    res.json({
      message: 'Salary calculated successfully',
      month,
      year,
      employeesProcessed: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get salary for a specific employee (employee can view own, admin can view any)
const getEmployeeSalary = async (req, res) => {
  try {
    // If admin, they can pass employeeId; otherwise use authenticated user's employee_id
    let targetEmployeeId = req.query.employeeId || req.user?.employee_id;

    if (!targetEmployeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Non-admin users can only view their own salary
    if (req.user?.role !== 'admin' && req.user?.employee_id !== targetEmployeeId) {
      return res.status(403).json({ message: 'You can only view your own salary' });
    }

    const { month, year } = req.query;

    let query = { employee_id: targetEmployeeId };

    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    const salary = await Salary.find(query).sort({ year: -1, month: -1 });
    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all salaries for a specific month
const getMonthlySalaries = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const salaries = await Salary.find({
      month: parseInt(month),
      year: parseInt(year),
    }).sort({ employee_id: 1 });

    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate consolidated Excel report with all details
const generateSalaryReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Get all salaries for the month
    const salaries = await Salary.find({
      month: parseInt(month),
      year: parseInt(year),
    });

    // Get employee details with LIC policies
    const LICPolicy = require('../models/LICPolicy');
    const employeeIds = salaries.map((s) => s.employee_id);
    const employees = await User.find({ employee_id: { $in: employeeIds } });
    const licPolicies = await LICPolicy.find({ employee_id: { $in: employeeIds } });

    // Create map of LIC policies by employee_id
    const licMap = {};
    licPolicies.forEach((policy) => {
      licMap[policy.employee_id] = policy;
    });

    // Create map of employee names by employee_id
    const employeeMap = {};
    employees.forEach((emp) => {
      employeeMap[emp.employee_id] = emp;
    });

    // Prepare report data
    const reportData = salaries.map((salary) => {
      const employee = employeeMap[salary.employee_id] || {};
      const lic = licMap[salary.employee_id] || {};

      return {
        'Employee Name': employee.name || '',
        'Employee ID': salary.employee_id,
        'Salary Per Day': salary.salaryPerDay,
        'Total Working Days': salary.totalWorkingDays,
        'Present Days': salary.presentDays,
        'Absent Days': salary.absentDays,
        'Late Days': salary.lateDays,
        'Half Days': salary.halfDays,
        'Overtime Hours': salary.overtimeHours,
        'Base Salary': salary.baseSalary,
        'Half Day Salary': salary.halfDaySalary,
        'Overtime Salary': salary.overtimeSalary,
        'Gross Salary': salary.grossSalary,
        'Bonus': salary.bonus,
        'Insurance Deduction': salary.insuranceDeduction,
        'Penalties': salary.penalties,
        'Advance Deduction': salary.advanceDeduction,
        'Total Deductions': salary.totalDeductions,
        'Net Salary': salary.netSalary,
        'LIC Policy Number': lic.policyNumber || 'N/A',
        'LIC Policy Name': lic.policyName || 'N/A',
        'LIC Premium Amount': lic.premiumAmount || 'N/A',
        'LIC Coverage Amount': lic.coverageAmount || 'N/A',
        'LIC Status': lic.status || 'N/A',
      };
    });

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    const columnWidths = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Report');

    // Generate filename
    const filename = `Salary_Report_${month}-${year}.xlsx`;
    const filepath = path.join(__dirname, '../../uploads', filename);

    // Write file
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Optionally delete file after download
      // fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateMonthlySalary,
  getEmployeeSalary,
  getMonthlySalaries,
  generateSalaryReport,
};
