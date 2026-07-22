import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

const indicators = [
  {
    title: "Ventas del día",
    value: "$ 0",
    description: "Facturación actual",
  },
  {
    title: "Compras pendientes",
    value: "0",
    description: "Pedidos por recibir",
  },
  {
    title: "Stock disponible",
    value: "0 kg",
    description: "Producto en cámara",
  },
  {
    title: "Rentabilidad",
    value: "0 %",
    description: "Margen estimado",
  },
];

export default function Dashboard() {
  return (
    <Box>

      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: "bold",
        }}
      >
        Dashboard Elinor Gestión
      </Typography>


      <Grid container spacing={3}>

        {indicators.map((item) => (

          <Grid item xs={12} md={3} key={item.title}>

            <Card
              sx={{
                height: "100%",
              }}
            >

              <CardContent>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  {item.title}
                </Typography>


                <Typography
                  variant="h4"
                  sx={{
                    mt: 2,
                    fontWeight: "bold",
                  }}
                >
                  {item.value}
                </Typography>


                <Typography
                  sx={{
                    mt: 1,
                  }}
                >
                  {item.description}
                </Typography>

              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>

    </Box>
  );
}