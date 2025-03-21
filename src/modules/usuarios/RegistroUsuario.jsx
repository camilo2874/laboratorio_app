// src/modules/usuarios/RegistroUsuario.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper, TextField, Button, Alert, CircularProgress, Typography, Select, MenuItem
} from "@mui/material";
import axios from "axios";
import AuthContext from "../../context/AuthContext"; // Ajusta la ruta si es necesario

const RegistroUsuario = () => {
  const { tipoUsuario } = useContext(AuthContext);
  const navigate = useNavigate();

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
    razonSocial: ""
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Definir las opciones de rol según el rol del usuario logueado
  let allowedOptions = [];
  if (tipoUsuario === "super_admin") {
    allowedOptions = [{ value: "administrador", label: "Administrador" }];
  } else if (tipoUsuario === "administrador") {
    allowedOptions = [
      { value: "cliente", label: "Cliente" },
      { value: "laboratorista", label: "Laboratorista" }
    ];
  }

  // Manejar cambios en los campos del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
    setError(null); // Resetear error al cambiar datos
  };

  // Enviar datos a la API con validaciones
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

    // Validación de campos obligatorios
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

    // Validación: Documento solo números
    if (!/^\d+$/.test(usuario.documento)) {
      setError("⚠ El documento debe contener solo números.");
      setCargando(false);
      return;
    }

    // Validación: Teléfono solo números y exactamente 10 dígitos
    if (!/^\d{10}$/.test(usuario.telefono)) {
      setError("⚠ El teléfono debe contener exactamente 10 dígitos numéricos.");
      setCargando(false);
      return;
    }

    // Validación: Correo electrónico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
      setError("⚠ El correo electrónico no tiene un formato válido.");
      setCargando(false);
      return;
    }

    // Validación: Contraseña mínimo 8 caracteres, al menos una mayúscula y un número
    if (usuario.password.length < 8) {
      setError("⚠ La contraseña debe tener al menos 8 caracteres.");
      setCargando(false);
      return;
    }
    if (!/[A-Z]/.test(usuario.password)) {
      setError("⚠ La contraseña debe incluir al menos una letra mayúscula.");
      setCargando(false);
      return;
    }
    if (!/\d/.test(usuario.password)) {
      setError("⚠ La contraseña debe incluir al menos un número.");
      setCargando(false);
      return;
    }

    // Preparar los datos de registro
    let datosRegistro = { ...usuario };
    if (usuario.tipo === "cliente") {
      datosRegistro.detalles = {
        tipo: "cliente",
        razonSocial: usuario.razonSocial
      };
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
      setTimeout(() => navigate("/users"), 2000);
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
          <MenuItem value="" disabled>
            Selecciona un tipo de usuario
          </MenuItem>
          {allowedOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
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