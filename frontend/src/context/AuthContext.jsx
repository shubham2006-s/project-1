import { createContext, useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        setIsLoggedIn(true);

        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        startAutoLogout(token);
      }
    } catch {
      logout();
    }

    setLoading(false);
  }, []);
  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
};