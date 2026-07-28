const comprasService = require("./compras.service");





function getCompras(req, res) {


  comprasService.getCompras(

    (error, compras) => {


      if (error) {


        return res.status(500).json({

          error: "Error obteniendo compras"

        });


      }



      res.json(compras);


    }

  );


}







function createCompra(req, res) {


  const compra = req.body;



  if (

    !compra.tipo ||

    !compra.producto

  ) {


    return res.status(400).json({

      error:
        "Tipo y producto son obligatorios"

    });


  }





  comprasService.createCompra(

    compra,

    (error, resultado) => {



      if (error) {


        return res.status(500).json({

          error:
            "Error guardando compra"

        });


      }



      res.json({

        mensaje:
          "Compra registrada correctamente",


        id:
          resultado.id


      });



    }


  );


}





module.exports = {

  getCompras,

  createCompra

};