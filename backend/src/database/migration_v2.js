const db = require("./connection");

console.log("🚀 Iniciando migración Elinor Gestión v2...");


function agregarColumna(nombre, tipo, valorDefault = null) {

  db.all(
    `PRAGMA table_info(productos)`,
    [],
    (err, columnas) => {

      if (err) {
        console.error(err);
        return;
      }


      const existe = columnas.some(
        c => c.name === nombre
      );


      if (!existe) {

        let sql = `
          ALTER TABLE productos
          ADD COLUMN ${nombre} ${tipo}
        `;


        if (valorDefault !== null) {

          sql += `
            DEFAULT ${valorDefault}
          `;

        }


        db.run(sql, (error)=>{

          if(error){

            console.error(
              "Error agregando",
              nombre,
              error.message
            );

          } else {

            console.log(
              "✅ Columna agregada:",
              nombre
            );

          }

        });


      } else {

        console.log(
          "✔ Ya existe:",
          nombre
        );

      }

    }
  );

}



db.serialize(()=>{


  agregarColumna(
    "tipo",
    "TEXT",
    "'producto'"
  );


  agregarColumna(
    "controlaStock",
    "INTEGER",
    0
  );


  agregarColumna(
    "esMateriaPrima",
    "INTEGER",
    0
  );


  agregarColumna(
    "esElaborado",
    "INTEGER",
    0
  );


  agregarColumna(
    "tieneReceta",
    "INTEGER",
    0
  );


  agregarColumna(
    "margen",
    "REAL",
    0
  );


  agregarColumna(
    "precioVenta",
    "REAL",
    0
  );


  agregarColumna(
    "activo",
    "INTEGER",
    1
  );


});


setTimeout(()=>{

  console.log(
    "✅ Migración v2 finalizada."
  );

  process.exit();

},2000);