const service = require("./materiasPrimas.service");




function getMateriasPrimas(req, res) {


  service.getAll((err, rows) => {


    if (err) {


      return res.status(500).json({

        error: err.message,

      });


    }



    res.json(rows);


  });


}






function createMateriaPrima(req, res) {


  service.create(

    req.body,

    (err, id) => {


      if (err) {


        return res.status(500).json({

          error: err.message,

        });


      }



      res.status(201).json({

        id,

        mensaje:
        "Materia prima creada correctamente"

      });


    }

  );


}






module.exports = {


  getMateriasPrimas,

  createMateriaPrima,


};