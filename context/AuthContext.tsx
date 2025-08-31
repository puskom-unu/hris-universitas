import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const login = (email: string, password: string) => {
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      setToken('mock-token');
      setLoginError(null);
      return true;
    }
    setLoginError('Email atau kata sandi salah.');
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const index = mockUsers.findIndex(u => u.email === updatedUser.email);
    if (index > -1) {
      mockUsers[index] = { ...mockUsers[index], ...updatedUser };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loginError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
