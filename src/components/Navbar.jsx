import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#00324D" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Laboratorio </Typography>
        {user && (
          <>
            <Typography sx={{ marginRight: 2 }}>
              {user.email || "Usuario"}
            </Typography>
            <Button onClick={handleLogout} sx={{ color: "white" }}>Cerrar Sesión</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
