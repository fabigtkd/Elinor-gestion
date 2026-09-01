const db = require("./connection");

console.log("🔄 Verificando estructura de recetas...");

db.serialize(() => {
  db.run("PRAGMA foreign_keys = OFF");

  db.get(
    `
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'recetas_detalle'
    `,
    [],
    (err, row) => {
      if (err) {
        console.error("❌ Error verificando recetas_detalle:", err.message);
        return;
      }

      if (!row) {
        console.log("ℹ️ recetas_detalle no existe. Creando tabla...");

        db.run(
          `
          CREATE TABLE recetas_detalle (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            recetaId INTEGER NOT NULL,

            materiaPrimaId INTEGER NOT NULL,

            cantidad REAL NOT NULL,

            unidad TEXT DEFAULT 'kg',

            FOREIGN KEY(recetaId)
              REFERENCES recetas(id),

            FOREIGN KEY(materiaPrimaId)
              REFERENCES materias_primas(id)
          )
          `,
          (createErr) => {
            if (createErr) {
              console.error(
                "❌ Error creando recetas_detalle:",
                createErr.message
              );
              return;
            }

            console.log("✅ recetas_detalle creada correctamente.");
          }
        );

        return;
      }

      db.all(
        `
        PRAGMA table_info(recetas_detalle)
        `,
        [],
        (columnsErr, columns) => {
          if (columnsErr) {
            console.error(
              "❌ Error leyendo recetas_detalle:",
              columnsErr.message
            );
            return;
          }

          const tieneMateriaPrimaId = columns.some(
            (column) => column.name === "materiaPrimaId"
          );

          if (tieneMateriaPrimaId) {
            console.log(
              "✅ recetas_detalle ya tiene materiaPrimaId."
            );

            db.run("PRAGMA foreign_keys = ON");

            console.log(
              "✅ Migración de recetas finalizada."
            );

            return;
          }

          console.log(
            "🔄 Actualizando estructura de recetas_detalle..."
          );

          db.run(
            `
            CREATE TABLE recetas_detalle_nueva (
              id INTEGER PRIMARY KEY AUTOINCREMENT,

              recetaId INTEGER NOT NULL,

              materiaPrimaId INTEGER NOT NULL,

              cantidad REAL NOT NULL,

              unidad TEXT DEFAULT 'kg',

              FOREIGN KEY(recetaId)
                REFERENCES recetas(id),

              FOREIGN KEY(materiaPrimaId)
                REFERENCES materias_primas(id)
            )
            `,
            (createErr) => {
              if (createErr) {
                console.error(
                  "❌ Error creando tabla temporal:",
                  createErr.message
                );
                return;
              }

              db.run(
                `
                DROP TABLE recetas_detalle
                `,
                (dropErr) => {
                  if (dropErr) {
                    console.error(
                      "❌ Error eliminando recetas_detalle anterior:",
                      dropErr.message
                    );
                    return;
                  }

                  db.run(
                    `
                    ALTER TABLE recetas_detalle_nueva
                    RENAME TO recetas_detalle
                    `,
                    (renameErr) => {
                      if (renameErr) {
                        console.error(
                          "❌ Error renombrando tabla:",
                          renameErr.message
                        );
                        return;
                      }

                      console.log(
                        "✅ recetas_detalle actualizada correctamente."
                      );

                      db.run(
                        "PRAGMA foreign_keys = ON"
                      );

                      console.log(
                        "✅ Migración de recetas finalizada."
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});