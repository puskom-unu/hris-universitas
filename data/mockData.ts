
import { Employee, AttendanceRecord, LeaveRequest, Payslip, Kpi, User, LeaveStatus, Position, Unit, LeaveType, PayrollComponent, WahaSettings, EmployeeSalaryComponent, PayItem, PartnerBank, PositionHistory, D1DatabaseSettings, R2StorageSettings } from '../types';
import { ROLES } from '../config/roles';

export let mockUsers: User[] = [
    {
        name: 'Budi Santoso',
        email: 'budi.santoso@unugha.ac.id',
        whatsappNumber: '6281234567890',
        avatarUrl: 'https://i.pravatar.cc/150?u=budi.santoso',
        role: ROLES.ADMIN_SDM,
        password: 'password123'
    },
    {
        name: 'Super Admin',
        email: 'superadmin@unugha.ac.id',
        whatsappNumber: '6281111111111',
        avatarUrl: 'https://i.pravatar.cc/150?u=superadmin',
        role: ROLES.SUPERADMIN,
        password: 'password123'
    },
    {
        name: 'Ani Keuangan',
        email: 'ani.keuangan@unugha.ac.id',
        whatsappNumber: '6282222222222',
        avatarUrl: 'https://i.pravatar.cc/150?u=ani.keuangan',
        role: ROLES.ADMIN_KEUANGAN,
        password: 'password123'
    },
    {
        // This is an employee from the existing mockEmployees list
        name: 'Ahmad Dahlan',
        email: 'ahmad.d@unugha.ac.id',
        whatsappNumber: '6281234567891',
        avatarUrl: 'https://i.pravatar.cc/150?u=E001',
        role: ROLES.PEGAWAI,
        password: 'password123'
    }
];


export const mockPositions: Position[] = [
    { id: 'P001', name: 'Rektor', description: 'Pimpinan tertinggi universitas.' },
    { id: 'P002', name: 'Dekan Fakultas Teknik', description: 'Pimpinan Fakultas Teknik.' },
    { id: 'P003', name: 'Dosen', description: 'Tenaga pengajar.' },
    { id: 'P004', name: 'Staf Administrasi', description: 'Staf bagian administrasi.' },
    { id: 'P005', name: 'Kepala Biro Keuangan', description: 'Pimpinan Biro Keuangan.' },
    { id: 'P006', name: 'Staf Pengajar', description: 'Tenaga pengajar awal.' },
];

export const mockUnits: Unit[] = [
    { id: 'U001', name: 'Fakultas Teknik', category: 'Fakultas' },
    { id: 'U002', name: 'Fakultas Ekonomi', category: 'Fakultas' },
    { id: 'U003', name: 'Biro Administrasi Akademik', category: 'Biro' },
    { id: 'U004', name: 'UPT Perpustakaan', category: 'UPT' },
    { id: 'U005', name: 'Biro Keuangan', category: 'Biro' },
];

export const mockEmployees: Employee[] = [
    { id: 'E001', name: 'Ahmad Dahlan', nip: '198503152010011001', position: 'Dosen', unit: 'Fakultas Teknik', email: 'ahmad.d@unugha.ac.id', whatsappNumber: '6281234567891', status: 'Active', avatarUrl: 'https://i.pravatar.cc/150?u=E001', joinDate: '2010-01-15', bankName: 'Bank Mandiri', accountNumber: '1234567890' },
    { id: 'E002', name: 'Siti Aminah', nip: '199008202015032002', position: 'Staf Administrasi', unit: 'Biro Administrasi Akademik', email: 'siti.a@unugha.ac.id', whatsappNumber: '6281234567892', status: 'Active', avatarUrl: 'https://i.pravatar.cc/150?u=E002', joinDate: '2015-03-20', bankName: 'Bank BRI', accountNumber: '0987654321' },
    { id: 'E003', name: 'Joko Susilo', nip: '198211102008121003', position: 'Dekan Fakultas Teknik', unit: 'Fakultas Teknik', email: 'joko.s@unugha.ac.id', whatsappNumber: '6281234567893', status: 'Active', avatarUrl: 'https://i.pravatar.cc/150?u=E003', joinDate: '2008-12-01', bankName: 'Bank BNI', accountNumber: '1122334455' },
    { id: 'E004', name: 'Dewi Lestari', nip: '199205252018092004', position: 'Dosen', unit: 'Fakultas Ekonomi', email: 'dewi.l@unugha.ac.id', whatsappNumber: '6281234567894', status: 'Active', avatarUrl: 'https://i.pravatar.cc/150?u=E004', joinDate: '2018-09-01', bankName: 'Bank BCA', accountNumber: '5566778899' },
    { id: 'E005', name: 'Bambang Pamungkas', nip: '198006102005011005', position: 'Kepala Biro Keuangan', unit: 'Biro Keuangan', email: 'bambang.p@unugha.ac.id', whatsappNumber: '6281234567895', status: 'Inactive', avatarUrl: 'https://i.pravatar.cc/150?u=E005', joinDate: '2005-01-10', bankName: 'Bank Mandiri', accountNumber: '2233445566' },
];

export let mockPositionHistory: PositionHistory[] = [
    { id: 'PH001', employeeId: 'E001', position: 'Staf Pengajar', unit: 'Fakultas Teknik', startDate: '2010-01-15', endDate: '2014-12-31' },
    { id: 'PH002', employeeId: 'E001', position: 'Dosen', unit: 'Fakultas Teknik', startDate: '2015-01-01', endDate: null },
    { id: 'PH003', employeeId: 'E003', position: 'Dosen', unit: 'Fakultas Teknik', startDate: '2008-12-01', endDate: '2017-12-31' },
    { id: 'PH004', employeeId: 'E003', position: 'Dekan Fakultas Teknik', unit: 'Fakultas Teknik', startDate: '2018-01-01', endDate: null },
    { id: 'PH005', employeeId: 'E002', position: 'Staf Administrasi', unit: 'Biro Administrasi Akademik', startDate: '2015-03-20', endDate: null },
    { id: 'PH006', employeeId: 'E004', position: 'Dosen', unit: 'Fakultas Ekonomi', startDate: '2018-09-01', endDate: null },
];

export const mockAttendance: AttendanceRecord[] = [
    { id: 'A001', employeeId: 'E001', employeeName: 'Ahmad Dahlan', date: '2023-10-25', clockIn: '08:00', clockOut: '17:00', status: 'On Time', shift: 'Regular' },
    { id: 'A002', employeeId: 'E002', employeeName: 'Siti Aminah', date: '2023-10-25', clockIn: '08:15', clockOut: '17:05', status: 'Late', shift: 'Regular' },
    { id: 'A003', employeeId: 'E003', employeeName: 'Joko Susilo', date: '2023-10-25', clockIn: '07:55', clockOut: '17:00', status: 'On Time', shift: 'Regular' },
    { id: 'A004', employeeId: 'E004', employeeName: 'Dewi Lestari', date: '2023-10-25', clockIn: 'N/A', clockOut: 'N/A', status: 'Absent', shift: 'Regular' },
    { id: 'A005', employeeId: 'E001', employeeName: 'Ahmad Dahlan', date: '2023-10-26', clockIn: '08:05', clockOut: '17:02', status: 'On Time', shift: 'Regular' },
];

export const mockLeaveRequests: LeaveRequest[] = [
    { id: 'L001', employeeId: 'E004', employeeName: 'Dewi Lestari', leaveType: 'Cuti Tahunan', startDate: '2023-10-25', endDate: '2023-10-26', reason: 'Acara keluarga', status: LeaveStatus.APPROVED, approver: 'Joko Susilo' },
    { id: 'L002', employeeId: 'E002', employeeName: 'Siti Aminah', leaveType: 'Sakit', startDate: '2023-10-27', endDate: '2023-10-27', reason: 'Sakit demam', status: LeaveStatus.PENDING, approver: 'Budi Santoso', documentName: 'surat_dokter.pdf' },
    { id: 'L003', employeeId: 'E001', employeeName: 'Ahmad Dahlan', leaveType: 'Izin', startDate: '2023-10-28', endDate: '2023-10-28', reason: 'Keperluan mendadak', status: LeaveStatus.REJECTED, approver: 'Joko Susilo' },
];

const payslipItemsE001: PayItem[] = [
    { name: 'Gaji Pokok', type: 'Earning', amount: 5000000 },
    { name: 'Tunjangan Jabatan', type: 'Earning', amount: 1500000 },
    { name: 'Tunjangan Transport', type: 'Earning', amount: 500000 },
    { name: 'Potongan BPJS', type: 'Deduction', amount: 200000 },
    { name: 'Potongan PPh 21', type: 'Deduction', amount: 150000 },
];
const payslipItemsE002: PayItem[] = [
    { name: 'Gaji Pokok', type: 'Earning', amount: 3500000 },
    { name: 'Tunjangan Kinerja', type: 'Earning', amount: 750000 },
    { name: 'Tunjangan Makan', type: 'Earning', amount: 400000 },
    { name: 'Potongan BPJS', type: 'Deduction', amount: 150000 },
];
export const mockPayslips: Payslip[] = [
    { id: 'PS001', employeeId: 'E001', employeeName: 'Ahmad Dahlan', period: 'Oktober 2023', grossSalary: 7000000, totalDeductions: 350000, netSalary: 6650000, items: payslipItemsE001 },
    { id: 'PS002', employeeId: 'E002', employeeName: 'Siti Aminah', period: 'Oktober 2023', grossSalary: 4650000, totalDeductions: 150000, netSalary: 4500000, items: payslipItemsE002 },
    { id: 'PS003', employeeId: 'E003', employeeName: 'Joko Susilo', period: 'Oktober 2023', grossSalary: 9000000, totalDeductions: 500000, netSalary: 8500000, items: [] },
    { id: 'PS004', employeeId: 'E004', employeeName: 'Dewi Lestari', period: 'Oktober 2023', grossSalary: 6000000, totalDeductions: 300000, netSalary: 5700000, items: [] },
    { id: 'PS005', employeeId: 'E001', employeeName: 'Ahmad Dahlan', period: 'September 2023', grossSalary: 7000000, totalDeductions: 350000, netSalary: 6650000, items: payslipItemsE001 },
];

export const mockKpis: Kpi[] = [
    { id: 'K001', employeeId: 'E001', employeeName: 'Ahmad Dahlan', title: 'Publikasi Jurnal', target: '2 Jurnal/Semester', actual: '1 Jurnal', progress: 50, period: 'Semester Ganjil 2023', status: 'On Track' },
    { id: 'K002', employeeId: 'E002', employeeName: 'Siti Aminah', title: 'Waktu Respon Email', target: '< 24 jam', actual: '18 jam', progress: 100, period: 'Q4 2023', status: 'Completed' },
    { id: 'K003', employeeId: 'E004', employeeName: 'Dewi Lestari', title: 'Kepuasan Mahasiswa', target: 'Skor 4.5/5', actual: 'Skor 4.0/5', progress: 80, period: 'Semester Ganjil 2023', status: 'At Risk' },
];

export const mockLeaveTypes: LeaveType[] = [
    { id: 'LT001', name: 'Cuti Tahunan', defaultDays: 12 },
    { id: 'LT002', name: 'Sakit dengan Surat Dokter', defaultDays: 3 },
    { id: 'LT003', name: 'Cuti Melahirkan', defaultDays: 90 },
    { id: 'LT004', name: 'Izin Keperluan Penting', defaultDays: 2 },
];

export let mockPayrollComponents: PayrollComponent[] = [
    { id: 'PC001', name: 'Gaji Pokok', type: 'Earning' },
    { id: 'PC002', name: 'Tunjangan Jabatan', type: 'Earning' },
    { id: 'PC003', name: 'Tunjangan Transport', type: 'Earning' },
    { id: 'PC004', name: 'Tunjangan Makan', type: 'Earning' },
    { id: 'PC101', name: 'Potongan BPJS', type: 'Deduction' },
    { id: 'PC102', name: 'Potongan PPh 21', type: 'Deduction' },
];

export let mockEmployeeSalaryComponents: EmployeeSalaryComponent[] = [
    { employeeId: 'E001', componentId: 'PC001', amount: 5000000 },
    { employeeId: 'E001', componentId: 'PC002', amount: 1500000 },
    { employeeId: 'E001', componentId: 'PC003', amount: 500000 },
    { employeeId: 'E001', componentId: 'PC101', amount: 200000 },
    { employeeId: 'E001', componentId: 'PC102', amount: 150000 },
    { employeeId: 'E002', componentId: 'PC001', amount: 350000 },
    { employeeId: 'E002', componentId: 'PC004', amount: 400000 },
    { employeeId: 'E002', componentId: 'PC101', amount: 150000 },
];

export const mockWahaSettings: WahaSettings = {
    enabled: true,
    endpoint: 'http://localhost:3000',
    sessionName: 'default',
    apiKey: '',
    triggers: {
        leaveApproved: true,
        leaveRejected: true,
        attendanceReminder: false,
        payslipIssued: true,
    }
};

export let mockPartnerBanks: PartnerBank[] = [
    { id: 'BANK001', name: 'Bank Mandiri', code: '008' },
    { id: 'BANK002', name: 'Bank BRI', code: '002' },
    { id: 'BANK003', name: 'Bank BNI', code: '009' },
    { id: 'BANK004', name: 'Bank BCA', code: '014' },
    { id: 'BANK005', name: 'Bank Syariah Indonesia', code: '451' },
];

export let mockD1Settings: D1DatabaseSettings = {
    enabled: false,
    accountId: '',
    databaseId: '',
    authToken: '',
};

export let mockR2Settings: R2StorageSettings = {
    enabled: false,
    accountId: '',
    bucketName: '',
    accessKeyId: '',
    secretAccessKey: '',
};
