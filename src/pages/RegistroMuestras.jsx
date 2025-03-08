import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const RegistroMuestras = () => {
  const [formData, setFormData] = useState({
    tipoMuestreo: "",
    tipoAgua: "",
    otroTipoAgua: "",
    documento: "",
    fechaHora: "",
    analisisSeleccionados: [],
  });

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const tiposAgua = ["Agua Potable", "Agua Natural", "Agua Residual", "Otro"];

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://unificado-u.onrender.com/api/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(response.data);
      } catch (error) {
        setError("Error al cargar los clientes.");
      }
    };
    fetchClientes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleTipoAguaChange = (e) => {
    setFormData({
      ...formData,
      tipoAgua: e.target.value,
      otroTipoAgua: e.target.value === "Otro" ? "" : formData.otroTipoAgua,
    });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      analisisSeleccionados: checked
        ? [...prev.analisisSeleccionados, value]
        : prev.analisisSeleccionados.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!formData.tipoMuestreo || !formData.documento || !formData.fechaHora || formData.analisisSeleccionados.length === 0) {
      setError("⚠ Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    const tipoAguaFinal = formData.tipoAgua === "Otro" ? formData.otroTipoAgua : formData.tipoAgua;

    try {
      const response = await axios.post(
        "https://backendregistromuestra.onrender.com/muestras",
        { ...formData, tipoAgua: tipoAguaFinal },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccess("✔ Muestra registrada exitosamente.");
      setTimeout(() => navigate("/muestras"), 2000);
    } catch (error) {
      setError("Error al registrar la muestra.");
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: "auto", marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>Registro de Muestra</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        {/* Tipo de Muestreo */}
        <Select
          fullWidth
          name="tipoMuestreo"
          value={formData.tipoMuestreo}
          onChange={handleChange}
          displayEmpty
          sx={{ marginBottom: 2 }}
        >
          <MenuItem value="">Seleccione el tipo de muestra</MenuItem>
          <MenuItem value="Agua">Agua</MenuItem>
          <MenuItem value="Suelo">Suelo</MenuItem>
        </Select>

        {/* Tipo de Agua (si selecciona Agua como tipo de muestreo) */}
        {formData.tipoMuestreo === "Agua" && (
          <>
            <Select
              fullWidth
              name="tipoAgua"
              value={formData.tipoAgua}
              onChange={handleTipoAguaChange}
              displayEmpty
              sx={{ marginBottom: 2 }}
            >
              <MenuItem value="">Seleccione el tipo de agua</MenuItem>
              {tiposAgua.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </Select>

            {/* Campo adicional si elige "Otro" */}
            {formData.tipoAgua === "Otro" && (
              <TextField
                fullWidth
                label="Especificar tipo de agua"
                name="otroTipoAgua"
                value={formData.otroTipoAgua}
                onChange={handleChange}
                sx={{ marginBottom: 2 }}
              />
            )}
          </>
        )}

        {/* Cliente */}
        <Select
          fullWidth
          name="documento"
          value={formData.documento}
          onChange={handleChange}
          displayEmpty
          sx={{ marginBottom: 2 }}
        >
          <MenuItem value="">Seleccione un cliente</MenuItem>
          {clientes.map((cliente) => (
            <MenuItem key={cliente.documento} value={cliente.documento}>
              {cliente.nombre} - {cliente.documento}
            </MenuItem>
          ))}
        </Select>

        {/* Fecha y Hora */}
        <TextField
          fullWidth
          type="datetime-local"
          name="fechaHora"
          value={formData.fechaHora}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
        />

        {/* Análisis a realizar */}
        <Typography variant="body1">Análisis a realizar:</Typography>
        {[
          "PH",
          "Conductividad",
          "Turbiedad",
          "Cloro Residual",
          "Metales Pesados",
        ].map((analisis) => (
          <FormControlLabel
            key={analisis}
            control={
              <Checkbox
                value={analisis}
                checked={formData.analisisSeleccionados.includes(analisis)}
                onChange={handleCheckboxChange}
              />
            }
            label={analisis}
          />
        ))}

        {/* Botón de envío */}
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Registrar Muestra"}
        </Button>
      </form>
    </Paper>
  );
};

export default RegistroMuestras;
