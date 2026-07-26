import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";

import AgricultureIcon from "@mui/icons-material/Agriculture";
import EggIcon from "@mui/icons-material/Egg";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import CategoryIcon from "@mui/icons-material/Category";

const opciones = [
  {
    titulo: "Pollo entero",
    icono: <AgricultureIcon sx={{ fontSize: 55 }} />,
    color: "#FFF8E1",
  },
  {
    titulo: "Pechuga",
    icono: <LunchDiningIcon sx={{ fontSize: 55 }} />,
    color: "#F1F8E9",
  },
  {
    titulo: "Pata / Muslo",
    icono: <RestaurantIcon sx={{ fontSize: 55 }} />,
    color: "#FCE4EC",
  },
  {
    titulo: "Congelados",
    icono: <AcUnitIcon sx={{ fontSize: 55 }} />,
    color: "#E3F2FD",
  },
  {
    titulo: "Huevos",
    icono: <EggIcon sx={{ fontSize: 55 }} />,
    color: "#FFFDE7",
  },
  {
    titulo: "Quesos",
    icono: <ShoppingBasketIcon sx={{ fontSize: 55 }} />,
    color: "#FFF3E0",
  },
  {
    titulo: "Insumos",
    icono: <Inventory2Icon sx={{ fontSize: 55 }} />,
    color: "#ECEFF1",
  },
  {
    titulo: "Otros",
    icono: <CategoryIcon sx={{ fontSize: 55 }} />,
    color: "#F3E5F5",
  },
];

export default function Compras() {
  return (
    <Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        Ingreso de Mercadería
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 4,
        }}
      >
        ¿Qué recibiste hoy?
      </Typography>

      <Grid container spacing={3}>

        {opciones.map((item) => (

          <Grid item xs={12} sm={6} md={3} key={item.titulo}>

            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                backgroundColor: item.color,
                height: "100%",
              }}
            >

              <CardActionArea
                sx={{
                  height: "100%",
                }}
              >

                <CardContent
                  sx={{
                    textAlign: "center",
                    py: 5,
                  }}
                >

                  {item.icono}

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      fontWeight: 700,
                    }}
                  >
                    {item.titulo}
                  </Typography>

                </CardContent>

              </CardActionArea>

            </Card>

          </Grid>

        ))}

      </Grid>

    </Box>
  );
}