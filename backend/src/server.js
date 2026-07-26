const express = require("express");
const cors = require("cors");

require("./database/init");

const productsRoutes = require("./modules/products/products.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRoutes);

app.get("/", (req, res) => {

  res.json({
    sistema: "Elinor Gestión",
    estado: "API funcionando",
    version: "0.3.0"
  });

});

const PORT = 3001;

app.listen(PORT, () => {

  console.log(`🚀 Elinor Gestión API activa en puerto ${PORT}`);

});