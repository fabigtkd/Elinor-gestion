const db = require("../../database/connection");



// ===============================
// OBTENER TODOS LOS PROVEEDORES
// ===============================

function getAll(callback) {

  db.all(

    `
      SELECT *

      FROM proveedores

      WHERE activo = 1

      ORDER BY nombre
    `,

    [],

    (error, rows) => {

      callback(error, rows);

    }

  );

}



// ===============================
// OBTENER UN PROVEEDOR
// ===============================

function getById(id, callback) {

  db.get(

    `
      SELECT *

      FROM proveedores

      WHERE id = ?
    `,

    [id],

    (error, row) => {

      callback(error, row);

    }

  );

}



// ===============================
// CREAR PROVEEDOR
// ===============================

function create(proveedor, callback) {

  db.run(

    `
      INSERT INTO proveedores (

        nombre,

        contacto,

        telefono,

        email,

        direccion,

        observaciones,

        saldo

      )

      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,

    [

      proveedor.nombre,

      proveedor.contacto,

      proveedor.telefono,

      proveedor.email,

      proveedor.direccion,

      proveedor.observaciones,

      proveedor.saldo || 0,

    ],

    function (error) {

      callback(error, this.lastID);

    }

  );

}



// ===============================
// ACTUALIZAR PROVEEDOR
// ===============================

function update(id, proveedor, callback) {

  db.run(

    `
      UPDATE proveedores

      SET

        nombre = ?,

        contacto = ?,

        telefono = ?,

        email = ?,

        direccion = ?,

        observaciones = ?,

        saldo = ?

      WHERE id = ?
    `,

    [

      proveedor.nombre,

      proveedor.contacto,

      proveedor.telefono,

      proveedor.email,

      proveedor.direccion,

      proveedor.observaciones,

      proveedor.saldo,

      id,

    ],

    function (error) {

      callback(error);

    }

  );

}



// ===============================
// ELIMINAR (BAJA LÓGICA)
// ===============================

function remove(id, callback) {

  db.run(

    `
      UPDATE proveedores

      SET activo = 0

      WHERE id = ?
    `,

    [id],

    function (error) {

      callback(error);

    }

  );

}



module.exports = {

  getAll,

  getById,

  create,

  update,

  remove,

};