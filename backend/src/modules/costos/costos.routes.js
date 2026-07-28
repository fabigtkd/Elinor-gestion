const express = require("express");

const controller = require("./costos.controller");


const router = express.Router();



router.get(
  "/",
  controller.getCostos
);




router.post(
  "/",
  controller.createCosto
);




router.put(
  "/:id",
  controller.updateCosto
);



module.exports = router;