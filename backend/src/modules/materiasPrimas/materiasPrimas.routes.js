const express = require("express");

const controller = require("./materiasPrimas.controller");

const router = express.Router();

// ============================================================
// LISTAR MATERIAS PRIMAS
// ============================================================

router.get(
  "/",
  controller.getMateriasPrimas
);

// ============================================================
// CREAR MATERIA PRIMA
// ============================================================

router.post(
  "/",
  controller.createMateriaPrima
);

// ============================================================
// ACTUALIZAR MATERIA PRIMA
// ============================================================

router.put(
  "/:id",
  controller.updateMateriaPrima
);

// ============================================================
// OBTENER ORÍGENES
// ============================================================

router.get(
  "/:id/origenes",
  controller.getOrigenes
);

// ============================================================
// CONSUMIR MATERIA PRIMA
// ============================================================
//
// POST /api/materias-primas/:id/consumir
//
// Ejemplo:
// POST /api/materias-primas/1/consumir
//
// Body:
// {
//   "cantidad": 3
// }
//
// ============================================================

router.post(
  "/:id/consumir",
  controller.consumirMateriaPrima
);

module.exports = router;