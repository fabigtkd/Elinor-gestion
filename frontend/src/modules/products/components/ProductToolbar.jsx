import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

export default function ProductToolbar({
  search,
  setSearch,
  selectedCount,
  onNew,
  onUpdatePrices,
}) {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
      >
        Productos
      </Typography>

      <Typography color="text.secondary">
        Gestión de productos y costos de Elinor Pollos
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          fullWidth
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          variant="outlined"
          color="primary"
          startIcon={<SyncAltIcon />}
          disabled={selectedCount === 0}
          onClick={onUpdatePrices}
          sx={{
            minWidth: 250,
          }}
        >
          Actualizar precios
          {selectedCount > 0
            ? ` (${selectedCount})`
            : ""}
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNew}
          sx={{
            minWidth: 200,
          }}
        >
          Nuevo producto
        </Button>
      </Stack>
    </Box>
  );
}