import React, { createContext, useState, useEffect } from 'react';

// Create a Context
const PreferencesContext = createContext();

// Provider component
export const PreferencesProvider = ({ children }) => {
  const [currency, setCurrency] = useState(typeof window !== 'undefined' ? localStorage.getItem('currency') || 'USD' : 'USD');
  const [language, setLanguage] = useState('en');

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('language', language);
  }, [currency, language]);

  return (
    <PreferencesContext.Provider value={{ currency, setCurrency, language, setLanguage }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  return React.useContext(PreferencesContext);
};