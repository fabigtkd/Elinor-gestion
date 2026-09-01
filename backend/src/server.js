const express = require("express");
const cors = require("cors");

// ============================================================
// BASE DE DATOS / MIGRACIONES
// ============================================================

require("./database/init");

require("./database/migrateCompras");

require("./database/migration_estructura_v2");

require("./database/migration_stock_origen_v1");

// ============================================================
// APP
// ============================================================

const app = express();

app.use(cors());

app.use(express.json());

// ============================================================
// RUTAS
// ============================================================

const productsRoutes = require(
"./modules/products/products.routes"
);

const costosRoutes = require(
"./modules/costos/costos.routes"
);

const materiasPrimasRoutes = require(
"./modules/materiasPrimas/materiasPrimas.routes"
);

const comprasRoutes = require(
"./modules/compras/compras.routes"
);

const proveedoresRoutes = require(
"./modules/proveedores/proveedores.routes"
);

const produccionRoutes = require(
"./modules/produccion/produccion.routes"
);

// ============================================================
// DEBUG
// ============================================================

console.log(
"COMPRAS ROUTES CARGADO DESDE:",
require.resolve(
"./modules/compras/compras.routes"
)
);

console.log(
"PRODUCCION ROUTES CARGADO DESDE:",
require.resolve(
"./modules/produccion/produccion.routes"
)
);

// ============================================================
// API ROUTES
// ============================================================

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

app.use(
"/api/produccion",
produccionRoutes
);

// ============================================================
// API PRINCIPAL
// ============================================================

app.get("/", (req, res) => {
res.json({
sistema: "Elinor Gestión",
estado: "API funcionando",
version: "0.7.0"
});
});

// ============================================================
// TEST PUT
// ============================================================

app.put("/api/test-put", (req, res) => {
console.log(
"🔥 TEST PUT FUNCIONANDO"
);

res.json({
ok: true
});
});

// ============================================================
// SERVIDOR
// ============================================================

const PORT = 3001;

app.listen(PORT, () => {
console.log(
`🚀 Elinor Gestión API activa en puerto ${PORT}`
);
});
