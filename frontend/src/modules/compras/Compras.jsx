import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  CardContent,
  IconButton,
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
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import { useEffect, useState } from "react";

import {
  createCompra,
  getCompras,
  getCompraById,
  updateCompra,
} from "./comprasService";

import {
  getMateriasPrimas,
} from "../materiasPrimas/materiasPrimasService";

import {
  getProveedores,
} from "../proveedores/proveedoresService";

import ModuleHeader from "../../components/ModuleHeader";
import ElinorCard from "../../components/ElinorCard";

const productoInicial = {
  materiaPrimaId: "",
  producto: "",
  cantidad: "",
  unidad: "kg",
  precioUnitario: "",
};

const compraInicial = {
  proveedorId: "",
  remito: "",
  fecha: new Date().toISOString().split("T")[0],
  contado: "",
  transferencia: "",
  observaciones: "",
};

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [materiasPrimas, setMateriasPrimas] = useState([]);

  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState(null);

  const [saldoActualizado, setSaldoActualizado] =
    useState(null);

  const [detalle, setDetalle] = useState([]);

  const [producto, setProducto] =
    useState(productoInicial);

  const [compra, setCompra] =
    useState(compraInicial);

  // ============================================================
  // VER REMITO
  // ============================================================

  const [compraSeleccionada, setCompraSeleccionada] =
    useState(null);

  const [dialogVer, setDialogVer] =
    useState(false);

  // ============================================================
  // EDITAR REMITO
  // ============================================================

  const [modoEdicion, setModoEdicion] =
    useState(false);

  const [compraEditandoId, setCompraEditandoId] =
    useState(null);

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    cargarCompras();
    cargarProveedores();
    cargarMateriasPrimas();
  }, []);

  // ============================================================
  // CARGAR COMPRAS
  // ============================================================

  async function cargarCompras() {
    try {
      const datos = await getCompras();

      setCompras(datos || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO COMPRAS:",
        error
      );
    }
  }

  // ============================================================
  // CARGAR PROVEEDORES
  // ============================================================

  async function cargarProveedores() {
    try {
      const datos = await getProveedores();

      setProveedores(datos || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO PROVEEDORES:",
        error
      );
    }
  }

  // ============================================================
  // CARGAR MATERIAS PRIMAS
  // ============================================================

  async function cargarMateriasPrimas() {
    try {
      const datos = await getMateriasPrimas();

      setMateriasPrimas(datos || []);
    } catch (error) {
      console.error(
        "ERROR CARGANDO MATERIAS PRIMAS:",
        error
      );
    }
  }

  // ============================================================
  // VER REMITO
  // ============================================================

  async function verRemito(id) {
    try {
      const datos = await getCompraById(id);

      setCompraSeleccionada(datos);
      setDialogVer(true);
    } catch (error) {
      console.error(
        "ERROR CARGANDO REMITO:",
        error
      );

      alert("Error cargando remito");
    }
  }

  // ============================================================
  // EDITAR REMITO
  // ============================================================

  async function editarRemito(id) {
    try {
      const datos = await getCompraById(id);

      setCompra({
        proveedorId:
          datos.proveedorId || "",

        remito:
          datos.remito || "",

        fecha:
          datos.fecha
            ? String(datos.fecha).substring(0, 10)
            : new Date()
                .toISOString()
                .split("T")[0],

        contado:
          datos.contado || "",

        transferencia:
          datos.transferencia || "",

        observaciones:
          datos.observaciones || "",
      });

      setDetalle(datos.detalle || []);

      const proveedor =
        proveedores.find(
          (item) =>
            Number(item.id) ===
            Number(datos.proveedorId)
        );

      setProveedorSeleccionado(
        proveedor || null
      );

      setSaldoActualizado(
        datos.saldoNuevo !== undefined
          ? datos.saldoNuevo
          : null
      );

      setCompraEditandoId(id);
      setModoEdicion(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "ERROR CARGANDO REMITO PARA EDITAR:",
        error
      );

      alert(
        "Error cargando remito para editar"
      );
    }
  }

  // ============================================================
  // CERRAR DIALOG
  // ============================================================

  function cerrarDialog() {
    setDialogVer(false);
    setCompraSeleccionada(null);
  }

  // ============================================================
  // CAMBIAR DATOS DEL REMITO
  // ============================================================

  function handleCompra(e) {
    const { name, value } = e.target;

    setCompra((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ============================================================
  // SELECCIONAR PROVEEDOR
  // ============================================================

  function seleccionarProveedor(e) {
    const id = Number(e.target.value);

    const proveedor =
      proveedores.find(
        (item) =>
          Number(item.id) === id
      );

    setProveedorSeleccionado(
      proveedor || null
    );

    setSaldoActualizado(null);

    setCompra((anterior) => ({
      ...anterior,
      proveedorId: id,
    }));
  }

  // ============================================================
  // SELECCIONAR MATERIA PRIMA
  // ============================================================

  function seleccionarMateriaPrima(e) {
    const id = Number(e.target.value);

    const materia =
      materiasPrimas.find(
        (item) =>
          Number(item.id) === id
      );

    if (!materia) {
      return;
    }

    setProducto((anterior) => ({
      ...anterior,
      materiaPrimaId: id,
      producto: materia.nombre,
      unidad: materia.unidad || "kg",
    }));
  }

  // ============================================================
  // CAMBIAR DATOS DEL PRODUCTO
  // ============================================================

  function handleProducto(e) {
    const { name, value } = e.target;

    setProducto((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ============================================================
  // AGREGAR PRODUCTO
  // ============================================================

  function agregarProducto() {
    if (
      !producto.materiaPrimaId ||
      !producto.cantidad ||
      !producto.precioUnitario
    ) {
      alert(
        "Complete materia prima, cantidad y precio"
      );

      return;
    }

    const cantidad =
      Number(producto.cantidad);

    const precioUnitario =
      Number(producto.precioUnitario);

    if (
      cantidad <= 0 ||
      precioUnitario <= 0
    ) {
      alert(
        "Cantidad y precio deben ser mayores a cero"
      );

      return;
    }

    setDetalle((anterior) => [
      ...anterior,
      {
        ...producto,
        cantidad,
        precioUnitario,
        subtotal:
          cantidad * precioUnitario,
      },
    ]);

    setProducto({
      ...productoInicial,
    });
  }

  // ============================================================
  // ELIMINAR PRODUCTO
  // ============================================================

  function eliminarProducto(index) {
    setDetalle((anterior) =>
      anterior.filter(
        (_, i) => i !== index
      )
    );
  }

  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    detalle.reduce(
      (acc, item) =>
        acc +
        Number(item.subtotal || 0),
      0
    );

  // ============================================================
  // PAGOS
  // ============================================================

  const pagos =
    Number(compra.contado || 0) +
    Number(compra.transferencia || 0);

  // ============================================================
  // CUENTA CORRIENTE
  // ============================================================

  const cuentaCorriente =
    total - pagos;

  // Evita warning de variable no utilizada
  void pagos;

  // ============================================================
  // GUARDAR / ACTUALIZAR REMITO
  // ============================================================

  async function guardarCompra() {
    if (!compra.proveedorId) {
      alert(
        "Debe seleccionar un proveedor"
      );

      return;
    }

    if (
      !detalle ||
      detalle.length === 0
    ) {
      alert(
        "Debe ingresar al menos un producto"
      );

      return;
    }

    const data = {
      ...compra,

      proveedorId:
        Number(compra.proveedorId),

      total,

      contado:
        Number(compra.contado || 0),

      transferencia:
        Number(
          compra.transferencia || 0
        ),

      cuentaCorriente,

      detalle,
    };

    console.log(
      "DATOS ENVIADOS A COMPRAS:",
      data
    );

    try {
      let respuesta;

      if (modoEdicion) {
        respuesta =
          await updateCompra(
            compraEditandoId,
            data
          );

        alert(
          "Remito actualizado correctamente"
        );
      } else {
        respuesta =
          await createCompra(data);

        alert(
          "Remito registrado correctamente"
        );
      }

      console.log(
        "RESPUESTA COMPRA:",
        respuesta
      );

      if (
        respuesta &&
        respuesta.saldoNuevo !==
          undefined
      ) {
        setSaldoActualizado(
          respuesta.saldoNuevo
        );
      }

      await cargarCompras();
      await cargarProveedores();

      setDetalle([]);

      setProducto({
        ...productoInicial,
      });

      setCompra({
        ...compraInicial,
      });

      setModoEdicion(false);
      setCompraEditandoId(null);
      setProveedorSeleccionado(null);
      setSaldoActualizado(null);
    } catch (error) {
      console.error(
        "ERROR GUARDANDO REMITO:",
        error
      );

      alert(
        error?.message ||
          "Error guardando remito"
      );
    }
  }

  // ============================================================
  // CANCELAR EDICIÓN
  // ============================================================

  function cancelarEdicion() {
    setCompra({
      ...compraInicial,
    });

    setDetalle([]);

    setProducto({
      ...productoInicial,
    });

    setModoEdicion(false);
    setCompraEditandoId(null);
    setProveedorSeleccionado(null);
    setSaldoActualizado(null);
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box>
      <ModuleHeader
        title="Compras"
        subtitle="Ingreso de mercadería mediante remitos"
      />

      {/* ======================================================
          FORMULARIO REMITO
      ====================================================== */}

      <ElinorCard>
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              color: "#D4A72C",
              mb: 2,
            }}
          >
            Datos del remito
          </Typography>

          {/* PROVEEDOR */}

          <TextField
            select
            fullWidth
            label="Proveedor"
            name="proveedorId"
            value={compra.proveedorId}
            onChange={seleccionarProveedor}
            sx={{ mb: 2 }}
          >
            {proveedores.map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
              >
                {item.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* SALDO ACTUAL */}

          {proveedorSeleccionado && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                background: "#111",
                border:
                  "1px solid rgba(212,167,44,.35)",
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  color: "#D4A72C",
                  fontSize: 14,
                }}
              >
                Saldo actual proveedor
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                }}
              >
                $
                {Number(
                  proveedorSeleccionado.saldo ||
                    0
                ).toLocaleString("es-AR")}
              </Typography>
            </Box>
          )}

          {/* NUEVO SALDO */}

          {saldoActualizado !== null && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                background: "#181818",
                border:
                  "1px solid #D4A72C",
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  color: "#D4A72C",
                }}
              >
                Nuevo saldo después del remito
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                }}
              >
                $
                {Number(
                  saldoActualizado
                ).toLocaleString("es-AR")}
              </Typography>
            </Box>
          )}

          {/* FECHA */}

          <TextField
            fullWidth
            label="Fecha"
            type="date"
            name="fecha"
            value={compra.fecha}
            onChange={handleCompra}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />

          {/* REMITO */}

          <TextField
            fullWidth
            label="Remito Nº"
            name="remito"
            value={compra.remito}
            onChange={handleCompra}
            helperText={
              !compra.remito
                ? "Si lo dejás vacío, el sistema asignará el próximo número automáticamente."
                : ""
            }
            sx={{ mb: 2 }}
          />

          {/* OBSERVACIONES */}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            name="observaciones"
            value={compra.observaciones}
            onChange={handleCompra}
            sx={{ mb: 2 }}
          />

          {/* ==================================================
              CARGA MERCADERÍA
          ================================================== */}

          <Typography
            variant="h6"
            sx={{
              color: "#D4A72C",
              mb: 2,
              mt: 3,
            }}
          >
            Carga de mercadería
          </Typography>

          <TextField
            select
            fullWidth
            label="Materia Prima"
            value={producto.materiaPrimaId}
            onChange={seleccionarMateriaPrima}
            sx={{ mb: 2 }}
          >
            {materiasPrimas.map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
              >
                {item.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Grid
            container
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Grid
              item
              xs={12}
              md={4}
            >
              <TextField
                fullWidth
                label="Cantidad"
                name="cantidad"
                type="number"
                value={producto.cantidad}
                onChange={handleProducto}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
            >
              <TextField
                fullWidth
                label="Precio Kg"
                name="precioUnitario"
                type="number"
                value={
                  producto.precioUnitario
                }
                onChange={handleProducto}
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  height: "56px",
                }}
                onClick={agregarProducto}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>

          {/* ==================================================
              DETALLE
          ================================================== */}

          <TableContainer
            component={Paper}
            sx={{
              mt: 3,
              background: "#111",
              border:
                "1px solid rgba(212,167,44,0.3)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Producto
                  </TableCell>

                  <TableCell>
                    Cantidad
                  </TableCell>

                  <TableCell>
                    Unidad
                  </TableCell>

                  <TableCell>
                    Precio
                  </TableCell>

                  <TableCell>
                    Subtotal
                  </TableCell>

                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {detalle.map(
                  (item, index) => (
                    <TableRow
                      key={
                        String(
                          item.materiaPrimaId ||
                            item.id ||
                            "producto"
                        ) +
                        "-" +
                        index
                      }
                    >
                      <TableCell>
                        {item.producto}
                      </TableCell>

                      <TableCell>
                        {item.cantidad}
                      </TableCell>

                      <TableCell>
                        {item.unidad}
                      </TableCell>

                      <TableCell>
                        $
                        {Number(
                          item.precioUnitario ||
                            0
                        ).toLocaleString(
                          "es-AR"
                        )}
                      </TableCell>

                      <TableCell>
                        $
                        {Number(
                          item.subtotal || 0
                        ).toLocaleString(
                          "es-AR"
                        )}
                      </TableCell>

                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() =>
                            eliminarProducto(
                              index
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ==================================================
              TOTALES
          ================================================== */}

          <Grid
            container
            spacing={3}
            sx={{ mt: 3 }}
          >
            <Grid
              item
              xs={12}
              md={6}
            >
              <Box
                sx={{
                  background: "#111",
                  border:
                    "1px solid rgba(212,167,44,0.4)",
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    color: "#D4A72C",
                  }}
                >
                  TOTAL COMPRA
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    color: "#fff",
                    mb: 3,
                  }}
                >
                  $
                  {total.toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <TextField
                  fullWidth
                  label="Pago efectivo"
                  name="contado"
                  type="number"
                  value={compra.contado}
                  onChange={handleCompra}
                  sx={{
                    mb: 2,
                  }}
                />

                <TextField
                  fullWidth
                  label="Transferencia"
                  name="transferencia"
                  type="number"
                  value={
                    compra.transferencia
                  }
                  onChange={handleCompra}
                  sx={{
                    mb: 2,
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    color:
                      cuentaCorriente > 0
                        ? "#D4A72C"
                        : "green",
                    mt: 2,
                  }}
                >
                  Cuenta corriente compra: $
                  {cuentaCorriente.toLocaleString(
                    "es-AR"
                  )}
                </Typography>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
            >
              <Box
                sx={{
                  background: "#111",
                  border:
                    "1px solid rgba(212,167,44,0.4)",
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography
                  sx={{
                    color: "#D4A72C",
                    mb: 2,
                  }}
                >
                  SALDO DEL PROVEEDOR
                </Typography>

                <Typography
                  sx={{
                    color: "#fff",
                    mb: 1,
                  }}
                >
                  Saldo anterior: $
                  {Number(
                    proveedorSeleccionado?.saldo ||
                      0
                  ).toLocaleString("es-AR")}
                </Typography>

                <Typography
                  sx={{
                    color: "#fff",
                    mb: 2,
                  }}
                >
                  Deuda de este remito: $
                  {cuentaCorriente.toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#D4A72C",
                  }}
                >
                  Saldo estimado: $
                  {(
                    Number(
                      proveedorSeleccionado?.saldo ||
                        0
                    ) +
                    cuentaCorriente
                  ).toLocaleString("es-AR")}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* ==================================================
              BOTONES
          ================================================== */}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={guardarCompra}
            >
              {modoEdicion
                ? "ACTUALIZAR REMITO"
                : "GUARDAR REMITO"}
            </Button>

            {modoEdicion && (
              <Button
                fullWidth
                variant="outlined"
                onClick={cancelarEdicion}
              >
                CANCELAR EDICIÓN
              </Button>
            )}
          </Box>
        </CardContent>
      </ElinorCard>

      {/* ======================================================
          HISTORIAL
      ====================================================== */}

      <Typography
        variant="h5"
        sx={{
          mt: 5,
          mb: 2,
        }}
      >
        Historial de compras
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          background: "#111",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Fecha
              </TableCell>

              <TableCell>
                Remito
              </TableCell>

              <TableCell>
                Proveedor
              </TableCell>

              <TableCell>
                Total
              </TableCell>

              <TableCell>
                Saldo anterior
              </TableCell>

              <TableCell>
                Saldo nuevo
              </TableCell>

              <TableCell>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {compras.map((item) => (
              <TableRow
                key={item.id}
              >
                <TableCell>
                  {item.fecha}
                </TableCell>

                <TableCell>
                  {item.remito || "-"}
                </TableCell>

                <TableCell>
                  {item.proveedorNombre ||
                    "-"}
                </TableCell>

                <TableCell>
                  $
                  {Number(
                    item.total || 0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </TableCell>

                <TableCell>
                  $
                  {Number(
                    item.saldoAnterior ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </TableCell>

                <TableCell>
                  $
                  {Number(
                    item.saldoNuevo || 0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </TableCell>

                <TableCell>
                  <IconButton
                    onClick={() =>
                      verRemito(
                        item.id
                      )
                    }
                    sx={{
                      color:
                        "#D4A72C",
                    }}
                    title="Ver remito"
                  >
                    <VisibilityIcon />
                  </IconButton>

                  <IconButton
                    onClick={() =>
                      editarRemito(
                        item.id
                      )
                    }
                    sx={{
                      color: "#fff",
                    }}
                    title="Editar remito"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ======================================================
          DIALOG VER REMITO
      ====================================================== */}

      <Dialog
        open={dialogVer}
        onClose={cerrarDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            color: "#D4A72C",
          }}
        >
          Detalle del Remito
        </DialogTitle>

        <DialogContent>
          {compraSeleccionada && (
            <Box>
              <Typography
                sx={{
                  mb: 1,
                }}
              >
                <strong>
                  Remito:
                </strong>{" "}
                {compraSeleccionada.remito ||
                  "-"}
              </Typography>

              <Typography
                sx={{
                  mb: 1,
                }}
              >
                <strong>
                  Proveedor:
                </strong>{" "}
                {compraSeleccionada.proveedorNombre ||
                  "-"}
              </Typography>

              <Typography
                sx={{
                  mb: 3,
                }}
              >
                <strong>
                  Fecha:
                </strong>{" "}
                {compraSeleccionada.fecha}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mt: 3,
                  color: "#D4A72C",
                }}
              >
                Detalle mercadería
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  mt: 2,
                  background: "#111",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Producto
                      </TableCell>

                      <TableCell>
                        Cantidad
                      </TableCell>

                      <TableCell>
                        Unidad
                      </TableCell>

                      <TableCell>
                        Precio
                      </TableCell>

                      <TableCell>
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {compraSeleccionada.detalle?.map(
                      (item, index) => (
                        <TableRow
                          key={
                            String(
                              item.id ||
                                item.materiaPrimaId ||
                                "detalle"
                            ) +
                            "-" +
                            index
                          }
                        >
                          <TableCell>
                            {item.producto}
                          </TableCell>

                          <TableCell>
                            {item.cantidad}
                          </TableCell>

                          <TableCell>
                            {item.unidad}
                          </TableCell>

                          <TableCell>
                            $
                            {Number(
                              item.precioUnitario ||
                                0
                            ).toLocaleString(
                              "es-AR"
                            )}
                          </TableCell>

                          <TableCell>
                            $
                            {Number(
                              item.subtotal ||
                                0
                            ).toLocaleString(
                              "es-AR"
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ==================================================
                  RESUMEN FINANCIERO
              ================================================== */}

              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  background: "#111",
                  border:
                    "1px solid rgba(212,167,44,.4)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    mb: 1,
                  }}
                >
                  Total: $
                  {Number(
                    compraSeleccionada.total ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <Typography
                  sx={{
                    mb: 1,
                  }}
                >
                  Contado: $
                  {Number(
                    compraSeleccionada.contado ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <Typography
                  sx={{
                    mb: 1,
                  }}
                >
                  Transferencia: $
                  {Number(
                    compraSeleccionada.transferencia ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <Typography
                  sx={{
                    mb: 1,
                    color: "#D4A72C",
                  }}
                >
                  Cuenta corriente: $
                  {Number(
                    compraSeleccionada.cuentaCorriente ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <Typography
                  sx={{
                    mb: 1,
                  }}
                >
                  Saldo anterior: $
                  {Number(
                    compraSeleccionada.saldoAnterior ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#D4A72C",
                  }}
                >
                  Saldo nuevo: $
                  {Number(
                    compraSeleccionada.saldoNuevo ||
                      0
                  ).toLocaleString(
                    "es-AR"
                  )}
                </Typography>
              </Box>

              {compraSeleccionada.observaciones && (
                <Box
                  sx={{
                    mt: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#D4A72C",
                    }}
                  >
                    Observaciones:
                  </Typography>

                  <Typography>
                    {
                      compraSeleccionada.observaciones
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={cerrarDialog}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}