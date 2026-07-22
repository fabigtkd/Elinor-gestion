import { Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FactoryIcon from "@mui/icons-material/Factory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 260;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon /> },
  { text: "Clientes", icon: <PeopleIcon /> },
  { text: "Productos", icon: <InventoryIcon /> },
  { text: "Compras", icon: <ShoppingCartIcon /> },
  { text: "Producción", icon: <FactoryIcon /> },
  { text: "Costos", icon: <AttachMoneyIcon /> },
  { text: "Ventas", icon: <PointOfSaleIcon /> },
  { text: "Reportes", icon: <AssessmentIcon /> },
  { text: "Configuración", icon: <SettingsIcon /> },
];

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#111827",
          zIndex: 1201,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              color: "#f59e0b",
              fontWeight: "bold",
            }}
          >
            ELINOR GESTIÓN
          </Typography>
        </Toolbar>
      </AppBar>


      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#1f2937",
            color: "white",
          },
        }}
      >

        <Toolbar />

        <List>

          {menuItems.map((item) => (

            <ListItemButton key={item.text}>

              <ListItemIcon
                sx={{
                  color: "#f59e0b",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.text} />

            </ListItemButton>

          ))}

        </List>

      </Drawer>


      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >

        <Outlet />

      </Box>


    </Box>
  );
}