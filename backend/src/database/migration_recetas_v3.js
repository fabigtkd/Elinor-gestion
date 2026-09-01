const db = require("./connection");

// ============================================================
// MIGRACIÓN RECETAS V3
// ============================================================
//
// OBJETIVO:
//
// La arquitectura definitiva de Elinor utiliza PRODUCTOS como
// fuente oficial de materias primas.
//
// Antes:
//
// recetas_detalle
//      └── materiaPrimaId
//              └── materias_primas
//
// Ahora:
//
// recetas_detalle
//      └── productoId
//              └── productos
//                    └── esMateriaPrima = 1
//
// IMPORTANTE:
//
// - NO elimina datos.
// - NO elimina materias_primas.
// - NO elimina materiaPrimaId todavía.
// - Agrega productoId.
// - Migra automáticamente referencias existentes.
// - Permite que el sistema siga funcionando mientras
//   terminamos la transición.
//
// ============================================================


// ============================================================
// VERIFICAR SI EXISTE UNA COLUMNA
// ============================================================

function columnaExiste(
  tabla,
  columna,
  callback
) {
  db.all(
    `PRAGMA table_info(${tabla})`,
    [],
    (error, columnas) => {
      if (error) {
        return callback(
          error,
          false
        );
      }

      const existe =
        Array.isArray(columnas) &&
        columnas.some(
          (item) =>
            item.name === columna
        );

      callback(
        null,
        existe
      );
    }
  );
}


// ============================================================
// AGREGAR COLUMNA SI NO EXISTE
// ============================================================

function agregarColumna(
  tabla,
  columna,
  tipo,
  callback
) {
  columnaExiste(
    tabla,
    columna,
    (
      error,
      existe
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      if (existe) {
        return callback(
          null
        );
      }

      db.run(
        `
          ALTER TABLE ${tabla}
          ADD COLUMN ${columna} ${tipo}
        `,
        (alterError) => {
          if (alterError) {
            return callback(
              alterError
            );
          }

          console.log(
            `✅ Columna agregada: ${tabla}.${columna}`
          );

          callback(
            null
          );
        }
      );
    }
  );
}


// ============================================================
// VERIFICAR TABLAS
// ============================================================

function verificarTablas(
  callback
) {
  db.run(
    `
      CREATE TABLE IF NOT EXISTS recetas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        productoId INTEGER NOT NULL,

        rendimiento REAL DEFAULT 1,

        unidad TEXT DEFAULT 'kg',

        observaciones TEXT,

        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(productoId)
        REFERENCES productos(id)
      )
    `,
    (error) => {
      if (error) {
        return callback(
          error
        );
      }

      db.run(
        `
          CREATE TABLE IF NOT EXISTS recetas_detalle (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            recetaId INTEGER NOT NULL,

            materiaPrimaId INTEGER,

            cantidad REAL NOT NULL DEFAULT 0,

            unidad TEXT DEFAULT 'kg',

            FOREIGN KEY(recetaId)
            REFERENCES recetas(id),

            FOREIGN KEY(materiaPrimaId)
            REFERENCES materias_primas(id)
          )
        `,
        (detalleError) => {
          if (detalleError) {
            return callback(
              detalleError
            );
          }

          callback(
            null
          );
        }
      );
    }
  );
}


// ============================================================
// AGREGAR PRODUCTOID
// ============================================================

function agregarProductoId(
  callback
) {
  agregarColumna(
    "recetas_detalle",
    "productoId",
    "INTEGER",
    callback
  );
}


// ============================================================
// MIGRAR REFERENCIAS ANTIGUAS
// ============================================================
//
// Busca:
//
// recetas_detalle.materiaPrimaId
//             ↓
// materias_primas.id
//             ↓
// materias_primas.nombre
//             ↓
// productos.nombre
//
// Y coloca el ID correspondiente de productos.
//
// Solo acepta productos que tengan:
//
// esMateriaPrima = 1
//
// ============================================================

function migrarReferencias(
  callback
) {
  const sql = `
    SELECT
      rd.id,
      rd.materiaPrimaId,
      mp.nombre AS materiaPrimaNombre
    FROM recetas_detalle rd
    INNER JOIN materias_primas mp
      ON mp.id = rd.materiaPrimaId
    WHERE
      rd.materiaPrimaId IS NOT NULL
      AND (
        rd.productoId IS NULL
        OR rd.productoId = 0
      )
    ORDER BY rd.id ASC
  `;

  db.all(
    sql,
    [],
    (error, detalles) => {
      if (error) {
        return callback(
          error
        );
      }

      if (
        !detalles ||
        detalles.length === 0
      ) {
        console.log(
          "ℹ️ No hay referencias antiguas de recetas para migrar."
        );

        return callback(
          null
        );
      }

      let index = 0;

      function siguiente() {
        if (
          index >=
          detalles.length
        ) {
          return callback(
            null
          );
        }

        const detalle =
          detalles[index];

        const nombre =
          String(
            detalle.materiaPrimaNombre ||
              ""
          ).trim();

        if (!nombre) {
          index++;

          return siguiente();
        }

        db.get(
          `
            SELECT
              id,
              nombre,
              esMateriaPrima,
              activo
            FROM productos
            WHERE
              LOWER(TRIM(nombre)) =
              LOWER(TRIM(?))
              AND activo = 1
              AND esMateriaPrima = 1
            LIMIT 1
          `,
          [nombre],
          (
            productoError,
            producto
          ) => {
            if (productoError) {
              return callback(
                productoError
              );
            }

            if (!producto) {
              console.log(
                `⚠️ No se encontró producto-materia prima para: ${nombre}`
              );

              index++;

              return siguiente();
            }

            db.run(
              `
                UPDATE recetas_detalle
                SET productoId = ?
                WHERE id = ?
              `,
              [
                producto.id,
                detalle.id,
              ],
              (updateError) => {
                if (
                  updateError
                ) {
                  return callback(
                    updateError
                  );
                }

                console.log(
                  `✅ Receta detalle ${detalle.id}: ${nombre} → producto ${producto.id}`
                );

                index++;

                siguiente();
              }
            );
          }
        );
      }

      siguiente();
    }
  );
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function verificarResultado(
  callback
) {
  db.get(
    `
      SELECT
        COUNT(*) AS total,
        SUM(
          CASE
            WHEN productoId IS NOT NULL
             AND productoId > 0
            THEN 1
            ELSE 0
          END
        ) AS migrados
      FROM recetas_detalle
    `,
    [],
    (error, resultado) => {
      if (error) {
        return callback(
          error
        );
      }

      console.log(
        "=========================================="
      );

      console.log(
        "📦 MIGRACIÓN RECETAS V3"
      );

      console.log(
        "Detalles de recetas:",
        Number(
          resultado?.total || 0
        )
      );

      console.log(
        "Detalles vinculados a Productos:",
        Number(
          resultado?.migrados || 0
        )
      );

      console.log(
        "=========================================="
      );

      callback(
        null
      );
    }
  );
}


// ============================================================
// EJECUTAR MIGRACIÓN
// ============================================================

db.serialize(() => {
  console.log(
    "🔄 Iniciando migración Recetas V3..."
  );

  verificarTablas(
    (errorTablas) => {
      if (errorTablas) {
        console.error(
          "❌ Error verificando tablas de recetas:",
          errorTablas
        );

        return;
      }

      agregarProductoId(
        (errorProductoId) => {
          if (errorProductoId) {
            console.error(
              "❌ Error agregando productoId:",
              errorProductoId
            );

            return;
          }

          migrarReferencias(
            (errorMigracion) => {
              if (errorMigracion) {
                console.error(
                  "❌ Error migrando recetas:",
                  errorMigracion
                );

                return;
              }

              verificarResultado(
                (errorResultado) => {
                  if (
                    errorResultado
                  ) {
                    console.error(
                      "❌ Error verificando resultado:",
                      errorResultado
                    );

                    return;
                  }

                  console.log(
                    "✅ Migración Recetas V3 finalizada correctamente."
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


// ============================================================
// EXPORTAR
// ============================================================

module.exports = db;