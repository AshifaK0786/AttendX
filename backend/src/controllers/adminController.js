const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance records
const getAllAttendanceRecords = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    let query = {};

    if (employeeId) {
      query.employee_id = employeeId;
    } else {
      // Exclude admins from the list
      const admins = await User.find({ role: 'admin' }).select('employee_id');
      const adminIds = admins.map((a) => a.employee_id);
      query.employee_id = { $nin: adminIds };
    }

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark attendance manually
const markAttendance = async (req, res) => {
  try {
    const { employee_id, date, status, in_time, out_time } = req.body;

    if (!employee_id || !date || !status) {
      return res.status(400).json({
        message: 'employee_id, date, and status are required',
      });
    }

    // Verify employee exists
    const employee = await User.findOne({ employee_id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      employee_id,
      date,
    });

    const attendanceData = {
      employee_id,
      name: employee.name,
      date,
      status,
      in_time: in_time || '',
      out_time: out_time || '',
    };

    if (existingAttendance) {
      await Attendance.updateOne(
        { employee_id, date },
        attendanceData
      );
      return res.json({
        message: 'Attendance updated successfully',
        attendance: attendanceData,
      });
    }

    const attendance = await Attendance.create(attendanceData);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Configure salary for an employee
const configureSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { salaryPerDay, overtimeRate, bonus, penalties, advanceDeduction } = req.body;

    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee salary per day
    if (salaryPerDay !== undefined) {
      employee.salaryPerDay = salaryPerDay;
      await employee.save();
    }

    // Update current month's salary record (if exists)
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const salaryRecord = await Salary.findOne({
      employee_id: employee.employee_id,
      month,
      year,
    });

    if (salaryRecord) {
      if (overtimeRate !== undefined) salaryRecord.overtimeRate = overtimeRate;
      if (bonus !== undefined) salaryRecord.bonus = bonus;
      if (penalties !== undefined) salaryRecord.penalties = penalties;
      if (advanceDeduction !== undefined) salaryRecord.advanceDeduction = advanceDeduction;

      // Recalculate net salary
      salaryRecord.totalDeductions = 
        salaryRecord.insuranceDeduction + 
        salaryRecord.penalties + 
        salaryRecord.advanceDeduction;
      salaryRecord.netSalary = 
        salaryRecord.grossSalary + 
        salaryRecord.bonus - 
        salaryRecord.totalDeductions;

      await salaryRecord.save();
    }

    res.json({
      message: 'Salary configured successfully',
      employee,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get salary details for an employee for a specific month
const getEmployeeSalaryDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const salary = await Salary.findOne({
      employee_id: employeeId,
      month: parseInt(month),
      year: parseInt(year),
    });

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or update employee
const addEmployee = async (req, res) => {
  try {
    const { employee_id, name, password } = req.body;

    if (!employee_id || !name || !password) {
      return res
        .status(400)
        .json({
          message: 'employee_id, name, and password are required',
        });
    }

    const existingEmployee = await User.findOne({ employee_id });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    const employee = new User({
      employee_id,
      name,
      password,
      role: 'employee',
    });

    await employee.save();

    res.status(201).json({
      message: 'Employee added successfully',
      employee: {
        id: employee._id,
        employee_id: employee.employee_id,
        name: employee.name,
        role: employee.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { name, password } = req.body;

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (name) employee.name = name;
    if (password) employee.password = password;

    await employee.save();

    res.json({
      message: 'Employee updated successfully',
      employee: {
        id: employee._id,
        employee_id: employee.employee_id,
        name: employee.name,
        role: employee.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await User.findByIdAndDelete(employeeId);

    if (!result) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance record
const updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, in_time, out_time, date } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (in_time !== undefined) attendance.in_time = in_time;
    if (out_time !== undefined) attendance.out_time = out_time;
    if (date) attendance.date = date;

    await attendance.save();

    res.json({
      message: 'Attendance record updated successfully',
      attendance,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getAllAttendanceRecords,
  markAttendance,
  configureSalary,
  getEmployeeSalaryDetails,
  updateAttendanceRecord,
  addEmployee,
  updateEmployee,
  deleteEmployee,
};
