import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CardContent,
} from "@mui/material";


import { useState } from "react";


import { createCompra } from "./comprasService";


import ModuleHeader from "../../components/ModuleHeader";

import ElinorCard from "../../components/ElinorCard";




export default function Compras() {



  const [compra, setCompra] = useState({


    tipo: "Compra",

    producto: "Cajón pollo",

    cantidad: "",

    unidad: "unidad",

    costoUnitario: "",

    merma: 0,


  });





  function handleChange(e) {


    setCompra({

      ...compra,

      [e.target.name]: e.target.value,

    });


  }






  async function guardarCompra() {



    const nuevaCompra = {


      ...compra,


      cantidad:
        Number(compra.cantidad),


      costoUnitario:
        Number(compra.costoUnitario),



      costoTotal:

        Number(compra.cantidad) *

        Number(compra.costoUnitario),



      merma:
        Number(compra.merma),


    };




    try {


      const resultado =
        await createCompra(nuevaCompra);



      console.log(
        "Compra guardada:",
        resultado
      );



      alert(
        "Compra registrada correctamente"
      );



    } catch(error) {


      console.error(error);



      alert(
        "Error guardando compra"
      );


    }


  }






  const total =

    Number(compra.cantidad || 0) *

    Number(compra.costoUnitario || 0);






  return (



    <Box>


      <ModuleHeader

        title="Ingreso de Mercadería"

        subtitle="Registro de compras y costos de materia prima"

      />






      <ElinorCard>


        <CardContent

          sx={{

            p:4,

            maxWidth:550,

          }}

        >




          <TextField


            select

            fullWidth

            label="Producto"

            name="producto"

            value={compra.producto}

            onChange={handleChange}

            sx={{mb:2}}


          >


            <MenuItem value="Cajón pollo">

              Cajón pollo

            </MenuItem>



            <MenuItem value="Pechuga">

              Pechuga

            </MenuItem>



            <MenuItem value="Pata muslo">

              Pata muslo

            </MenuItem>



            <MenuItem value="Congelados">

              Congelados

            </MenuItem>



          </TextField>








          <TextField


            fullWidth

            label="Cantidad"

            name="cantidad"

            type="number"

            value={compra.cantidad}

            onChange={handleChange}

            sx={{mb:2}}


          />







          <TextField


            select

            fullWidth

            label="Unidad"

            name="unidad"

            value={compra.unidad}

            onChange={handleChange}

            sx={{mb:2}}


          >


            <MenuItem value="unidad">

              Unidad

            </MenuItem>



            <MenuItem value="kg">

              Kilogramos

            </MenuItem>



          </TextField>








          <TextField


            fullWidth

            label="Costo unitario"

            name="costoUnitario"

            type="number"

            value={compra.costoUnitario}

            onChange={handleChange}

            sx={{mb:2}}


          />







          <TextField


            fullWidth

            label="Merma %"

            name="merma"

            type="number"

            value={compra.merma}

            onChange={handleChange}

            sx={{mb:3}}


          />








          <Box

            sx={{

              p:2,

              mb:3,

              borderRadius:2,

              backgroundColor:"#000000",

              border:

              "1px solid rgba(212,167,44,0.25)",

            }}

          >


            <Typography

              sx={{

                color:"#D4A72C",

                fontWeight:700,

              }}

            >

              Total compra:

            </Typography>



            <Typography

              variant="h5"

              sx={{

                color:"#FAFAFA",

                fontWeight:700,

              }}

            >

              ${total.toLocaleString("es-AR")}

            </Typography>



          </Box>







          <Button


            variant="contained"


            fullWidth


            onClick={guardarCompra}


            sx={{


              backgroundColor:"#D4A72C",


              color:"#000000",


              fontWeight:700,



              "&:hover":{

                backgroundColor:"#B89020",

              },


            }}



          >


            Guardar compra


          </Button>





        </CardContent>


      </ElinorCard>





    </Box>


  );



}