import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useEffect, useMemo, useState } from "react";

import { getProducts, createProduct, updateProduct } from "./services/productsService";

import ProductForm from "./components/ProductForm";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuProduct, setMenuProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  async function handleCreate(product) {
    await createProduct(product);
    await loadProducts();
    setShowForm(false);
  }

  async function handleUpdate(product) {
    await updateProduct(product.id, product);
    await loadProducts();
    setEditingProduct(null);
    setShowForm(false);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setShowForm(true);
    handleCloseMenu();
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("¿Eliminar este producto?");

    if (!confirmDelete) {
      return;
    }

    await fetch(`http://localhost:3001/api/products/${id}`, {
      method: "DELETE",
    });

    setSelectedProducts((current) => current.filter((productId) => productId !== id));

    await loadProducts();

    handleCloseMenu();
  }

  function handleOpenMenu(event, product) {
    setMenuAnchor(event.currentTarget);
    setMenuProduct(product);
  }

  function handleCloseMenu() {
    setMenuAnchor(null);
    setMenuProduct(null);
  }

  function handleSelectProduct(id) {
    setSelectedProducts((current) => {
      if (current.includes(id)) {
        return current.filter((productId) => productId !== id);
      }

      return [...current, id];
    });
  }

  function handleSelectAll() {
    const visibleIds = filteredProducts.map((product) => product.id);

    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProducts.includes(id));

    if (allSelected) {
      setSelectedProducts((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedProducts((current) => [...current, ...visibleIds.filter((id) => !current.includes(id))]);
  }

  async function handleUpdateSelectedPrices() {
    if (selectedProducts.length === 0) {
      window.alert("Seleccioná al menos un producto para actualizar.");
      return;
    }

    const selected = products.filter((product) => selectedProducts.includes(product.id));

    const productsToUpdate = selected.filter((product) => Number(product.precioSugerido || 0) > 0);

    if (productsToUpdate.length === 0) {
      window.alert("Los productos seleccionados no tienen un precio sugerido válido para actualizar.");
      return;
    }

    const confirmUpdate = window.confirm(
      `Se actualizará el precio de venta de ${productsToUpdate.length} producto(s) utilizando su precio sugerido. ¿Continuar?`
    );

    if (!confirmUpdate) {
      return;
    }

    try {
      await Promise.all(
        productsToUpdate.map((product) =>
          updateProduct(product.id, {
            ...product,
            precio: Number(product.precioSugerido),
          })
        )
      );

      await loadProducts();

      setSelectedProducts([]);

      const skipped = selected.length - productsToUpdate.length;

      if (skipped > 0) {
        window.alert(
          `Se actualizaron ${productsToUpdate.length} producto(s). ${skipped} producto(s) no fueron modificados porque no tenían precio sugerido válido.`
        );
      } else {
        window.alert(`Se actualizaron ${productsToUpdate.length} producto(s) correctamente.`);
      }
    } catch (error) {
      console.error("Error actualizando precios:", error);

      window.alert("Ocurrió un error al actualizar los precios. Verificá los productos e intentá nuevamente.");
    }
  }

  function getPriceStatus(product) {
    const venta = Number(product.precio || 0);
    const sugerido = Number(product.precioSugerido || 0);

    if (sugerido <= 0) {
      return "neutral";
    }

    if (venta >= sugerido) {
      return "ok";
    }

    const diferencia = ((sugerido - venta) / sugerido) * 100;

    if (diferencia <= 10) {
      return "warning";
    }

    return "danger";
  }

  function getStatusColor(status) {
    if (status === "ok") {
      return "#7CB342";
    }

    if (status === "warning") {
      return "#F2A900";
    }

    if (status === "danger") {
      return "#E53935";
    }

    return "#777777";
  }

  const filteredProducts = useMemo(() => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return products;
    }

    return products.filter((product) => String(product.nombre || "").toLowerCase().includes(text));
  }, [products, search]);

  /*
   * ============================================================
   * MATERIAS PRIMAS DISPONIBLES PARA LAS RECETAS
   * ============================================================
   *
   * Las materias primas son productos existentes marcados
   * con esMateriaPrima = 1.
   *
   * Se ordenan por nombre para que el selector de recetas
   * resulte fácil de utilizar.
   *
   * No modificamos el listado original de productos.
   */

  const materiasPrimas = useMemo(() => {
    return products
      .filter((product) => Number(product.esMateriaPrima || 0) === 1)
      .sort((a, b) =>
        String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
          sensitivity: "base",
        })
      );
  }, [products]);

  const visibleIds = filteredProducts.map((product) => product.id);

  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProducts.includes(id));

  const someVisibleSelected = visibleIds.some((id) => selectedProducts.includes(id)) && !allVisibleSelected;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* ENCABEZADO */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Productos
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de productos y costos de Elinor Pollos
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingProduct(null);
            setShowForm(!showForm);
          }}
        >
          Nuevo producto
        </Button>
      </Box>

      {/* FORMULARIO */}

      {showForm && (
        <ProductForm initialProduct={editingProduct} materiasPrimas={materiasPrimas} onSave={editingProduct ? handleUpdate : handleCreate} />
      )}

      {/* BUSCADOR + ACTUALIZACION */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <TextField fullWidth label="Buscar producto" value={search} onChange={(e) => setSearch(e.target.value)} />

        <Button
          variant="outlined"
          disabled={selectedProducts.length === 0}
          onClick={handleUpdateSelectedPrices}
          sx={{
            minWidth: 220,
            height: 56,
            whiteSpace: "nowrap",
          }}
        >
          Actualizar precios
          {selectedProducts.length > 0 ? ` (${selectedProducts.length})` : ""}
        </Button>
      </Box>

      {/* TABLA */}

      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "8px",
          border: "1px solid rgba(212,167,44,0.18)",
          boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
          "& .MuiTableCell-root": {
            px: 1.25,
          },
        }}
      >
        <Table
          size="small"
          sx={{
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: "5%" }}>
                <Checkbox size="small" checked={allVisibleSelected} indeterminate={someVisibleSelected} onChange={handleSelectAll} />
              </TableCell>

              <TableCell sx={{ width: "24%" }}>Producto</TableCell>

              <TableCell align="center" sx={{ width: "11%" }}>
                Costo
              </TableCell>

              <TableCell align="center" sx={{ width: "14%" }}>
                Venta
              </TableCell>

              <TableCell align="center" sx={{ width: "14%" }}>
                Sugerido
              </TableCell>

              <TableCell align="center" sx={{ width: "10%" }}>
                Margen
              </TableCell>

              <TableCell align="center" sx={{ width: "8%" }}>
                Revisar
              </TableCell>

              <TableCell align="center" sx={{ width: "14%", whiteSpace: "nowrap" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredProducts.map((product) => {
              const status = getPriceStatus(product);
              const statusColor = getStatusColor(status);
              const isSelected = selectedProducts.includes(product.id);

              return (
                <TableRow
                  key={product.id}
                  hover
                  selected={isSelected}
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox size="small" checked={isSelected} onChange={() => handleSelectProduct(product.id)} />
                  </TableCell>

                  {/* PRODUCTO */}

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          minWidth: 8,
                          borderRadius: "50%",
                          backgroundColor: statusColor,
                        }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight="600" noWrap>
                          {product.nombre}
                        </Typography>

                        {product.categoria && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {product.categoria}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* COSTO */}

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    ${Number(product.costoActual || 0).toLocaleString("es-AR")}
                  </TableCell>

                  {/* VENTA */}

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Typography fontWeight="600">${Number(product.precio || 0).toLocaleString("es-AR")}</Typography>
                  </TableCell>

                  {/* SUGERIDO */}

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    ${Number(product.precioSugerido || 0).toLocaleString("es-AR")}
                  </TableCell>

                  {/* MARGEN */}

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {Number(product.margen || 0)}%
                  </TableCell>

                  {/* SEMAFORO */}

                  <TableCell align="center">
                    <Tooltip
                      title={
                        status === "ok"
                          ? "Precio dentro del objetivo"
                          : status === "warning"
                            ? "Conviene revisar el precio"
                            : status === "danger"
                              ? "Precio requiere revisión"
                              : "Sin precio sugerido"
                      }
                    >
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          backgroundColor: statusColor,
                          display: "inline-block",
                        }}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* ACCIONES */}

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton size="small" onClick={(event) => handleOpenMenu(event, product)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No se encontraron productos.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MENU DE ACCIONES */}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => handleEdit(menuProduct)}>Editar producto</MenuItem>

        <MenuItem onClick={() => handleDelete(menuProduct?.id)} sx={{ color: "error.main" }}>
          Eliminar producto
        </MenuItem>
      </Menu>
    </Box>
  );
}
