import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  createCosto,
  getCostos,
  updateCosto,
} from "./services/costosService";


export default function Costos() {


  const [costo, setCosto] = useState({

    nombre: "",

    unidad: "kg",

    costoBase: "",

    margen: "",

  });



  const [editando, setEditando] = useState(null);



  const [precioSugerido, setPrecioSugerido] = useState(0);



  const [costos, setCostos] = useState([]);




  useEffect(() => {

    cargarCostos();

  }, []);





  async function cargarCostos() {

    try {

      const data = await getCostos();

      setCostos(data);


    } catch(error) {

      console.error(
        "Error cargando costos:",
        error
      );

    }

  }






  function handleChange(e) {

    const nuevoCosto = {

      ...costo,

      [e.target.name]: e.target.value,

    };


    setCosto(nuevoCosto);


    calcularPrecio(nuevoCosto);


  }







  function calcularPrecio(data) {


    const base = Number(data.costoBase);

    const margen = Number(data.margen);



    if (
      base > 0 &&
      margen > 0 &&
      margen < 100
    ) {


      const precio =
        base / (1 - margen / 100);



      setPrecioSugerido(
        Math.round(precio)
      );


    } else {

      setPrecioSugerido(0);

    }


  }







  function editarCosto(item) {


    setEditando(item.id);


    setCosto({

      nombre: item.nombre,

      unidad: item.unidad,

      costoBase: item.costoBase,

      margen: item.margen,

    });


    setPrecioSugerido(
      item.precioSugerido
    );


  }







  async function guardarCosto() {


    try {


      const datosCosto = {


        nombre: costo.nombre,

        unidad: costo.unidad,

        costoBase: Number(costo.costoBase),

        margen: Number(costo.margen),

        precioSugerido,


      };



      if(editando) {


        await updateCosto(

          editando,

          datosCosto

        );


      } else {


        await createCosto(

          datosCosto

        );


      }



      await cargarCostos();



      setEditando(null);



      setCosto({

        nombre: "",

        unidad: "kg",

        costoBase: "",

        margen: "",

      });



      setPrecioSugerido(0);



    } catch(error) {


      console.error(

        "Error guardando costo:",

        error

      );


    }


  }







  return (

    <Box sx={{p:3}}>


      <Typography
        variant="h4"
        fontWeight="bold"
      >

        Costos

      </Typography>



      <Typography color="text.secondary">

        Cálculo de costos y costos vigentes

      </Typography>





      <Paper

        sx={{

          mt:3,

          p:3,

          maxWidth:500,

        }}

      >


        <TextField

          fullWidth

          label="Producto"

          name="nombre"

          value={costo.nombre}

          onChange={handleChange}

          sx={{mb:2}}

        />



        <TextField

          select

          fullWidth

          label="Unidad"

          name="unidad"

          value={costo.unidad}

          onChange={handleChange}

          sx={{mb:2}}

        >

          <MenuItem value="kg">

            Kilogramo

          </MenuItem>


          <MenuItem value="unidad">

            Unidad

          </MenuItem>


        </TextField>





        <TextField

          fullWidth

          type="number"

          label="Costo base"

          name="costoBase"

          value={costo.costoBase}

          onChange={handleChange}

          sx={{mb:2}}

        />





        <TextField

          fullWidth

          type="number"

          label="Margen deseado %"

          name="margen"

          value={costo.margen}

          onChange={handleChange}

          sx={{mb:3}}

        />





        <Typography variant="h6">

          Precio sugerido: ${precioSugerido}

        </Typography>




        <Button

          variant="contained"

          sx={{mt:3}}

          onClick={guardarCosto}

        >

          {editando
            ? "Actualizar costo"
            : "Guardar cálculo"}

        </Button>


      </Paper>






      <Typography

        variant="h5"

        fontWeight="bold"

        sx={{mt:5, mb:2}}

      >

        Costos vigentes

      </Typography>





      <TableContainer component={Paper}>


        <Table>


          <TableHead>

            <TableRow>


              <TableCell>
                Producto
              </TableCell>


              <TableCell>
                Unidad
              </TableCell>


              <TableCell>
                Costo
              </TableCell>


              <TableCell>
                Margen
              </TableCell>


              <TableCell>
                Precio sugerido
              </TableCell>


              <TableCell>
                Acción
              </TableCell>


            </TableRow>

          </TableHead>





          <TableBody>


            {costos.map((item)=>(


              <TableRow key={item.id}>


                <TableCell>
                  {item.nombre}
                </TableCell>


                <TableCell>
                  {item.unidad}
                </TableCell>


                <TableCell>
                  ${item.costoBase}
                </TableCell>


                <TableCell>
                  {item.margen}%
                </TableCell>


                <TableCell>
                  ${item.precioSugerido}
                </TableCell>


                <TableCell>

                  <Button

                    variant="outlined"

                    size="small"

                    onClick={() => editarCosto(item)}

                  >

                    Editar

                  </Button>


                </TableCell>


              </TableRow>


            ))}


          </TableBody>


        </Table>


      </TableContainer>


    </Box>

  );

}