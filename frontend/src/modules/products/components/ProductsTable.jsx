import { DataGrid } from "@mui/x-data-grid";
import {
  Chip,
  IconButton,
  Stack,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


export default function ProductsTable({ products }) {

  const columns = [
    {
      field: "code",
      headerName: "Código",
      width: 100,
    },
    {
      field: "name",
      headerName: "Producto",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Categoría",
      width: 140,
    },
    {
      field: "unit",
      headerName: "Unidad",
      width: 100,
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={`${params.value} ${params.row.unit}`}
          color={params.value < 20 ? "error" : "success"}
          size="small"
        />
      ),
    },
    {
      field: "cost",
      headerName: "Costo",
      width: 140,
      valueFormatter: (value) =>
        new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(value),
    },
    {
      field: "price",
      headerName: "Precio",
      width: 140,
      valueFormatter: (value) =>
        new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(value),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">

          <IconButton
            color="primary"
            size="small"
            onClick={() => params.row.onEdit(params.row)}
          >
            <EditIcon />
          </IconButton>


          <IconButton
            color="error"
            size="small"
            onClick={() => params.row.onDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>

        </Stack>
      ),
    },
  ];


  return (
    <div style={{ height: 520, width: "100%" }}>

      <DataGrid
        rows={products}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        disableRowSelectionOnClick
      />

    </div>
  );
}