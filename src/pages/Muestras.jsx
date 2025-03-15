import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import senaLogo from "../assets/sena-logo.png"; // Importamos el logo

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Alert, TextField, Select, MenuItem, Button, TablePagination,
  Modal, Box, Typography, IconButton, Checkbox, FormControlLabel
} from "@mui/material";

// Importar iconos
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";

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
  const [editingMuestra, setEditingMuestra] = useState(null); // Estado para la muestra en edición

  // Estilo para el modal
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  // 📌 Cargar muestras y asociar con clientes
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
          headers: { Authorization: `Bearer ${token}` }
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

  // 📌 Aplicar filtro y búsqueda
  useEffect(() => {
    let filtered = [...muestras];

    if (filterType !== "todos") {
      filtered = filtered.filter(muestra => muestra.tipoMuestreo?.toLowerCase() === filterType.toLowerCase());
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(muestra =>
        muestra.nombreCliente.toLowerCase().includes(search.toLowerCase()) ||
        String(muestra.id_muestra).includes(search)
      );
    }

    setFilteredMuestras(filtered);
    setPage(0);
  }, [search, filterType, muestras]);

  // 📌 Manejo de eventos
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleFilterChange = (e) => setFilterType(e.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 📌 Generar PDF con colores institucionales y el logo
  const generarPDFMuestra = (muestra, preview = false) => {
    const doc = new jsPDF();
    
    // Agregar logo SENA
    doc.addImage(senaLogo, "PNG", 10, 10, 40, 20);

    // Encabezado con colores institucionales
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(0, 49, 77); // Color institucional
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
        ["Fecha", muestra.fechaHora ? new Date(muestra.fechaHora).toLocaleDateString() : "N/A"],
        ["Análisis Seleccionados", muestra.analisisSeleccionados?.length > 0 ? muestra.analisisSeleccionados.join(", ") : "Ninguno"],
      ],
      theme: "grid",
    });

    doc.setFontSize(12);
    doc.text("Nota: Información confidencial para uso interno.", 14, doc.lastAutoTable.finalY + 10);

    if (preview) {
      window.open(doc.output("bloburl"), "_blank");
    } else {
      doc.save(`Muestra_${muestra.id_muestra}.pdf`);
    }
  };

  // 📌 Editar muestra
  const handleEditMuestra = (muestra) => {
    setEditingMuestra(muestra); // Abrir el modal de edición con los datos de la muestra
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `https://backendregistromuestra.onrender.com/muestras/${editingMuestra.id_muestra}`,
        editingMuestra,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Actualizar el estado de las muestras
      const updatedMuestras = muestras.map((m) =>
        m.id_muestra === editingMuestra.id_muestra ? editingMuestra : m
      );
      setMuestras(updatedMuestras);
      setFilteredMuestras(updatedMuestras);

      setEditingMuestra(null); // Cerrar el modal de edición
    } catch (error) {
      setError("⚠ Error al actualizar la muestra.");
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert severity="error" sx={{ margin: "20px" }}>{error}</Alert>;

  return (
    <Paper sx={{ padding: 2, marginTop: 2, boxShadow: 3 }}>
      <Typography variant="h4" align="center" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
        🔬 Muestras Registradas
      </Typography>

      {/* Filtro por tipo de muestra */}
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

      {/* Buscador */}
      <TextField
        label="Buscar muestra (ID o cliente)"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={handleSearchChange}
      />

      {/* Tabla de muestras */}
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "#39A900" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cliente</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Teléfono</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Análisis a realizar</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMuestras.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((muestra) => (
              <TableRow 
                key={muestra.id_muestra} 
                onClick={() => setSelectedMuestra(muestra)}
                sx={{
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                  cursor: "pointer"
                }}
              >
                <TableCell>{muestra.id_muestra || "N/A"}</TableCell>
                <TableCell>{muestra.nombreCliente || "No encontrado"}</TableCell>
                <TableCell>{muestra.telefono || "No encontrado"}</TableCell>
                <TableCell>{muestra.tipoMuestreo || "N/A"}</TableCell>
                <TableCell>{muestra.fechaHora ? new Date(muestra.fechaHora).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>{muestra.analisisSeleccionados ? muestra.analisisSeleccionados.join(", ") : "Ninguno"}</TableCell>
                <TableCell>
                  <IconButton 
                    color="secondary" 
                    onClick={(e) => { e.stopPropagation(); generarPDFMuestra(muestra, true); }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={(e) => { e.stopPropagation(); generarPDFMuestra(muestra); }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    onClick={(e) => { e.stopPropagation(); handleEditMuestra(muestra); }}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={filteredMuestras.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal para ver detalles de la muestra */}
      <Modal
        open={selectedMuestra !== null}
        onClose={() => setSelectedMuestra(null)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Detalles de la Muestra
          </Typography>
          {selectedMuestra && (
            <TableContainer component={Paper} sx={{ maxWidth: '100%' }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell>{selectedMuestra.id_muestra || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                    <TableCell>{selectedMuestra.nombreCliente || "No encontrado"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                    <TableCell>{selectedMuestra.telefono || "No encontrado"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell>{selectedMuestra.tipoMuestreo || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                    <TableCell>{selectedMuestra.fechaHora ? new Date(selectedMuestra.fechaHora).toLocaleDateString() : "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Análisis</TableCell>
                    <TableCell>{selectedMuestra.analisisSeleccionados?.join(", ") || "Ninguno"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Modal>

      {/* Modal para editar muestra */}
      <Modal
        open={editingMuestra !== null}
        onClose={() => setEditingMuestra(null)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Editar Muestra
          </Typography>
          {editingMuestra && (
            <Box component="form" noValidate autoComplete="off">
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Muestreo</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={editingMuestra.tipoMuestreo}
                          onChange={(e) => setEditingMuestra({ ...editingMuestra, tipoMuestreo: e.target.value })}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fecha y Hora</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="datetime-local"
                          value={editingMuestra.fechaHora}
                          onChange={(e) => setEditingMuestra({ ...editingMuestra, fechaHora: e.target.value })}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>Análisis a realizar</TableCell>
                      <TableCell>
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
                                checked={editingMuestra.analisisSeleccionados?.includes(analisis)}
                                onChange={(e) => {
                                  const { value, checked } = e.target;
                                  setEditingMuestra((prev) => ({
                                    ...prev,
                                    analisisSeleccionados: checked
                                      ? [...prev.analisisSeleccionados, value]
                                      : prev.analisisSeleccionados.filter((item) => item !== value),
                                  }));
                                }}
                              />
                            }
                            label={analisis}
                          />
                        ))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                onClick={handleSaveEdit}
                sx={{ marginTop: 2 }}
              >
                Guardar Cambios
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default Muestras;
