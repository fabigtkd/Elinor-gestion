const express = require("express");

const router = express.Router();

const comprasController = require("./compras.controller");



router.get(

  "/",

  comprasController.getCompras

);



router.post(

  "/",

  comprasController.createCompra

);



module.exports = router;