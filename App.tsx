
import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';
import EmployeeManagement from './components/employees/EmployeeManagement';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import LeaveManagement from './components/leave/LeaveManagement';
import PayrollManagement from './components/payroll/PayrollManagement';
import PerformanceManagement from './components/performance/PerformanceManagement';
import SettingsManagement from './components/settings/SettingsManagement';
import ReportManagement from './components/reports/ReportManagement';
import { User } from './types';
import { mockUsers } from './data/mockData';
import LoginPage from './components/auth/LoginPage';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import MyProfile from './components/profile/MyProfile';
import { ROLES } from './config/roles';
import PayrollInfo from './components/payroll/PayrollInfo';
import Layout from './components/layout/Layout';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setLoggedInUser(user);
      setLoginError(null);
      navigate('/dashboard');
    } else {
      setLoginError("Email atau kata sandi salah.");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    navigate('/');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setLoggedInUser(updatedUser);
    
    // Also update the mock data source so changes persist during the session
    const userIndex = mockUsers.findIndex(u => u.email === updatedUser.email);
    if (userIndex > -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedUser };
    }
  };

  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} loginError={loginError} />;
  }

  const isEmployee = loggedInUser.role === ROLES.PEGAWAI;

  return (
    <Routes>
      <Route
        element={<Layout user={loggedInUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />}
      >
        <Route
          path="/dashboard"
          element={isEmployee ? <EmployeeDashboard user={loggedInUser!} /> : <Dashboard />}
        />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/attendance" element={<AttendanceManagement />} />
        <Route path="/leave" element={<LeaveManagement user={loggedInUser!} />} />
        <Route path="/payroll" element={<PayrollManagement />} />
        <Route path="/performance" element={<PerformanceManagement />} />
        <Route path="/reports" element={<ReportManagement />} />
        <Route path="/settings" element={<SettingsManagement />} />
        <Route path="/profile" element={<MyProfile user={loggedInUser!} />} />
        <Route path="/payroll-info" element={<PayrollInfo user={loggedInUser!} />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
