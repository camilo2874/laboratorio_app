import React, { useState, useContext } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validación básica en el frontend
    if (!credentials.email || !credentials.password) {
      setError("⚠ Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      setError("⚠ Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/login`;
      const response = await axios.post(url, credentials);
      if (response.data && response.data.token) {
        console.log("🔑 Token recibido:", response.data.token);
        localStorage.setItem("token", response.data.token);
        // Actualizamos el contexto con toda la información del usuario, incluyendo el token
        login({ email: credentials.email, token: response.data.token, ...response.data.usuario });
        navigate("/dashboard"); // Redirigir al Dashboard
      } else {
        setError("Error: No se recibió un token válido.");
      }
    } catch (error) {
      if (error.response) {
        console.error("❌ Error en la solicitud:", error.response.data);
        setError(error.response.data.message || "Error en la autenticación.");
      } else {
        console.error("❌ Error de conexión:", error.message);
        setError("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper sx={{ padding: 4, width: 320, textAlign: "center" }}>
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>Iniciar Sesión</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Correo" name="email" type="email" onChange={handleChange} fullWidth required />
          <TextField label="Contraseña" name="password" type="password" onChange={handleChange} fullWidth required />
          {loading ? (
            <CircularProgress size={24} sx={{ alignSelf: "center", margin: 2 }} />
          ) : (
            <Button type="submit" variant="contained" sx={{ backgroundColor: "#39A900", color: "white" }}>
              Ingresar
            </Button>
          )}
        </Box>
        {/* Enlace para recuperar contraseña */}
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          <a href="/recuperar-contrasena" style={{ color: "#39A900", textDecoration: "none" }}>
            ¿Olvidaste tu contraseña?
          </a>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
