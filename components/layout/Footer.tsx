
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
      {t('footerText', { year: currentYear })}
    </footer>
  );
};

export default Footer;
