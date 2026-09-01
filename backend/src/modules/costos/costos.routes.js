const express = require("express");
const controller = require("./costos.controller");

const router = express.Router();

// ============================================================
// COSTOS
// ============================================================

// Obtener todos los costos
router.get("/", controller.getCostos);

// Crear costo
router.post("/", controller.createCosto);

// Actualizar costo
router.put("/:id", controller.updateCosto);

module.exports = router;
