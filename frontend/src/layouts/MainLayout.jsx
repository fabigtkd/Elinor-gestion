import { Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";

const drawerWidth = 240;

const menu = [
  "Dashboard",
  "Clientes",
  "Productos",
  "Compras",
  "Producción",
  "Stock",
  "Costos",
  "Ventas",
  "Reportes",
  "Configuración",
];

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          background: "#111827",
        }}
      >
        <Toolbar>
          <Typography variant="h6">
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
            background: "#1f2937",
            color: "white",
          },
        }}
      >
        <Toolbar />

        <List>
          {menu.map((item) => (
            <ListItemButton key={item}>
              <ListItemText primary={item} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}