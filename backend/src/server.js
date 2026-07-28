const express = require("express");
const cors = require("cors");

require("./database/init");

const app = express();

app.use(cors());
app.use(express.json());



// ==========================
// RUTAS
// ==========================

const productsRoutes = require("./modules/products/products.routes");
const costosRoutes = require("./modules/costos/costos.routes");
const materiasPrimasRoutes = require("./modules/materiasPrimas/materiasPrimas.routes");
const comprasRoutes = require("./modules/compras/compras.routes");
const proveedoresRoutes = require("./modules/proveedores/proveedores.routes");



app.use(
  "/api/products",
  productsRoutes
);

app.use(
  "/api/costos",
  costosRoutes
);

app.use(
  "/api/materias-primas",
  materiasPrimasRoutes
);

app.use(
  "/api/compras",
  comprasRoutes
);

app.use(
  "/api/proveedores",
  proveedoresRoutes
);



// ==========================
// API
// ==========================

app.get("/", (req, res) => {

  res.json({

    sistema: "Elinor Gestión",

    estado: "API funcionando",

    version: "0.6.0",

  });

});



const PORT = 3001;



app.listen(PORT, () => {

  console.log(

    `🚀 Elinor Gestión API activa en puerto ${PORT}`

  );

});