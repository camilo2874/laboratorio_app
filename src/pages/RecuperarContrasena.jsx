import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from "@mui/material";

const RecuperarContrasena = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setLoading(true);

    // Validar que el correo no esté vacío
    if (!email) {
      setError("⚠ Debes ingresar un correo electrónico.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("⚠ Ingresa un correo válido.");
      setLoading(false);
      return;
    }

    try {
      // Enviar solicitud de recuperación de contraseña a la API
      const url = "https://back-usuarios-f.onrender.com/api/usuarios/solicitar-recuperacion";
      const response = await axios.post(url, { email });

      // Si el servidor devuelve status 200, asumimos que se procesó correctamente
      if (response.status === 200) {
        // Tu servidor envía algo como:
        // {
        //   "mensaje": "Si el correo existe en nuestra base de datos...",
        //   "detalles": "El enlace de recuperación es válido por 1 hora..."
        // }
        setMensaje(response.data.mensaje);
      } else {
        // Cualquier otro status code lo tratamos como error
        setError("⚠ No se pudo procesar la solicitud.");
      }
    } catch (error) {
      console.error(error);
      setError("❌ Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >
      <Paper sx={{ padding: 4, width: 320, textAlign: "center" }}>
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          Recuperar Contraseña
        </Typography>

        {mensaje && <Alert severity="success">{mensaje}</Alert>}
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

          {loading ? (
            <CircularProgress
              size={24}
              sx={{ alignSelf: "center", margin: 2 }}
            />
          ) : (
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "#39A900", color: "white" }}
            >
              Enviar correo
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default RecuperarContrasena;