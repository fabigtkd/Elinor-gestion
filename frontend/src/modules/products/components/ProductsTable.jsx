import { DataGrid } from "@mui/x-data-grid";

import {
  IconButton,
  Stack,
} from "@mui/material";


import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


import { esES } from "@mui/x-data-grid/locales";

import StatusChip from "../../../components/StatusChip";


export default function ProductsTable({ products }) {


  const columns = [

    {
      field: "code",
      headerName: "Código",
      width: 90,
    },


    {
      field: "name",
      headerName: "Producto",
      flex: 1,
      minWidth: 160,
    },


    {
      field: "category",
      headerName: "Categoría",
      width: 130,
    },


    {
      field: "unit",
      headerName: "Unidad",
      width: 90,
    },


    {
      field: "stock",
      headerName: "Stock",
      width: 110,

      renderCell: (params) =>
        `${params.value} ${params.row.unit}`,

    },


    {
      field: "minStock",
      headerName: "Mínimo",
      width: 100,
    },


    {
      field: "status",
      headerName: "Estado",
      width: 140,

      renderCell: (params) => (

        <StatusChip

          stock={params.row.stock}

          minStock={params.row.minStock}

        />

      ),

    },


    {
      field: "location",
      headerName: "Ubicación",
      width: 150,

      valueGetter: (value) =>
        value || "Sin asignar",

    },


    {
      field: "cost",
      headerName: "Costo",
      width: 130,

      valueFormatter: (value) =>

        new Intl.NumberFormat("es-AR", {

          style: "currency",

          currency: "ARS",

        }).format(value),

    },


    {
      field: "price",
      headerName: "Precio",
      width: 130,

      valueFormatter: (value) =>

        new Intl.NumberFormat("es-AR", {

          style: "currency",

          currency: "ARS",

        }).format(value),

    },


    {
      field: "actions",
      headerName: "Acciones",
      width: 120,
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

    <div
      style={{
        height: 560,
        width: "100%",
      }}
    >

      <DataGrid

        rows={products}

        columns={columns}


        localeText={
          esES.components.MuiDataGrid.defaultProps.localeText
        }


        pageSizeOptions={[5, 10, 20]}


        initialState={{

          pagination: {

            paginationModel: {

              pageSize: 10,

            },

          },

        }}


        disableRowSelectionOnClick

      />

    </div>

  );

}