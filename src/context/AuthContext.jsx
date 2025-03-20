import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: null, tipoUsuario: null });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setAuth({
        user: parsedUser,
        token: storedToken,
        tipoUsuario: parsedUser.tipoUsuario || null, // Se guarda el tipo de usuario
      });
    }
  }, []);

  const login = (userData) => {
    setAuth({ 
      user: userData, 
      token: userData.token, 
      tipoUsuario: userData.tipoUsuario || null  // Almacena el tipo de usuario
    });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
  };

  const logout = () => {
    setAuth({ user: null, token: null, tipoUsuario: null });
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
