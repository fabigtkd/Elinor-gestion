import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";

import ContentCutIcon from "@mui/icons-material/ContentCut";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useEffect, useState } from "react";

import ModuleHeader from "../../components/ModuleHeader";
import ElinorCard from "../../components/ElinorCard";

const API_URL = "/api/produccion";

function numero(valor) {
  const resultado = Number(valor || 0);
  return Number.isFinite(resultado) ? resultado : 0;
}

function formatoNumero(valor, decimales = 2) {
  return numero(valor).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimales,
  });
}

function obtenerEstadoTexto(estado) {
  const valor = String(estado || "").trim().toUpperCase();

  if (valor === "DISPONIBLE") {
    return "Disponible";
  }

  if (valor === "PARCIAL") {
    return "Parcial";
  }

  if (valor === "CORTADO") {
    return "Cortado";
  }

  if (valor === "ENTERO_VENDIDO") {
    return "Vendido";
  }

  return estado || "-";
}

function obtenerEstadoColor(estado) {
  const valor = String(estado || "").trim().toUpperCase();

  if (valor === "DISPONIBLE") {
    return {
      color: "#D4A72C",
      borderColor: "rgba(212,167,44,0.45)",
      backgroundColor: "rgba(212,167,44,0.08)",
    };
  }

  if (valor === "PARCIAL") {
    return {
      color: "#fff",
      borderColor: "rgba(255,255,255,0.25)",
      backgroundColor: "rgba(255,255,255,0.06)",
    };
  }

  if (valor === "CORTADO") {
    return {
      color: "#8fd19e",
      borderColor: "rgba(143,209,158,0.35)",
      backgroundColor: "rgba(143,209,158,0.08)",
    };
  }

  if (valor === "ENTERO_VENDIDO") {
    return {
      color: "#aaa",
      borderColor: "rgba(170,170,170,0.25)",
      backgroundColor: "rgba(170,170,170,0.06)",
    };
  }

  return {
    color: "#aaa",
    borderColor: "rgba(170,170,170,0.25)",
    backgroundColor: "transparent",
  };
}

export default function Produccion() {
  const [cajones, setCajones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogCorte, setDialogCorte] = useState(false);
  const [cajonSeleccionado, setCajonSeleccionado] = useState(null);
  const [cantidadCorte, setCantidadCorte] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCajones();
  }, []);

  async function cargarCajones() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/cajones`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudieron cargar los cajones.");
      }

      setCajones(Array.isArray(datos) ? datos : []);
    } catch (err) {
      console.error("ERROR CARGANDO CAJONES:", err);
      setError(err?.message || "Error cargando cajones.");
    } finally {
      setCargando(false);
    }
  }

  function abrirCorte(cajon) {
    const disponible = numero(cajon.cantidadDisponible);

    if (disponible <= 0) {
      alert("Este cajón no tiene disponibilidad para corte.");
      return;
    }

    setCajonSeleccionado(cajon);
    setCantidadCorte("");
    setObservaciones("");
    setDialogCorte(true);
  }

  function cerrarCorte() {
    if (guardando) {
      return;
    }

    setDialogCorte(false);
    setCajonSeleccionado(null);
    setCantidadCorte("");
    setObservaciones("");
  }

  async function registrarCorte() {
    if (!cajonSeleccionado) {
      return;
    }

    const cantidad = Number(cantidadCorte);
    const disponible = numero(cajonSeleccionado.cantidadDisponible);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      alert("Ingrese una cantidad de cajones mayor a cero.");
      return;
    }

    if (cantidad > disponible) {
      alert(`No puede cortar ${formatoNumero(cantidad, 6)} cajones. Solo hay ${formatoNumero(disponible, 6)} disponibles.`);
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await fetch(`${API_URL}/cajones/${cajonSeleccionado.id}/cortar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cantidad,
          observaciones: observaciones || null,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos?.error || "No se pudo registrar el corte.");
      }

      cerrarCorte();
      await cargarCajones();
    } catch (err) {
      console.error("ERROR REGISTRANDO CORTE:", err);
      alert(err?.message || "Error registrando corte.");
    } finally {
      setGuardando(false);
    }
  }

  const totalCajones = cajones.reduce((total, cajon) => total + numero(cajon.cantidad), 0);
  const cajonesDisponibles = cajones.reduce((total, cajon) => total + numero(cajon.cantidadDisponible), 0);
  const cajonesCortados = cajones.reduce((total, cajon) => total + numero(cajon.cantidadCortada), 0);
  const kilosTeoricosCorte = cajones.reduce((total, cajon) => total + numero(cajon.cantidadCortada) * numero(cajon.rendimientoTeorico || 14), 0);

  return (
    <Box>
      <ModuleHeader title="Producción" subtitle="Gestión de cajones destinados a corte" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ElinorCard>
            <CardContent sx={{ py: 2.5 }}>
              <Typography
                sx={{
                  color: "#D4A72C",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                CAJONES INGRESADOS
              </Typography>

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 30,
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {formatoNumero(totalCajones, 6)}
              </Typography>
            </CardContent>
          </ElinorCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ElinorCard>
            <CardContent sx={{ py: 2.5 }}>
              <Typography
                sx={{
                  color: "#D4A72C",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                DISPONIBLES
              </Typography>

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 30,
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {formatoNumero(cajonesDisponibles, 6)}
              </Typography>
            </CardContent>
          </ElinorCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ElinorCard>
            <CardContent sx={{ py: 2.5 }}>
              <Typography
                sx={{
                  color: "#D4A72C",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                DESTINADOS A CORTE
              </Typography>

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 30,
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {formatoNumero(cajonesCortados, 6)}
              </Typography>
            </CardContent>
          </ElinorCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ElinorCard>
            <CardContent sx={{ py: 2.5 }}>
              <Typography
                sx={{
                  color: "#D4A72C",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                RENDIMIENTO TEÓRICO
              </Typography>

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 30,
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {formatoNumero(kilosTeoricosCorte, 2)}{" "}
                <Typography component="span" sx={{ color: "#888", fontSize: 14, fontWeight: 400 }}>
                  kg
                </Typography>
              </Typography>
            </CardContent>
          </ElinorCard>
        </Grid>
      </Grid>

      <ElinorCard>
        <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                Cajones
              </Typography>

              <Typography sx={{ color: "#777", fontSize: 13, mt: 0.4 }}>Ingresos y disponibilidad para producción.</Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarCajones}
              disabled={cargando}
              sx={{
                minWidth: 120,
                borderColor: "rgba(212,167,44,.4)",
                color: "#D4A72C",
                "&:hover": {
                  borderColor: "#D4A72C",
                  background: "rgba(212,167,44,.06)",
                },
              }}
            >
              Actualizar
            </Button>
          </Box>

          {error && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #8b0000",
                borderRadius: 2,
                background: "#180909",
              }}
            >
              <Typography sx={{ color: "#ff8a8a" }}>{error}</Typography>
            </Box>
          )}

          <TableContainer
            component={Paper}
            sx={{
              background: "transparent",
              boxShadow: "none",
              overflow: "hidden",
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  px: { xs: 1, md: 1.5 },
                  py: 1.5,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "18%",
                      color: "#777",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Fecha de ingreso
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: "17%",
                      color: "#777",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Ingresados
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: "17%",
                      color: "#777",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Disponibles
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: "17%",
                      color: "#777",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    A corte
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: "15%",
                      color: "#777",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Estado
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      width: "16%",
                      color: "#777",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.7,
                      textTransform: "uppercase",
                    }}
                  >
                    Acción
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cargando ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ color: "#777", py: 3 }}>Cargando cajones...</Typography>
                    </TableCell>
                  </TableRow>
                ) : cajones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography sx={{ color: "#777", py: 3 }}>No hay cajones registrados.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cajones.map((cajon) => {
                    const disponible = numero(cajon.cantidadDisponible);
                    const puedeCortar = disponible > 0;
                    const estadoStyle = obtenerEstadoColor(cajon.estado);

                    return (
                      <TableRow
                        key={cajon.id}
                        sx={{
                          transition: "background .2s ease",
                          "&:hover": {
                            background: "rgba(255,255,255,0.025)",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
                            {cajon.fecha ? String(cajon.fecha).substring(0, 10) : "-"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                            {formatoNumero(cajon.cantidad, 6)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography sx={{ color: disponible > 0 ? "#fff" : "#666", fontSize: 14, fontWeight: 600 }}>
                            {formatoNumero(disponible, 6)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography
                            sx={{
                              color: numero(cajon.cantidadCortada) > 0 ? "#D4A72C" : "#666",
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {formatoNumero(cajon.cantidadCortada, 6)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={obtenerEstadoTexto(cajon.estado)}
                            size="small"
                            sx={{
                              color: estadoStyle.color,
                              border: `1px solid ${estadoStyle.borderColor}`,
                              backgroundColor: estadoStyle.backgroundColor,
                              fontSize: 11,
                              height: 26,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ContentCutIcon />}
                            disabled={!puedeCortar}
                            onClick={() => abrirCorte(cajon)}
                            sx={{
                              minWidth: 92,
                              borderColor: puedeCortar ? "rgba(212,167,44,.45)" : "rgba(255,255,255,.08)",
                              color: puedeCortar ? "#D4A72C" : "#555",
                              fontSize: 11,
                              "&:hover": {
                                borderColor: "#D4A72C",
                                background: "rgba(212,167,44,.06)",
                              },
                            }}
                          >
                            Cortar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </ElinorCard>

      <Dialog open={dialogCorte} onClose={guardando ? undefined : cerrarCorte} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#D4A72C" }}>Destinar cajones a corte</DialogTitle>

        <DialogContent>
          {cajonSeleccionado && (
            <Box sx={{ pt: 1 }}>
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  background: "#111",
                  border: "1px solid rgba(212,167,44,.35)",
                  borderRadius: 2,
                }}
              >
                <Typography sx={{ color: "#888", fontSize: 13 }}>Ingreso seleccionado</Typography>

                <Typography variant="h6" sx={{ color: "#fff", mt: 0.5 }}>
                  {cajonSeleccionado.fecha ? String(cajonSeleccionado.fecha).substring(0, 10) : "-"}
                </Typography>

                <Typography sx={{ color: "#aaa", mt: 1 }}>
                  Disponibles: <strong style={{ color: "#fff" }}>{formatoNumero(cajonSeleccionado.cantidadDisponible, 6)}</strong> cajones
                </Typography>

                <Typography sx={{ color: "#aaa", mt: 0.5 }}>
                  Rendimiento teórico:{" "}
                  <strong style={{ color: "#fff" }}>{formatoNumero(cajonSeleccionado.rendimientoTeorico || 14, 2)} kg/cajón</strong>
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Cantidad de cajones a cortar"
                type="number"
                value={cantidadCorte}
                onChange={(e) => setCantidadCorte(e.target.value)}
                inputProps={{
                  min: 0,
                  step: 0.000001,
                  max: numero(cajonSeleccionado.cantidadDisponible),
                }}
                helperText={`Máximo disponible: ${formatoNumero(cajonSeleccionado.cantidadDisponible, 6)} cajones`}
                sx={{ mb: 2 }}
              />

              <TextField fullWidth multiline rows={3} label="Observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />

              {Number(cantidadCorte) > 0 && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    background: "#111",
                    border: "1px solid rgba(212,167,44,.35)",
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: "#D4A72C", fontSize: 13 }}>Referencia de rendimiento</Typography>

                  <Typography variant="h6" sx={{ color: "#fff" }}>
                    {formatoNumero(Number(cantidadCorte) * numero(cajonSeleccionado.rendimientoTeorico || 14), 2)} kg
                  </Typography>

                  <Typography sx={{ color: "#666", fontSize: 12, mt: 0.5 }}>
                    Referencia teórica para costos. No representa stock físico.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarCorte} disabled={guardando}>
            Cancelar
          </Button>

          <Button variant="contained" startIcon={<ContentCutIcon />} onClick={registrarCorte} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar corte"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
