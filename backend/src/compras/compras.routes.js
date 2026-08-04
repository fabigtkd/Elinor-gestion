const express = require("express");

const router = express.Router();


const comprasController = require("./compras.controller");

console.log("✅ compras.routes.js cargado");



// ===============================
// OBTENER COMPRAS
// ===============================

router.get(

  "/",

  comprasController.getCompras

);

router.get(
  "/abc123",
  (req,res)=>{
    res.json({
      mensaje:"PRUEBA OK"
    });
  }
);

// ===============================
// OBTENER REMITO POR ID
// ===============================

router.get(

  "/:id",

  comprasController.getCompraById

);



// ===============================
// CREAR COMPRA
// ===============================

router.post(

  "/",

  comprasController.createCompra

);
router.put("/test", (req, res) => {
  console.log("✅ PUT TEST");
  res.json({ ok: true });
});


module.exports = router;