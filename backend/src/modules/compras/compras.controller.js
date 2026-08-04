const comprasService = require("./compras.service");



// ===============================
// OBTENER COMPRAS
// ===============================

function getCompras(req, res) {


  comprasService.getCompras(

    (error, compras)=>{


      if(error){

        return res.status(500).json({

          error:error.message

        });

      }


      res.json(compras);


    }

  );


}





// ===============================
// OBTENER REMITO POR ID
// ===============================

function getCompraById(req,res){


  const id = Number(req.params.id);



  comprasService.getCompraById(

    id,

    (error,compra)=>{


      if(error){

        return res.status(500).json({

          error:error.message

        });

      }



      if(!compra){

        return res.status(404).json({

          error:"Remito no encontrado"

        });

      }



      res.json(compra);



    }

  );


}





// ===============================
// CREAR REMITO
// ===============================

function createCompra(req,res){


  const compra = req.body;



  if(!compra.detalle || compra.detalle.length === 0){


    return res.status(400).json({

      error:"Debe ingresar al menos un producto"

    });


  }




  const compraPreparada = {


    proveedorId:Number(compra.proveedorId || 1),

    remito:compra.remito || "",

    fecha:compra.fecha,

    observaciones:compra.observaciones || "",

    total:Number(compra.total || 0),

    contado:Number(compra.contado || 0),

    transferencia:Number(compra.transferencia || 0),

    detalle:compra.detalle


  };





  comprasService.createCompra(


    compraPreparada,


    (error,resultado)=>{


      if(error){


        console.error(error);


        return res.status(500).json({

          error:error.message

        });


      }



      res.status(201).json(resultado);



    }


  );



}





// ===============================
// ACTUALIZAR REMITO
// ===============================

function updateCompra(req,res){


  const id = Number(req.params.id);


  const compra = req.body;



  if(!compra.detalle || compra.detalle.length === 0){


    return res.status(400).json({

      error:"El remito debe tener productos"

    });


  }




  comprasService.updateCompra(

    id,

    compra,


    (error,resultado)=>{


      if(error){


        console.error(error);


        return res.status(500).json({

          error:error.message

        });


      }



      res.json({

        mensaje:"Remito actualizado correctamente",

        id:resultado.id


      });



    }


  );



}





module.exports = {


  getCompras,

  getCompraById,

  createCompra,

  updateCompra


};