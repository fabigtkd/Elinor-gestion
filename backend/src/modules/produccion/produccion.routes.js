const express = require("express");

const controller = require("./produccion.controller");

const router = express.Router();

// ============================================================
// CAJONES
// ============================================================

router.get(
"/cajones",
controller.obtenerCajones
);

router.get(
"/cajones/:id",
controller.obtenerCajon
);

router.post(
"/cajones",
controller.crearCajon
);

router.put(
"/cajones/:id/cortar",
controller.cortarCajon
);

// ============================================================
// CONSUMO DE MATERIA PRIMA
// ============================================================

router.post(
"/consumo",
controller.consumirMateriaPrima
);

// ============================================================
// COSTO ACTUAL DE MATERIA PRIMA
// ============================================================

router.get(
"/costo/:productoId",
controller.calcularCostoActual
);

module.exports = router;
