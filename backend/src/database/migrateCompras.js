const db = require("./connection");



function columnaExiste(tabla, columna, callback){

  db.all(

    `PRAGMA table_info(${tabla})`,

    [],

    (err, columnas)=>{

      if(err){

        return callback(err,false);

      }


      const existe = columnas.some(

        c => c.name === columna

      );


      callback(null, existe);

    }

  );

}






function crearColumna(tabla, columna, tipo){

  return new Promise((resolve)=>{


    columnaExiste(

      tabla,

      columna,

      (err, existe)=>{


        if(err){

          console.error(err);

          resolve();

          return;

        }



        if(existe){

          resolve();

          return;

        }



        db.run(

          `ALTER TABLE ${tabla} ADD COLUMN ${columna} ${tipo}`,

          (error)=>{


            if(error){

              console.error(error);

            }


            resolve();


          }

        );


      }

    );


  });

}






async function migrarCompras(){


  console.log(

    "🔄 Verificando estructura de compras..."

  );



  await crearColumna(

    "compras",

    "remito",

    "TEXT"

  );



  await crearColumna(

    "compras_detalle",

    "materiaPrimaId",

    "INTEGER"

  );



  console.log(

    "✅ Migración compras finalizada"

  );


}





migrarCompras();