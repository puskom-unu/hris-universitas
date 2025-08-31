import { D1DatabaseSettings, R2StorageSettings } from '../types';
import { API_BASE_URL } from '../config/api';
import {
  mockEmployees,
  mockPositionHistory,
  mockAttendance,
  mockLeaveRequests,
  mockPayslips,
  mockLeaveTypes,
  mockPositions,
  mockUnits,
} from '../data/mockData';
import {
  Employee,
  PositionHistory,
  AttendanceRecord,
  LeaveRequest,
  LeaveStatus,
  Payslip,
  LeaveType,
  Position,
  Unit,
} from '../types';

const jsonFetch = async (path: string, options: RequestInit = {}) => {
  const url = API_BASE_URL ? new URL(path, API_BASE_URL).toString() : path;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

export const getD1Settings = async (): Promise<Omit<D1DatabaseSettings, 'authToken'>> => {
  return jsonFetch('/api/settings/database');
};

export const saveD1Settings = async (settings: D1DatabaseSettings): Promise<{ message: string }> => {
  return jsonFetch('/api/settings/database', { method: 'POST', body: JSON.stringify(settings) });
};

export const testD1Connection = async (): Promise<{ success: boolean; message: string }> => {
  return jsonFetch('/api/settings/database/test', { method: 'POST' });
};

export const seedInitialDataToD1 = async (): Promise<{ success: boolean; message: string }> => {
  return jsonFetch('/api/database/seed', { method: 'POST' });
};

export const getR2Settings = async (): Promise<Omit<R2StorageSettings, 'accessKeyId' | 'secretAccessKey'>> => {
  return jsonFetch('/api/settings/storage');
};

export const saveR2Settings = async (settings: R2StorageSettings): Promise<{ message: string }> => {
  return jsonFetch('/api/settings/storage', { method: 'POST', body: JSON.stringify(settings) });
};

export const testR2Connection = async (): Promise<{ success: boolean; message: string }> => {
  return jsonFetch('/api/settings/storage/test', { method: 'POST' });
};

export const generatePresignedUrl = async (
  fileName: string,
  contentType: string
): Promise<{ success: boolean; uploadUrl?: string; finalUrl?: string; message: string }> => {
  return jsonFetch('/api/storage/generate-upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
};

export const uploadFileWithPresignedUrl = async (
  uploadUrl: string,
  file: File
): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) {
    return { success: false, message: 'File upload failed.' };
  }
  return { success: true, message: 'File berhasil diunggah.' };
};

// Employee APIs
export const fetchEmployees = async (): Promise<Employee[]> => {
  return Promise.resolve([...mockEmployees]);
};

export const fetchPositionHistory = async (): Promise<PositionHistory[]> => {
  return Promise.resolve([...mockPositionHistory]);
};

export const createEmployee = async (
  data: Omit<Employee, 'id' | 'avatarUrl'>
): Promise<{ employee: Employee; positionHistory: PositionHistory[] }> => {
  const newId = `E${(mockEmployees.length + 1).toString().padStart(3, '0')}`;
  const employee: Employee = {
    id: newId,
    avatarUrl: `https://picsum.photos/seed/${newId}/100/100`,
    ...data,
  };
  mockEmployees.unshift(employee);
  const history: PositionHistory = {
    id: `PH-${Date.now()}`,
    employeeId: newId,
    position: employee.position,
    unit: employee.unit,
    startDate: employee.joinDate,
    endDate: null,
  };
  mockPositionHistory.unshift(history);
  return Promise.resolve({ employee, positionHistory: [...mockPositionHistory] });
};

export const updateEmployee = async (
  updated: Employee
): Promise<{ employee: Employee; positionHistory: PositionHistory[] }> => {
  const index = mockEmployees.findIndex(e => e.id === updated.id);
  if (index === -1) throw new Error('Employee not found');
  const original = mockEmployees[index];
  mockEmployees[index] = updated;

  if (original.position !== updated.position || original.unit !== updated.unit) {
    const today = new Date().toISOString().split('T')[0];
    const currentIndex = mockPositionHistory.findIndex(
      h => h.employeeId === updated.id && h.endDate === null
    );
    if (currentIndex !== -1) {
      mockPositionHistory[currentIndex] = {
        ...mockPositionHistory[currentIndex],
        endDate: today,
      };
    }
    const newHistory: PositionHistory = {
      id: `PH-${Date.now()}`,
      employeeId: updated.id,
      position: updated.position,
      unit: updated.unit,
      startDate: today,
      endDate: null,
    };
    mockPositionHistory.unshift(newHistory);
  }
  return Promise.resolve({ employee: updated, positionHistory: [...mockPositionHistory] });
};

export const deleteEmployee = async (
  id: string
): Promise<PositionHistory[]> => {
  const index = mockEmployees.findIndex(e => e.id === id);
  if (index !== -1) {
    mockEmployees.splice(index, 1);
  }
  for (let i = mockPositionHistory.length - 1; i >= 0; i--) {
    if (mockPositionHistory[i].employeeId === id) {
      mockPositionHistory.splice(i, 1);
    }
  }
  return Promise.resolve([...mockPositionHistory]);
};

export const fetchPositions = async (): Promise<Position[]> => {
  return Promise.resolve([...mockPositions]);
};

export const fetchUnits = async (): Promise<Unit[]> => {
  return Promise.resolve([...mockUnits]);
};

// Attendance APIs
export const fetchAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  return Promise.resolve([...mockAttendance]);
};

export const createAttendanceRecord = async (
  data: Omit<AttendanceRecord, 'id'>
): Promise<AttendanceRecord> => {
  const newId = `A${(mockAttendance.length + 1).toString().padStart(3, '0')}`;
  const record: AttendanceRecord = { id: newId, ...data };
  mockAttendance.unshift(record);
  return Promise.resolve(record);
};

export const updateAttendanceRecord = async (
  record: AttendanceRecord
): Promise<AttendanceRecord> => {
  const index = mockAttendance.findIndex(r => r.id === record.id);
  if (index !== -1) {
    mockAttendance[index] = record;
  }
  return Promise.resolve(record);
};

export const deleteAttendanceRecord = async (id: string): Promise<void> => {
  const index = mockAttendance.findIndex(r => r.id === id);
  if (index !== -1) {
    mockAttendance.splice(index, 1);
  }
  return Promise.resolve();
};

// Leave Request APIs
export const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
  return Promise.resolve([...mockLeaveRequests]);
};

export const createLeaveRequest = async (
  data: Omit<LeaveRequest, 'id' | 'status' | 'approver' | 'employeeName'>
): Promise<LeaveRequest> => {
  const employee = mockEmployees.find(e => e.id === data.employeeId);
  const request: LeaveRequest = {
    id: `L-${Date.now()}`,
    employeeName: employee ? employee.name : '',
    status: LeaveStatus.PENDING,
    approver: '',
    ...data,
  };
  mockLeaveRequests.unshift(request);
  return Promise.resolve(request);
};

export const updateLeaveRequest = async (
  request: LeaveRequest
): Promise<LeaveRequest> => {
  const index = mockLeaveRequests.findIndex(r => r.id === request.id);
  if (index !== -1) {
    mockLeaveRequests[index] = request;
  }
  return Promise.resolve(request);
};

export const deleteLeaveRequest = async (id: string): Promise<void> => {
  const index = mockLeaveRequests.findIndex(r => r.id === id);
  if (index !== -1) {
    mockLeaveRequests.splice(index, 1);
  }
  return Promise.resolve();
};

export const fetchLeaveTypes = async (): Promise<LeaveType[]> => {
  return Promise.resolve([...mockLeaveTypes]);
};

// Payroll APIs
export const fetchPayslips = async (): Promise<Payslip[]> => {
  return Promise.resolve([...mockPayslips]);
};

export const createPayslip = async (
  data: Omit<Payslip, 'id'>
): Promise<Payslip> => {
  const newId = `PS${(mockPayslips.length + 1).toString().padStart(3, '0')}`;
  const payslip: Payslip = { id: newId, ...data };
  mockPayslips.unshift(payslip);
  return Promise.resolve(payslip);
};

export const updatePayslip = async (payslip: Payslip): Promise<Payslip> => {
  const index = mockPayslips.findIndex(p => p.id === payslip.id);
  if (index !== -1) {
    mockPayslips[index] = payslip;
  }
  return Promise.resolve(payslip);
};

export const deletePayslip = async (id: string): Promise<void> => {
  const index = mockPayslips.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPayslips.splice(index, 1);
  }
  return Promise.resolve();
};
