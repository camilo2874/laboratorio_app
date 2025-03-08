import React, { useState } from "react";
import UsersList from "../modules/usuarios/UsersList";
import RegistroUsuario from "../modules/usuarios/RegistroUsuario";
import { Button, Paper } from "@mui/material";

const Users = () => {
  const [vista, setVista] = useState("lista");

  return (
    <Paper sx={{ padding: 3 }}>
      <Button
        variant="contained"
        color={vista === "lista" ? "primary" : "secondary"}
        onClick={() => setVista("lista")}
        sx={{ marginRight: 2 }}
      >
        Ver Usuarios
      </Button>
      <Button
        variant="contained"
        color={vista === "registro" ? "primary" : "secondary"}
        onClick={() => setVista("registro")}
      >
        Registrar Usuario
      </Button>

      {vista === "lista" ? <UsersList /> : <RegistroUsuario />}
    </Paper>
  );
};

export default Users;
