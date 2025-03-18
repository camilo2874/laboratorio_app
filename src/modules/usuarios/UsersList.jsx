import React, { useState, useEffect } from "react"; 
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  CircularProgress, Alert, TextField, Select, MenuItem, Button, TablePagination, 
  Dialog, DialogActions, DialogContent, DialogTitle, Switch, IconButton, Box, Grid, Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  // Nuevos estados para el detalle del usuario
  const [detailUser, setDetailUser] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  // 📌 Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No tienes permiso para acceder a esta información. Inicia sesión.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("https://back-usuarios-f.onrender.com/api/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token"); // Elimina el token expirado
          navigate("/login"); // Redirige al usuario a la página de login
        } else {
          setError("Error al cargar los usuarios.");
          console.error("❌ Error en la solicitud:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // 📌 Aplicar filtro por tipo de usuario y búsqueda
  useEffect(() => {
    let filtered = [...users];

    if (filterType !== "todos") {
      filtered = filtered.filter(user =>
        user.rol?.name && user.rol.name.trim().toLowerCase() === filterType.toLowerCase()
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
  
    // Actualizamos solo los campos editables, omitiendo el campo "rol"
    const datosActualizados = {
      nombre: editUser.nombre,
      documento: editUser.documento,
      telefono: editUser.telefono,
      direccion: editUser.direccion,
      email: editUser.email
    };
  
    console.log("📩 Datos enviados:", JSON.stringify(datosActualizados, null, 2));
  
    try {
      const response = await axios.put(
        `https://back-usuarios-f.onrender.com/api/usuarios/${editUser._id}`,
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
      setFilteredUsers(filteredUsers.map(user => (user._id === editUser._id ? { ...user, ...datosActualizados } : user)));
  
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
      await axios.delete(`https://back-usuarios-f.onrender.com/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter(user => user._id !== id));
      setFilteredUsers(filteredUsers.filter(user => user._id !== id));
      alert("Usuario eliminado con éxito.");
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      alert(error.response?.data?.message || "Error al eliminar usuario.");
    }
  };

  // 📌 Activar/desactivar usuario
  const handleToggleActivo = async (userId, nuevoEstado) => {
    console.log("handleToggleActivo - userId:", userId, "nuevoEstado:", nuevoEstado);
    const token = localStorage.getItem("token");

    try {
      // Corregido: se usa /desactivar en lugar de /activo
      const response = await axios.put(
        `https://back-usuarios-f.onrender.com/api/usuarios/${userId}/estado`,
        { activo: nuevoEstado },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✔ Estado actualizado:", response.data);

      setUsers(users.map(user => 
        user._id === userId ? { ...user, activo: nuevoEstado } : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user._id === userId ? { ...user, activo: nuevoEstado } : user
      ));

      alert(`Usuario ${nuevoEstado ? "activado" : "desactivado"} con éxito.`);
    } catch (error) {
      console.error("❌ Error al actualizar el estado:", error);
      alert(error.response?.data?.message || "Error al actualizar el estado del usuario.");
    }
  };

  // 📌 Manejo de detalle del usuario
  const handleRowClick = (user) => {
    setDetailUser(user);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetailUser(null);
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
        <MenuItem value="cliente">Cliente</MenuItem>
        <MenuItem value="laboratorista">Laboratorista</MenuItem>
        <MenuItem value="administrador">Administrador</MenuItem>
        <MenuItem value="super_admin">Super Administrador</MenuItem>
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
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Rol</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Activo</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(user => (
              <TableRow
                key={user._id}
                onClick={() => handleRowClick(user)}
                sx={{
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)", cursor: "pointer" }
                }}
              >
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.documento}</TableCell>
                <TableCell>{user.telefono}</TableCell>
                <TableCell>{user.direccion}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.rol?.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.activo}
                    onChange={() => handleToggleActivo(user._id, !user.activo)}
                    color="primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={(e) => { e.stopPropagation(); handleEditClick(user); }}
                    aria-label="editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={(e) => { e.stopPropagation(); handleDelete(user._id); }}
                    aria-label="eliminar"
                  >
                    <DeleteIcon />
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
            <TextField
              key={field}
              fullWidth
              margin="dense"
              label={field}
              value={editUser?.[field] || ""}
              onChange={(e) => setEditUser({ ...editUser, [field]: e.target.value })}
            />
          ))}

          {/* Campo para cambiar el tipo de usuario */}
          <Select
            value={editUser?.rol?.name || ""}
            onChange={(e) => setEditUser({ ...editUser, rol: { ...editUser.rol, name: e.target.value } })}
            fullWidth
            margin="dense"
            sx={{ marginTop: 2 }}
          >
            <MenuItem value="cliente">Cliente</MenuItem>
            <MenuItem value="laboratorista">Laboratorista</MenuItem>
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="super_admin">Super Administrador</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para detalle del usuario */}
      <Dialog open={openDetail} onClose={handleCloseDetail} disableEnforceFocus={true} disableRestoreFocus={true}>
        <DialogTitle>Detalle del Usuario</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ border: '1px solid #ccc', borderRadius: 2, padding: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" align="center">{detailUser?.nombre}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Documento:</strong> {detailUser?.documento}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Teléfono:</strong> {detailUser?.telefono}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Dirección:</strong> {detailUser?.direccion}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Email:</strong> {detailUser?.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Rol:</strong> {detailUser?.rol?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Activo:</strong> {detailUser?.activo ? "Sí" : "No"}</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UsersList;
