import api from './api';

export const authService = {
  login: (employee_id: string, password: string) =>
    api.post('/auth/login', { employee_id, password }),

  register: (data: {
    employee_id: string;
    name: string;
    password: string;
    role?: 'admin' | 'employee';
  }) =>
    api.post('/auth/register', {
      employee_id: data.employee_id,
      name: data.name,
      password: data.password,
      role: data.role || 'employee',
    }),
};

export const attendanceService = {
  getTodayAttendance: () =>
    api.get('/attendance/today'),

  getAttendanceByDateRange: (startDate: string, endDate: string) =>
    api.get('/attendance/by-date-range', { params: { startDate, endDate } }),

  getMonthlyAttendance: (month: number, year: number) =>
    api.get('/attendance/monthly', { params: { month, year } }),
};

export const adminService = {
  uploadAttendanceSheet: (formData: FormData) =>
    api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAllEmployees: () =>
    api.get('/admin/employees'),

  getAllAttendanceRecords: (employeeId?: string, startDate?: string, endDate?: string) =>
    api.get('/admin/attendance', { params: { employeeId, startDate, endDate } }),

  addEmployee: (employee_id: string, name: string, password: string) =>
    api.post('/admin/employees', { employee_id, name, password }),

  updateEmployee: (employeeId: string, name: string, password?: string) =>
    api.put(`/admin/employees/${employeeId}`, { name, password }),

  deleteEmployee: (employeeId: string) =>
    api.delete(`/admin/employees/${employeeId}`),
};
