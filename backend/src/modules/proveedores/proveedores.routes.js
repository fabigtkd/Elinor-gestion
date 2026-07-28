const express = require("express");

const router = express.Router();

const {

  getProveedores,

  getProveedor,

  createProveedor,

  updateProveedor,

  deleteProveedor,

} = require("./proveedores.controller");



// ===============================
// OBTENER TODOS
// ===============================

router.get(
  "/",
  getProveedores
);



// ===============================
// OBTENER UNO
// ===============================

router.get(
  "/:id",
  getProveedor
);



// ===============================
// CREAR
// ===============================

router.post(
  "/",
  createProveedor
);



// ===============================
// ACTUALIZAR
// ===============================

router.put(
  "/:id",
  updateProveedor
);



// ===============================
// ELIMINAR
// ===============================

router.delete(
  "/:id",
  deleteProveedor
);



module.exports = router;