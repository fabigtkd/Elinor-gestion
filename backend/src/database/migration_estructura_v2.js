const db = require("./connection");

// ============================================================
// MIGRACIÓN ESTRUCTURA V2
// ============================================================
//
// ARQUITECTURA ACTUAL DE ELINOR
//
// PRODUCTOS = fuente de materias primas.
//
// Un producto puede ser:
//   - producto de venta
//   - materia prima
//   - elaborado
//   - materia prima + elaborado
//
// NO se elimina información existente.
//
// ============================================================

// ============================================================
// VERIFICAR COLUMNA
// ============================================================

function columnaExiste(tabla, columna, callback) {
  db.all(`PRAGMA table_info(${tabla})`, [], (error, columnas) => {
    if (error) {
      return callback(error, false);
    }

    const existe = Array.isArray(columnas) && columnas.some((item) => item.name === columna);
    callback(null, existe);
  });
}

// ============================================================
// AGREGAR COLUMNA SI NO EXISTE
// ============================================================

function agregarColumna(tabla, columna, tipo, callback) {
  columnaExiste(tabla, columna, (error, existe) => {
    if (error) {
      console.error(`❌ Error verificando ${tabla}.${columna}:`, error);
      return callback(error);
    }

    if (existe) {
      return callback(null);
    }

    db.run(
      `
      ALTER TABLE ${tabla}
      ADD COLUMN ${columna} ${tipo}
    `,
      (alterError) => {
        if (alterError) {
          console.error(`❌ Error agregando ${tabla}.${columna}:`, alterError);
          return callback(alterError);
        }

        console.log(`✅ Columna agregada: ${tabla}.${columna}`);
        callback(null);
      }
    );
  });
}

// ============================================================
// AGREGAR VARIAS COLUMNAS
// ============================================================

function agregarColumnas(tabla, columnas, callback) {
  let index = 0;

  function siguiente() {
    if (index >= columnas.length) {
      return callback(null);
    }

    const columna = columnas[index];

    agregarColumna(tabla, columna.nombre, columna.tipo, (error) => {
      if (error) {
        return callback(error);
      }

      index++;
      siguiente();
    });
  }

  siguiente();
}

// ============================================================
// CREAR ÍNDICE
// ============================================================

function crearIndice(nombre, sql, callback) {
  db.run(sql, (error) => {
    if (error) {
      console.error(`❌ Error creando índice ${nombre}:`, error);
      return callback(error);
    }

    callback(null);
  });
}

// ============================================================
// MIGRACIÓN
// ============================================================

db.serialize(() => {
  console.log("🔄 Verificando estructura general V2...");

  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  agregarColumnas(
    "productos",
    [
      { nombre: "tipo", tipo: "TEXT DEFAULT 'producto'" },
      { nombre: "controlaStock", tipo: "INTEGER DEFAULT 0" },
      { nombre: "esMateriaPrima", tipo: "INTEGER DEFAULT 0" },
      { nombre: "esElaborado", tipo: "INTEGER DEFAULT 0" },
      { nombre: "tieneReceta", tipo: "INTEGER DEFAULT 0" },
      { nombre: "margen", tipo: "REAL DEFAULT 0" },
      { nombre: "costoActual", tipo: "REAL DEFAULT 0" },
      { nombre: "precioSugerido", tipo: "REAL DEFAULT 0" },
      { nombre: "familiaCosto", tipo: "TEXT DEFAULT 'MANUAL'" },
      { nombre: "activo", tipo: "INTEGER DEFAULT 1" },
      { nombre: "fechaActualizacion", tipo: "DATETIME" },
    ],
    (error) => {
      if (error) {
        console.error("❌ Error migrando productos:", error);
      }
    }
  );

  // ==========================================================
  // COMPRAS DETALLE
  // ==========================================================

  agregarColumnas(
    "compras_detalle",
    [{ nombre: "productoId", tipo: "INTEGER" }],
    (error) => {
      if (error) {
        console.error("❌ Error migrando compras_detalle:", error);
      }
    }
  );

  // ==========================================================
  // ORÍGENES DE MATERIA PRIMA
  // ==========================================================
  //
  // Los orígenes representan de dónde proviene el costo
  // y el stock físico de una materia prima.
  //
  // COMPRA = stock físico real.
  //
  // CAJON = costo teórico, no stock de cortes.
  //
  // ==========================================================

  agregarColumnas(
    "origenes_materia_prima",
    [
      { nombre: "cantidadDisponible", tipo: "REAL DEFAULT 0" },
      { nombre: "prioridadConsumo", tipo: "INTEGER DEFAULT 2" },
      { nombre: "fechaActualizacion", tipo: "DATETIME" },
    ],
    (error) => {
      if (error) {
        console.error("❌ Error migrando origenes_materia_prima:", error);
      }
    }
  );

  // ==========================================================
  // RECETAS
  // ==========================================================

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
        console.error("❌ Error creando tabla recetas:", error);
      } else {
        console.log("✅ Tabla recetas verificada.");
      }
    }
  );

  // ==========================================================
  // RECETAS DETALLE
  // ==========================================================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS recetas_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recetaId INTEGER NOT NULL,
    productoId INTEGER,
    materiaPrimaId INTEGER,
    cantidad REAL NOT NULL DEFAULT 0,
    unidad TEXT DEFAULT 'kg',
    FOREIGN KEY(recetaId)
    REFERENCES recetas(id),
    FOREIGN KEY(productoId)
    REFERENCES productos(id),
    FOREIGN KEY(materiaPrimaId)
    REFERENCES productos(id)
  )
`,
    (error) => {
      if (error) {
        console.error("❌ Error creando recetas_detalle:", error);
      } else {
        console.log("✅ Tabla recetas_detalle verificada.");
      }
    }
  );

  // ==========================================================
  // CAJONES
  // ==========================================================
  //
  // REGLA DEFINITIVA DE ELINOR
  //
  // Un cajón es una UNIDAD DE COMPRA.
  //
  // NO se registra:
  //
  // - cantidad de pollos
  // - kilos físicos del cajón
  // - número de cajón
  // - identificación individual
  //
  // Ejemplo:
  //
  // Compra:
  //
  // cantidad = 7 cajones
  //
  // El sistema sabe:
  //
  // 7 cajones disponibles.
  //
  // No sabe cuántos pollos contiene cada cajón.
  //
  //
  // Si durante el día se cortan 4 cajones:
  //
  // cajones disponibles = 3
  // cajones cortados = 4
  //
  // No importa si esos cajones tenían 5, 7, 8
  // o 9 pollos cada uno.
  //
  //
  // IMPORTANTE:
  //
  // cantidadDisponible y cantidadCortada se expresan
  // SIEMPRE EN CAJONES.
  //
  // NO EN KILOS.
  //
  //
  // Los kilos aparecen recién en:
  //
  // - ventas de pollo entero
  // - ventas de cortes
  // - cálculos teóricos de rendimiento
  //
  //
  // Para cortes:
  //
  // valor del cajón / 14
  //
  //
  // Para pollo entero:
  //
  // valor del cajón / 19
  //
  //
  // El cajón NO genera stock físico de cortes.
  //
  // ==========================================================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS cajones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    cantidad REAL NOT NULL DEFAULT 1,
    valorUnitario REAL DEFAULT 0,
    valorTotal REAL DEFAULT 0,
    rendimientoTeorico REAL DEFAULT 14,
    kilosTeoricos REAL DEFAULT 0,
    estado TEXT DEFAULT 'DISPONIBLE',
    compraId INTEGER,
    observaciones TEXT,
    cantidadDisponible REAL DEFAULT 0,
    cantidadCortada REAL DEFAULT 0,
    cantidadEnteraVendida REAL DEFAULT 0,
    fechaCorte DATETIME,
    observacionesProduccion TEXT,
    FOREIGN KEY(compraId)
    REFERENCES compras(id)
  )
`,
    (error) => {
      if (error) {
        console.error("❌ Error creando tabla cajones:", error);
      } else {
        console.log("✅ Tabla cajones verificada.");
      }
    }
  );

  // ==========================================================
  // COMPATIBILIDAD CAJONES
  // ==========================================================
  //
  // Estas columnas se agregan si la tabla ya existía.
  //
  // IMPORTANTE:
  //
  // Su unidad lógica es CAJONES.
  //
  // ==========================================================

  agregarColumnas(
    "cajones",
    [
      { nombre: "cantidadDisponible", tipo: "REAL DEFAULT 0" },
      { nombre: "cantidadCortada", tipo: "REAL DEFAULT 0" },
      { nombre: "cantidadEnteraVendida", tipo: "REAL DEFAULT 0" },
      { nombre: "fechaCorte", tipo: "DATETIME" },
      { nombre: "observacionesProduccion", tipo: "TEXT" },
    ],
    (error) => {
      if (error) {
        console.error("❌ Error migrando cajones:", error);
      }
    }
  );

  // ==========================================================
  // MOVIMIENTOS DE STOCK
  // ==========================================================

  db.run(
    `
  CREATE TABLE IF NOT EXISTS stock_movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productoId INTEGER,
    materiaPrimaId INTEGER,
    tipo TEXT NOT NULL,
    cantidad REAL NOT NULL,
    referenciaId INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(productoId)
    REFERENCES productos(id),
    FOREIGN KEY(materiaPrimaId)
    REFERENCES productos(id)
  )
`,
    (error) => {
      if (error) {
        console.error("❌ Error verificando stock_movimientos:", error);
      } else {
        console.log("✅ Tabla stock_movimientos verificada.");
      }
    }
  );

  // ==========================================================
  // ÍNDICES
  // ==========================================================

  crearIndice(
    "idx_origenes_materia_prima",
    `
      CREATE INDEX IF NOT EXISTS
      idx_origenes_materia_prima
      ON origenes_materia_prima
      (
        materiaPrimaId,
        prioridadConsumo,
        cantidadDisponible
      )
    `,
    (error) => {
      if (error) {
        console.error("❌ Error creando índice de orígenes:", error);
      }
    }
  );

  crearIndice(
    "idx_compras_detalle_producto",
    `
      CREATE INDEX IF NOT EXISTS
      idx_compras_detalle_producto
      ON compras_detalle
      (
        materiaPrimaId
      )
    `,
    (error) => {
      if (error) {
        console.error("❌ Error creando índice de compras:", error);
      }
    }
  );

  crearIndice(
    "idx_recetas_producto",
    `
      CREATE INDEX IF NOT EXISTS
      idx_recetas_producto
      ON recetas
      (
        productoId
      )
    `,
    (error) => {
      if (error) {
        console.error("❌ Error creando índice de recetas:", error);
      }
    }
  );

  // ==========================================================
  // NORMALIZAR PRIORIDADES
  // ==========================================================

  db.run(
    `
      UPDATE origenes_materia_prima
      SET prioridadConsumo = 1
      WHERE UPPER(TRIM(tipoOrigen)) = 'COMPRA'
    `,
    (error) => {
      if (error) {
        console.error("❌ Error normalizando prioridad COMPRA:", error);
      }
    }
  );

  db.run(
    `
      UPDATE origenes_materia_prima
      SET prioridadConsumo = 2
      WHERE UPPER(TRIM(tipoOrigen)) != 'COMPRA'
         OR tipoOrigen IS NULL
    `,
    (error) => {
      if (error) {
        console.error("❌ Error normalizando prioridad CAJON:", error);
      }
    }
  );

  // ==========================================================
  // INICIALIZAR STOCK FÍSICO DE COMPRAS
  // ==========================================================
  //
  // Los orígenes COMPRA representan stock físico.
  //
  // Si un registro anterior todavía no tenía
  // cantidadDisponible, se inicializa con cantidad.
  //
  // ==========================================================

  db.run(
    `
      UPDATE origenes_materia_prima
      SET cantidadDisponible = cantidad
      WHERE
        UPPER(TRIM(tipoOrigen)) = 'COMPRA'
        AND COALESCE(cantidadDisponible, 0) = 0
        AND COALESCE(cantidad, 0) > 0
    `,
    (error) => {
      if (error) {
        console.error("❌ Error inicializando cantidad disponible:", error);
      }
    }
  );

  // ==========================================================
  // INICIALIZAR CAJONES EXISTENTES
  // ==========================================================
  //
  // Para registros anteriores:
  //
  // cantidad = cantidad total de cajones.
  //
  // Si nunca fueron cortados:
  //
  // cantidadDisponible = cantidad.
  //
  // cantidadCortada = 0.
  //
  //
  // IMPORTANTE:
  //
  // No se convierte cantidad en kilos.
  //
  // ==========================================================

  db.run(
    `
      UPDATE cajones
      SET
        cantidadDisponible = cantidad,
        cantidadCortada = 0
      WHERE
        COALESCE(cantidadDisponible, 0) = 0
        AND COALESCE(cantidadCortada, 0) = 0
        AND COALESCE(cantidad, 0) > 0
    `,
    (error) => {
      if (error) {
        console.error("❌ Error inicializando disponibilidad de cajones:", error);
      }
    }
  );

  // ==========================================================
  // FINAL
  // ==========================================================

  console.log("✅ Migración estructura V2 iniciada correctamente.");
});

// ============================================================
// EXPORTAR
// ============================================================

module.exports = db;
