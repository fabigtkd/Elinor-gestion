const db = require("../../database/connection");



// ===============================
// OBTENER COMPRAS
// ===============================

function getCompras(callback) {

  db.all(

    `
    SELECT

      compras.*,

      proveedores.nombre AS proveedorNombre

    FROM compras

    LEFT JOIN proveedores

      ON compras.proveedorId = proveedores.id

    ORDER BY compras.fecha DESC
    `,

    [],

    callback

  );

}



// ===============================
// OBTENER UN REMITO
// ===============================

function getCompraById(id, callback) {

  db.get(

    `
    SELECT

      compras.*,

      proveedores.nombre AS proveedorNombre

    FROM compras

    LEFT JOIN proveedores

      ON compras.proveedorId = proveedores.id

    WHERE compras.id = ?

    `,

    [id],

    (error, compra) => {

      if (error) {

        return callback(error);

      }

      if (!compra) {

        return callback(null, null);

      }

      db.all(

        `
        SELECT

          id,

          materiaPrimaId,

          producto,

          cantidad,

          unidad,

          precioUnitario,

          subtotal

        FROM compras_detalle

        WHERE compraId = ?

        ORDER BY id

        `,

        [id],

        (errorDetalle, detalle) => {

          if (errorDetalle) {

            return callback(errorDetalle);

          }

          compra.detalle = detalle || [];

          callback(null, compra);

        }

      );

    }

  );

}



// ===============================
// CREAR COMPRA
// ===============================

function createCompra(data, callback) {

  const {

    proveedorId,

    remito,

    fecha,

    total,

    contado,

    transferencia,

    observaciones,

    detalle

  } = data;

  const pendiente =
    Number(total || 0) -
    (
      Number(contado || 0) +
      Number(transferencia || 0)
    );

  db.get(

    `
    SELECT

      nombre,

      saldo

    FROM proveedores

    WHERE id = ?

    `,

    [proveedorId],

    (err, proveedor) => {

      if (err) {

        return callback(err);

      }

      const saldoAnterior =
        proveedor
          ? Number(proveedor.saldo)
          : 0;

      const saldoNuevo =
        saldoAnterior + pendiente;
              db.run(

        `
        INSERT INTO compras
        (
          proveedorId,
          fecha,
          remito,
          observaciones,
          total,
          contado,
          transferencia,
          cuentaCorriente,
          saldoAnterior,
          saldoNuevo
        )

        VALUES (?,?,?,?,?,?,?,?,?,?)
        `,

        [

          proveedorId,
          fecha,
          remito,
          observaciones,
          total,
          contado,
          transferencia,
          pendiente,
          saldoAnterior,
          saldoNuevo

        ],

        function (error) {

          if (error) {

            return callback(error);

          }

          const compraId = this.lastID;

          const detalleStmt = db.prepare(

            `
            INSERT INTO compras_detalle
            (
              compraId,
              materiaPrimaId,
              producto,
              cantidad,
              unidad,
              precioUnitario,
              subtotal
            )

            VALUES (?,?,?,?,?,?,?)
            `

          );

          detalle.forEach((item) => {

            detalleStmt.run([

              compraId,

              item.materiaPrimaId,

              item.producto,

              item.cantidad,

              item.unidad,

              item.precioUnitario,

              item.subtotal

            ]);

          });

          detalleStmt.finalize();

          db.run(

            `
            UPDATE proveedores
            SET saldo = ?
            WHERE id = ?
            `,

            [

              saldoNuevo,

              proveedorId

            ]

          );

          db.run(

            `
            INSERT INTO movimientos_proveedores
            (
              proveedorId,
              tipo,
              descripcion,
              debe,
              haber,
              saldo,
              referenciaId
            )

            VALUES (?,?,?,?,?,?,?)
            `,

            [

              proveedorId,

              "COMPRA",

              "Compra de mercadería",

              pendiente,

              0,

              saldoNuevo,

              compraId

            ]

          );

          callback(null, {

            id: compraId,

            proveedorId,

            proveedorNombre:
              proveedor
                ? proveedor.nombre
                : "",

            total: Number(total),

            cuentaCorriente: pendiente,

            saldoAnterior,

            saldoNuevo

          });

        }

      );

    }

  );

}
module.exports = {

  getCompras,

  getCompraById,

  createCompra

};