const db = require("../../database/connection");

// ===============================
// OBTENER TODOS LOS PROVEEDORES
// ===============================

function getAll(callback) {
  const sql = `
    SELECT
      proveedores.*,
      COALESCE(
        (
          SELECT SUM(
            COALESCE(compras.cuentaCorriente, 0)
          )
          FROM compras
          WHERE compras.proveedorId = proveedores.id
        ),
        0
      ) AS saldo
    FROM proveedores
    WHERE proveedores.activo = 1
    ORDER BY proveedores.nombre
  `;

  db.all(sql, [], (error, rows) => {
    if (error) {
      console.error("ERROR OBTENIENDO PROVEEDORES:", error);
    }
    callback(error, rows);
  });
}

// ===============================
// OBTENER UN PROVEEDOR
// ===============================

function getById(id, callback) {
  const sql = `
    SELECT
      proveedores.*,
      COALESCE(
        (
          SELECT SUM(
            COALESCE(compras.cuentaCorriente, 0)
          )
          FROM compras
          WHERE compras.proveedorId = proveedores.id
        ),
        0
      ) AS saldo
    FROM proveedores
    WHERE proveedores.id = ?
  `;

  db.get(sql, [id], (error, row) => {
    if (error) {
      console.error("ERROR OBTENIENDO PROVEEDOR:", error);
    }
    callback(error, row);
  });
}

// ===============================
// OBTENER COMPRAS POR PROVEEDOR
// ===============================
//
// Devuelve únicamente los remitos pertenecientes
// al proveedor seleccionado.
//
// No modifica ni duplica los remitos.
// Utiliza la misma información que ya existe
// en el módulo Compras.
//

function getComprasByProveedor(proveedorId, callback) {
  const sql = `
    SELECT
      compras.id,
      compras.proveedorId,
      compras.fecha,
      compras.remito,
      compras.total,
      compras.cuentaCorriente
    FROM compras
    WHERE compras.proveedorId = ?
    ORDER BY
      compras.fecha DESC,
      compras.id DESC
  `;

  db.all(sql, [proveedorId], (error, rows) => {
    if (error) {
      console.error("ERROR OBTENIENDO COMPRAS DEL PROVEEDOR:", error);
    }
    callback(error, rows);
  });
}

// ===============================
// CREAR PROVEEDOR
// ===============================

function create(proveedor, callback) {
  db.run(
    `INSERT INTO proveedores
      (
        nombre,
        contacto,
        telefono,
        email,
        direccion,
        observaciones,
        saldo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      proveedor.nombre,
      proveedor.contacto,
      proveedor.telefono,
      proveedor.email,
      proveedor.direccion,
      proveedor.observaciones,
      0,
    ],
    function (error) {
      if (error) {
        console.error("ERROR CREANDO PROVEEDOR:", error);
      }
      callback(error, this?.lastID);
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
        observaciones = ?
      WHERE id = ?
    `,
    [
      proveedor.nombre,
      proveedor.contacto,
      proveedor.telefono,
      proveedor.email,
      proveedor.direccion,
      proveedor.observaciones,
      id,
    ],
    function (error) {
      if (error) {
        console.error("ERROR ACTUALIZANDO PROVEEDOR:", error);
      }
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
      if (error) {
        console.error("ERROR ELIMINANDO PROVEEDOR:", error);
      }
      callback(error);
    }
  );
}

// ===============================
// EXPORTAR
// ===============================

module.exports = {
  getAll,
  getById,
  getComprasByProveedor,
  create,
  update,
  remove,
};
