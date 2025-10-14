import React, { createContext, useState, useEffect } from 'react';

// Create a Context
const PreferencesContext = createContext();

// Provider component
export const PreferencesProvider = ({ children }) => {
  const [preferredCurrency, setPreferredCurrency] = useState(typeof window !== 'undefined' ? localStorage.getItem('currency') || 'USD' : 'USD');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('currency', preferredCurrency);
    localStorage.setItem('language', preferredLanguage);
  }, [preferredCurrency, preferredLanguage]);

  return (
    <PreferencesContext.Provider value={{ preferredCurrency, setPreferredCurrency, preferredLanguage, setPreferredLanguage }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  return React.useContext(PreferencesContext);
};