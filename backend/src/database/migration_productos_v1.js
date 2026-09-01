const db = require("./connection");

console.log("🚀 Iniciando migración Productos v1...");

db.serialize(() => {
  console.log("🔄 Verificando estructura de productos...");

  db.all(
    `PRAGMA table_info(productos)`,
    [],
    (error, columnas) => {
      if (error) {
        console.error(
          "❌ Error verificando estructura de productos:",
          error.message
        );
        return;
      }

      const nombresColumnas = columnas.map(
        (columna) => columna.name
      );

      // ========================================================
      // COSTO ACTUAL
      // ========================================================

      if (!nombresColumnas.includes("costoActual")) {
        db.run(
          `ALTER TABLE productos ADD COLUMN costoActual REAL DEFAULT 0`,
          (alterError) => {
            if (alterError) {
              console.error(
                "❌ Error agregando costoActual:",
                alterError.message
              );
            } else {
              console.log(
                "✅ Columna agregada: costoActual"
              );
            }
          }
        );
      } else {
        console.log("✔ Ya existe: costoActual");
      }

      // ========================================================
      // PRECIO SUGERIDO
      // ========================================================

      if (!nombresColumnas.includes("precioSugerido")) {
        db.run(
          `ALTER TABLE productos ADD COLUMN precioSugerido REAL DEFAULT 0`,
          (alterError) => {
            if (alterError) {
              console.error(
                "❌ Error agregando precioSugerido:",
                alterError.message
              );
            } else {
              console.log(
                "✅ Columna agregada: precioSugerido"
              );
            }
          }
        );
      } else {
        console.log("✔ Ya existe: precioSugerido");
      }

      // ========================================================
      // FAMILIA DE COSTO
      // ========================================================

      if (!nombresColumnas.includes("familiaCosto")) {
        db.run(
          `ALTER TABLE productos ADD COLUMN familiaCosto TEXT DEFAULT 'MANUAL'`,
          (alterError) => {
            if (alterError) {
              console.error(
                "❌ Error agregando familiaCosto:",
                alterError.message
              );
            } else {
              console.log(
                "✅ Columna agregada: familiaCosto"
              );
            }
          }
        );
      } else {
        console.log("✔ Ya existe: familiaCosto");
      }

      // ========================================================
      // FECHA ACTUALIZACION
      // ========================================================

      if (!nombresColumnas.includes("fechaActualizacion")) {
        db.run(
          `ALTER TABLE productos ADD COLUMN fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP`,
          (alterError) => {
            if (alterError) {
              console.error(
                "❌ Error agregando fechaActualizacion:",
                alterError.message
              );
            } else {
              console.log(
                "✅ Columna agregada: fechaActualizacion"
              );
            }
          }
        );
      } else {
        console.log(
          "✔ Ya existe: fechaActualizacion"
        );
      }

      console.log(
        "✅ Verificación de Productos v1 finalizada."
      );
    }
  );
});

module.exports = db;