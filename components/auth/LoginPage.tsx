import React from 'react';
import Button from '../shared/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from './schema';
import { useTranslation } from 'react-i18next';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  loginError: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loginError }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormData) => {
    onLogin(data.email, data.password);
    reset();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <i className="fas fa-university fa-3x text-blue-600"></i>
            <h1 className="text-3xl font-bold ml-4 text-gray-800 dark:text-white">HRIS UNUGHA</h1>
          </div>
          <h2 className="text-xl text-gray-600 dark:text-gray-300">{t('welcomeBack')}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <label htmlFor="email-address" className="sr-only">{t('email')}</label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password-for-login" className="sr-only">{t('password')}</label>
              <input
                id="password-for-login"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={!isValid}>
              {t('login')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
