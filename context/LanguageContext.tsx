import React, { createContext, useContext, useState } from 'react';
import i18n from 'i18next';

type LanguageContextType = {
  language: string;
  setLanguage: (lng: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.language || 'en');

  const setLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguageState(lng);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

