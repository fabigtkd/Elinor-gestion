const db = require("./connection");

function agregarColumnaSiNoExiste(tabla, columna, definicion) {
  db.all(
    `PRAGMA table_info(${tabla})`,
    [],
    (error, columnas) => {
      if (error) {
        console.error(`ERROR REVISANDO COLUMNA ${tabla}.${columna}:`, error);
        return;
      }

      const existe = (columnas || []).some((item) => item.name === columna);

      if (existe) {
        return;
      }

      db.run(
        `ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`,
        [],
        (alterError) => {
          if (alterError) {
            console.error(`ERROR AGREGANDO COLUMNA ${tabla}.${columna}:`, alterError);
          } else {
            console.log(`✅ Columna agregada: ${tabla}.${columna}`);
          }
        }
      );
    }
  );
}

db.serialize(() => {
  // ==========================================================
  // PROVEEDORES
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS proveedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      contacto TEXT,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      observaciones TEXT,
      saldo REAL DEFAULT 0,
      activo INTEGER DEFAULT 1,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================================================
  // MOVIMIENTOS PROVEEDORES
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS movimientos_proveedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proveedorId INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      debe REAL DEFAULT 0,
      haber REAL DEFAULT 0,
      saldo REAL DEFAULT 0,
      referenciaId INTEGER,
      FOREIGN KEY(proveedorId)
      REFERENCES proveedores(id)
    )
  `);

  // ==========================================================
  // PAGOS PROVEEDORES
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS pagos_proveedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proveedorId INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      importe REAL NOT NULL,
      medioPago TEXT,
      observaciones TEXT,
      FOREIGN KEY(proveedorId)
      REFERENCES proveedores(id)
    )
  `);

  // ==========================================================
  // COMPRAS
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proveedorId INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      remito TEXT,
      observaciones TEXT,
      total REAL DEFAULT 0,
      contado REAL DEFAULT 0,
      transferencia REAL DEFAULT 0,
      cuentaCorriente REAL DEFAULT 0,
      saldoAnterior REAL DEFAULT 0,
      saldoNuevo REAL DEFAULT 0,
      FOREIGN KEY(proveedorId)
      REFERENCES proveedores(id)
    )
  `);

  // ==========================================================
  // MATERIAS PRIMAS
  // ==========================================================
  //
  // Se conserva por compatibilidad con datos anteriores.
  // La arquitectura vigente utiliza PRODUCTOS como fuente de materias primas.
  //
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS materias_primas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      nombre TEXT NOT NULL UNIQUE,
      categoria TEXT,
      unidad TEXT DEFAULT 'kg',
      rendimiento REAL DEFAULT 100,
      costoActual REAL DEFAULT 0,
      costoAnterior REAL DEFAULT 0,
      activo INTEGER DEFAULT 1,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================================================
  // ORIGENES MATERIA PRIMA
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS origenes_materia_prima (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materiaPrimaId INTEGER NOT NULL,
      tipoOrigen TEXT NOT NULL,
      documentoOrigen INTEGER,
      cantidad REAL DEFAULT 0,
      costoUnitario REAL DEFAULT 0,
      cantidadDisponible REAL DEFAULT 0,
      prioridadConsumo INTEGER DEFAULT 1,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(materiaPrimaId)
      REFERENCES productos(id)
    )
  `);

  // ==========================================================
  // DETALLE COMPRAS
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS compras_detalle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compraId INTEGER NOT NULL,
      materiaPrimaId INTEGER,
      productoId INTEGER,
      producto TEXT,
      cantidad REAL NOT NULL,
      unidad TEXT NOT NULL,
      precioUnitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(compraId)
      REFERENCES compras(id),
      FOREIGN KEY(materiaPrimaId)
      REFERENCES productos(id),
      FOREIGN KEY(productoId)
      REFERENCES productos(id)
    )
  `);

  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT,
      precio REAL DEFAULT 0,
      stock REAL DEFAULT 0,
      stockMinimo REAL DEFAULT 0,
      unidad TEXT DEFAULT 'kg',
      esMateriaPrima INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      costoActual REAL DEFAULT 0,
      costoAnterior REAL DEFAULT 0,
      tieneReceta INTEGER DEFAULT 0,
      receta TEXT,
      fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================================================
  // MOVIMIENTOS STOCK
  // ==========================================================

  db.run(`
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
  `);

  // ==========================================================
  // COSTOS
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS costos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      unidad TEXT,
      costoBase REAL DEFAULT 0,
      margen REAL DEFAULT 0,
      precioSugerido REAL DEFAULT 0,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================================================
  // HISTORIAL COSTOS
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS costos_historial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      costoBase REAL DEFAULT 0,
      margen REAL DEFAULT 0,
      precioSugerido REAL DEFAULT 0,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ==========================================================
  // CAJONES
  // ==========================================================
  //
  // REGLA ELINOR:
  //
  // Un cajón es una UNIDAD DE COMPRA.
  //
  // NO se registra:
  // - cantidad de pollos
  // - kilos físicos del cajón
  // - número de cajón
  // - identificación individual
  //
  // cantidad = cantidad de cajones comprados.
  //
  // Ejemplo:
  //
  // cantidad = 5
  // valorUnitario = 70000
  // valorTotal = 350000
  //
  // El sistema NO sabe cuántos pollos contiene cada cajón.
  //
  // El rendimiento teórico de cortes es una referencia
  // para costos, no stock físico.
  //
  // ==========================================================

  db.run(`
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
      FOREIGN KEY(compraId)
      REFERENCES compras(id)
    )
  `);

  // ==========================================================
  // PRODUCCION - CAJONES CORTADOS
  // ==========================================================
  //
  // ESTA TABLA ES LA NUEVA BASE DEL MODULO PRODUCCION.
  //
  // Producción NO registra el desposte.
  //
  // Solamente registra:
  //
  //     CUANTOS CAJONES SE CORTARON DURANTE EL DÍA.
  //
  // No se registra:
  //
  // - cantidad de pollos
  // - kilos contenidos en los cajones
  // - número de cajón
  // - cortes obtenidos
  // - rendimiento real de cada cajón
  //
  // Ejemplo:
  //
  // Fecha: 31/08/2026
  // Cajones cortados: 3
  //
  // Luego Ventas registra:
  //
  // Pollo entero vendido por kg
  // Pechuga vendida por kg
  // Pata muslo vendida por kg
  // Alas vendidas por kg
  // etc.
  //
  // Con esos datos Elinor podrá calcular el rendimiento
  // de los cajones utilizados.
  //
  // IMPORTANTE:
  //
  // El registro de cajones cortados NO genera stock de cortes.
  //
  // ==========================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS produccion_cajones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      cantidadCajones REAL NOT NULL,
      observaciones TEXT
    )
  `);

  // ==========================================================
  // COMPATIBILIDAD CON ESTRUCTURAS EXISTENTES
  // ==========================================================

  agregarColumnaSiNoExiste("productos", "esMateriaPrima", "INTEGER DEFAULT 0");
  agregarColumnaSiNoExiste("productos", "activo", "INTEGER DEFAULT 1");
  agregarColumnaSiNoExiste("productos", "costoActual", "REAL DEFAULT 0");
  agregarColumnaSiNoExiste("productos", "costoAnterior", "REAL DEFAULT 0");
  agregarColumnaSiNoExiste("productos", "tieneReceta", "INTEGER DEFAULT 0");
  agregarColumnaSiNoExiste("productos", "receta", "TEXT");
  agregarColumnaSiNoExiste("productos", "fechaActualizacion", "DATETIME");

  // ==========================================================
  // COLUMNAS ORIGENES
  // ==========================================================

  agregarColumnaSiNoExiste("origenes_materia_prima", "cantidadDisponible", "REAL DEFAULT 0");
  agregarColumnaSiNoExiste("origenes_materia_prima", "prioridadConsumo", "INTEGER DEFAULT 1");
  agregarColumnaSiNoExiste("origenes_materia_prima", "fechaActualizacion", "DATETIME");

  // ==========================================================
  // COLUMNAS COMPRAS_DETALLE
  // ==========================================================

  agregarColumnaSiNoExiste("compras_detalle", "productoId", "INTEGER");

  // ==========================================================
  // COMPATIBILIDAD CAJONES
  // ==========================================================
  //
  // Estas columnas se conservan porque pueden existir
  // en la base de datos actual.
  //
  // La nueva lógica de Producción no depende de ellas
  // para registrar el corte diario.
  //
  // ==========================================================

  agregarColumnaSiNoExiste("cajones", "cantidadDisponible", "REAL DEFAULT 0");
  agregarColumnaSiNoExiste("cajones", "cantidadCortada", "REAL DEFAULT 0");
  agregarColumnaSiNoExiste("cajones", "cantidadEnteraVendida", "REAL DEFAULT 0");
  agregarColumnaSiNoExiste("cajones", "fechaCorte", "DATETIME");
  agregarColumnaSiNoExiste("cajones", "observacionesProduccion", "TEXT");

  console.log("✅ Base de datos Elinor Gestión inicializada.");
});

module.exports = db;
