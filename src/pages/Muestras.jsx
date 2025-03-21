import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import senaLogo from "../assets/sena-logo.png";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  Button,
  TablePagination,
  Modal,
  Box,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Constantes de análisis (se usan en Registro y edición)
const ANALISIS_AGUA = [
  {
    categoria: "Metales",
    analisis: [
      "Aluminio", "Arsénico", "Cadmio", "Cobre", "Cromo", "Hierro",
      "Manganeso", "Mercurio", "Molibdeno", "Níquel", "Plata", "Plomo", "Zinc",
    ],
  },
  {
    categoria: "Química General",
    analisis: [
      "Carbono Orgánico Total (COT)", "Cloro residual", "Cloro Total", "Cloruros",
      "Conductividad", "Dureza Cálcica", "Dureza Magnésica", "Dureza Total",
      "Ortofosfatos", "Fósforo Total", "Nitratos", "Nitritos", "Nitrógeno amoniacal",
      "Nitrógeno total", "Oxígeno disuelto", "pH", "Potasio", "Sulfatos",
    ],
  },
  {
    categoria: "Físicos",
    analisis: [
      "Color aparente", "Color real", "Sólidos sedimentables", "Sólidos suspendidos",
      "Sólidos Totales", "Turbiedad",
    ],
  },
  {
    categoria: "Otros",
    analisis: ["Bromo", "Cobalto", "Yodo"],
  },
];

const ANALISIS_SUELO = [
  {
    categoria: "Propiedades Físicas",
    analisis: ["pH", "Conductividad Eléctrica", "Humedad", "Sólidos Totales"],
  },
  {
    categoria: "Propiedades Químicas",
    analisis: [
      "Carbono orgánico", "Materia orgánica", "Fósforo total",
      "Acidez intercambiable", "Bases intercambiables",
    ],
  },
  {
    categoria: "Macronutrientes",
    analisis: ["Calcio", "Magnesio", "Potasio", "Sodio"],
  },
  {
    categoria: "Micronutrientes",
    analisis: [
      "Cobre", "Zinc", "Hierro", "Manganeso", "Cadmio", "Mercurio",
    ],
  },
];

// Subcomponente para ver los detalles de una muestra
const DetailMuestraModal = ({ selectedMuestra, onClose, modalStyle }) => (
  <Modal open={selectedMuestra !== null} onClose={onClose}>
    <Box sx={modalStyle}>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Detalles de la Muestra
      </Typography>
      {selectedMuestra && (
        <TableContainer component={Paper} sx={{ maxWidth: "100%" }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                <TableCell>{selectedMuestra.id_muestra || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
                <TableCell>{selectedMuestra.nombreCliente || "No encontrado"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Teléfono</TableCell>
                <TableCell>{selectedMuestra.telefono || "No encontrado"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell>{selectedMuestra.tipoMuestreo || "N/A"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell>
                  {selectedMuestra.fechaHora
                    ? new Date(selectedMuestra.fechaHora).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Análisis</TableCell>
                <TableCell>
                  {selectedMuestra.analisisSeleccionados?.join(", ") || "Ninguno"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  </Modal>
);

// Subcomponente para editar una muestra
const EditMuestraModal = ({ editingMuestra, setEditingMuestra, onSave, modalStyle }) => {
  if (!editingMuestra) return null;

  return (
    <Modal open={editingMuestra !== null} onClose={() => setEditingMuestra(null)}>
      <Box sx={modalStyle}>
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Editar Muestra
        </Typography>
        <Box component="form" noValidate autoComplete="off" sx={{ "& .MuiTextField-root": { mb: 2 } }}>
          {/* Tipo de Muestra */}
          <Typography variant="subtitle2">Tipo de Muestra</Typography>
          <Select
            fullWidth
            value={editingMuestra.tipoMuestra || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                tipoMuestra: e.target.value,
                analisisSeleccionados: [],
              })
            }
          >
            <MenuItem value="">Seleccione</MenuItem>
            <MenuItem value="Agua">Agua</MenuItem>
            <MenuItem value="Suelo">Suelo</MenuItem>
          </Select>
          {/* Tipo de Muestreo */}
          <Typography variant="subtitle2">Tipo de Muestreo</Typography>
          <Select
            fullWidth
            value={editingMuestra.tipoMuestreo || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                tipoMuestreo: e.target.value,
              })
            }
          >
            <MenuItem value="">Seleccione</MenuItem>
            <MenuItem value="Simple">Simple</MenuItem>
            <MenuItem value="Completo">Completo</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
          {editingMuestra.tipoMuestreo === "Otro" && (
            <TextField
              fullWidth
              label="Especificar tipo de muestreo"
              value={editingMuestra.tipoMuestreoOtro || ""}
              onChange={(e) =>
                setEditingMuestra({
                  ...editingMuestra,
                  tipoMuestreoOtro: e.target.value,
                })
              }
            />
          )}
          {/* Campo Documento */}
          <TextField
            fullWidth
            label="Documento"
            value={editingMuestra.documento || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                documento: e.target.value,
              })
            }
          />
          {/* Fecha y Hora */}
          <TextField
            fullWidth
            label="Fecha y Hora"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={editingMuestra.fechaHora || ""}
            onChange={(e) =>
              setEditingMuestra({
                ...editingMuestra,
                fechaHora: e.target.value,
              })
            }
          />
          {/* Campos específicos para Muestra de tipo Agua */}
          {editingMuestra.tipoMuestra === "Agua" && (
            <>
              <Typography variant="subtitle2">Tipo de Agua</Typography>
              <Select
                fullWidth
                value={editingMuestra.tipoAgua || ""}
                onChange={(e) =>
                  setEditingMuestra({
                    ...editingMuestra,
                    tipoAgua: e.target.value,
                  })
                }
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="Potable">Potable</MenuItem>
                <MenuItem value="No Potable">No Potable</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
              {editingMuestra.tipoAgua === "Otro" && (
                <TextField
                  fullWidth
                  label="Especificar tipo de agua"
                  value={editingMuestra.otroTipoAgua || ""}
                  onChange={(e) =>
                    setEditingMuestra({
                      ...editingMuestra,
                      otroTipoAgua: e.target.value,
                    })
                  }
                />
              )}
            </>
          )}
          {/* Sección de Análisis */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Análisis a Realizar
          </Typography>
          {editingMuestra.tipoMuestra === "Agua" &&
            ANALISIS_AGUA.map((categoria, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
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
                          checked={editingMuestra.analisisSeleccionados?.includes(analisis)}
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            setEditingMuestra((prev) => ({
                              ...prev,
                              analisisSeleccionados: checked
                                ? [...(prev.analisisSeleccionados || []), value]
                                : (prev.analisisSeleccionados || []).filter((item) => item !== value),
                            }));
                          }}
                        />
                      }
                      label={analisis}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          {editingMuestra.tipoMuestra === "Suelo" &&
            ANALISIS_SUELO.map((categoria, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
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
                          checked={editingMuestra.analisisSeleccionados?.includes(analisis)}
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            setEditingMuestra((prev) => ({
                              ...prev,
                              analisisSeleccionados: checked
                                ? [...(prev.analisisSeleccionados || []), value]
                                : (prev.analisisSeleccionados || []).filter((item) => item !== value),
                            }));
                          }}
                        />
                      }
                      label={analisis}
                    />
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onSave}
            sx={{ mt: 2 }}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const Muestras = () => {
  const [muestras, setMuestras] = useState([]);
  const [filteredMuestras, setFilteredMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMuestra, setSelectedMuestra] = useState(null);
  const [editingMuestra, setEditingMuestra] = useState(null);

  // Estilo común para los modales
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  // Cargar muestras y asociarlas a usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const muestrasResponse = await axios.get("https://backendregistromuestra.onrender.com/muestras");
        const token = localStorage.getItem("token");

        if (!token) {
          setError("⚠ No tienes autorización. Inicia sesión.");
          setLoading(false);
          return;
        }

        const usuariosResponse = await axios.get("https://back-usuarios-f.onrender.com/api/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const muestrasCompletas = muestrasResponse.data.map((muestra) => {
          const usuario = usuariosResponse.data.find((user) => user.documento === muestra.documento);
          return {
            ...muestra,
            nombreCliente: usuario ? usuario.nombre : "No encontrado",
            telefono: usuario ? usuario.telefono : "No encontrado",
          };
        });

        setMuestras(muestrasCompletas);
        setFilteredMuestras(muestrasCompletas);
      } catch (error) {
        setError("⚠ Error al cargar las muestras. Verifica tu conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let filtered = [...muestras];
    if (filterType !== "todos") {
      filtered = filtered.filter(
        (muestra) =>
          muestra.tipoMuestreo?.toLowerCase() === filterType.toLowerCase()
      );
    }
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (muestra) =>
          muestra.nombreCliente.toLowerCase().includes(search.toLowerCase()) ||
          String(muestra.id_muestra).includes(search)
      );
    }
    setFilteredMuestras(filtered);
    setPage(0);
  }, [search, filterType, muestras]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleFilterChange = (e) => setFilterType(e.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para generar PDF
  const generarPDFMuestra = (muestra, preview = false) => {
    const doc = new jsPDF();
    doc.addImage(senaLogo, "PNG", 10, 10, 40, 20);
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(0, 49, 77);
    doc.rect(0, 35, 210, 10, "F");
    doc.text("Detalles de la Muestra", 14, 42);
    autoTable(doc, {
      startY: 50,
      head: [["Campo", "Valor"]],
      body: [
        ["ID Muestra", muestra.id_muestra || "N/A"],
        ["Documento", muestra.documento || "N/A"],
        ["Nombre del Cliente", muestra.nombreCliente || "No encontrado"],
        ["Teléfono", muestra.telefono || "No encontrado"],
        ["Tipo Muestreo", muestra.tipoMuestreo || "N/A"],
        [
          "Fecha",
          muestra.fechaHora
            ? new Date(muestra.fechaHora).toLocaleDateString()
            : "N/A",
        ],
        [
          "Análisis Seleccionados",
          muestra.analisisSeleccionados?.length > 0
            ? muestra.analisisSeleccionados.join(", ")
            : "Ninguno",
        ],
      ],
      theme: "grid",
    });
    doc.setFontSize(12);
    doc.text(
      "Nota: Información confidencial para uso interno.",
      14,
      doc.lastAutoTable.finalY + 10
    );
    if (preview) {
      window.open(doc.output("bloburl"), "_blank");
    } else {
      doc.save(`Muestra_${muestra.id_muestra}.pdf`);
    }
  };

  const handleEditMuestra = (muestra) => setEditingMuestra(muestra);

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `https://backendregistromuestra.onrender.com/muestras/${editingMuestra.id_muestra}`,
        editingMuestra,
        { headers: { "Content-Type": "application/json" } }
      );
      const updatedMuestras = muestras.map((m) =>
        m.id_muestra === editingMuestra.id_muestra ? editingMuestra : m
      );
      setMuestras(updatedMuestras);
      setFilteredMuestras(updatedMuestras);
      setEditingMuestra(null);
    } catch (error) {
      setError("⚠ Error al actualizar la muestra.");
    }
  };

  if (loading)
    return (
      <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
    );
  if (error)
    return (
      <Alert severity="error" sx={{ margin: "20px" }}>
        {error}
      </Alert>
    );

  return (
    <Paper sx={{ padding: 2, marginTop: 2, boxShadow: 3 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: 2, fontWeight: "bold" }}
      >
        🔬 Muestras Registradas
      </Typography>
      <Select
        value={filterType}
        onChange={handleFilterChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="Agua">Agua</MenuItem>
        <MenuItem value="Suelo">Suelo</MenuItem>
      </Select>
      <TextField
        label="Buscar muestra (ID o cliente)"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={handleSearchChange}
      />
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "#39A900" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Cliente
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Teléfono
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Tipo
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Fecha
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Análisis
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMuestras
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((muestra) => (
                <TableRow
                  key={muestra.id_muestra}
                  onClick={() => setSelectedMuestra(muestra)}
                  sx={{
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                    cursor: "pointer",
                  }}
                >
                  <TableCell>{muestra.id_muestra || "N/A"}</TableCell>
                  <TableCell>{muestra.nombreCliente || "No encontrado"}</TableCell>
                  <TableCell>{muestra.telefono || "No encontrado"}</TableCell>
                  <TableCell>{muestra.tipoMuestreo || "N/A"}</TableCell>
                  <TableCell>
                    {muestra.fechaHora
                      ? new Date(muestra.fechaHora).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {muestra.analisisSeleccionados
                      ? muestra.analisisSeleccionados.join(", ")
                      : "Ninguno"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        generarPDFMuestra(muestra, true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        generarPDFMuestra(muestra);
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMuestra(muestra);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredMuestras.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* Modales */}
      <DetailMuestraModal
        selectedMuestra={selectedMuestra}
        onClose={() => setSelectedMuestra(null)}
        modalStyle={modalStyle}
      />
      <EditMuestraModal
        editingMuestra={editingMuestra}
        setEditingMuestra={setEditingMuestra}
        onSave={handleSaveEdit}
        modalStyle={modalStyle}
      />
    </Paper>
  );
};

export default Muestras;
