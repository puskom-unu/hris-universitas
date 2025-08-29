import { View } from '../types';

export const ROLES = {
  SUPERADMIN: 'Superadmin',
  ADMIN_SDM: 'Admin HR',
  ADMIN_KEUANGAN: 'Admin Keuangan',
  PEGAWAI: 'Pegawai',
};

// Define permissions for each role
export const rolePermissions: Record<string, View[]> = {
  [ROLES.SUPERADMIN]: [
    View.DASHBOARD,
    View.EMPLOYEES,
    View.ATTENDANCE,
    View.LEAVE,
    View.PAYROLL,
    View.PERFORMANCE,
    View.REPORTS,
    View.SETTINGS,
  ],
  [ROLES.ADMIN_SDM]: [
    View.DASHBOARD,
    View.EMPLOYEES,
    View.ATTENDANCE,
    View.LEAVE,
    View.PERFORMANCE,
    View.REPORTS,
  ],
  [ROLES.ADMIN_KEUANGAN]: [
    View.DASHBOARD,
    View.PAYROLL,
    View.REPORTS,
  ],
  [ROLES.PEGAWAI]: [
    View.DASHBOARD,
    View.MY_PROFILE,
    View.PAYROLL_INFO,
    View.LEAVE,
  ],
};
