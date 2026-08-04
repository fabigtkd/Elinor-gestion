const db = require("../../database/connection");





function getAll(callback){

  console.log("ENTRO A GET ALL MATERIAS PRIMAS");


  db.all(

    `

    SELECT *

    FROM materias_primas

    ORDER BY nombre ASC

    `,

    [],

    (error, rows)=>{

      if(error){

        console.error(
          "ERROR SQL MATERIAS PRIMAS:",
          error
        );

      } else {

        console.log(
          "MATERIAS PRIMAS:",
          rows
        );

      }


      callback(error,rows);

    }

  );

}





function create(materiaPrima, callback){



  const sql = `

    INSERT INTO materias_primas

    (

      codigo,

      nombre,

      categoria,

      unidad,

      rendimiento,

      costoActual,

      costoAnterior,

      activo

    )


    VALUES (?,?,?,?,?,?,?,?)

  `;



  db.run(

    sql,

    [

      materiaPrima.codigo || null,

      materiaPrima.nombre,

      materiaPrima.categoria || null,

      materiaPrima.unidad || "kg",

      Number(materiaPrima.rendimiento || 100),

      Number(materiaPrima.costoActual || 0),

      Number(materiaPrima.costoAnterior || 0),

      materiaPrima.activo === false ? 0 : 1

    ],

    function(error){


      callback(

        error,

        this.lastID

      );


    }

  );


}







function update(id, materiaPrima, callback){



  db.run(

    `

    UPDATE materias_primas

    SET

      codigo=?,

      nombre=?,

      categoria=?,

      unidad=?,

      rendimiento=?,

      costoActual=?,

      activo=?


    WHERE id=?

    `,


    [

      materiaPrima.codigo,

      materiaPrima.nombre,

      materiaPrima.categoria,

      materiaPrima.unidad,

      Number(materiaPrima.rendimiento || 100),

      Number(materiaPrima.costoActual || 0),

      materiaPrima.activo === false ? 0 : 1,

      id

    ],


    callback

  );


}







function getOrigenes(id, callback){



  db.all(

    `

    SELECT *

    FROM origenes_materia_prima

    WHERE materiaPrimaId=?

    ORDER BY fecha DESC

    `,

    [

      id

    ],

    callback

  );


}








module.exports={


  getAll,

  create,

  update,

  getOrigenes


};