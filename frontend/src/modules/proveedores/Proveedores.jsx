import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "./proveedoresService";


export default function Proveedores() {

  const [proveedores, setProveedores] = useState([]);

  const [open, setOpen] = useState(false);

  const [editando, setEditando] = useState(null);


  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
  });


  async function cargarProveedores() {

    const data = await getProveedores();

    setProveedores(data);

  }


  useEffect(() => {

    cargarProveedores();

  }, []);



  function abrirNuevo() {

    setEditando(null);

    setForm({
      nombre: "",
      contacto: "",
      telefono: "",
    });

    setOpen(true);

  }



  function abrirEditar(proveedor) {

    setEditando(proveedor.id);

    setForm({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
    });

    setOpen(true);

  }



  async function guardar() {


    if (editando) {

      await updateProveedor(
        editando,
        form
      );

    } else {

      await createProveedor(form);

    }


    setOpen(false);

    cargarProveedores();

  }



  async function eliminar(id) {

    await deleteProveedor(id);

    cargarProveedores();

  }



  return (

    <Box
      sx={{
        padding: 4,
        color: "white",
      }}
    >


      <Typography
        variant="h4"
        sx={{
          color:"#D4A72C",
          fontWeight:"bold",
          mb:1,
        }}
      >
        Proveedores
      </Typography>


      <Typography
        sx={{
          color:"rgba(255,255,255,0.65)",
          mb:4,
        }}
      >
        Administración de proveedores
      </Typography>



      <Button
        variant="contained"
        onClick={abrirNuevo}
        sx={{
          backgroundColor:"#D4A72C",
          color:"#111",
          fontWeight:"bold",
          mb:4,
          "&:hover":{
            backgroundColor:"#b89020",
          }
        }}
      >
        + Nuevo proveedor
      </Button>




      <Grid
        container
        spacing={3}
      >


        {
          proveedores.map((proveedor)=>(


            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={proveedor.id}
            >


              <Card
                sx={{
                  backgroundColor:"#1B1B1B",
                  color:"white",
                  border:"1px solid rgba(255,255,255,0.15)",
                  borderRadius:3,
                  height:"100%",
                }}
              >


                <CardContent>


                  <Typography
                    variant="h6"
                    sx={{
                      color:"#D4A72C",
                      fontWeight:"bold",
                    }}
                  >
                    {proveedor.nombre}
                  </Typography>


                  <Typography sx={{mt:2}}>
                    Contacto:
                    <br/>
                    {proveedor.contacto || "-"}
                  </Typography>



                  <Typography sx={{mt:1}}>
                    Teléfono:
                    <br/>
                    {proveedor.telefono || "-"}
                  </Typography>



                  <Box
                    sx={{
                      mt:3,
                      p:2,
                      backgroundColor:"#111",
                      borderRadius:2,
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize:14,
                        color:"rgba(255,255,255,0.6)"
                      }}
                    >
                      Saldo actual
                    </Typography>


                    <Typography
                      variant="h6"
                      sx={{
                        color:"#D4A72C",
                        fontWeight:"bold",
                      }}
                    >
                      $
                      {Number(proveedor.saldo || 0)
                      .toLocaleString("es-AR")}
                    </Typography>


                  </Box>



                  <Box
                    sx={{
                      display:"flex",
                      gap:2,
                      mt:3,
                    }}
                  >

                    <Button
                      variant="outlined"
                      onClick={()=>abrirEditar(proveedor)}
                      sx={{
                        color:"#D4A72C",
                        borderColor:"#D4A72C",
                      }}
                    >
                      Editar
                    </Button>



                    <Button
                      variant="outlined"
                      color="error"
                      onClick={()=>eliminar(proveedor.id)}
                    >
                      Eliminar
                    </Button>


                  </Box>


                </CardContent>


              </Card>


            </Grid>


          ))
        }


      </Grid>




      <Dialog
        open={open}
        onClose={()=>setOpen(false)}
      >

        <DialogTitle>
          {editando ? "Editar proveedor" : "Nuevo proveedor"}
        </DialogTitle>


        <DialogContent>


          <TextField
            fullWidth
            label="Nombre"
            margin="normal"
            value={form.nombre}
            onChange={(e)=>
              setForm({
                ...form,
                nombre:e.target.value
              })
            }
          />



          <TextField
            fullWidth
            label="Contacto"
            margin="normal"
            value={form.contacto}
            onChange={(e)=>
              setForm({
                ...form,
                contacto:e.target.value
              })
            }
          />



          <TextField
            fullWidth
            label="Teléfono"
            margin="normal"
            value={form.telefono}
            onChange={(e)=>
              setForm({
                ...form,
                telefono:e.target.value
              })
            }
          />


        </DialogContent>



        <DialogActions>


          <Button
            onClick={()=>setOpen(false)}
          >
            Cancelar
          </Button>


          <Button
            onClick={guardar}
            variant="contained"
            sx={{
              backgroundColor:"#D4A72C",
              color:"#111",
            }}
          >
            Guardar
          </Button>


        </DialogActions>


      </Dialog>



    </Box>

  );

}