const express = require("express");

const router = express.Router();

const {
  getCompras,
  getComprasByProveedor,
  getCompraById,
  createCompra,
  updateCompra,
} = require("./compras.controller");

// ============================================================
// OBTENER TODAS LAS COMPRAS
// ============================================================

router.get("/", getCompras);

// ============================================================
// OBTENER COMPRAS DE UN PROVEEDOR
// IMPORTANTE: esta ruta debe estar antes de /:id
// ============================================================

router.get("/proveedor/:proveedorId", getComprasByProveedor);

// ============================================================
// OBTENER REMITO POR ID
// ============================================================

router.get("/:id", getCompraById);

// ============================================================
// CREAR REMITO
// ============================================================

router.post("/", createCompra);

// ============================================================
// ACTUALIZAR REMITO
// ============================================================

router.put("/:id", updateCompra);

module.exports = router;
