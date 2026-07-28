import { Routes, Route } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";

import Dashboard from "../../modules/dashboard/Dashboard";
import Products from "../../modules/products/Products";
import Proveedores from "../../modules/proveedores/Proveedores";


export default function AppRouter() {

  return (

    <Routes>


      <Route element={<MainLayout />}>


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
          path="/proveedores"
          element={<Proveedores />}
        />


      </Route>


    </Routes>

  );

}