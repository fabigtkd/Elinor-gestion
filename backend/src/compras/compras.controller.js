const comprasService = require("./compras.service");




// ===============================
// OBTENER COMPRAS
// ===============================

function getCompras(req, res) {


  comprasService.getCompras(

    (error, compras) => {


      if (error) {

        return res.status(500).json({

          error: error.message

        });

      }



      res.json(compras);


    }

  );


}







// ===============================
// OBTENER REMITO POR ID
// ===============================

function getCompraById(req, res){


  const id = Number(req.params.id);



  comprasService.getCompraById(

    id,

    (error, compra)=>{


      if(error){

        return res.status(500).json({

          error:error.message

        });

      }



      if(!compra){

        return res.status(404).json({

          error:"Remito no encontrado."

        });

      }



      res.json(compra);


    }

  );


}








// ===============================
// CREAR COMPRA
// ===============================

function createCompra(req, res) {


  const compra = req.body;




  if (!compra.detalle || compra.detalle.length === 0) {


    return res.status(400).json({

      error: "Debe ingresar al menos un producto."

    });


  }






  const proveedorId = Number(compra.proveedorId || 1);

  const contado = Number(compra.contado || 0);

  const transferencia = Number(compra.transferencia || 0);

  const total = Number(compra.total || 0);







  const compraPreparada = {


    proveedorId,

    remito: compra.remito || "",

    fecha: compra.fecha,

    observaciones: compra.observaciones || "",

    total,

    contado,

    transferencia,

    detalle: compra.detalle


  };









  comprasService.createCompra(


    compraPreparada,


    (error, resultado) => {



      if (error) {


        console.error(error);



        return res.status(500).json({

          error: error.message

        });


      }








      res.status(201).json({



        mensaje:

        "Remito registrado correctamente.",



        id:

        resultado.id,



        proveedorId:

        resultado.proveedorId,



        proveedorNombre:

        resultado.proveedorNombre,



        total:

        resultado.total,



        cuentaCorriente:

        resultado.cuentaCorriente,



        saldoAnterior:

        resultado.saldoAnterior,



        saldoNuevo:

        resultado.saldoNuevo



      });




    }


  );



}









module.exports = {


  getCompras,


  getCompraById,


  createCompra


};