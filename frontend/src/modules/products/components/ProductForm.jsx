import {
  TextField,
  Button,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { useEffect, useState } from "react";


const emptyProduct = {

  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  unidad: "kg",

  tipo: "producto",

  controlaStock: false,

  esMateriaPrima: false,

  esElaborado: false,

  tieneReceta: false,

  margen: "",

};




export default function ProductForm({

  onSave,

  initialProduct = null,

}) {


  const [product, setProduct] = useState(emptyProduct);



  useEffect(() => {


    if(initialProduct){

      setProduct({

        ...emptyProduct,

        ...initialProduct,

      });


    } else {

      setProduct(emptyProduct);

    }


  }, [initialProduct]);







  function handleChange(e){


    setProduct({

      ...product,

      [e.target.name]: e.target.value,

    });


  }







  function handleCheck(e){


    setProduct({

      ...product,

      [e.target.name]: e.target.checked,

    });


  }







  function handleSubmit(e){


    e.preventDefault();



    onSave({

      ...product,


      precio: Number(product.precio || 0),

      stock: Number(product.stock || 0),

      stockMinimo: Number(product.stockMinimo || 0),

      margen: Number(product.margen || 0),


    });



    if(!initialProduct){

      setProduct(emptyProduct);

    }


  }







  return (

    <Box

      component="form"

      onSubmit={handleSubmit}

      sx={{

        display:"flex",

        flexDirection:"column",

        gap:2,

        mb:4,

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

        select

        label="Unidad"

        name="unidad"

        value={product.unidad}

        onChange={handleChange}

      >

        <MenuItem value="kg">

          Kilogramo

        </MenuItem>


        <MenuItem value="unidad">

          Unidad

        </MenuItem>


        <MenuItem value="docena">

          Docena

        </MenuItem>


        <MenuItem value="media_docena">

          Media docena

        </MenuItem>


        <MenuItem value="bandeja">

          Bandeja

        </MenuItem>


      </TextField>







      <TextField

        select

        label="Tipo"

        name="tipo"

        value={product.tipo}

        onChange={handleChange}

      >


        <MenuItem value="producto">

          Producto

        </MenuItem>


        <MenuItem value="materia_prima">

          Materia prima

        </MenuItem>


        <MenuItem value="elaborado">

          Elaborado

        </MenuItem>


      </TextField>







      <TextField

        label="Precio venta"

        name="precio"

        type="number"

        value={product.precio}

        onChange={handleChange}

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





      <TextField

        label="Margen %"

        name="margen"

        type="number"

        value={product.margen}

        onChange={handleChange}

      />






      <FormControlLabel

        control={

          <Checkbox

            checked={product.controlaStock}

            onChange={handleCheck}

            name="controlaStock"

          />

        }

        label="Controla stock"

      />





      <FormControlLabel

        control={

          <Checkbox

            checked={product.esMateriaPrima}

            onChange={handleCheck}

            name="esMateriaPrima"

          />

        }

        label="Es materia prima"

      />





      <FormControlLabel

        control={

          <Checkbox

            checked={product.esElaborado}

            onChange={handleCheck}

            name="esElaborado"

          />

        }

        label="Es elaborado"

      />





      <FormControlLabel

        control={

          <Checkbox

            checked={product.tieneReceta}

            onChange={handleCheck}

            name="tieneReceta"

          />

        }

        label="Tiene receta"

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