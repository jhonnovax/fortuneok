import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
});

export const ThemeProvider = ({ children }) => {

  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }

  useEffect(() => {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    
    darkThemeMq.addEventListener("change", (e) => {
      setTheme(e.matches ? "dark" : "light");
    });

    setTheme(darkThemeMq.matches ? "dark" : "light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );

};

export default ThemeContext;