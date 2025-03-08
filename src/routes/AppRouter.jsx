import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Samples from "../pages/Samples";
import Muestras from "../pages/Muestras"; // 📌 Importación corregida
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import RegistroMuestras from "../pages/RegistroMuestras";


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
        <Route path="/samples" element={<PrivateRoute><Layout><Samples /></Layout></PrivateRoute>} />
        <Route path="/muestras" element={<PrivateRoute><Layout><Muestras /></Layout></PrivateRoute>} />
        <Route path="/registro-muestras" element={<PrivateRoute><Layout><RegistroMuestras /></Layout></PrivateRoute>} />

      </Routes>
    </Router>
  );
};

export default AppRouter;
