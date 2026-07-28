const API_URL = "http://localhost:3001/api/materias-primas";



export async function getMateriasPrimas() {


  const response = await fetch(API_URL);


  if (!response.ok) {


    throw new Error(
      "Error obteniendo materias primas"
    );


  }


  return await response.json();


}




export async function createMateriaPrima(data) {


  const response = await fetch(
    API_URL,
    {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify(data),

    }
  );



  if (!response.ok) {


    throw new Error(
      "Error creando materia prima"
    );


  }



  return await response.json();


}