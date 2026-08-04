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

    ORDER BY compras.id DESC

    `,

    [],

    callback

  );

}





// ===============================
// OBTENER REMITO POR ID
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

    (error, compra)=>{


      if(error){

        return callback(error);

      }


      if(!compra){

        return callback(null,null);

      }



      db.all(

        `
        SELECT *

        FROM compras_detalle

        WHERE compraId = ?

        ORDER BY id

        `,

        [id],

        (errorDetalle,detalle)=>{


          if(errorDetalle){

            return callback(errorDetalle);

          }


          compra.detalle = detalle || [];

          callback(null,compra);


        }

      );


    }

  );


}






// ===============================
// GENERAR NUMERO AUTOMATICO REMITO
// ===============================

function generarNumeroRemito(callback){

console.log("🔥 GENERANDO NUMERO REMITO");
  db.get(

    `
    SELECT remito

    FROM compras

    WHERE remito LIKE 'REM-%'

    ORDER BY id DESC

    LIMIT 1

    `,

    [],

    (error,resultado)=>{


      if(error){

        return callback(error);

      }



      let numero = 1;



      if(resultado && resultado.remito){


        const ultimo = Number(

          resultado.remito.replace("REM-","")

        );


        numero = ultimo + 1;


      }



      const remitoNuevo =

        "REM-" +

        String(numero).padStart(6,"0");

console.log("✅ REMITO GENERADO:", remitoNuevo);

      callback(null,remitoNuevo);



    }

  );


}






// ===============================
// CREAR COMPRA
// ===============================

function createCompra(data, callback) {


  const {

    proveedorId,

    fecha,

    total,

    contado,

    transferencia,

    observaciones,

    detalle

  } = data;
    const pendiente =

    Number(total) -

    (

      Number(contado) +

      Number(transferencia)

    );



  generarNumeroRemito(

    (errorRemito,remitoAutomatico)=>{


      if(errorRemito){

        return callback(errorRemito);

      }




      db.get(

        `
        SELECT nombre,saldo

        FROM proveedores

        WHERE id = ?

        `,

        [proveedorId],


        (error,proveedor)=>{


          if(error){

            return callback(error);

          }



          const saldoAnterior =

            Number(proveedor?.saldo || 0);



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

              remitoAutomatico,

              observaciones,

              total,

              contado,

              transferencia,

              pendiente,

              saldoAnterior,

              saldoNuevo

            ],



            function(errorInsert){


              if(errorInsert){

                return callback(errorInsert);

              }



              const id=this.lastID;



              insertarDetalle(

                id,

                detalle,

                ()=>{



                  db.run(

                    `

                    UPDATE proveedores

                    SET saldo=?

                    WHERE id=?

                    `,

                    [

                      saldoNuevo,

                      proveedorId

                    ]

                  );





                  callback(null,{

                    id,

                    proveedorId,

                    proveedorNombre:

                      proveedor?.nombre || "",

                    remito:

                      remitoAutomatico,

                    total,

                    cuentaCorriente:

                      pendiente,

                    saldoAnterior,

                    saldoNuevo

                  });



                }

              );



            }


          );



        }


      );


    }

  );


}






// ===============================
// EDITAR COMPRA
// ===============================

function updateCompra(id,data,callback){


  const {

  proveedorId,

  fecha,

  total,

  contado,

  transferencia,

  observaciones,

  detalle

} = data;


  const pendienteNuevo =

    Number(total || 0) -

    (

      Number(contado || 0) +

      Number(transferencia || 0)

    );




  db.get(

    `
    SELECT *

    FROM compras

    WHERE id=?

    `,

    [id],


    (error,compraAnterior)=>{


      console.log("================================");
      console.log("UPDATE COMPRA");
      console.log("ID recibido:",id);
      console.log("Compra encontrada:",compraAnterior);
      console.log("================================");



      if(error){

        return callback(error);

      }



      if(!compraAnterior){

        return callback(

          new Error("Compra no encontrada")

        );

      }
            const diferenciaSaldo =

        pendienteNuevo -

        Number(compraAnterior.cuentaCorriente || 0);





      db.run(

        `
        UPDATE compras

        SET

        proveedorId=?,

        fecha=?,


        observaciones=?,

        total=?,

        contado=?,

        transferencia=?,

        cuentaCorriente=?

        WHERE id=?

        `,


        [

          proveedorId,

          fecha,


          observaciones,

          total,

          contado,

          transferencia,

          pendienteNuevo,

          id

        ],



        (errorUpdate)=>{


          if(errorUpdate){

            return callback(errorUpdate);

          }




          db.run(

            `
            UPDATE proveedores

            SET saldo = saldo + ?

            WHERE id=?

            `,


            [

              diferenciaSaldo,

              proveedorId

            ]

          );






          db.run(

            `
            DELETE FROM compras_detalle

            WHERE compraId=?

            `,


            [id],



            ()=>{


              insertarDetalle(

                id,

                detalle || [],

                ()=>{


                  callback(null,{

                    id,

                    cuentaCorriente:

                      pendienteNuevo

                  });


                }

              );


            }


          );



        }


      );



    }


  );


}





// ===============================
// INSERTAR DETALLE
// ===============================

function insertarDetalle(compraId,detalle,callback){


  const stmt = db.prepare(

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



  detalle.forEach(item=>{


    stmt.run([

      compraId,

      item.materiaPrimaId,

      item.producto,

      item.cantidad,

      item.unidad,

      item.precioUnitario,

      item.subtotal

    ]);


  });



  stmt.finalize(callback);


}






module.exports = {


  getCompras,

  getCompraById,

  createCompra,

  updateCompra


};