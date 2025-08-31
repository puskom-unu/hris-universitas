
export enum View {
  DASHBOARD = 'DASHBOARD',
  EMPLOYEES = 'EMPLOYEES',
  ATTENDANCE = 'ATTENDANCE',
  LEAVE = 'LEAVE',
  PAYROLL = 'PAYROLL',
  PAYROLL_INFO = 'PAYROLL_INFO',
  PERFORMANCE = 'PERFORMANCE',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  MY_PROFILE = 'MY_PROFILE',
}

export enum MasterDataView {
  NONE = 'NONE',
  POSITIONS = 'POSITIONS',
  UNITS = 'UNITS',
  LEAVE_TYPES = 'LEAVE_TYPES',
  PAYROLL_COMPONENTS = 'PAYROLL_COMPONENTS',
  WHATSAPP_NOTIFICATIONS = 'WHATSAPP_NOTIFICATIONS',
  PARTNER_BANKS = 'PARTNER_BANKS',
  DATABASE_SETTINGS = 'DATABASE_SETTINGS',
  R2_STORAGE = 'R2_STORAGE',
}

export enum ReportView {
  NONE = 'NONE',
  EMPLOYEE_LIST = 'EMPLOYEE_LIST',
  PAYROLL_PERIOD = 'PAYROLL_PERIOD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ATTENDANCE_SUMMARY = 'ATTENDANCE_SUMMARY',
}

export interface Employee {
  id: string;
  name: string;
  nip: string;
  position: string;
  unit: string;
  email: string;
  whatsappNumber: string;
  status: 'Active' | 'Inactive';
  avatarUrl: string;
  joinDate: string;
  bankName: string;
  accountNumber: string;
}

export interface PositionHistory {
  id: string;
  employeeId: string;
  position: string;
  unit: string;
  startDate: string;
  endDate: string | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;

  date: string;
  clockIn: string;
  clockOut: string;
  status: 'On Time' | 'Late' | 'Absent';
  shift: string;
}

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approver: string;
  documentName?: string;
  documentUrl?: string;
}

export interface PayItem {
  name: string;
  type: 'Earning' | 'Deduction';
  amount: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  items: PayItem[];
}

export interface Kpi {
    id: string;
    employeeId: string;
    employeeName: string;
    title: string;
    target: string;
    actual: string;
    progress: number;
    period: string;
    status: 'On Track' | 'At Risk' | 'Completed';
}

export interface User {
    name: string;
    email: string;
    whatsappNumber: string;
    avatarUrl: string;
    role: string;
    password?: string;
}

export interface Position {
  id: string;
  name: string;
  description: string;
}

export interface Unit {
  id: string;
  name: string;
  category: string; // e.g., Fakultas, Biro, UPT
}

export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
}

export interface PayrollComponent {
  id: string;
  name: string;
  type: 'Earning' | 'Deduction';
}

export interface EmployeeSalaryComponent {
  employeeId: string;
  componentId: string;
  amount: number;
}

export interface WahaTriggers {
  leaveApproved: boolean;
  leaveRejected: boolean;
  attendanceReminder: boolean;
  payslipIssued: boolean;
}

export interface WahaSettings {
  enabled: boolean;
  endpoint: string;
  sessionName: string;
  triggers: WahaTriggers;
}

export interface WorkerConfigStatus {
  waha: {
    endpoint: boolean;
    sessionName: boolean;
    hasApiKey: boolean;
  };
}

export interface PartnerBank {
  id: string;
  name: string;
  code?: string;
}

export interface D1DatabaseSettings {
  enabled: boolean;
  accountId: string;
  databaseId: string;
  authToken: string;
}

export interface R2StorageSettings {
  enabled: boolean;
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
}
