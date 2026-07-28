const db = require("../../database/connection");



function getAll(callback) {


  db.all(

    `
    SELECT *
    FROM materias_primas
    ORDER BY nombre ASC
    `,

    [],

    callback

  );


}





function create(materiaPrima, callback) {


  const sql = `

    INSERT INTO materias_primas

    (

      nombre,

      origen,

      unidad,

      costoActual,

      rendimiento,

      merma

    )

    VALUES (?, ?, ?, ?, ?, ?)

  `;



  db.run(

    sql,

    [

      materiaPrima.nombre,

      materiaPrima.origen,

      materiaPrima.unidad,

      materiaPrima.costoActual,

      materiaPrima.rendimiento,

      materiaPrima.merma,

    ],

    function(err) {


      callback(

        err,

        this.lastID

      );


    }

  );


}





module.exports = {

  getAll,

  create,

};