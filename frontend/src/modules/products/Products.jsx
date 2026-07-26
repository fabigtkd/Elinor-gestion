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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useEffect, useState } from "react";

import {
  getProducts,
  createProduct,
} from "./services/productsService";

import ProductForm from "./components/ProductForm";


export default function Products() {


  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);



  useEffect(() => {

    loadProducts();

  }, []);



  async function loadProducts() {

    try {

      const data = await getProducts();

      setProducts(data);

    } catch (error) {

      console.error(
        "Error cargando productos:",
        error
      );

    }

  }



  async function handleCreate(product) {

    try {

      await createProduct(product);

      await loadProducts();

      setShowForm(false);

    } catch (error) {

      console.error(
        "Error creando producto:",
        error
      );

    }

  }



  async function handleDelete(id) {

    const confirmDelete = window.confirm(
      "¿Eliminar este producto?"
    );


    if (!confirmDelete) {
      return;
    }


    try {

      await fetch(
        `http://localhost:3001/api/products/${id}`,
        {
          method: "DELETE",
        }
      );


      await loadProducts();


    } catch (error) {

      console.error(
        "Error eliminando producto:",
        error
      );

    }

  }



  function handleEdit(product) {

    console.log(
      "Editar producto:",
      product
    );

  }



  const filteredProducts = products.filter((product) =>

    product.nombre
      .toLowerCase()
      .includes(search.toLowerCase())

  );



  return (

    <Box sx={{ p: 3 }}>


      <Typography
        variant="h4"
        fontWeight="bold"
      >
        Productos
      </Typography>



      <Typography color="text.secondary">

        Gestión de productos y costos de Elinor Pollos

      </Typography>



      <Button

        variant="contained"

        startIcon={<AddIcon />}

        onClick={() => setShowForm(!showForm)}

        sx={{
          mt: 3,
          mb: 3,
        }}

      >

        Nuevo producto

      </Button>



      {
        showForm && (

          <ProductForm
            onSave={handleCreate}
          />

        )
      }



      <TextField

        fullWidth

        label="Buscar producto"

        value={search}

        onChange={(e) =>
          setSearch(e.target.value)
        }

        sx={{
          mb: 3,
        }}

      />



      <TableContainer component={Paper}>

        <Table>


          <TableHead>

            <TableRow>

              <TableCell>
                Producto
              </TableCell>

              <TableCell>
                Categoría
              </TableCell>

              <TableCell>
                Precio
              </TableCell>

              <TableCell>
                Stock
              </TableCell>

              <TableCell>
                Unidad
              </TableCell>

              <TableCell align="center">
                Acciones
              </TableCell>

            </TableRow>

          </TableHead>



          <TableBody>


            {filteredProducts.map((product) => (


              <TableRow key={product.id}>


                <TableCell>
                  {product.nombre}
                </TableCell>


                <TableCell>
                  {product.categoria}
                </TableCell>


                <TableCell>
                  ${product.precio}
                </TableCell>


                <TableCell>
                  {product.stock}
                </TableCell>


                <TableCell>
                  {product.unidad}
                </TableCell>


                <TableCell align="center">


                  <IconButton
                    onClick={() =>
                      handleEdit(product)
                    }
                  >

                    <EditIcon />

                  </IconButton>



                  <IconButton
                    color="error"
                    onClick={() =>
                      handleDelete(product.id)
                    }
                  >

                    <DeleteIcon />

                  </IconButton>


                </TableCell>


              </TableRow>


            ))}


          </TableBody>


        </Table>

      </TableContainer>


    </Box>

  );

}