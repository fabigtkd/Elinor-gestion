const db = require("./connection");


db.serialize(() => {


  // ==========================
  // PROVEEDORES
  // ==========================

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



  // ==========================
  // MOVIMIENTOS PROVEEDORES
  // ==========================

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



  // ==========================
  // PAGOS PROVEEDORES
  // ==========================

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



  // ==========================
  // COMPRAS
  // ==========================

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



  // ==========================
  // MATERIAS PRIMAS
  // ==========================

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



  // ==========================
  // ORIGENES MATERIA PRIMA
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS origenes_materia_prima (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      materiaPrimaId INTEGER NOT NULL,

      tipoOrigen TEXT NOT NULL,

      documentoOrigen INTEGER,

      cantidad REAL DEFAULT 0,

      costoUnitario REAL DEFAULT 0,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(materiaPrimaId)
      REFERENCES materias_primas(id)

    )
  `);



  // ==========================
  // DETALLE COMPRAS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS compras_detalle (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      compraId INTEGER NOT NULL,

      materiaPrimaId INTEGER,

      producto TEXT,

      cantidad REAL NOT NULL,

      unidad TEXT NOT NULL,

      precioUnitario REAL NOT NULL,

      subtotal REAL NOT NULL,

      FOREIGN KEY(compraId)
      REFERENCES compras(id),

      FOREIGN KEY(materiaPrimaId)
      REFERENCES materias_primas(id)

    )
  `);



  // ==========================
  // PRODUCTOS TERMINADOS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nombre TEXT NOT NULL,

      categoria TEXT,

      precio REAL DEFAULT 0,

      stock REAL DEFAULT 0,

      stockMinimo REAL DEFAULT 0,

      unidad TEXT DEFAULT 'kg'

    )
  `);



  // ==========================
  // MOVIMIENTOS STOCK
  // ==========================

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
      REFERENCES materias_primas(id)

    )
  `);



  // ==========================
  // COSTOS
  // ==========================

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



  // ==========================
  // HISTORIAL COSTOS
  // ==========================

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



  console.log(
    "✅ Base de datos Elinor Gestión inicializada."
  );


});


module.exports = db;