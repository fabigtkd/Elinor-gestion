import { Outlet, useNavigate } from "react-router-dom";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FactoryIcon from "@mui/icons-material/Factory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SettingsIcon from "@mui/icons-material/Settings";

import elinorLogo from "../assets/elinor-logo.png";

const menu = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
  },
  {
    text: "Productos",
    icon: <InventoryIcon />,
    path: "/productos",
  },
  {
    text: "Costos",
    icon: <AttachMoneyIcon />,
    path: "/costos",
  },
  {
    text: "Producción",
    icon: <FactoryIcon />,
    path: "/produccion",
  },
  {
    text: "Ventas",
    icon: <ShoppingCartIcon />,
    path: "/ventas",
  },
  {
    text: "Caja",
    icon: <PointOfSaleIcon />,
    path: "/caja",
  },
  {
    text: "Configuración",
    icon: <SettingsIcon />,
    path: "/configuracion",
  },
];

export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#000000",
      }}
    >

      <Drawer
        variant="permanent"
        sx={{
          width: 290,

          "& .MuiDrawer-paper": {
            width: 290,
            boxSizing: "border-box",

            backgroundColor: "#000000",
            color: "#FAFAFA",

            borderRight:
              "1px solid rgba(212,167,44,0.25)",
          },
        }}
      >

        <Box
          sx={{
            height: 230,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <Box
            sx={{
              width: 125,
              height: 125,
              borderRadius: "50%",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              backgroundColor: "#111111",

              border:
                "3px solid #D4A72C",

              boxShadow:
                "0 0 22px rgba(212,167,44,0.45)",

              overflow: "hidden",
              mb: 2,
            }}
          >

            <Box
              component="img"
              src={elinorLogo}
              alt="Elinor Gestión"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />

          </Box>


          <Typography
            sx={{
              color: "#D4A72C",

              fontSize: "2rem",
              fontWeight: 500,

              letterSpacing: 1.5,
              lineHeight: 1,

              fontFamily:
                "'Playfair Display', Georgia, serif",
            }}
          >
            Elinor
          </Typography>


          <Typography
            sx={{
              color: "#FAFAFA",

              fontSize: "0.95rem",
              fontWeight: 500,

              letterSpacing: 4,
              mt: 0.7,

              fontFamily:
                "Montserrat, Arial, sans-serif",
            }}
          >
            GESTIÓN
          </Typography>

        </Box>


        <List sx={{ px: 1.5 }}>

          {menu.map((item) => (

            <ListItem
              key={item.text}
              disablePadding
              sx={{
                mb: 0.5,
              }}
            >

              <ListItemButton
                onClick={() => navigate(item.path)}

                sx={{

                  borderRadius: 2,

                  color: "#FAFAFA",

                  transition:
                    "0.25s",

                  "&:hover": {

                    backgroundColor:
                      "rgba(212,167,44,0.15)",

                    transform:
                      "translateX(5px)",
                  },


                  "& .MuiListItemIcon-root": {

                    color:
                      "#D4A72C",

                    minWidth:
                      42,
                  },

                }}
              >

                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>


                <ListItemText

                  primary={item.text}

                  primaryTypographyProps={{

                    fontWeight: 600,

                    letterSpacing:
                      0.5,

                  }}

                />

              </ListItemButton>

            </ListItem>

          ))}

        </List>

      </Drawer>


      <Box
        component="main"

        sx={{

          flexGrow: 1,

          p: 3,

          backgroundColor:
            "#000000",

          minHeight:
            "100vh",

        }}
      >

        <Outlet />

      </Box>

    </Box>
  );
}