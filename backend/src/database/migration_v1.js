const db = require("./connection");

console.log("🚀 Iniciando migración Elinor Gestión v1...");


db.serialize(() => {


  // ==========================
  // CATEGORIAS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nombre TEXT NOT NULL UNIQUE,

      activo INTEGER DEFAULT 1

    )
  `);



  // ==========================
  // CLIENTES
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nombre TEXT NOT NULL,

      telefono TEXT,

      tipo TEXT DEFAULT 'mostrador',

      cuentaCorriente INTEGER DEFAULT 0,

      saldo REAL DEFAULT 0,

      activo INTEGER DEFAULT 1,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP

    )
  `);



  // ==========================
  // RECETAS
  // ==========================

  db.run(`
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
  `);



  // ==========================
  // DETALLE RECETAS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS recetas_detalle (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      recetaId INTEGER NOT NULL,

      productoId INTEGER NOT NULL,

      cantidad REAL NOT NULL,

      unidad TEXT DEFAULT 'kg',

      FOREIGN KEY(recetaId)
      REFERENCES recetas(id),

      FOREIGN KEY(productoId)
      REFERENCES productos(id)

    )
  `);



  // ==========================
  // COSTOS ESTRUCTURA
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS costos_estructura (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      concepto TEXT NOT NULL,

      importe REAL DEFAULT 0,

      periodo TEXT,

      observaciones TEXT,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP

    )
  `);



  // ==========================
  // HISTORIAL PRECIOS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS historial_precios (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      productoId INTEGER NOT NULL,

      precioAnterior REAL,

      precioNuevo REAL,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(productoId)
      REFERENCES productos(id)

    )
  `);



  // ==========================
  // VENTAS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS ventas (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      clienteId INTEGER,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

      total REAL DEFAULT 0,

      efectivo REAL DEFAULT 0,

      transferencia REAL DEFAULT 0,

      debito REAL DEFAULT 0,

      credito REAL DEFAULT 0,

      cuentaCorriente REAL DEFAULT 0,

      observaciones TEXT,

      FOREIGN KEY(clienteId)
      REFERENCES clientes(id)

    )
  `);



  // ==========================
  // DETALLE VENTAS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS ventas_detalle (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      ventaId INTEGER NOT NULL,

      productoId INTEGER NOT NULL,

      cantidad REAL NOT NULL,

      unidad TEXT,

      precioUnitario REAL,

      subtotal REAL,

      FOREIGN KEY(ventaId)
      REFERENCES ventas(id),

      FOREIGN KEY(productoId)
      REFERENCES productos(id)

    )
  `);



  // ==========================
  // CAJA MOVIMIENTOS
  // ==========================

  db.run(`
    CREATE TABLE IF NOT EXISTS caja_movimientos (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      tipo TEXT NOT NULL,

      concepto TEXT NOT NULL,

      importe REAL NOT NULL,

      medioPago TEXT,

      usuario TEXT,

      fecha DATETIME DEFAULT CURRENT_TIMESTAMP

    )
  `);



  console.log("✅ Migración v1 creada correctamente.");

});

