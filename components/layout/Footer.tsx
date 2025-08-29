
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
      &copy; {currentYear} HRIS UNUGHA | Hubungi Dukungan: Bidang Sumber Daya Manusia UNUGHA Cilacap
    </footer>
  );
};

export default Footer;
