const API_URL = "http://localhost:3001/api/compras";



export async function getCompras() {

  const response = await fetch(API_URL);


  if (!response.ok) {

    throw new Error(
      "Error obteniendo compras"
    );

  }


  return await response.json();

}





export async function createCompra(compra) {


  const response = await fetch(

    API_URL,

    {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },


      body: JSON.stringify(compra),

    }

  );



  if (!response.ok) {

    throw new Error(
      "Error creando compra"
    );

  }



  return await response.json();

}