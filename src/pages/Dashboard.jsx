import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Paper, Typography, Grid, CircularProgress
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const response = await axios.get("https://unificado-u.onrender.com/api/usuarios");
        const usuarios = response.data;

        // Contar usuarios por tipo
        const conteoPorTipo = usuarios.reduce((acc, user) => {
          const tipo = user.rol?.nombre || "Desconocido";
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {});

        // Convertir en un array de objetos para los gráficos
        const datosGrafico = Object.keys(conteoPorTipo).map(tipo => ({
          nombre: tipo,
          cantidad: conteoPorTipo[tipo],
        }));

        setEstadisticas({
          totalUsuarios: usuarios.length,
          datosGrafico,
        });

      } catch (err) {
        setError("Error al cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ padding: 3, marginTop: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 2, fontWeight: "bold", textAlign: "center" }}>
        📊 Dashboard de Usuarios
      </Typography>

      <Grid container spacing={3}>
        {/* Total de usuarios */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: "center", backgroundColor: "#39A900", color: "white" }}>
            <Typography variant="h5">Total de Usuarios</Typography>
            <Typography variant="h3">{estadisticas.totalUsuarios}</Typography>
          </Paper>
        </Grid>

        {/* Gráfico de barras */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>Usuarios por Tipo</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.datosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#003" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de pastel */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>Distribución de Usuarios</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Dashboard;
