import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

import { useState, useEffect } from "react";


const emptyForm = {

  code: "",
  name: "",
  category: "",
  unit: "KG",

  stock: "",
  minStock: "",

  location: "",

  cost: "",
  price: "",

  notes: "",

};



export default function ProductDialog({

  open,

  onClose,

  onSave,

  productToEdit,

}) {



  const [form, setForm] = useState(emptyForm);



  useEffect(() => {


    if (productToEdit) {


      setForm({

        code: productToEdit.code || "",

        name: productToEdit.name || "",

        category: productToEdit.category || "",

        unit: productToEdit.unit || "KG",


        stock: productToEdit.stock || "",

        minStock: productToEdit.minStock || "",


        location: productToEdit.location || "",


        cost: productToEdit.cost || "",

        price: productToEdit.price || "",


        notes: productToEdit.notes || "",


        id: productToEdit.id,

      });



    } else {


      setForm(emptyForm);


    }


  }, [productToEdit, open]);





  const handleChange = (event) => {


    setForm({

      ...form,

      [event.target.name]: event.target.value,

    });


  };





  const handleSave = () => {


    onSave({

      ...form,


      id: productToEdit?.id,


      stock: Number(form.stock),

      minStock: Number(form.minStock),

      cost: Number(form.cost),

      price: Number(form.price),


    });



  };





  return (


    <Dialog

      open={open}

      onClose={onClose}

      fullWidth

      maxWidth="sm"

    >


      <DialogTitle>

        {productToEdit

          ? "Editar Producto"

          : "Nuevo Producto"}

      </DialogTitle>





      <DialogContent>




        <TextField

          margin="dense"

          label="Código"

          name="code"

          fullWidth

          value={form.code}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Nombre"

          name="name"

          fullWidth

          value={form.name}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Categoría"

          name="category"

          fullWidth

          value={form.category}

          onChange={handleChange}

        />





        <TextField

          select

          margin="dense"

          label="Unidad"

          name="unit"

          fullWidth

          value={form.unit}

          onChange={handleChange}

        >

          <MenuItem value="KG">

            Kilogramos

          </MenuItem>


          <MenuItem value="UN">

            Unidades

          </MenuItem>


          <MenuItem value="LT">

            Litros

          </MenuItem>


        </TextField>





        <TextField

          margin="dense"

          label="Stock actual"

          name="stock"

          type="number"

          fullWidth

          value={form.stock}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Stock mínimo"

          name="minStock"

          type="number"

          fullWidth

          value={form.minStock}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Ubicación"

          name="location"

          fullWidth

          value={form.location}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Costo"

          name="cost"

          type="number"

          fullWidth

          value={form.cost}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Precio venta"

          name="price"

          type="number"

          fullWidth

          value={form.price}

          onChange={handleChange}

        />





        <TextField

          margin="dense"

          label="Observaciones"

          name="notes"

          multiline

          rows={3}

          fullWidth

          value={form.notes}

          onChange={handleChange}

        />



      </DialogContent>





      <DialogActions>


        <Button onClick={onClose}>

          Cancelar

        </Button>



        <Button

          variant="contained"

          onClick={handleSave}

        >

          Guardar

        </Button>



      </DialogActions>



    </Dialog>


  );


}