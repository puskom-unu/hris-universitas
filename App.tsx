
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import EmployeeManagement from './components/employees/EmployeeManagement';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import LeaveManagement from './components/leave/LeaveManagement';
import PayrollManagement from './components/payroll/PayrollManagement';
import PerformanceManagement from './components/performance/PerformanceManagement';
import SettingsManagement from './components/settings/SettingsManagement';
import ReportManagement from './components/reports/ReportManagement';
import LoginPage from './components/auth/LoginPage';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import MyProfile from './components/profile/MyProfile';
import { ROLES } from './config/roles';
import PayrollInfo from './components/payroll/PayrollInfo';
import Layout from './components/layout/Layout';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
    const { user, login, loginError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

    if (!user) {
      return <LoginPage onLogin={handleLogin} loginError={loginError} />;
    }

  const isEmployee = user.role === ROLES.PEGAWAI;

  return (
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={isEmployee ? <EmployeeDashboard /> : <Dashboard />}
          />
          <Route path="/employees" element={<EmployeeManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="/payroll" element={<PayrollManagement />} />
          <Route path="/performance" element={<PerformanceManagement />} />
          <Route path="/reports" element={<ReportManagement />} />
          <Route path="/settings" element={<SettingsManagement />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/payroll-info" element={<PayrollInfo />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
  );
};

export default App;
