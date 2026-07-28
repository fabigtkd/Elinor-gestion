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
  getMateriasPrimas,
  createMateriaPrima,
} from "./materiasPrimasService";



export default function MateriasPrimas() {


  const [materia, setMateria] = useState({

    nombre: "",

    tipo: "Compra",

    origen: "Proveedor",

    unidad: "kg",

    costoActual: "",

    rendimiento: "",

    merma: "",

  });



  const [materias, setMaterias] = useState([]);




  useEffect(() => {

    cargarMaterias();

  }, []);




  async function cargarMaterias() {


    try {


      const data = await getMateriasPrimas();


      setMaterias(data);



    } catch(error) {


      console.error(
        "Error cargando materias primas:",
        error
      );


    }


  }





  function handleChange(e) {


    setMateria({

      ...materia,

      [e.target.name]: e.target.value,

    });


  }






  async function guardarMateria() {


    try {


      await createMateriaPrima({

        nombre: materia.nombre,

        tipo: materia.tipo,

        origen: materia.origen,

        unidad: materia.unidad,

        costoActual: Number(materia.costoActual),

        rendimiento: Number(materia.rendimiento),

        merma: Number(materia.merma),

      });



      await cargarMaterias();



      setMateria({

        nombre: "",

        tipo: "Compra",

        origen: "Proveedor",

        unidad: "kg",

        costoActual: "",

        rendimiento: "",

        merma: "",

      });



    } catch(error) {


      console.error(
        "Error guardando materia prima:",
        error
      );


    }


  }





  return (

    <Box sx={{ p:3 }}>


      <Typography
        variant="h4"
        fontWeight="bold"
      >

        Materias Primas

      </Typography>



      <Typography color="text.secondary">

        Centro de costos de materia prima

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

          label="Nombre"

          name="nombre"

          value={materia.nombre}

          onChange={handleChange}

          sx={{ mb:2 }}

        />





        <TextField

          select

          fullWidth

          label="Tipo"

          name="tipo"

          value={materia.tipo}

          onChange={handleChange}

          sx={{ mb:2 }}

        >


          <MenuItem value="Compra">

            Compra

          </MenuItem>



          <MenuItem value="Produccion">

            Producción

          </MenuItem>



        </TextField>






        <TextField

          select

          fullWidth

          label="Origen"

          name="origen"

          value={materia.origen}

          onChange={handleChange}

          sx={{ mb:2 }}

        >


          <MenuItem value="Proveedor">

            Proveedor

          </MenuItem>



          <MenuItem value="Cajon pollo">

            Cajón pollo

          </MenuItem>



          <MenuItem value="Elaboracion">

            Elaboración propia

          </MenuItem>


        </TextField>







        <TextField

          select

          fullWidth

          label="Unidad"

          name="unidad"

          value={materia.unidad}

          onChange={handleChange}

          sx={{ mb:2 }}

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

          label="Costo actual"

          name="costoActual"

          value={materia.costoActual}

          onChange={handleChange}

          sx={{ mb:2 }}

        />






        <TextField

          fullWidth

          type="number"

          label="Rendimiento %"

          name="rendimiento"

          value={materia.rendimiento}

          onChange={handleChange}

          sx={{ mb:2 }}

        />






        <TextField

          fullWidth

          type="number"

          label="Merma %"

          name="merma"

          value={materia.merma}

          onChange={handleChange}

          sx={{ mb:3 }}

        />






        <Button

          variant="contained"

          onClick={guardarMateria}

        >

          Guardar materia prima

        </Button>



      </Paper>






      <Typography

        variant="h5"

        fontWeight="bold"

        sx={{ mt:5, mb:2 }}

      >

        Materias registradas

      </Typography>






      <TableContainer component={Paper}>


        <Table>


          <TableHead>

            <TableRow>


              <TableCell>
                Nombre
              </TableCell>


              <TableCell>
                Tipo
              </TableCell>


              <TableCell>
                Origen
              </TableCell>


              <TableCell>
                Costo
              </TableCell>


              <TableCell>
                Rendimiento
              </TableCell>


              <TableCell>
                Merma
              </TableCell>


            </TableRow>

          </TableHead>





          <TableBody>


            {materias.map((item)=>(


              <TableRow key={item.id}>


                <TableCell>
                  {item.nombre}
                </TableCell>



                <TableCell>
                  {item.tipo}
                </TableCell>



                <TableCell>
                  {item.origen}
                </TableCell>



                <TableCell>
                  ${item.costoActual}
                </TableCell>



                <TableCell>
                  {item.rendimiento}%
                </TableCell>



                <TableCell>
                  {item.merma}%
                </TableCell>



              </TableRow>


            ))}


          </TableBody>


        </Table>


      </TableContainer>



    </Box>

  );

}