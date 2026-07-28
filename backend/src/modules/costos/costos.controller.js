const service = require("./costos.service");



function getCostos(req, res) {


  service.getAll((err, rows)=>{


    if(err){

      return res.status(500).json({
        error: err.message,
      });

    }


    res.json(rows);


  });


}





function createCosto(req,res){


  service.create(

    req.body,

    (err,id)=>{


      if(err){

        return res.status(500).json({
          error: err.message,
        });

      }


      res.status(201).json({

        id,

        mensaje:
        "Costo guardado correctamente"

      });


    }

  );


}






function updateCosto(req,res){


  const id = req.params.id;



  service.update(

    id,

    req.body,

    (err)=>{


      if(err){

        return res.status(500).json({

          error: err.message,

        });

      }



      res.json({

        mensaje:
        "Costo actualizado correctamente"

      });



    }

  );


}





module.exports = {

  getCostos,

  createCosto,

  updateCosto,

};