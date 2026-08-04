const API_URL = "http://localhost:3001/api/compras";




// ===============================
// OBTENER COMPRAS
// ===============================

export async function getCompras(){

  const response = await fetch(API_URL);


  if(!response.ok){

    throw new Error(
      "Error obteniendo compras"
    );

  }


  return await response.json();

}






// ===============================
// OBTENER COMPRA POR ID
// ===============================

export async function getCompraById(id){

  const response = await fetch(
    `${API_URL}/${id}`
  );


  if(!response.ok){

    throw new Error(
      "Error obteniendo detalle de compra"
    );

  }


  return await response.json();

}






// ===============================
// CREAR COMPRA
// ===============================

export async function createCompra(compra){


  const compraPreparada = prepararCompra(compra);



  const response = await fetch(

    API_URL,

    {

      method:"POST",

      headers:{

        "Content-Type":"application/json",

      },

      body:JSON.stringify(compraPreparada),

    }

  );



  if(!response.ok){

    throw new Error(
      "Error creando remito"
    );

  }



  return await response.json();

}








// ===============================
// EDITAR COMPRA
// ===============================

export async function updateCompra(id,compra){


  const compraPreparada = prepararCompra(compra);



  const response = await fetch(

    `${API_URL}/${id}`,

    {

      method:"PUT",

      headers:{

        "Content-Type":"application/json",

      },

      body:JSON.stringify(compraPreparada),

    }

  );



  if(!response.ok){

    throw new Error(
      "Error actualizando remito"
    );

  }



  return await response.json();


}








// ===============================
// PREPARAR DATOS
// ===============================

function prepararCompra(compra){


  return {

    fecha:compra.fecha,

    remito:compra.remito,


    proveedorId:

      Number(compra.proveedorId || 0),


    observaciones:

      compra.observaciones || "",


    total:

      Number(compra.total || 0),


    contado:

      Number(compra.contado || 0),


    transferencia:

      Number(compra.transferencia || 0),


    detalle:

      compra.detalle || []

  };


}






// ===============================
// ELIMINAR COMPRA
// ===============================

export async function deleteCompra(id){


  const response = await fetch(

    `${API_URL}/${id}`,

    {

      method:"DELETE"

    }

  );



  if(!response.ok){

    throw new Error(
      "Error eliminando compra"
    );

  }



  return await response.json();


}