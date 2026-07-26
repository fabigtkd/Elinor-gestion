import {
  Box,
  TextField,
} from "@mui/material";


export default function ProductToolbar({
  search,
  setSearch,
}) {

  return (

    <Box
      sx={{
        mb: 3,
      }}
    >

      <TextField

        label="Buscar producto"

        value={search}

        onChange={(e) => setSearch(e.target.value)}

        fullWidth

        variant="outlined"

        sx={{
          backgroundColor: "white",
          borderRadius: 2,
        }}

      />

    </Box>

  );

}