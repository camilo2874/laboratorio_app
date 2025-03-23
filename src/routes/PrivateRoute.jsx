import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, tipoUsuario } = useContext(AuthContext);

  // Si no hay usuario, redirige a /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos y el rol del usuario no está en la lista,
  // redirige a /dashboard (o a otra ruta de "No autorizado")
  if (allowedRoles.length > 0 && !allowedRoles.includes(tipoUsuario)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si pasa las validaciones, renderiza el contenido protegido
  return children;
};

export default PrivateRoute;
