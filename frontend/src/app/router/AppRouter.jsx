import { Routes, Route } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Dashboard from "../../modules/dashboard/Dashboard";
import Products from "../../modules/products/Products";
import Costos from "../../modules/costos/Costos";
import Proveedores from "../../modules/proveedores/Proveedores";
import Compras from "../../modules/compras/Compras";
import Produccion from "../../modules/produccion/Produccion";

function AppRouter() {
return ( <Routes>
<Route element={<MainLayout />}>
<Route path="/" element={<Dashboard />} />
<Route path="/productos" element={<Products />} />
<Route path="/costos" element={<Costos />} />
<Route path="/proveedores" element={<Proveedores />} />
<Route path="/compras" element={<Compras />} />
<Route path="/produccion" element={<Produccion />} /> </Route> </Routes>
);
}

export default AppRouter;
