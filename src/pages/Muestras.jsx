import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import senaLogo from "../assets/sena-logo.png"; // Importamos el logo

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Alert, TextField, Select, MenuItem, Button, TablePagination
} from "@mui/material";

const Muestras = () => {
  const [muestras, setMuestras] = useState([]);
  const [filteredMuestras, setFilteredMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

        const usuariosResponse = await axios.get("https://unificado-u.onrender.com/api/usuarios", {
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
    doc.setFillColor(0, 49, 77); // Verde SENA
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

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert severity="error" sx={{ margin: "20px" }}>{error}</Alert>;

  return (
    <Paper sx={{ padding: 2, marginTop: 2, boxShadow: 3 }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", fontWeight: "bold" }}>🔬 Muestras Registradas</h2>

      {/* Filtro por tipo de muestra (Solo "Agua" y "Suelo") */}
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
              <TableRow key={muestra.id_muestra}>
                <TableCell>{muestra.id_muestra || "N/A"}</TableCell>
                <TableCell>{muestra.nombreCliente || "No encontrado"}</TableCell>
                <TableCell>{muestra.telefono || "No encontrado"}</TableCell>
                <TableCell>{muestra.tipoMuestreo || "N/A"}</TableCell>
                <TableCell>{muestra.fechaHora ? new Date(muestra.fechaHora).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>{muestra.analisisSeleccionados ? muestra.analisisSeleccionados.join(", ") : "Ninguno"}</TableCell>
                <TableCell>
                  <Button variant="contained" color= "secondary" onClick={() => generarPDFMuestra(muestra, true)}>Visualizar</Button>
                  <Button variant="contained" color="error" onClick={() => generarPDFMuestra(muestra)}>Descargar</Button>
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
    </Paper>
  );
};

export default Muestras;
