import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";

export default function Products() {
  return (
    <Box>

      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: "bold",
        }}
      >
        Productos y Stock
      </Typography>


      <Card>

        <CardContent>

          <Typography variant="h6">
            Gestión de productos
          </Typography>

          <Typography sx={{ mt: 1 }}>
            Aquí administraremos cortes, precios,
            costos y existencias.
          </Typography>


          <Button
            variant="contained"
            sx={{
              mt: 3,
            }}
          >
            Nuevo Producto
          </Button>


        </CardContent>

      </Card>

    </Box>
  );
}