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
  // Estado del formulario para registrar la MUESTRA
  const [formData, setFormData] = useState({
    tipoMuestra: "",
    tipoMuestreo: "",
    tipoAgua: "",
    otroTipoAgua: "",
    documento: "",
    fechaHora: "",
    analisisSeleccionados: [],
    tipoMuestreoOtro: "",
  });

  // Estado para usuario validado
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [validatingUser, setValidatingUser] = useState(false);
  const [userValidationError, setUserValidationError] = useState(null);

  // Otros estados para manejo de errores, carga y éxito
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado para el modal de registro de CLIENTE
  const [openModal, setOpenModal] = useState(false);

  // Aquí renombramos "nombreCompleto" a "nombre" para que coincida con lo que exige el backend
  const [clienteData, setClienteData] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    direccion: "",
    email: "",
    password: "",
    razonSocial: "",
  });

  // Estados para el registro de cliente (errores, éxito y carga)
  const [registroError, setRegistroError] = useState(null);
  const [registroExito, setRegistroExito] = useState(null);
  const [registrando, setRegistrando] = useState(false);

  const navigate = useNavigate();

  // Listas de análisis
  const analisisAgua = [
    {
      categoria: "Metales",
      analisis: [
        "Aluminio", "Arsénico", "Cadmio", "Cobre", "Cromo", "Hierro",
        "Manganeso", "Mercurio", "Molibdeno", "Níquel", "Plata", "Plomo", "Zinc"
      ],
    },
    {
      categoria: "Química General",
      analisis: [
        "Carbono Orgánico Total (COT)", "Cloro residual", "Cloro Total", "Cloruros",
        "Conductividad", "Dureza Cálcica", "Dureza Magnésica", "Dureza Total",
        "Ortofosfatos", "Fósforo Total", "Nitratos", "Nitritos", "Nitrógeno amoniacal",
        "Nitrógeno total", "Oxígeno disuelto", "pH", "Potasio", "Sulfatos"
      ],
    },
    {
      categoria: "Físicos",
      analisis: [
        "Color aparente", "Color real", "Sólidos sedimentables", "Sólidos suspendidos",
        "Sólidos Totales", "Turbiedad"
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
      analisis: [
        "pH", "Conductividad Eléctrica", "Humedad", "Sólidos Totales"
      ],
    },
    {
      categoria: "Propiedades Químicas",
      analisis: [
        "Carbono orgánico", "Materia orgánica", "Fósforo total",
        "Acidez intercambiable", "Bases intercambiables"
      ],
    },
    {
      categoria: "Macronutrientes",
      analisis: ["Calcio", "Magnesio", "Potasio", "Sodio"],
    },
    {
      categoria: "Micronutrientes",
      analisis: [
        "Cobre", "Zinc", "Hierro", "Manganeso", "Cadmio", "Mercurio"
      ],
    },
  ];

  // Determina cuál lista de análisis mostrar
  const analisisDisponibles =
    formData.tipoMuestra === "Suelo"
      ? analisisSuelo
      : formData.tipoMuestra === "Agua"
      ? analisisAgua
      : [];

  // Ejemplo de validación de cédula (opcional)
  const validarCedula = (cedula) => {
    if (cedula.length !== 10) return false;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const verificador = parseInt(cedula[9], 10);
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula[i], 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }
    const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return resultado === verificador;
  };

  // Manejar cambios en formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setUserValidationError(null);
  };

  // Manejar checkbox de análisis
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      analisisSeleccionados: checked
        ? [...prev.analisisSeleccionados, value]
        : prev.analisisSeleccionados.filter((item) => item !== value),
    }));
  };

  // Validar usuario por documento
  const handleValidateUser = async () => {
    if (!formData.documento) {
      setUserValidationError("Por favor ingrese el número de documento.");
      return;
    }
    setValidatingUser(true);
    setUserValidationError(null);

    try {
      const token = localStorage.getItem("token");
      console.log("Validando usuario con documento:", formData.documento);
      console.log("Token enviado:", token);

      // Uso de template literals para URL y headers
      const response = await axios.get(
        `https://back-usuarios-f.onrender.com/api/usuarios/buscar?documento=${formData.documento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta de la API:", response.data);

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

  // Envío del formulario de la MUESTRA
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

    // Validar "Otro" en tipo de muestreo
    if (formData.tipoMuestreo === "Otro" && !formData.tipoMuestreoOtro) {
      setError("⚠ Por favor, especifique el tipo de muestreo.");
      setLoading(false);
      return;
    }

    // Validar que haya un usuario encontrado
    if (!clienteEncontrado) {
      setError("⚠ Debe validar el usuario antes de continuar.");
      setLoading(false);
      return;
    }

    // Ajustar tipo de agua y muestreo si es "Otro"
    const tipoAguaFinal =
      formData.tipoAgua === "Otro" ? formData.otroTipoAgua : formData.tipoAgua;
    const tipoMuestreoFinal =
      formData.tipoMuestreo === "Otro" ? formData.tipoMuestreoOtro : formData.tipoMuestreo;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://backendregistromuestra.onrender.com/muestras",
        { 
          ...formData,
          tipoAgua: tipoAguaFinal,
          tipoMuestreo: tipoMuestreoFinal 
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

  // Manejo del modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Manejar cambios en los campos del modal (clienteData)
  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setClienteData({ ...clienteData, [name]: value });
  };

  // Registrar un nuevo cliente desde el modal
  const handleRegistrarCliente = async () => {
    // Verifica que los campos obligatorios estén llenos
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

      console.log("Usuario autenticado con rol:", userRole);

      // Si tu backend exige un 'tipo' para el usuario, puedes forzarlo aquí:
      const newClienteData = {
        ...clienteData,
        tipo: "cliente", // <--- si solo quieres crear clientes
      };

      // Validar si el administrador puede registrar este tipo de usuario
      if (
        userRole === "administrador" &&
        newClienteData.tipo !== "cliente" &&
        newClienteData.tipo !== "laboratorista"
      ) {
        setRegistroError(
          "⚠ Un administrador solo puede registrar clientes o laboratoristas."
        );
        setRegistrando(false);
        return;
      }

      // Enviamos "newClienteData" en lugar de "formData"
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

      // Limpia el formulario del modal
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

      {/* Formulario principal para la MUESTRA */}
      <form onSubmit={handleSubmit} autoComplete="off">
        <Select
          fullWidth
          name="tipoMuestra"
          value={formData.tipoMuestra}
          onChange={handleChange}
          displayEmpty
          sx={{ mb: 2 }}
          autoComplete="off"
        >
          <MenuItem value="">tipo de muestra</MenuItem>
          <MenuItem value="Agua">Agua</MenuItem>
          <MenuItem value="Suelo">Suelo</MenuItem>
        </Select>

        <Select
          fullWidth
          name="tipoMuestreo"
          value={formData.tipoMuestreo}
          onChange={handleChange}
          displayEmpty
          sx={{ mb: 2 }}
          autoComplete="off"
        >
          <MenuItem value="">tipo de muestreo</MenuItem>
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
            autoComplete="off"
          />
        )}

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            label="Número de Documento"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            autoComplete="off"
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
              onClick={handleOpenModal}
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

        <TextField
          fullWidth
          type="datetime-local"
          name="fechaHora"
          value={formData.fechaHora}
          onChange={handleChange}
          sx={{ mb: 2 }}
          autoComplete="off"
        />

        <Typography variant="body1" sx={{ mb: 1 }}>
          Análisis a realizar:
        </Typography>

        {formData.tipoMuestra === "Agua" && (
          analisisAgua.map((categoria, index) => (
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
          ))
        )}

        {formData.tipoMuestra === "Suelo" && (
          analisisSuelo.map((categoria, index) => (
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
          ))
        )}

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

      {/* Modal para registrar cliente */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal} onExited={() => {
          // Reinicia los campos al cerrar el modal
          setClienteData({
            nombre: "",
            documento: "",
            telefono: "",
            direccion: "",
            email: "",
            password: "",
            razonSocial: "",
          });
        }}>
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
              autoComplete="off"
            />
            <TextField
              fullWidth
              label="Documento"
              name="documento"
              value={clienteData.documento}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={clienteData.telefono}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={clienteData.direccion}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            <TextField
              fullWidth
              label="Correo Electrónico"
              name="email"
              value={clienteData.email}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={clienteData.password}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              label="Razón Social"
              name="razonSocial"
              value={clienteData.razonSocial}
              onChange={handleClienteChange}
              sx={{ mb: 2 }}
              autoComplete="off"
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
