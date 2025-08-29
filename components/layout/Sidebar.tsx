
import React from 'react';
import { View, User } from '../../types';
import { rolePermissions } from '../../config/roles';

interface SidebarProps {
  user: User;
  currentView: View;
  setCurrentView: (view: View) => void;
}

interface NavItemProps {
  view: View;
  label: string;
  icon: string;
  currentView: View;
  onClick: (view: View) => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon, currentView, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(view); }}
      className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
        currentView === view
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <i className={`fas ${icon} w-6 text-center`}></i>
      <span className="ml-4 font-medium">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, setCurrentView }) => {
  const availableViews = rolePermissions[user.role] || [];

  const navItems = [
      { view: View.DASHBOARD, label: "Dashboard", icon: "fa-tachometer-alt" },
      { view: View.MY_PROFILE, label: "Profil Saya", icon: "fa-user" },
      { view: View.PAYROLL_INFO, label: "Info Payroll", icon: "fa-money-bill-wave" },
      { view: View.EMPLOYEES, label: "Pegawai", icon: "fa-users" },
      { view: View.ATTENDANCE, label: "Presensi", icon: "fa-clock" },
      { view: View.LEAVE, label: "Cuti & Izin", icon: "fa-calendar-alt" },
      { view: View.PAYROLL, label: "Payroll", icon: "fa-file-invoice-dollar" },
      { view: View.PERFORMANCE, label: "Kinerja (KPI)", icon: "fa-chart-line" },
      { view: View.REPORTS, label: "Laporan", icon: "fa-file-alt" },
  ];
  
  const settingsItem = { view: View.SETTINGS, label: "Pengaturan", icon: "fa-cog" };

  const accessibleNavItems = navItems.filter(item => availableViews.includes(item.view));
  const canAccessSettings = availableViews.includes(View.SETTINGS);


  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg hidden md:block">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <i className="fas fa-university fa-2x text-blue-600"></i>
        <h1 className="text-xl font-bold ml-3 text-gray-800 dark:text-white">HRIS UNUGHA</h1>
      </div>
      <nav className="p-4">
        <ul>
          {accessibleNavItems.map(item => (
             <NavItem key={item.view} view={item.view} label={item.label} icon={item.icon} currentView={currentView} onClick={setCurrentView} />
          ))}

          {canAccessSettings && (
             <>
                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                <NavItem view={settingsItem.view} label={settingsItem.label} icon={settingsItem.icon} currentView={currentView} onClick={setCurrentView} />
             </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;