const db = require("../../database/connection");



function getAll(callback) {

  db.all(

    `
    SELECT *

    FROM productos

    ORDER BY nombre ASC
    `,

    [],

    callback

  );

}







function create(product, callback) {


  const sql = `

    INSERT INTO productos

    (

      nombre,

      categoria,

      precio,

      stock,

      stockMinimo,

      unidad,

      tipo,

      controlaStock,

      esMateriaPrima,

      esElaborado,

      tieneReceta,

      margen,

      precioVenta,

      activo

    )

    VALUES

    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

  `;



  db.run(

    sql,

    [

      product.nombre,

      product.categoria,

      product.precio || 0,

      product.stock || 0,

      product.stockMinimo || 0,

      product.unidad || "kg",

      product.tipo || "producto",

      product.controlaStock ? 1 : 0,

      product.esMateriaPrima ? 1 : 0,

      product.esElaborado ? 1 : 0,

      product.tieneReceta ? 1 : 0,

      product.margen || 0,

      product.precioVenta || 0,

      product.activo ?? 1,

    ],

    function(err){

      callback(
        err,
        this.lastID
      );

    }

  );


}








function update(id, product, callback) {


  const sql = `


    UPDATE productos

    SET


      nombre = ?,

      categoria = ?,

      precio = ?,

      stock = ?,

      stockMinimo = ?,

      unidad = ?,

      tipo = ?,

      controlaStock = ?,

      esMateriaPrima = ?,

      esElaborado = ?,

      tieneReceta = ?,

      margen = ?,

      precioVenta = ?,

      activo = ?


    WHERE id = ?


  `;



  db.run(

    sql,

    [

      product.nombre,

      product.categoria,

      product.precio || 0,

      product.stock || 0,

      product.stockMinimo || 0,

      product.unidad || "kg",

      product.tipo || "producto",

      product.controlaStock ? 1 : 0,

      product.esMateriaPrima ? 1 : 0,

      product.esElaborado ? 1 : 0,

      product.tieneReceta ? 1 : 0,

      product.margen || 0,

      product.precioVenta || 0,

      product.activo ?? 1,

      id,

    ],

    callback

  );


}








function remove(id, callback) {


  db.run(

    `

    UPDATE productos

    SET activo = 0

    WHERE id = ?

    `,

    [

      id

    ],

    callback

  );


}







module.exports = {

  getAll,

  create,

  update,

  remove,

};