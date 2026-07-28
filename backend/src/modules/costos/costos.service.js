const db = require("../../database/connection");



function getAll(callback) {

  db.all(

    `
    SELECT *
    FROM costos
    ORDER BY nombre ASC
    `,

    [],

    callback

  );

}





function guardarHistorial(costo) {

  db.run(

    `
    INSERT INTO costos_historial
    (
      nombre,
      unidad,
      costoBase,
      margen,
      precioSugerido
    )
    VALUES (?, ?, ?, ?, ?)
    `,

    [

      costo.nombre,

      costo.unidad,

      costo.costoBase,

      costo.margen,

      costo.precioSugerido,

    ]

  );

}





function create(costo, callback) {

  db.get(

    `
    SELECT id
    FROM costos
    WHERE nombre = ?
    `,

    [

      costo.nombre

    ],

    (err, row) => {

      if (err) {

        return callback(err);

      }



      if (row) {

        const updateSql = `

          UPDATE costos

          SET

            unidad = ?,

            costoBase = ?,

            margen = ?,

            precioSugerido = ?,

            fecha = CURRENT_TIMESTAMP

          WHERE id = ?

        `;



        db.run(

          updateSql,

          [

            costo.unidad,

            costo.costoBase,

            costo.margen,

            costo.precioSugerido,

            row.id,

          ],

          function(err) {

            if (!err) {

              guardarHistorial(costo);

            }

            callback(err, row.id);

          }

        );



      } else {



        const insertSql = `

          INSERT INTO costos

          (

            nombre,

            unidad,

            costoBase,

            margen,

            precioSugerido

          )

          VALUES (?, ?, ?, ?, ?)

        `;



        db.run(

          insertSql,

          [

            costo.nombre,

            costo.unidad,

            costo.costoBase,

            costo.margen,

            costo.precioSugerido,

          ],

          function(err) {

            if (!err) {

              guardarHistorial(costo);

            }

            callback(err, this.lastID);

          }

        );

      }

    }

  );

}






function update(id, costo, callback) {

  const sql = `

    UPDATE costos

    SET

      nombre = ?,

      unidad = ?,

      costoBase = ?,

      margen = ?,

      precioSugerido = ?,

      fecha = CURRENT_TIMESTAMP

    WHERE id = ?

  `;



  db.run(

    sql,

    [

      costo.nombre,

      costo.unidad,

      costo.costoBase,

      costo.margen,

      costo.precioSugerido,

      id,

    ],

    function(err) {

      if (!err) {

        guardarHistorial(costo);

      }

      callback(err);

    }

  );

}





module.exports = {

  getAll,

  create,

  update,

};