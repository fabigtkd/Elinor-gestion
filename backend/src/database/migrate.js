const db = require("./connection");


db.serialize(() => {


  db.run(

    `
    ALTER TABLE materias_primas
    ADD COLUMN tipo TEXT DEFAULT 'Compra'
    `,

    (err) => {


      if (err) {


        if (
          err.message.includes(
            "duplicate column name"
          )
        ) {

          console.log(
            "ℹ️ Campo tipo ya existe"
          );


        } else {


          console.error(err);


        }


      } else {


        console.log(
          "✅ Campo tipo agregado a materias_primas"
        );


      }


      db.close();


    }

  );


});