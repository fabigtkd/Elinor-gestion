const db = require("../../database/connection");


function getAll(callback) {

  db.all(
    "SELECT * FROM productos ORDER BY nombre",
    [],
    callback
  );

}



function create(product, callback) {

  const sql = `
    INSERT INTO productos
    (nombre, categoria, precio, stock, stockMinimo, unidad)
    VALUES (?, ?, ?, ?, ?, ?)
  `;


  db.run(

    sql,

    [

      product.nombre,

      product.categoria,

      product.precio,

      product.stock,

      product.stockMinimo,

      product.unidad,

    ],

    function (err) {

      callback(err, this.lastID);

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

      unidad = ?

    WHERE id = ?

  `;



  db.run(

    sql,

    [

      product.nombre,

      product.categoria,

      product.precio,

      product.stock,

      product.stockMinimo,

      product.unidad,

      id,

    ],

    callback

  );


}



function remove(id, callback) {


  db.run(

    "DELETE FROM productos WHERE id = ?",

    [id],

    callback

  );


}



module.exports = {

  getAll,

  create,

  update,

  remove,

};