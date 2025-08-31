
import React from 'react';
import { NavLink } from 'react-router-dom';
import { View } from '../../types';
import { rolePermissions } from '../../config/roles';
import { useAuth } from '../../context/AuthContext';

interface NavItemProps {
  to: string;
  label: string;
  icon: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`
      }
    >
      <i className={`fas ${icon} w-6 text-center`}></i>
      <span className="ml-4 font-medium">{label}</span>
    </NavLink>
  </li>
);

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  const availableViews = rolePermissions[user.role] || [];

  const navItems = [
      { view: View.DASHBOARD, label: "Dashboard", icon: "fa-tachometer-alt", to: "/dashboard" },
      { view: View.MY_PROFILE, label: "Profil Saya", icon: "fa-user", to: "/profile" },
      { view: View.PAYROLL_INFO, label: "Info Payroll", icon: "fa-money-bill-wave", to: "/payroll-info" },
      { view: View.EMPLOYEES, label: "Pegawai", icon: "fa-users", to: "/employees" },
      { view: View.ATTENDANCE, label: "Presensi", icon: "fa-clock", to: "/attendance" },
      { view: View.LEAVE, label: "Cuti & Izin", icon: "fa-calendar-alt", to: "/leave" },
      { view: View.PAYROLL, label: "Payroll", icon: "fa-file-invoice-dollar", to: "/payroll" },
      { view: View.PERFORMANCE, label: "Kinerja (KPI)", icon: "fa-chart-line", to: "/performance" },
      { view: View.REPORTS, label: "Laporan", icon: "fa-file-alt", to: "/reports" },
  ];

  const settingsItem = { view: View.SETTINGS, label: "Pengaturan", icon: "fa-cog", to: "/settings" };

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
             <NavItem key={item.view} to={item.to} label={item.label} icon={item.icon} />
          ))}

          {canAccessSettings && (
             <>
                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                <NavItem to={settingsItem.to} label={settingsItem.label} icon={settingsItem.icon} />
             </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;