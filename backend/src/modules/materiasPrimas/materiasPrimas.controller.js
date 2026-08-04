const service = require("./materiasPrimas.service");





function getMateriasPrimas(req,res){


  service.getAll(

    (err,rows)=>{


      if(err){

        return res.status(500).json({

          error:err.message

        });

      }


      res.json(rows);


    }

  );


}








function createMateriaPrima(req,res){



  service.create(

    req.body,

    (err,id)=>{


      if(err){

        return res.status(500).json({

          error:err.message

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








function updateMateriaPrima(req,res){



  service.update(

    req.params.id,

    req.body,

    (err)=>{


      if(err){

        return res.status(500).json({

          error:err.message

        });

      }



      res.json({

        mensaje:
        "Materia prima actualizada correctamente"

      });


    }

  );


}








function getOrigenes(req,res){



  service.getOrigenes(

    req.params.id,

    (err,rows)=>{


      if(err){

  console.error("ERROR MATERIAS PRIMAS:", err);

  return res.status(500).json({

    error:err.message

  });

}



      res.json(rows);


    }

  );


}








module.exports={


  getMateriasPrimas,

  createMateriaPrima,

  updateMateriaPrima,

  getOrigenes


};