import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import { useEffect, useState } from "react";

import {
  createCompra,
  getCompras,
  getCompraById,
  updateCompra,
} from "./comprasService";

import {
  getMateriasPrimas,
} from "../materiasPrimas/materiasPrimasService";

import {
  getProveedores,
} from "../proveedores/proveedoresService";

import ModuleHeader from "../../components/ModuleHeader";
import ElinorCard from "../../components/ElinorCard";


const productoInicial = {
  materiaPrimaId: "",
  producto: "",
  cantidad: "",
  unidad: "kg",
  precioUnitario: "",
};


const compraInicial = {
  proveedorId: "",
  remito: "",
  fecha: new Date().toISOString().split("T")[0],
  contado: "",
  transferencia: "",
  observaciones: "",
};


export default function Compras(){

const [compras,setCompras] = useState([]);

const [proveedores,setProveedores] = useState([]);

const [materiasPrimas,setMateriasPrimas] = useState([]);

const [proveedorSeleccionado,setProveedorSeleccionado] = useState(null);

const [saldoActualizado,setSaldoActualizado] = useState(null);


const [detalle,setDetalle] = useState([]);

const [producto,setProducto] = useState(productoInicial);

const [compra,setCompra] = useState(compraInicial);


// VER REMITO

const [compraSeleccionada,setCompraSeleccionada] = useState(null);

const [dialogVer,setDialogVer] = useState(false);


// EDITAR

const [modoEdicion,setModoEdicion] = useState(false);

const [compraEditandoId,setCompraEditandoId] = useState(null);



useEffect(()=>{

 cargarCompras();
 cargarProveedores();
 cargarMateriasPrimas();

},[]);



async function cargarCompras(){

 try{

  const datos = await getCompras();

  setCompras(datos);

 }catch(error){

  console.error(error);

 }

}



async function cargarProveedores(){

 try{

  const datos = await getProveedores();

  setProveedores(datos);

 }catch(error){

  console.error(error);

 }

}



async function cargarMateriasPrimas(){

 try{

  const datos = await getMateriasPrimas();

  setMateriasPrimas(datos);

 }catch(error){

  console.error(error);

 }

}


// VER REMITO

async function verRemito(id){

 try{

  const datos = await getCompraById(id);

  setCompraSeleccionada(datos);

  setDialogVer(true);

 }catch(error){

  console.error(error);

  alert("Error cargando remito");

 }

}



// EDITAR REMITO

async function editarRemito(id){

 try{

  const datos = await getCompraById(id);


  setCompra({

    proveedorId: datos.proveedorId,

    remito: datos.remito || "",

    fecha: datos.fecha,

    contado: datos.contado || "",

    transferencia: datos.transferencia || "",

    observaciones: datos.observaciones || ""

  });


  setDetalle(datos.detalle || []);


  const proveedor = proveedores.find(
    item=>item.id === datos.proveedorId
  );


  setProveedorSeleccionado(proveedor || null);


  setCompraEditandoId(id);

  setModoEdicion(true);


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });


 }catch(error){

  console.error(error);

  alert("Error cargando remito para editar");

 }

}



function cerrarDialog(){

 setDialogVer(false);

 setCompraSeleccionada(null);

}



function handleCompra(e){

 setCompra({

  ...compra,

  [e.target.name]:e.target.value

 });

}
function seleccionarProveedor(e){

 const id = Number(e.target.value);


 const proveedor = proveedores.find(
  item=>item.id===id
 );


 setProveedorSeleccionado(
  proveedor || null
 );


 setSaldoActualizado(null);


 setCompra({

  ...compra,

  proveedorId:id

 });

}



function seleccionarMateriaPrima(e){

 const id = Number(e.target.value);


 const materia = materiasPrimas.find(
  item=>item.id===id
 );


 if(!materia) return;


 setProducto({

  ...producto,

  materiaPrimaId:id,

  producto:materia.nombre,

  unidad:materia.unidad || "kg"

 });

}




function handleProducto(e){

 setProducto({

  ...producto,

  [e.target.name]:e.target.value

 });

}





function agregarProducto(){


 if(
  !producto.materiaPrimaId ||
  !producto.cantidad ||
  !producto.precioUnitario
 ){

  alert(
   "Complete materia prima, cantidad y precio"
  );

  return;

 }



 setDetalle([

  ...detalle,

  {

   ...producto,

   cantidad:Number(producto.cantidad),

   precioUnitario:Number(producto.precioUnitario),

   subtotal:
    Number(producto.cantidad) *
    Number(producto.precioUnitario)

  }

 ]);



 setProducto(productoInicial);


}




function eliminarProducto(index){


 setDetalle(

  detalle.filter(

   (_,i)=>i!==index

  )

 );


}





const total = detalle.reduce(

 (acc,item)=>acc + Number(item.subtotal || 0),

 0

);



const pagos =

 Number(compra.contado || 0)

 +

 Number(compra.transferencia || 0);



const cuentaCorriente = total - pagos;





// ===============================
// GUARDAR / ACTUALIZAR REMITO
// ===============================


async function guardarCompra(){


 const data={


  ...compra,


  proveedorId:Number(compra.proveedorId),


  total,


  contado:Number(compra.contado || 0),


  transferencia:Number(compra.transferencia || 0),


  cuentaCorriente,


  detalle


 };



 try{


  let respuesta;



  if(modoEdicion){


   respuesta = await updateCompra(

    compraEditandoId,

    data

   );


   alert(
    "Remito actualizado correctamente"
   );


  }else{


   respuesta = await createCompra(data);


   alert(
    "Remito registrado correctamente"
   );


  }




  if(
   respuesta &&
   respuesta.saldoNuevo !== undefined
  ){

   setSaldoActualizado(
    respuesta.saldoNuevo
   );

  }




  console.log(
   "RESPUESTA COMPRA:",
   respuesta
  );




  setDetalle([]);


  setProducto(productoInicial);


  setCompra(compraInicial);


  setModoEdicion(false);


  setCompraEditandoId(null);


  setProveedorSeleccionado(null);


  cargarCompras();



 }catch(error){


  console.error(error);


  alert(
   "Error guardando remito"
  );


 }


}
return (

<Box>

<ModuleHeader

title="Compras"

subtitle="Ingreso de mercadería mediante remitos"

/>



<ElinorCard>

<CardContent sx={{p:4}}>


<Grid container spacing={3}>


<Grid item xs={12} md={5}>


<Typography

variant="h6"

sx={{

color:"#D4A72C",

mb:2

}}

>

Datos del remito

</Typography>



<TextField

select

fullWidth

label="Proveedor"

name="proveedorId"

value={compra.proveedorId}

onChange={seleccionarProveedor}

sx={{mb:2}}

>


{

proveedores.map(item=>(

<MenuItem

key={item.id}

value={item.id}

>

{item.nombre}

</MenuItem>

))

}


</TextField>



{

proveedorSeleccionado && (

<Box

sx={{

mb:2,

p:2,

background:"#111",

border:"1px solid rgba(212,167,44,.35)",

borderRadius:2

}}

>


<Typography

sx={{

color:"#D4A72C",

fontSize:14

}}

>

Saldo actual proveedor

</Typography>


<Typography variant="h6">

$

{

Number(

proveedorSeleccionado.saldo || 0

)

.toLocaleString("es-AR")

}

</Typography>


</Box>

)

}





{

saldoActualizado !== null && (

<Box

sx={{

mb:2,

p:2,

background:"#181818",

border:"1px solid #D4A72C",

borderRadius:2

}}

>


<Typography

sx={{color:"#D4A72C"}}

>

Nuevo saldo después del remito

</Typography>



<Typography variant="h5">

$

{

Number(saldoActualizado)

.toLocaleString("es-AR")

}

</Typography>


</Box>

)

}





<TextField

fullWidth

label="Fecha"

type="date"

name="fecha"

value={compra.fecha}

onChange={handleCompra}

InputLabelProps={{

shrink:true

}}

sx={{mb:2}}

/>





<TextField

fullWidth

label="Remito Nº"

name="remito"

value={compra.remito}

onChange={handleCompra}

sx={{mb:2}}

/>





<TextField

fullWidth

multiline

rows={3}

label="Observaciones"

name="observaciones"

value={compra.observaciones}

onChange={handleCompra}

sx={{mb:2}}

/>



</Grid>




<Grid item xs={12} md={7}>


<Typography

variant="h6"

sx={{

color:"#D4A72C",

mb:2

}}

>

Carga de mercadería

</Typography>




<TextField

select

fullWidth

label="Materia Prima"

value={producto.materiaPrimaId}

onChange={seleccionarMateriaPrima}

sx={{mb:2}}

>


{

materiasPrimas.map(item=>(

<MenuItem

key={item.id}

value={item.id}

>

{item.nombre}

</MenuItem>

))

}


</TextField>




<Grid container spacing={2}>


<Grid item xs={12} md={4}>


<TextField

fullWidth

label="Cantidad"

name="cantidad"

type="number"

value={producto.cantidad}

onChange={handleProducto}

/>


</Grid>




<Grid item xs={12} md={4}>


<TextField

fullWidth

label="Precio Kg"

name="precioUnitario"

type="number"

value={producto.precioUnitario}

onChange={handleProducto}

/>


</Grid>




<Grid item xs={12} md={4}>


<Button

fullWidth

variant="outlined"

startIcon={<AddIcon/>}

sx={{height:"56px"}}

onClick={agregarProducto}

>

Agregar

</Button>


</Grid>


</Grid>


</Grid>


</Grid>
<TableContainer

component={Paper}

sx={{

mt:4,

background:"#111",

border:"1px solid rgba(212,167,44,0.3)"

}}

>


<Table>


<TableHead>


<TableRow>


<TableCell>
Materia Prima
</TableCell>


<TableCell align="right">
Cantidad
</TableCell>


<TableCell>
Unidad
</TableCell>


<TableCell align="right">
Costo
</TableCell>


<TableCell align="right">
Subtotal
</TableCell>


<TableCell align="center">
Acción
</TableCell>


</TableRow>


</TableHead>



<TableBody>


{

detalle.map((item,index)=>(


<TableRow key={index}>


<TableCell>

{item.producto}

</TableCell>


<TableCell align="right">

{item.cantidad}

</TableCell>


<TableCell>

{item.unidad}

</TableCell>


<TableCell align="right">

$

{Number(item.precioUnitario)

.toLocaleString("es-AR")}

</TableCell>


<TableCell align="right">

$

{Number(item.subtotal)

.toLocaleString("es-AR")}

</TableCell>


<TableCell align="center">


<IconButton

color="error"

onClick={()=>eliminarProducto(index)}

>

<DeleteIcon/>

</IconButton>


</TableCell>


</TableRow>


))


}


</TableBody>


</Table>


</TableContainer>






<Grid

container

spacing={3}

sx={{mt:3}}

>


<Grid item xs={12} md={4}>


<Box

sx={{

background:"#111",

border:"1px solid rgba(212,167,44,0.4)",

borderRadius:2,

p:3

}}

>


<Typography

sx={{color:"#D4A72C"}}

>

TOTAL COMPRA

</Typography>



<Typography variant="h5">

$

{total.toLocaleString("es-AR")}

</Typography>


</Box>


</Grid>





<Grid item xs={12} md={4}>


<TextField

fullWidth

label="Pago efectivo"

name="contado"

value={compra.contado}

onChange={handleCompra}

/>


</Grid>





<Grid item xs={12} md={4}>


<TextField

fullWidth

label="Transferencia"

name="transferencia"

value={compra.transferencia}

onChange={handleCompra}

/>


</Grid>





<Grid item xs={12}>


<Typography

variant="h6"

sx={{

color:

cuentaCorriente>0

?"#D4A72C"

:"green",

mt:2

}}

>

Cuenta corriente compra:

$

{cuentaCorriente.toLocaleString("es-AR")}

</Typography>


</Grid>





<Grid item xs={12}>


<Button

fullWidth

variant="contained"

onClick={guardarCompra}

>

{

modoEdicion

?

"ACTUALIZAR REMITO"

:

"GUARDAR REMITO"

}


</Button>


</Grid>


</Grid>


</CardContent>


</ElinorCard>





<Typography

variant="h5"

sx={{

mt:5,

mb:2

}}

>

Historial de compras

</Typography>






<TableContainer component={Paper}>


<Table>


<TableHead>


<TableRow>


<TableCell>
Fecha
</TableCell>


<TableCell>
Remito
</TableCell>


<TableCell>
Proveedor
</TableCell>


<TableCell align="right">
Total
</TableCell>


<TableCell align="center">
Acción
</TableCell>


</TableRow>


</TableHead>



<TableBody>


{

compras.map(item=>(


<TableRow key={item.id}>


<TableCell>

{item.fecha}

</TableCell>


<TableCell>

{item.remito || "-"}

</TableCell>


<TableCell>

{item.proveedorNombre || "-"}

</TableCell>


<TableCell align="right">

$

{Number(item.total || 0)

.toLocaleString("es-AR")}

</TableCell>
<TableCell align="center">


<IconButton

onClick={()=>verRemito(item.id)}

sx={{

color:"#D4A72C"

}}

>

<VisibilityIcon/>

</IconButton>




<IconButton

onClick={()=>editarRemito(item.id)}

sx={{

color:"#ffffff"

}}

>

<EditIcon/>

</IconButton>


</TableCell>


</TableRow>


))


}


</TableBody>


</Table>


</TableContainer>






<Dialog

open={dialogVer}

onClose={cerrarDialog}

maxWidth="md"

fullWidth

>


<DialogTitle

sx={{

color:"#D4A72C"

}}

>

Detalle del Remito

</DialogTitle>



<DialogContent dividers>


{

compraSeleccionada && (


<Box>


<Typography>

<b>Remito:</b> {compraSeleccionada.remito || "-"}

</Typography>



<Typography>

<b>Proveedor:</b> {compraSeleccionada.proveedorNombre || "-"}

</Typography>



<Typography>

<b>Fecha:</b> {compraSeleccionada.fecha}

</Typography>





<Typography

variant="h6"

sx={{

mt:3,

color:"#D4A72C"

}}

>

Detalle mercadería

</Typography>





<TableContainer component={Paper}>


<Table>


<TableHead>


<TableRow>


<TableCell>
Producto
</TableCell>


<TableCell>
Cantidad
</TableCell>


<TableCell>
Unidad
</TableCell>


<TableCell align="right">
Precio
</TableCell>


<TableCell align="right">
Subtotal
</TableCell>


</TableRow>


</TableHead>



<TableBody>


{

compraSeleccionada.detalle?.map(item=>(


<TableRow key={item.id}>


<TableCell>

{item.producto}

</TableCell>


<TableCell>

{item.cantidad}

</TableCell>


<TableCell>

{item.unidad}

</TableCell>


<TableCell align="right">

$

{Number(item.precioUnitario || 0)

.toLocaleString("es-AR")}

</TableCell>


<TableCell align="right">

$

{Number(item.subtotal || 0)

.toLocaleString("es-AR")}

</TableCell>


</TableRow>


))


}


</TableBody>


</Table>


</TableContainer>







<Box sx={{mt:3}}>


<Typography>

<b>Total:</b> $

{Number(compraSeleccionada.total || 0)

.toLocaleString("es-AR")}

</Typography>



<Typography>

<b>Contado:</b> $

{Number(compraSeleccionada.contado || 0)

.toLocaleString("es-AR")}

</Typography>



<Typography>

<b>Transferencia:</b> $

{Number(compraSeleccionada.transferencia || 0)

.toLocaleString("es-AR")}

</Typography>



<Typography>

<b>Cuenta corriente:</b> $

{Number(compraSeleccionada.cuentaCorriente || 0)

.toLocaleString("es-AR")}

</Typography>


</Box>






<Box sx={{mt:3}}>


<Typography>

<b>Saldo anterior:</b> $

{Number(compraSeleccionada.saldoAnterior || 0)

.toLocaleString("es-AR")}

</Typography>



<Typography>

<b>Saldo nuevo:</b> $

{Number(compraSeleccionada.saldoNuevo || 0)

.toLocaleString("es-AR")}

</Typography>


</Box>







{

compraSeleccionada.observaciones && (


<Box sx={{mt:3}}>


<Typography>

<b>Observaciones:</b>

</Typography>


<Typography>

{compraSeleccionada.observaciones}

</Typography>


</Box>


)


}




</Box>


)


}



</DialogContent>






<DialogActions>


<Button

onClick={cerrarDialog}

>

Cerrar

</Button>


</DialogActions>


</Dialog>






</Box>


);


}