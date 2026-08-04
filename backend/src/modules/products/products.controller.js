const service = require("./products.service");



function getProducts(req, res) {


  service.getAll(

    (err, rows)=>{


      if(err){

        return res.status(500).json({

          error: err.message,

        });

      }



      res.json(rows);


    }

  );


}








function createProduct(req,res){


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
        "Producto creado correctamente"

      });


    }

  );


}









function updateProduct(req,res){


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
        "Producto actualizado correctamente"

      });


    }

  );


}









function deleteProduct(req,res){


  const id = req.params.id;



  service.remove(

    id,

    (err)=>{


      if(err){

        return res.status(500).json({

          error: err.message,

        });

      }



      res.json({

        mensaje:
        "Producto eliminado correctamente"

      });


    }

  );


}








module.exports = {

  getProducts,

  createProduct,

  updateProduct,

  deleteProduct,

};