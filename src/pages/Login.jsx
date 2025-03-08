import React, { useState, useContext } from "react";
import axios from "axios"; // ✅ Importamos axios
import { 
  TextField, Button, Box, Typography, Paper, Alert, CircularProgress 
} from "@mui/material";
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

    try {
      const response = await axios.post("https://unificado-u.onrender.com/api/usuarios/login", credentials);

      if (response.data && response.data.token) {
        console.log("🔑 Token recibido:", response.data.token);

        localStorage.setItem("token", response.data.token); // ✅ Guardar token en localStorage
        login({ email: credentials.email, token: response.data.token });

        navigate("/"); // Redirigir al Dashboard o Home
      } else {
        setError("Error: No se recibió un token válido.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error en la autenticación");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Paper sx={{ padding: 4, width: 300, textAlign: "center" }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>Iniciar Sesión</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField 
            label="Correo" 
            name="email" 
            type="email" 
            onChange={handleChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="Contraseña" 
            name="password" 
            type="password" 
            onChange={handleChange} 
            fullWidth 
            required 
          />

          {loading ? (
            <CircularProgress size={24} sx={{ alignSelf: "center", margin: 2 }} />
          ) : (
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ backgroundColor: "#39A900", color: "white" }}
            >
              Ingresar
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
