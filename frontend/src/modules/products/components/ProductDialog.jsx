import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
} from "@mui/material";

import { useState } from "react";

export default function ProductDialog({ open, onClose, onSave }) {

  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    unit: "KG",
    stock: "",
    minStock: "",
    cost: "",
    price: "",
  });


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


 const handleSave = () => {

  onSave({
    ...form,
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
        Nuevo Producto
      </DialogTitle>


      <DialogContent>

        <Stack spacing={2} mt={1}>

          <TextField
            label="Código"
            name="code"
            value={form.code}
            onChange={handleChange}
          />


          <TextField
            label="Nombre del producto"
            name="name"
            value={form.name}
            onChange={handleChange}
          />


          <TextField
            label="Categoría"
            name="category"
            value={form.category}
            onChange={handleChange}
          />


          <TextField
            select
            label="Unidad"
            name="unit"
            value={form.unit}
            onChange={handleChange}
          >

            <MenuItem value="KG">
              Kilogramos (kg)
            </MenuItem>

            <MenuItem value="UN">
              Unidades
            </MenuItem>

            <MenuItem value="LT">
              Litros (lt)
            </MenuItem>

          </TextField>


          <TextField
            label="Stock inicial"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
          />


          <TextField
            label="Stock mínimo"
            name="minStock"
            type="number"
            value={form.minStock}
            onChange={handleChange}
          />


          <TextField
            label="Costo"
            name="cost"
            type="number"
            value={form.cost}
            onChange={handleChange}
          />


          <TextField
            label="Precio venta"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
          />

        </Stack>

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