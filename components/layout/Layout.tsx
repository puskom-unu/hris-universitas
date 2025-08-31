import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { User } from '../../types';

interface LayoutProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onUpdateUser, onLogout }) => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <Sidebar user={user} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  </div>
);

export default Layout;
