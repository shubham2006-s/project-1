import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminDarkModeContext = createContext();

export const AdminDarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <AdminDarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </AdminDarkModeContext.Provider>
  );
};

export const useAdminDarkMode = () => {
  const context = useContext(AdminDarkModeContext);
  if (!context) {
    throw new Error('useAdminDarkMode must be used within AdminDarkModeProvider');
  }
  return context;
};
