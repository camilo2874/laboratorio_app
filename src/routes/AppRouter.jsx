import React from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Samples from "../pages/Samples";
import Muestras from "../pages/Muestras";
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import RegistroMuestras from "../pages/RegistroMuestras";
import RecuperarContrasena from "../pages/RecuperarContrasena";
import CambiarContrasena from "../pages/CambiarContrasena"; // ✅ Nueva página

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/cambiar-contrasena/:token" element={<CambiarContrasena />} /> 

        {/* Rutas protegidas */}
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} /> {/* ✅ Asegura que /dashboard funcione */}
        <Route path="/users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
        <Route path="/samples" element={<PrivateRoute><Layout><Samples /></Layout></PrivateRoute>} />
        <Route path="/muestras" element={<PrivateRoute><Layout><Muestras /></Layout></PrivateRoute>} />
        <Route path="/registro-muestras" element={<PrivateRoute><Layout><RegistroMuestras /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
