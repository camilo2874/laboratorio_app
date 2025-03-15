import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setAuth({ user: JSON.parse(storedUser), token: storedToken });
    }
  }, []);

  const login = (userData) => {
    setAuth({ user: userData, token: userData.token });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
