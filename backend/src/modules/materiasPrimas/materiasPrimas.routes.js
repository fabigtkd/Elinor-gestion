const express = require("express");

const controller = require("./materiasPrimas.controller");


const router = express.Router();



router.get(
  "/",
  controller.getMateriasPrimas
);



router.post(
  "/",
  controller.createMateriaPrima
);



module.exports = router;