import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "./proveedoresService";

const API_COMPRAS = "http://localhost:3001/api/compras";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [remitos, setRemitos] = useState([]);
  const [cargandoRemitos, setCargandoRemitos] = useState(false);
  const [remitoSeleccionado, setRemitoSeleccionado] = useState(null);
  const [cargandoRemito, setCargandoRemito] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
  });

  async function cargarProveedores() {
    try {
      const data = await getProveedores();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ERROR CARGANDO PROVEEDORES:", error);
    }
  }

  useEffect(() => {
    cargarProveedores();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm({
      nombre: "",
      contacto: "",
      telefono: "",
    });
    setOpen(true);
  }

  function abrirEditar(proveedor) {
    setEditando(proveedor.id);
    setForm({
      nombre: proveedor.nombre || "",
      contacto: proveedor.contacto || "",
      telefono: proveedor.telefono || "",
    });
    setOpen(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      return;
    }

    try {
      if (editando) {
        await updateProveedor(editando, form);
      } else {
        await createProveedor(form);
      }

      setOpen(false);
      await cargarProveedores();
    } catch (error) {
      console.error("ERROR GUARDANDO PROVEEDOR:", error);
    }
  }

  async function eliminar(id) {
    const confirmar = window.confirm("¿Querés eliminar este proveedor?");
    if (!confirmar) {
      return;
    }

    try {
      await deleteProveedor(id);
      await cargarProveedores();

      if (proveedorSeleccionado && proveedorSeleccionado.id === id) {
        setProveedorSeleccionado(null);
        setRemitos([]);
      }
    } catch (error) {
      console.error("ERROR ELIMINANDO PROVEEDOR:", error);
    }
  }

  async function verRemitos(proveedor) {
    if (proveedorSeleccionado && proveedorSeleccionado.id === proveedor.id) {
      setProveedorSeleccionado(null);
      setRemitos([]);
      return;
    }

    setProveedorSeleccionado(proveedor);
    setRemitos([]);
    setCargandoRemitos(true);

    try {
      // Optimizado: usa el endpoint por proveedor en vez de traer todo
      const response = await fetch(`${API_COMPRAS}/proveedor/${proveedor.id}`);

      if (!response.ok) {
        throw new Error("No se pudieron obtener las compras");
      }

      const data = await response.json();
      const remitosProveedor = Array.isArray(data) ? data : [];
      remitosProveedor.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

      setRemitos(remitosProveedor);
    } catch (error) {
      console.error("ERROR CARGANDO REMITOS DEL PROVEEDOR:", error);
      setRemitos([]);
    } finally {
      setCargandoRemitos(false);
    }
  }

  async function abrirRemito(id) {
    setCargandoRemito(true);
    setRemitoSeleccionado(null);

    try {
      const response = await fetch(`${API_COMPRAS}/${id}`);

      if (!response.ok) {
        throw new Error("No se pudo obtener el remito");
      }

      const remito = await response.json();
      setRemitoSeleccionado(remito);
    } catch (error) {
      console.error("ERROR ABRIENDO REMITO:", error);
    } finally {
      setCargandoRemito(false);
    }
  }

  function cerrarRemito() {
    setRemitoSeleccionado(null);
  }

  function dinero(valor) {
    return Number(valor || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function fecha(valor) {
    if (!valor) {
      return "-";
    }

    const texto = String(valor);
    const partes = texto.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return texto;
  }

  function construirTextoRemito(remito) {
    if (!remito) {
      return "";
    }

    const proveedor = remito.proveedorNombre || proveedorSeleccionado?.nombre || "Proveedor";
    const numeroRemito = remito.remito || remito.id || "-";
    const detalle = Array.isArray(remito.detalle) ? remito.detalle : [];

    let texto = "";
    texto += "ELINOR POLLOS\n";
    texto += "DETALLE DE COMPRA\n";
    texto += "------------------------------\n";
    texto += `Remito Nº: ${numeroRemito}\n`;
    texto += `Fecha: ${fecha(remito.fecha)}\n`;
    texto += `Proveedor: ${proveedor}\n`;
    texto += "\n";

    texto += "PRODUCTOS\n";
    texto += "------------------------------\n";

    if (detalle.length > 0) {
      detalle.forEach((item) => {
        const nombre = item.producto || item.nombre || "-";
        const cantidad = Number(item.cantidad || 0);
        const unidad = item.unidad || "kg";
        const precio = Number(item.precioUnitario || 0);
        const subtotal = Number(item.subtotal || 0);

        texto += `${nombre}\n`;
        texto += `Cantidad: ${cantidad} ${unidad}\n`;
        texto += `Precio unitario: $${dinero(precio)}\n`;
        texto += `Subtotal: $${dinero(subtotal)}\n`;
        texto += "\n";
      });
    } else {
      texto += "Sin productos registrados.\n\n";
    }

    texto += "PAGO\n";
    texto += "------------------------------\n";
    texto += `Total: $${dinero(remito.total)}\n`;
    texto += `Contado: $${dinero(remito.contado)}\n`;
    texto += `Transferencia: $${dinero(remito.transferencia)}\n`;
    texto += `Cuenta corriente: $${dinero(remito.cuentaCorriente)}\n`;

    texto += "\nSALDO DEL PROVEEDOR\n";
    texto += "------------------------------\n";
    texto += `Saldo anterior: $${dinero(remito.saldoAnterior)}\n`;
    texto += `Saldo nuevo: $${dinero(remito.saldoNuevo)}\n`;

    if (remito.observaciones) {
      texto += "\nOBSERVACIONES\n";
      texto += "------------------------------\n";
      texto += `${remito.observaciones}\n`;
    }

    texto += "\n";
    texto += "Elinor Pollos";

    return texto;
  }

  async function compartirRemito() {
    if (!remitoSeleccionado) {
      return;
    }

    const texto = construirTextoRemito(remitoSeleccionado);
    const numeroRemito = remitoSeleccionado.remito || remitoSeleccionado.id || "";
    const titulo = `Remito de compra Nº ${numeroRemito}`;

    try {
      if (navigator.share && typeof navigator.share === "function") {
        await navigator.share({
          title: titulo,
          text: texto,
        });
        return;
      }

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(texto);
        window.alert("Remito copiado al portapapeles.");
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = texto;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      document.execCommand("copy");
      document.body.removeChild(textarea);

      window.alert("Remito copiado al portapapeles.");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("ERROR COMPARTIENDO REMITO:", error);
      window.alert("No se pudo compartir el remito.");
    }
  }

  async function copiarRemito() {
    if (!remitoSeleccionado) {
      return;
    }

    const texto = construirTextoRemito(remitoSeleccionado);

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(texto);
        window.alert("Remito copiado al portapapeles.");
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = texto;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      document.execCommand("copy");
      document.body.removeChild(textarea);

      window.alert("Remito copiado al portapapeles.");
    } catch (error) {
      console.error("ERROR COPIANDO REMITO:", error);
      window.alert("No se pudo copiar el remito.");
    }
  }

  return (
    <Box sx={{ padding: 4, color: "white" }}>
      <Typography variant="h4" sx={{ color: "#D4A72C", fontWeight: "bold", mb: 1 }}>
        Proveedores
      </Typography>

      <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 4 }}>Administración de proveedores</Typography>

      <Button
        variant="contained"
        onClick={abrirNuevo}
        sx={{
          backgroundColor: "#D4A72C",
          color: "#111",
          fontWeight: "bold",
          mb: 4,
          "&:hover": { backgroundColor: "#b89020" },
        }}
      >
        + Nuevo proveedor
      </Button>

      <Grid container spacing={3}>
        {proveedores.map((proveedor) => (
          <Grid item xs={12} md={6} lg={4} key={proveedor.id}>
            <Card
              sx={{
                backgroundColor: "#1B1B1B",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 3,
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: "#D4A72C", fontWeight: "bold" }}>
                  {proveedor.nombre}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                  Contacto:
                  <br />
                  {proveedor.contacto || "-"}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  Teléfono:
                  <br />
                  {proveedor.telefono || "-"}
                </Typography>

                <Box sx={{ mt: 3, p: 2, backgroundColor: "#111", borderRadius: 2 }}>
                  <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Saldo actual</Typography>
                  <Typography variant="h6" sx={{ color: "#D4A72C", fontWeight: "bold" }}>
                    ${dinero(proveedor.saldo)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
                  <Button variant="outlined" onClick={() => abrirEditar(proveedor)} sx={{ color: "#D4A72C", borderColor: "#D4A72C" }}>
                    Editar
                  </Button>

                  <Button variant="outlined" color="error" onClick={() => eliminar(proveedor.id)}>
                    Eliminar
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => verRemitos(proveedor)}
                    sx={{
                      backgroundColor: "#D4A72C",
                      color: "#111",
                      fontWeight: "bold",
                      "&:hover": { backgroundColor: "#b89020" },
                    }}
                  >
                    {proveedorSeleccionado && proveedorSeleccionado.id === proveedor.id ? "Ocultar remitos" : "Ver remitos"}
                  </Button>
                </Box>

                {proveedorSeleccionado && proveedorSeleccionado.id === proveedor.id && (
                  <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                    <Typography sx={{ color: "#D4A72C", fontWeight: "bold", mb: 2 }}>Remitos de {proveedor.nombre}</Typography>

                    {cargandoRemitos && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: "#D4A72C" }} />
                        <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>Cargando remitos...</Typography>
                      </Box>
                    )}

                    {!cargandoRemitos && remitos.length === 0 && (
                      <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>No hay remitos registrados para este proveedor.</Typography>
                    )}

                    {!cargandoRemitos &&
                      remitos.map((remito) => (
                        <Box
                          key={remito.id}
                          sx={{
                            mb: 2,
                            p: 2,
                            backgroundColor: "#151515",
                            border: "1px solid rgba(255,255,255,0.10)",
                            borderRadius: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                            <Box>
                              <Typography sx={{ color: "#D4A72C", fontWeight: "bold" }}>
                                Remito Nº {remito.remito || remito.id}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.60)", mt: 0.5 }}>
                                Fecha: {fecha(remito.fecha)}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.60)" }}>
                                Total: ${dinero(remito.total)}
                              </Typography>
                            </Box>

                            <Button
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => abrirRemito(remito.id)}
                              sx={{
                                color: "#D4A72C",
                                borderColor: "#D4A72C",
                                whiteSpace: "nowrap",
                                "&:hover": {
                                  borderColor: "#D4A72C",
                                  backgroundColor: "rgba(212,167,44,0.08)",
                                },
                              }}
                            >
                              Ver detalle
                            </Button>
                          </Box>
                        </Box>
                      ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editando ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>

        <DialogContent>
          <TextField fullWidth label="Nombre" margin="normal" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField fullWidth label="Contacto" margin="normal" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
          <TextField fullWidth label="Teléfono" margin="normal" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={guardar} variant="contained" sx={{ backgroundColor: "#D4A72C", color: "#111", "&:hover": { backgroundColor: "#b89020" } }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(remitoSeleccionado) || cargandoRemito} onClose={cerrarRemito} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            backgroundColor: "#151515",
            color: "#D4A72C",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            {remitoSeleccionado ? `Remito Nº ${remitoSeleccionado.remito || remitoSeleccionado.id}` : "Detalle del remito"}

            {remitoSeleccionado && (
              <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.60)", mt: 0.5 }}>
                {remitoSeleccionado.proveedorNombre || proveedorSeleccionado?.nombre || "Proveedor"} · {fecha(remitoSeleccionado.fecha)}
              </Typography>
            )}
          </Box>

          <Button onClick={cerrarRemito} sx={{ minWidth: 40, color: "white" }}>
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: "#1B1B1B", color: "white", p: 3 }}>
          {cargandoRemito && (
            <Box sx={{ minHeight: 250, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <CircularProgress sx={{ color: "#D4A72C" }} />
              <Typography>Cargando detalle...</Typography>
            </Box>
          )}

          {!cargandoRemito && remitoSeleccionado && (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 3 }}>
                <Box sx={{ backgroundColor: "#111", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Proveedor</Typography>
                  <Typography sx={{ mt: 0.5, fontWeight: "bold" }}>
                    {remitoSeleccionado.proveedorNombre || proveedorSeleccionado?.nombre || "-"}
                  </Typography>
                </Box>

                <Box sx={{ backgroundColor: "#111", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Fecha</Typography>
                  <Typography sx={{ mt: 0.5, fontWeight: "bold" }}>{fecha(remitoSeleccionado.fecha)}</Typography>
                </Box>

                <Box sx={{ backgroundColor: "#111", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Nº de remito</Typography>
                  <Typography sx={{ mt: 0.5, fontWeight: "bold", color: "#D4A72C" }}>
                    {remitoSeleccionado.remito || remitoSeleccionado.id}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 3 }} />

              <Typography variant="h6" sx={{ color: "#D4A72C", fontWeight: "bold", mb: 2 }}>
                Productos recibidos
              </Typography>

              {remitoSeleccionado.detalle && remitoSeleccionado.detalle.length > 0 ? (
                <Box sx={{ backgroundColor: "#111", borderRadius: 2, overflow: "hidden" }}>
                  {remitoSeleccionado.detalle.map((item, index) => (
                    <Box
                      key={item.id || index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        gap: 2,
                        alignItems: "center",
                        p: 2,
                        borderBottom:
                          index < remitoSeleccionado.detalle.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: "bold" }}>{item.producto || item.nombre || "-"}</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)", mt: 0.4 }}>
                          {item.cantidad || 0} {item.unidad || "kg"}
                        </Typography>
                      </Box>

                      <Typography sx={{ color: "rgba(255,255,255,0.70)", whiteSpace: "nowrap" }}>
                        ${dinero(item.precioUnitario)}
                      </Typography>

                      <Typography sx={{ fontWeight: "bold", color: "#D4A72C", whiteSpace: "nowrap" }}>
                        ${dinero(item.subtotal)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: "rgba(255,255,255,0.55)" }}>Este remito no tiene detalle de productos.</Typography>
              )}

              <Box sx={{ mt: 3, ml: "auto", maxWidth: 400, backgroundColor: "#111", borderRadius: 2, p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography>Total</Typography>
                  <Typography sx={{ color: "#D4A72C", fontWeight: "bold", fontSize: 20 }}>
                    ${dinero(remitoSeleccionado.total)}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.10)", my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>Contado</Typography>
                  <Typography>${dinero(remitoSeleccionado.contado)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>Transferencia</Typography>
                  <Typography>${dinero(remitoSeleccionado.transferencia)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Typography sx={{ color: "#D4A72C", fontWeight: "bold" }}>Cuenta corriente</Typography>
                  <Typography sx={{ color: "#D4A72C", fontWeight: "bold" }}>${dinero(remitoSeleccionado.cuentaCorriente)}</Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: "rgba(212,167,44,0.08)",
                  border: "1px solid rgba(212,167,44,0.25)",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Saldo anterior</Typography>
                    <Typography sx={{ fontWeight: "bold" }}>${dinero(remitoSeleccionado.saldoAnterior)}</Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Saldo nuevo</Typography>
                    <Typography sx={{ fontWeight: "bold", color: "#D4A72C" }}>${dinero(remitoSeleccionado.saldoNuevo)}</Typography>
                  </Box>
                </Box>
              </Box>

              {remitoSeleccionado.observaciones && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#111", borderRadius: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Observaciones</Typography>
                  <Typography sx={{ mt: 1 }}>{remitoSeleccionado.observaciones}</Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ backgroundColor: "#151515", p: 2, gap: 1, flexWrap: "wrap" }}>
          {remitoSeleccionado && (
            <>
              <Button
                onClick={copiarRemito}
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                sx={{
                  color: "#D4A72C",
                  borderColor: "#D4A72C",
                  fontWeight: "bold",
                  "&:hover": {
                    borderColor: "#D4A72C",
                    backgroundColor: "rgba(212,167,44,0.08)",
                  },
                }}
              >
                Copiar
              </Button>

              <Button
                onClick={compartirRemito}
                variant="contained"
                startIcon={<ShareIcon />}
                sx={{
                  backgroundColor: "#D4A72C",
                  color: "#111",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#b89020" },
                }}
              >
                Compartir remito
              </Button>
            </>
          )}

          <Button onClick={cerrarRemito} variant="contained" sx={{ backgroundColor: "#333", color: "white", fontWeight: "bold", "&:hover": { backgroundColor: "#444" } }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
