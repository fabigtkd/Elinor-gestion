const API_URL = "http://localhost:3001/api/costos";



export async function createCosto(costo) {


  const response = await fetch(

    API_URL,

    {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify(costo),

    }

  );



  if (!response.ok) {

    throw new Error(
      "Error guardando costo"
    );

  }



  return await response.json();


}





export async function getCostos() {


  const response = await fetch(API_URL);



  if (!response.ok) {

    throw new Error(
      "Error cargando costos"
    );

  }



  return await response.json();


}





export async function updateCosto(id, costo) {


  const response = await fetch(

    `${API_URL}/${id}`,

    {

      method: "PUT",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify(costo),

    }

  );



  if (!response.ok) {

    throw new Error(
      "Error actualizando costo"
    );

  }



  return await response.json();


}