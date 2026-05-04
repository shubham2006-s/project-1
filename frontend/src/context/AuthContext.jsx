import { createContext, useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const logoutTimer = useRef(null);

  // 🔥 logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);

    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }

    window.location.href = "/login";
  };

  // 🔥 auto logout setup
  const startAutoLogout = (token) => {
    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000;
      const remainingTime = expiryTime - Date.now();

      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }

      if (remainingTime <= 0) {
        logout();
      } else {
        logoutTimer.current = setTimeout(logout, remainingTime);
      }
    } catch {
      logout();
    }
  };

  // 🔥 login
  const login = (token, nextUser) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    }

    startAutoLogout(token); // ✅ IMPORTANT
  };

  // 🔄 restore on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        setIsLoggedIn(true);
        startAutoLogout(token); // ✅ resume timer
      }
    } catch {
      logout();
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};