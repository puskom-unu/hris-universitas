
import React, { useState, useEffect, useRef } from 'react';
import UserProfileModal from '../user/UserProfileModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    <>
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center">
        {/* Can be used for breadcrumbs or page title */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full max-w-xs bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="fas fa-search text-gray-400"></i>
          </span>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <i className="fas fa-bell fa-lg"></i>
        </button>
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center focus:outline-none">
                <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full" />
                <div className="ml-3 text-right hidden sm:block">
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsProfileModalOpen(true);
                            setIsDropdownOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <i className="fas fa-user-edit w-5 mr-2"></i>Edit Profil
                    </a>
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); logout(); navigate('/'); }}
                        className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                       <i className="fas fa-sign-out-alt w-5 mr-2"></i>Logout
                    </a>
                </div>
            )}
        </div>
      </div>
    </header>

      <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Header;