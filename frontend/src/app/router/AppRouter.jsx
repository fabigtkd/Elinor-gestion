import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Dashboard from "../../modules/dashboard/Dashboard";
import Products from "../../modules/products/Products";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<Products />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}