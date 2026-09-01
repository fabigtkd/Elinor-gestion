const db = require("./connection");

// ============================================================
// MIGRACIÓN CAJONES V1
// ============================================================
//
// Control simple de cajones:
//
// INGRESO = cajones que entran al negocio
// CORTE   = cajones que fueron procesados
//
// Stock disponible:
//
// INGRESOS - CORTES
//
// No se registra rendimiento por cajón.
// ============================================================

db.serialize(() => {
  console.log("🔄 Verificando estructura de cajones...");

  db.run(
    `
    CREATE TABLE IF NOT EXISTS movimientos_cajones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      tipoMovimiento TEXT NOT NULL,

      cantidad REAL NOT NULL DEFAULT 0,

      observaciones TEXT,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `,
    (error) => {
      if (error) {
        console.error(
          "❌ Error creando movimientos_cajones:",
          error
        );

        return;
      }

      console.log(
        "✅ Estructura de cajones verificada."
      );
    }
  );
});

module.exports = db;