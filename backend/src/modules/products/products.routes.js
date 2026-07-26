const express = require("express");

const controller = require("./products.controller");


const router = express.Router();



router.get(
  "/",
  controller.getProducts
);



router.post(
  "/",
  controller.createProduct
);



router.put(
  "/:id",
  controller.updateProduct
);



router.delete(
  "/:id",
  controller.deleteProduct
);



module.exports = router;