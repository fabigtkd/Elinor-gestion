const express = require("express");

const controller = require("./compras.controller");

const router = express.Router();


console.log("🔥 MODULE COMPRAS ROUTES ACTIVO");



// ===============================
// LISTADO DE COMPRAS
// ===============================

router.get(
  "/",
  controller.getCompras
);



// ===============================
// VER REMITO POR ID
// ===============================

router.get(
  "/:id",
  controller.getCompraById
);



// ===============================
// CREAR REMITO
// ===============================

router.post(
  "/",
  controller.createCompra
);



// ===============================
// EDITAR REMITO
// ===============================

router.put("/:id", (req, res, next) => {
  console.log("🔥 LLEGÓ PUT /api/compras/" + req.params.id);
  next();
}, controller.updateCompra);



module.exports = router;