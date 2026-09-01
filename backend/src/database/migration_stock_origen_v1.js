const db = require("./connection");

// ============================================================
// MIGRACIÓN STOCK POR ORIGEN V2
// ============================================================
//
// Objetivo:
//
// 1. Garantizar cantidadDisponible.
// 2. Garantizar prioridadConsumo.
// 3. Inicializar correctamente stock disponible.
// 4. Asignar prioridad:
//      COMPRA = 1
//      CAJÓN  = 2
//
// Esta migración NO elimina datos.
// ============================================================

db.serialize(() => {
  console.log(
    "🔄 Verificando estructura de stock por origen..."
  );

  db.all(
    `PRAGMA table_info(origenes_materia_prima)`,
    [],
    (error, columns) => {
      if (error) {
        console.error(
          "❌ Error verificando origenes_materia_prima:",
          error
        );

        return;
      }

      const nombresColumnas =
        columns.map(
          (column) => column.name
        );

      // ========================================================
      // CANTIDAD DISPONIBLE
      // ========================================================

      function verificarCantidadDisponible(
        siguiente
      ) {
        if (
          nombresColumnas.includes(
            "cantidadDisponible"
          )
        ) {
          return siguiente();
        }

        db.run(
          `
          ALTER TABLE origenes_materia_prima
          ADD COLUMN cantidadDisponible REAL DEFAULT 0
          `,
          (alterError) => {
            if (alterError) {
              console.error(
                "❌ Error agregando cantidadDisponible:",
                alterError
              );

              return;
            }

            console.log(
              "✅ Columna cantidadDisponible agregada."
            );

            siguiente();
          }
        );
      }

      // ========================================================
      // PRIORIDAD DE CONSUMO
      // ========================================================

      function verificarPrioridadConsumo(
        siguiente
      ) {
        if (
          nombresColumnas.includes(
            "prioridadConsumo"
          )
        ) {
          return siguiente();
        }

        db.run(
          `
          ALTER TABLE origenes_materia_prima
          ADD COLUMN prioridadConsumo INTEGER DEFAULT 2
          `,
          (alterError) => {
            if (alterError) {
              console.error(
                "❌ Error agregando prioridadConsumo:",
                alterError
              );

              return;
            }

            console.log(
              "✅ Columna prioridadConsumo agregada."
            );

            siguiente();
          }
        );
      }

      // ========================================================
      // ASIGNAR PRIORIDADES
      // ========================================================

      function actualizarPrioridades(
        siguiente
      ) {
        db.run(
          `
          UPDATE origenes_materia_prima
          SET prioridadConsumo =
            CASE
              WHEN UPPER(
                COALESCE(tipoOrigen, '')
              ) = 'COMPRA'
                THEN 1

              WHEN UPPER(
                COALESCE(tipoOrigen, '')
              ) = 'CAJON'
                THEN 2

              WHEN UPPER(
                COALESCE(tipoOrigen, '')
              ) = 'CAJÓN'
                THEN 2

              ELSE
                COALESCE(
                  prioridadConsumo,
                  2
                )
            END
          `,
          (updateError) => {
            if (updateError) {
              console.error(
                "❌ Error asignando prioridades:",
                updateError
              );

              return;
            }

            console.log(
              "✅ Prioridades de consumo actualizadas."
            );

            siguiente();
          }
        );
      }

      // ========================================================
      // INICIALIZAR STOCK DISPONIBLE
      // ========================================================
      //
      // IMPORTANTE:
      //
      // No sobrescribimos cantidades que ya fueron consumidas.
      //
      // Solamente inicializamos registros cuyo
      // cantidadDisponible sea NULL.
      //
      // Para registros antiguos que quedaron en 0 por la
      // migración anterior, no podemos asumir automáticamente
      // que siguen disponibles porque podrían haber sido
      // consumidos.
      //
      // ========================================================

      function inicializarStockDisponible(
        siguiente
      ) {
        db.run(
          `
          UPDATE origenes_materia_prima
          SET cantidadDisponible = cantidad
          WHERE cantidadDisponible IS NULL
          `,
          (updateError) => {
            if (updateError) {
              console.error(
                "❌ Error inicializando cantidadDisponible:",
                updateError
              );

              return;
            }

            console.log(
              "✅ Stock disponible verificado."
            );

            siguiente();
          }
        );
      }

      // ========================================================
      // EJECUCIÓN
      // ========================================================

      verificarCantidadDisponible(() => {
        verificarPrioridadConsumo(() => {
          actualizarPrioridades(() => {
            inicializarStockDisponible(() => {
              console.log(
                "✅ Verificación de stock por origen finalizada."
              );
            });
          });
        });
      });
    }
  );
});

module.exports = db;