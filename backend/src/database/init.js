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
  // COMPRAS (CABECERA)
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS compras (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      proveedorId INTEGER NOT NULL,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

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
  // DETALLE DE COMPRA
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS compras_detalle (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      compraId INTEGER NOT NULL,

      producto TEXT NOT NULL,

      cantidad REAL NOT NULL,

      unidad TEXT NOT NULL,

      precioUnitario REAL NOT NULL,

      subtotal REAL NOT NULL,

      FOREIGN KEY(compraId)
      REFERENCES compras(id)

    )
  `);



  // ==========================
  // PRODUCTOS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nombre TEXT NOT NULL,

      categoria TEXT,

      precio REAL NOT NULL,

      stock REAL DEFAULT 0,

      stockMinimo REAL DEFAULT 0,

      unidad TEXT DEFAULT 'kg'

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

      costoBase REAL,

      margen REAL,

      precioSugerido REAL,

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

      unidad TEXT,

      costoBase REAL,

      margen REAL,

      precioSugerido REAL,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP

    )
  `);



  // ==========================
  // MATERIAS PRIMAS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS materias_primas (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nombre TEXT NOT NULL UNIQUE,

      origen TEXT,

      unidad TEXT DEFAULT 'kg',

      costoActual REAL DEFAULT 0,

      rendimiento REAL DEFAULT 100,

      merma REAL DEFAULT 0,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP

    )
  `);



  console.log("✅ Base de datos inicializada.");

});

module.exports = db;