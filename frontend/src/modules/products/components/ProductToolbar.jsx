import {
  Box,
  TextField,
  Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";


export default function ProductToolbar({
  search,
  setSearch,
  onNewProduct,
}) {

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 2,
        gap: 2,
      }}
    >

      <TextField
        label="Buscar producto"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        variant="outlined"
        sx={{
          width: 350,
          backgroundColor: "white",
          borderRadius: 1,
        }}
      />


      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onNewProduct}
        sx={{
          fontWeight: "bold",
          px: 3,
        }}
      >
        Nuevo Producto
      </Button>


    </Box>
  );
}