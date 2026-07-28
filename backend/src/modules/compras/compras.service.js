const db = require("../../database/connection");


function getCompras(callback) {

  db.all(
    `
    SELECT *
    FROM compras
    ORDER BY fecha DESC
    `,
    [],
    callback
  );

}



function createCompra(data, callback) {

  const {

    tipo,
    producto,
    cantidad,
    unidad,
    costoUnitario,
    costoTotal,
    merma

  } = data;



  db.run(

    `
    INSERT INTO compras (

      tipo,
      producto,
      cantidad,
      unidad,
      costoUnitario,
      costoTotal,
      merma

    )

    VALUES (?,?,?,?,?,?,?)

    `,

    [

      tipo,
      producto,
      cantidad,
      unidad,
      costoUnitario,
      costoTotal,
      merma || 0

    ],

    function(error){

      callback(

        error,

        {
          id: this.lastID
        }

      );

    }

  );

}



module.exports = {

  getCompras,

  createCompra

};