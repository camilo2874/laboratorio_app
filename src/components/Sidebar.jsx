import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science"; // 📌 Icono para muestras
import { Link } from "react-router-dom";
import senaLogo from "../assets/sena-logo.png"; // Importamos el logo
import BiotechIcon from "@mui/icons-material/Biotech"; // Nuevo icono


const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          backgroundColor: "#FFFFFF", // Verde institucional
          color: "white",
        },
      }}
    >
      <Toolbar>
        <Box sx={{ width: "100%", textAlign: "center", padding: 1 }}>
          <img src={senaLogo} alt="Logo SENA" width="80" />
        </Box>
      </Toolbar>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon sx={{ color: "000000" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/users">
          <ListItemIcon sx={{ color: "000000" }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Usuarios" />
        </ListItem>
        <ListItem button component={Link} to="/muestras"> 
          <ListItemIcon sx={{ color: "000000" }}>
            <ScienceIcon /> {/* Icono de ciencia/laboratorio */}
          </ListItemIcon>
          <ListItemText primary="Muestras" />
        </ListItem>
        <ListItem button component={Link} to="/registro-muestras">
  <ListItemIcon sx={{ color: "000000" }}>
    <BiotechIcon /> {/* Nuevo icono de registro */}
  </ListItemIcon>
  <ListItemText primary="Registrar Muestra" />
</ListItem>

      </List>
    </Drawer>
  );
};

export default Sidebar;
