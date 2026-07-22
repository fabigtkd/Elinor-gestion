import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Dashboard from "../../modules/dashboard/Dashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}