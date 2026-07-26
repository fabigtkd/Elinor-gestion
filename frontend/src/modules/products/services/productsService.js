const API_URL = "http://localhost:3001/api/products";


export async function getProducts() {

  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  return await response.json();

}


export async function createProduct(product) {

  const response = await fetch(API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(product),

  });


  if (!response.ok) {
    throw new Error("Error al crear producto");
  }


  return await response.json();

}