const API = "http://localhost:3001/api/proveedores";



export async function getProveedores() {

  const response = await fetch(API);

  return response.json();

}



export async function createProveedor(proveedor) {

  const response = await fetch(API, {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

    },

    body: JSON.stringify(proveedor),

  });

  return response.json();

}



export async function updateProveedor(id, proveedor) {

  const response = await fetch(

    `${API}/${id}`,

    {

      method: "PUT",

      headers: {

        "Content-Type": "application/json",

      },

      body: JSON.stringify(proveedor),

    }

  );

  return response.json();

}



export async function deleteProveedor(id) {

  const response = await fetch(

    `${API}/${id}`,

    {

      method: "DELETE",

    }

  );

  return response.json();

}