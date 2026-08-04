import { Routes, Route } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";

import Dashboard from "../../modules/dashboard/Dashboard";
import Products from "../../modules/products/Products";
import Compras from "../../modules/compras/Compras";
import Proveedores from "../../modules/proveedores/Proveedores";
import MateriasPrimas from "../../modules/materiasPrimas/MateriasPrimas";
import Costos from "../../modules/costos/Costos";

export default function AppRouter() {

  return (

    <Routes>

      <Route
        element={<MainLayout />}
      >

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/productos"
          element={<Products />}
        />

        <Route
          path="/compras"
          element={<Compras />}
        />

        <Route
          path="/proveedores"
          element={<Proveedores />}
        />

        <Route
          path="/materias-primas"
          element={<MateriasPrimas />}
        />

        <Route
          path="/costos"
          element={<Costos />}
        />

      </Route>

    </Routes>

  );

}