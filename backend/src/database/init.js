const db = require("./connection");

db.serialize(() => {

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

  console.log("✅ Base de datos inicializada.");

});

module.exports = db;