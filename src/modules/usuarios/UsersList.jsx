import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Alert, TextField, Select, MenuItem, Button, TablePagination, 
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editUser, setEditUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  // 📌 Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://unificado-u.onrender.com/api/usuarios");
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        setError("Error al cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 📌 Aplicar filtro por tipo de usuario y búsqueda
  useEffect(() => {
    let filtered = [...users];

    if (filterType !== "todos") {
      filtered = filtered.filter(user =>
        user.rol?.nombre && user.rol.nombre.trim().toLowerCase() === filterType.toLowerCase()
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(user =>
        user.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        (user.documento && user.documento.toString().includes(search))
      );
    }

    setFilteredUsers(filtered);
    setPage(0);
  }, [search, filterType, users]);

  // 📌 Manejo de eventos
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleFilterChange = (e) => setFilterType(e.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 📌 Abrir modal de edición
  const handleEditClick = (user) => {
    setEditUser(user);
    setOpenEdit(true);
  };

  // 📌 Cerrar modal de edición
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditUser(null);
  };

  // 📌 Guardar cambios de edición
  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!editUser || !editUser._id) {
      alert("No se encontró el usuario a editar.");
      return;
    }

    const datosActualizados = {
      nombre: editUser.nombre,
      documento: editUser.documento,
      telefono: editUser.telefono,
      direccion: editUser.direccion,
      email: editUser.email,
    };

    console.log("📩 Datos enviados:", JSON.stringify(datosActualizados, null, 2));

    try {
      const response = await axios.put(
        `https://unificado-u.onrender.com/api/usuarios/${editUser._id}`,
        datosActualizados,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✔ Usuario actualizado:", response.data);

      setUsers(users.map(user => (user._id === editUser._id ? { ...user, ...datosActualizados } : user)));

      handleCloseEdit();
    } catch (error) {
      console.error("❌ Error al actualizar usuario:", error);
      alert(error.response?.data?.message || "Error al actualizar usuario.");
    }
  };

  // 📌 Eliminar usuario
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await axios.delete(`https://unificado-u.onrender.com/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter(user => user._id !== id));
      alert("Usuario eliminado con éxito.");
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      alert(error.response?.data?.message || "Error al eliminar usuario.");
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert severity="error" sx={{ margin: "20px" }}>{error}</Alert>;

  return (
    <Paper sx={{ padding: 2, marginTop: 2, boxShadow: 3 }}>
      {/* Filtro por tipo de usuario */}
      <Select
        value={filterType}
        onChange={handleFilterChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="Cliente">Cliente</MenuItem>
        <MenuItem value="Laboratorista">Laboratorista</MenuItem>
        <MenuItem value="Administrador">Administrador</MenuItem>
        <MenuItem value="Super_admin">Super Administrador</MenuItem>
      </Select>

      {/* Buscador */}
      <TextField
        label="Buscar usuario (nombre o documento)"
        variant="outlined"
        fullWidth
        sx={{ marginBottom: 2 }}
        onChange={handleSearchChange}
      />

      {/* Tabla de usuarios */}
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: "#39A900" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Documento</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Teléfono</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Dirección</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
              <TableRow key={user._id}>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.documento}</TableCell>
                <TableCell>{user.telefono}</TableCell>
                <TableCell>{user.direccion}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEditClick(user)}>
                    Editar
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(user._id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal para editar usuario */}
      <Dialog open={openEdit} onClose={handleCloseEdit} disableEnforceFocus={true} disableRestoreFocus={true}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          {["nombre", "documento", "telefono", "direccion", "email"].map(field => (
            <TextField key={field} fullWidth margin="dense" label={field} value={editUser?.[field] || ""} onChange={(e) => setEditUser({ ...editUser, [field]: e.target.value })} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UsersList;
