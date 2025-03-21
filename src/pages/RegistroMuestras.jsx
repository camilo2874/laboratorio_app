import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  Box,
  Modal,
  Backdrop,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const RegistroMuestras = () => {
  const navigate = useNavigate();

  // Estado del formulario de registro
  const [formData, setFormData] = useState({
    tipoMuestra: "",
    tipoMuestreo: "",
    // Estos campos de agua solo se usarán si el tipo de muestra es "Agua"
    tipoAgua: "",
    descripcion: "",
    tipoPersonalizado: "",
    documento: "",
    fechaHora: "",
    analisisSeleccionados: [],
    tipoMuestreoOtro: "",
  });

  // Estados para usuario validado
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [validatingUser, setValidatingUser] = useState(false);
  const [userValidationError, setUserValidationError] = useState(null);

  // Estados para mensajes de error, éxito y carga
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para el modal de registro de cliente
  const [openModal, setOpenModal] = useState(false);
  const [clienteData, setClienteData] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    direccion: "",
    email: "",
    password: "",
    razonSocial: "",
  });
  const [registroError, setRegistroError] = useState(null);
  const [registroExito, setRegistroExito] = useState(null);
  const [registrando, setRegistrando] = useState(false);

  // Listas de análisis
  const analisisAgua = [
    {
      categoria: "Metales",
      analisis: [
        "Aluminio",
        "Arsénico",
        "Cadmio",
        "Cobre",
        "Cromo",
        "Hierro",
        "Manganeso",
        "Mercurio",
        "Molibdeno",
        "Níquel",
        "Plata",
        "Plomo",
        "Zinc",
      ],
    },
    {
      categoria: "Química General",
      analisis: [
        "Carbono Orgánico Total (COT)",
        "Cloro residual",
        "Cloro Total",
        "Cloruros",
        "Conductividad",
        "Dureza Cálcica",
        "Dureza Magnésica",
        "Dureza Total",
        "Ortofosfatos",
        "Fósforo Total",
        "Nitratos",
        "Nitritos",
        "Nitrógeno amoniacal",
        "Nitrógeno total",
        "Oxígeno disuelto",
        "pH",
        "Potasio",
        "Sulfatos",
      ],
    },
    {
      categoria: "Físicos",
      analisis: [
        "Color aparente",
        "Color real",
        "Sólidos sedimentables",
        "Sólidos suspendidos",
        "Sólidos Totales",
        "Turbiedad",
      ],
    },
    {
      categoria: "Otros",
      analisis: ["Bromo", "Cobalto", "Yodo"],
    },
  ];

  const analisisSuelo = [
    {
      categoria: "Propiedades Físicas",
      analisis: ["pH", "Conductividad Eléctrica", "Humedad", "Sólidos Totales"],
    },
    {
      categoria: "Propiedades Químicas",
      analisis: [
        "Carbono orgánico",
        "Materia orgánica",
        "Fósforo total",
        "Acidez intercambiable",
        "Bases intercambiables",
      ],
    },
    {
      categoria: "Macronutrientes",
      analisis: ["Calcio", "Magnesio", "Potasio", "Sodio"],
    },
    {
      categoria: "Micronutrientes",
      analisis: ["Cobre", "Zinc", "Hierro", "Manganeso", "Cadmio", "Mercurio"],
    },
  ];

  // Determinar qué lista de análisis mostrar según el tipo de muestra
  const analisisDisponibles =
    formData.tipoMuestra === "Suelo"
      ? analisisSuelo
      : formData.tipoMuestra === "Agua"
      ? analisisAgua
      : [];

  // Manejar cambios en formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setUserValidationError(null);
  };

  // Manejar cambios en los checkbox de análisis
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      analisisSeleccionados: checked
        ? [...prev.analisisSeleccionados, value]
        : prev.analisisSeleccionados.filter((item) => item !== value),
    }));
  };

  // Validar usuario a través del documento
  const handleValidateUser = async () => {
    if (!formData.documento) {
      setUserValidationError("Por favor ingrese el número de documento.");
      return;
    }
    setValidatingUser(true);
    setUserValidationError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://back-usuarios-f.onrender.com/api/usuarios/buscar?documento=${formData.documento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.documento) {
        setClienteEncontrado(response.data);
        setUserValidationError(null);
      } else {
        setUserValidationError("Usuario no encontrado.");
        setClienteEncontrado(null);
      }
    } catch (error) {
      console.error(
        "Error al validar usuario:",
        error.response ? error.response.data : error.message
      );
      setUserValidationError("Usuario no encontrado.");
      setClienteEncontrado(null);
    }
    setValidatingUser(false);
  };

  // Envío del formulario de registro de muestra
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validaciones básicas
    if (
      !formData.tipoMuestra ||
      !formData.tipoMuestreo ||
      !formData.documento ||
      !formData.fechaHora ||
      formData.analisisSeleccionados.length === 0
    ) {
      setError("⚠ Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    if (formData.tipoMuestreo === "Otro" && !formData.tipoMuestreoOtro) {
      setError("⚠ Por favor, especifique el tipo de muestreo.");
      setLoading(false);
      return;
    }

    if (!clienteEncontrado) {
      setError("⚠ Debe validar el usuario antes de continuar.");
      setLoading(false);
      return;
    }

    // Si el tipo de agua es "Otra", se realiza la asignación mediante la API
    if (formData.tipoAgua === "Otra") {
      try {
        const assignResponse = await axios.post(
          "https://backend-daniel.onrender.com/api/tipos-agua/asignar/MUESTRA-H06",
          {
            descripcion: formData.descripcion,
            tipoPersonalizado: formData.tipoPersonalizado,
          }
        );
        console.log("Asignación de tipo de agua:", assignResponse.data);
      } catch (assignError) {
        console.error(
          "Error al asignar tipo de agua:",
          assignError.response ? assignError.response.data : assignError.message
        );
        // Puedes detener el proceso o continuar según tu lógica
      }
    }

    const tipoMuestreoFinal =
      formData.tipoMuestreo === "Otro" ? formData.tipoMuestreoOtro : formData.tipoMuestreo;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://backendregistromuestra.onrender.com/api/muestras",
        {
          ...formData,
          tipoMuestreo: tipoMuestreoFinal,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Respuesta del servidor:", response.data);
      setSuccess("✔ Muestra registrada exitosamente.");
      setTimeout(() => navigate("/muestras"), 2000);
    } catch (error) {
      console.error(
        "Error al registrar la muestra:",
        error.response ? error.response.data : error.message
      );
      setError("Error al registrar la muestra.");
    }
    setLoading(false);
  };

  // Modal para registrar cliente
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setClienteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistrarCliente = async () => {
    if (!clienteData.documento || !clienteData.nombre || !clienteData.email) {
      setRegistroError("⚠ Todos los campos obligatorios deben completarse.");
      return;
    }
    setRegistrando(true);
    setRegistroError(null);
    setRegistroExito(null);
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("usuario"));
      const userRole = userData?.rol?.name || "";
      const newClienteData = { ...clienteData, tipo: "cliente" };
      if (
        userRole === "administrador" &&
        newClienteData.tipo !== "cliente" &&
        newClienteData.tipo !== "laboratorista"
      ) {
        setRegistroError("⚠ Un administrador solo puede registrar clientes o laboratoristas.");
        setRegistrando(false);
        return;
      }
      const response = await axios.post(
        "https://back-usuarios-f.onrender.com/api/usuarios/registro",
        newClienteData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Cliente registrado con éxito:", response.data);
      setRegistroExito("✔ Cliente registrado correctamente.");
      setClienteData({
        nombre: "",
        documento: "",
        telefono: "",
        direccion: "",
        email: "",
        password: "",
        razonSocial: "",
      });
    } catch (error) {
      console.error(
        "Error al registrar el cliente:",
        error.response ? error.response.data : error.message
      );
      setRegistroError(
        error.response?.data?.detalles || "⚠ Error en el registro."
      );
    }
    setRegistrando(false);
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 800, margin: "auto", marginTop: 3 }}>
      <Typography variant="h5" gutterBottom>
        Registro de Muestra
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Selección de Tipo de Muestra */}
        <Select
          fullWidth
          name="tipoMuestra"
          value={formData.tipoMuestra}
          onChange={handleChange}
          displayEmpty
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Tipo de Muestra</MenuItem>
          <MenuItem value="Agua">Agua</MenuItem>
          <MenuItem value="Suelo">Suelo</MenuItem>
        </Select>

        {/* Selección de Tipo de Muestreo */}
        <Select
          fullWidth
          name="tipoMuestreo"
          value={formData.tipoMuestreo}
          onChange={handleChange}
          displayEmpty
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Tipo de Muestreo</MenuItem>
          <MenuItem value="Simple">Simple</MenuItem>
          <MenuItem value="Completo">Completo</MenuItem>
          <MenuItem value="Otro">Otro</MenuItem>
        </Select>
        {formData.tipoMuestreo === "Otro" && (
          <TextField
            fullWidth
            label="Especificar tipo de muestreo"
            name="tipoMuestreoOtro"
            value={formData.tipoMuestreoOtro}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        )}

        {/* La selección de Tipo de Agua solo se muestra si el Tipo de Muestra es Agua */}
        {formData.tipoMuestra === "Agua" && (
          <>
            <Select
              fullWidth
              name="tipoAgua"
              value={formData.tipoAgua}
              onChange={handleChange}
              displayEmpty
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Tipo de Agua</MenuItem>
              <MenuItem value="Potable">Potable</MenuItem>
              <MenuItem value="Natural">Natural</MenuItem>
              <MenuItem value="Residual">Residual</MenuItem>
              <MenuItem value="Otra">Otra</MenuItem>
            </Select>
            {formData.tipoAgua === "Otra" && (
              <>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Tipo Personalizado"
                  name="tipoPersonalizado"
                  value={formData.tipoPersonalizado}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </>
        )}

        {/* Número de Documento y Validación */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            label="Número de Documento"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
          />
          <Button
            variant="outlined"
            onClick={handleValidateUser}
            sx={{ ml: 1, height: "56px" }}
            disabled={validatingUser}
          >
            {validatingUser ? <CircularProgress size={24} /> : "Validar"}
          </Button>
          {userValidationError && (
            <Button
              variant="outlined"
              onClick={() => setOpenModal(true)}
              sx={{ ml: 1, height: "56px" }}
            >
              Registrar Cliente
            </Button>
          )}
        </Box>
        {userValidationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {userValidationError}
          </Alert>
        )}
        {clienteEncontrado && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Usuario encontrado:
            </Typography>
            <Typography variant="body1">
              Nombre: {clienteEncontrado.nombre}
            </Typography>
            <Typography variant="body1">
              Documento: {clienteEncontrado.documento}
            </Typography>
            <Typography variant="body1">
              Correo: {clienteEncontrado.email}
            </Typography>
          </Box>
        )}

        {/* Fecha y Hora */}
        <TextField
          fullWidth
          type="datetime-local"
          name="fechaHora"
          value={formData.fechaHora}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        {/* Selección de Análisis */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          Análisis a realizar:
        </Typography>
        {formData.tipoMuestra === "Agua" &&
          analisisDisponibles.map((categoria, index) => (
            <Accordion key={index} sx={{ mb: 1, boxShadow: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "#f5f5f5" }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {categoria.categoria}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {categoria.analisis.map((analisis, idx) => (
                  <FormControlLabel
                    key={idx}
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
              </AccordionDetails>
            </Accordion>
          ))}
        {formData.tipoMuestra === "Suelo" &&
          analisisDisponibles.map((categoria, index) => (
            <Accordion key={index} sx={{ mb: 1, boxShadow: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: "#f5f5f5" }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {categoria.categoria}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {categoria.analisis.map((analisis, idx) => (
                  <FormControlLabel
                    key={idx}
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
              </AccordionDetails>
            </Accordion>
          ))}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Registrar Muestra"}
        </Button>
      </form>

      {/* Modal para registrar Cliente */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade
          in={openModal}
          onExited={() => {
            setClienteData({
              nombre: "",
              documento: "",
              telefono: "",
              direccion: "",
              email: "",
              password: "",
              razonSocial: "",
            });
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Registrar Cliente
            </Typography>
            <TextField
              fullWidth
              label="Nombre Completo"
              name="nombre"
              value={clienteData.nombre}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Documento"
              name="documento"
              value={clienteData.documento}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={clienteData.telefono}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={clienteData.direccion}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              value={clienteData.email}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={clienteData.password}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Razón Social"
              name="razonSocial"
              value={clienteData.razonSocial}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
            />
            {registroError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {registroError}
              </Alert>
            )}
            {registroExito && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {registroExito}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleRegistrarCliente}
              disabled={registrando}
            >
              {registrando ? <CircularProgress size={24} /> : "Registrar"}
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Paper>
  );
};

export default RegistroMuestras;
