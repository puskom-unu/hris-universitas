
import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import EmployeeManagement from './components/employees/EmployeeManagement';
import AttendanceManagement from './components/attendance/AttendanceManagement';
import LeaveManagement from './components/leave/LeaveManagement';
import PayrollManagement from './components/payroll/PayrollManagement';
import PerformanceManagement from './components/performance/PerformanceManagement';
import SettingsManagement from './components/settings/SettingsManagement';
import ReportManagement from './components/reports/ReportManagement';
import { View, User } from './types';
import { mockUsers } from './data/mockData';
import LoginPage from './components/auth/LoginPage';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import MyProfile from './components/profile/MyProfile';
import { ROLES } from './config/roles';
import PayrollInfo from './components/payroll/PayrollInfo';
import Footer from './components/layout/Footer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = (email: string, password: string) => {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setLoggedInUser(user);
      setLoginError(null);
      setCurrentView(View.DASHBOARD); // Reset to dashboard on login
    } else {
      setLoginError("Email atau kata sandi salah.");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setLoggedInUser(updatedUser);
    
    // Also update the mock data source so changes persist during the session
    const userIndex = mockUsers.findIndex(u => u.email === updatedUser.email);
    if (userIndex > -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedUser };
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        // For admin roles, show the main dashboard.
        // For employee role, this is handled in the main return statement.
        return <Dashboard />;
      case View.EMPLOYEES:
        return <EmployeeManagement />;
      case View.ATTENDANCE:
        return <AttendanceManagement />;
      case View.LEAVE:
        return <LeaveManagement user={loggedInUser!} />;
      case View.PAYROLL:
        return <PayrollManagement />;
      case View.PERFORMANCE:
        return <PerformanceManagement />;
      case View.REPORTS:
        return <ReportManagement />;
      case View.SETTINGS:
        return <SettingsManagement />;
      case View.MY_PROFILE:
        return <MyProfile user={loggedInUser!} />;
      case View.PAYROLL_INFO:
        return <PayrollInfo user={loggedInUser!} />;
      default:
        return <Dashboard />;
    }
  };

  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} loginError={loginError} />;
  }

  const isEmployee = loggedInUser.role === ROLES.PEGAWAI;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar user={loggedInUser} currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={loggedInUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {isEmployee && currentView === View.DASHBOARD ? (
            <EmployeeDashboard user={loggedInUser} />
          ) : (
            renderView()
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
