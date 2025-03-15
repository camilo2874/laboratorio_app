import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper, TextField, Button, Alert, CircularProgress, Typography, Select, MenuItem
} from "@mui/material";
import axios from "axios";

const RegistroUsuario = () => {
  const [usuario, setUsuario] = useState({
    tipo: "",
    nombre: "",
    documento: "",
    telefono: "",
    direccion: "",
    email: "",
    password: "",
    especialidad: "",
    codigoSeguridad: "",
    razonSocial: ""  // Campo para clientes
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
    setError(null); // Resetear error al cambiar datos
  };

  // Enviar datos a la API
  const registrarUsuario = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);
    setError(null);

    // Verificar si el token existe ANTES de enviar la solicitud
    const token = localStorage.getItem("token");

    if (!token) {
      setError("⚠ No tienes permiso para registrar usuarios. Inicia sesión.");
      setCargando(false);
      return;
    }

    // Validación de campos obligatorios; para clientes, también se requiere "razonSocial"
    if (
      !usuario.tipo ||
      !usuario.nombre ||
      !usuario.documento ||
      !usuario.telefono ||
      !usuario.direccion ||
      !usuario.email ||
      !usuario.password ||
      (usuario.tipo === "cliente" && !usuario.razonSocial)
    ) {
      setError("⚠ Todos los campos obligatorios deben completarse.");
      setCargando(false);
      return;
    }

    // Preparar los datos de registro
    // Si el usuario es de tipo "cliente", se anidan los detalles en un objeto "detalles"
    let datosRegistro = { ...usuario };
    if (usuario.tipo === "cliente") {
      datosRegistro.detalles = {
        tipo: "cliente",           // Se especifica el tipo dentro de detalles
        razonSocial: usuario.razonSocial
      };
      // Opcional: elimina "razonSocial" de la raíz para evitar duplicados
      delete datosRegistro.razonSocial;
    }
    console.log("Datos que se envían al backend:", datosRegistro);


    try {
      console.log("📩 Enviando datos a la API:", JSON.stringify(datosRegistro, null, 2));
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/registro`;
      const respuesta = await axios.post(url, datosRegistro, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✔ Registro exitoso:", respuesta.data);
      setMensaje("✔ Usuario registrado correctamente.");
      setUsuario({
        tipo: "",
        nombre: "",
        documento: "",
        telefono: "",
        direccion: "",
        email: "",
        password: "",
        especialidad: "",
        codigoSeguridad: "",
        razonSocial: ""
      });
      setTimeout(() => navigate("/users"), 2000); // Redirige a la lista de usuarios después de 2 segundos
    } catch (error) {
      console.error("❌ Error en la solicitud:", error.response ? error.response.data : error.message);
      if (error.response) {
        setError(
          error.response.data.mensaje ||
          error.response.data.error ||
          "⚠ Error en el registro."
        );
      } else {
        setError("⚠ Error de conexión con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: "auto", marginTop: 3 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Registrar Nuevo Usuario
      </Typography>

      {mensaje && <Alert severity="success" sx={{ marginBottom: 2 }}>{mensaje}</Alert>}
      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

      <form onSubmit={registrarUsuario}>
        <Select
          value={usuario.tipo}
          name="tipo"
          onChange={manejarCambio}
          displayEmpty
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        >
          <MenuItem value="" disabled>Selecciona un tipo de usuario</MenuItem>
          <MenuItem value="cliente">Cliente</MenuItem>
          <MenuItem value="laboratorista">Laboratorista</MenuItem>
          <MenuItem value="administrador">Administrador</MenuItem>
          <MenuItem value="super_admin">Super Administrador</MenuItem>
        </Select>

        <TextField
          label="Nombre Completo"
          name="nombre"
          value={usuario.nombre}
          onChange={manejarCambio}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Documento"
          name="documento"
          value={usuario.documento}
          onChange={manejarCambio}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Teléfono"
          name="telefono"
          value={usuario.telefono}
          onChange={manejarCambio}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Dirección"
          name="direccion"
          value={usuario.direccion}
          onChange={manejarCambio}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Correo Electrónico"
          name="email"
          type="email"
          value={usuario.email}
          onChange={manejarCambio}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          value={usuario.password}
          onChange={manejarCambio}
          fullWidth
          required
          sx={{ marginBottom: 2 }}
        />

        {/* Campos condicionales */}
        {usuario.tipo === "laboratorista" && (
          <TextField
            label="Especialidad"
            name="especialidad"
            value={usuario.especialidad}
            onChange={manejarCambio}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
        )}
        {usuario.tipo === "super_admin" && (
          <TextField
            label="Código de Seguridad"
            name="codigoSeguridad"
            value={usuario.codigoSeguridad}
            onChange={manejarCambio}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
        )}
        {/* Campo condicional para tipo "cliente": Razón Social */}
        {usuario.tipo === "cliente" && (
          <TextField
            label="Razón Social"
            name="razonSocial"
            value={usuario.razonSocial}
            onChange={manejarCambio}
            fullWidth
            required
            sx={{ marginBottom: 2 }}
          />
        )}

        {usuario.tipo === "administrador" && (
          <Typography sx={{ marginBottom: 2 }}>Nivel de acceso: 1</Typography>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={cargando}>
          {cargando ? <CircularProgress size={24} /> : "Registrar Usuario"}
        </Button>
      </form>
    </Paper>
  );
};

export default RegistroUsuario;
