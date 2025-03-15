import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Paper, Typography, Grid, CircularProgress, Alert
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEstadisticas = async () => {
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
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token"); // Elimina el token expirado
          navigate("/login"); // Redirige al usuario a la página de login
        } else {
          setError("Error al cargar las estadísticas.");
          console.error("❌ Error en la solicitud:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, [navigate]);

  if (loading) return <CircularProgress sx={{ display: "block", margin: "20px auto" }} />;
  if (error) return <Alert severity="error" sx={{ margin: "20px" }}>{error}</Alert>;

  // Colores para el gráfico de pastel
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

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
                <Pie
                  data={estadisticas.datosGrafico}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                  nameKey="nombre"
                  label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                >
                  {estadisticas.datosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
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