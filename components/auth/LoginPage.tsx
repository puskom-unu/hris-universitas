import React, { useState } from 'react';
import Button from '../shared/Button';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  loginError: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loginError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <i className="fas fa-university fa-3x text-blue-600"></i>
            <h1 className="text-3xl font-bold ml-4 text-gray-800 dark:text-white">HRIS UNUGHA</h1>
          </div>
          <h2 className="text-xl text-gray-600 dark:text-gray-300">Selamat Datang Kembali</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg text-center">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {loginError}
              </p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Alamat Email"
              />
            </div>
            <div>
              <label htmlFor="password-for-login" className="sr-only">Kata Sandi</label>
              <input
                id="password-for-login"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Kata Sandi"
              />
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
