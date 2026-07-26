import {
  TextField,
  Button,
  Box,
} from "@mui/material";

import { useEffect, useState } from "react";


const emptyProduct = {

  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  unidad: "kg",

};



export default function ProductForm({

  onSave,

  initialProduct = null,

}) {



  const [product, setProduct] = useState(emptyProduct);



  useEffect(() => {


    if (initialProduct) {

      setProduct(initialProduct);

    } else {

      setProduct(emptyProduct);

    }


  }, [initialProduct]);





  function handleChange(e) {


    setProduct({

      ...product,

      [e.target.name]: e.target.value,

    });


  }





  function handleSubmit(e) {


    e.preventDefault();



    onSave({

      ...product,

      precio: Number(product.precio),

      stock: Number(product.stock),

      stockMinimo: Number(product.stockMinimo),

    });



    if (!initialProduct) {

      setProduct(emptyProduct);

    }


  }





  return (


    <Box

      component="form"

      onSubmit={handleSubmit}

      sx={{

        display: "flex",

        flexDirection: "column",

        gap: 2,

        mb: 4,

      }}

    >



      <TextField

        label="Nombre"

        name="nombre"

        value={product.nombre}

        onChange={handleChange}

        required

      />



      <TextField

        label="Categoría"

        name="categoria"

        value={product.categoria}

        onChange={handleChange}

      />



      <TextField

        label="Precio"

        name="precio"

        type="number"

        value={product.precio}

        onChange={handleChange}

        required

      />



      <TextField

        label="Stock"

        name="stock"

        type="number"

        value={product.stock}

        onChange={handleChange}

      />



      <TextField

        label="Stock mínimo"

        name="stockMinimo"

        type="number"

        value={product.stockMinimo}

        onChange={handleChange}

      />



      <Button

        type="submit"

        variant="contained"

      >

        {
          initialProduct
            ? "Actualizar producto"
            : "Guardar producto"
        }


      </Button>



    </Box>


  );


}