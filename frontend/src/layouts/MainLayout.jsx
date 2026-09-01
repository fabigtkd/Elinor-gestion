import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FactoryIcon from "@mui/icons-material/Factory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import WarehouseIcon from "@mui/icons-material/Warehouse";

import elinorLogo from "../assets/elinor-logo.png";

const drawerWidth = 290;

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
    text: "Proveedores",
    icon: <PeopleIcon />,
    path: "/proveedores",
  },

  {
    text: "Compras",
    icon: <LocalShippingIcon />,
    path: "/compras",
  },

  {
    text: "Producción",
    icon: <FactoryIcon />,
    path: "/produccion",
  },

  {
    text: "Stock",
    icon: <WarehouseIcon />,
    path: "/stock",
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
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",

        background:
          "linear-gradient(135deg,#050505 0%, #111111 50%, #050505 100%)",
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,

            boxSizing: "border-box",

            background:
              "linear-gradient(180deg,#000000 0%, #090909 100%)",

            color: "#FAFAFA",

            borderRight:
              "1px solid rgba(212,167,44,.20)",

            boxShadow:
              "10px 0 35px rgba(0,0,0,.45)",
          },
        }}
      >
        {/* =====================================================
            LOGO
        ===================================================== */}

        <Box
          sx={{
            height: 240,

            display: "flex",

            flexDirection: "column",

            alignItems: "center",

            justifyContent: "center",

            px: 2,
          }}
        >
          <Box
            sx={{
              width: 128,

              height: 128,

              borderRadius: "50%",

              display: "flex",

              justifyContent: "center",

              alignItems: "center",

              overflow: "hidden",

              background: "#111",

              border:
                "3px solid #D4A72C",

              boxShadow:
                "0 0 10px rgba(212,167,44,.35),0 0 35px rgba(212,167,44,.18)",
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
              mt: 2,

              color: "#D4A72C",

              fontFamily:
                "'Playfair Display', serif",

              fontSize: "2rem",

              fontWeight: 500,

              letterSpacing: 1,
            }}
          >
            Elinor
          </Typography>

          <Typography
            sx={{
              color: "#EAEAEA",

              letterSpacing: 5,

              fontWeight: 300,

              fontSize: ".90rem",
            }}
          >
            GESTIÓN
          </Typography>
        </Box>

        <Divider
          sx={{
            borderColor:
              "rgba(212,167,44,.12)",

            mb: 1,
          }}
        />

        {/* =====================================================
            MENU
        ===================================================== */}

        <List sx={{ px: 1.5 }}>
          {menu.map((item) => {
            const selected =
              location.pathname === item.path;

            return (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  mb: 0.7,
                }}
              >
                <ListItemButton
                  selected={selected}
                  onClick={() =>
                    navigate(item.path)
                  }
                  sx={{
                    borderRadius: 3,

                    py: 1.2,

                    color: selected
                      ? "#000"
                      : "#F5F5F5",

                    background: selected
                      ? "linear-gradient(90deg,#D4A72C,#F4C542)"
                      : "transparent",

                    "&:hover": {
                      transform:
                        "translateX(6px)",
                    },

                    "& .MuiListItemIcon-root": {
                      color: selected
                        ? "#000"
                        : "#D4A72C",

                      minWidth: 42,
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.text}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* =====================================================
            ESPACIO INFERIOR
        ===================================================== */}

        <Box sx={{ flexGrow: 1 }} />

        {/* =====================================================
            PIE
        ===================================================== */}

        <Box
          sx={{
            p: 2,

            textAlign: "center",

            borderTop:
              "1px solid rgba(212,167,44,.10)",
          }}
        >
          <Typography
            sx={{
              color: "#777",

              fontSize: ".75rem",

              letterSpacing: 1,
            }}
          >
            ELINOR GESTIÓN
          </Typography>

          <Typography
            sx={{
              color: "#555",

              fontSize: ".70rem",
            }}
          >
            Sistema de Gestión Comercial
          </Typography>
        </Box>
      </Drawer>

      {/* =======================================================
          CONTENIDO PRINCIPAL
      ======================================================= */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width:
            `calc(100vw - ${drawerWidth}px)`,

          minHeight: "100vh",

          p: 2.5,

          overflowX: "auto",

          background:
            "radial-gradient(circle at top right, rgba(212,167,44,.05), transparent 30%), #050505",
        }}
      >
        <Box
          sx={{
            width: "100%",

            maxWidth: "none",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}