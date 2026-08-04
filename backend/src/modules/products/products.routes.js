const express = require("express");

const controller = require("./products.controller");


const router = express.Router();



// Obtener productos

router.get(

  "/",

  controller.getProducts

);



// Crear producto

router.post(

  "/",

  controller.createProduct

);



// Actualizar producto

router.put(

  "/:id",

  controller.updateProduct

);



// Baja lógica

router.delete(

  "/:id",

  controller.deleteProduct

);



module.exports = router;