import { Chip } from "@mui/material";

export default function StatusChip({ stock, minStock }) {

  const cantidad = Number(stock) || 0;
  const minimo = Number(minStock) || 0;


  if (cantidad <= 0) {

    return (
      <Chip
        label="Sin stock"
        color="error"
        size="small"
      />
    );

  }


  if (cantidad <= minimo) {

    return (
      <Chip
        label="Stock bajo"
        color="warning"
        size="small"
      />
    );

  }


  return (
    <Chip
      label="Disponible"
      color="success"
      size="small"
    />
  );

}