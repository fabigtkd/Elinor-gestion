const API_URL = "/api/produccion";

// ============================================================
// OBTENER TODOS LOS CAJONES
// ============================================================

export async function getCajones() {
  const respuesta = await fetch(`${API_URL}/cajones`);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.error || "No se pudieron cargar los cajones.");
  }

  return Array.isArray(datos) ? datos : [];
}

// ============================================================
// OBTENER UN CAJÓN
// ============================================================

export async function getCajon(id) {
  const respuesta = await fetch(`${API_URL}/cajones/${id}`);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.error || "No se pudo cargar el cajón.");
  }

  return datos;
}

// ============================================================
// CREAR CAJONES
// ============================================================

export async function createCajon(data) {
  const respuesta = await fetch(`${API_URL}/cajones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.error || "No se pudieron registrar los cajones.");
  }

  return datos;
}

// ============================================================
// DESTINAR CAJONES A CORTE
// ============================================================

export async function cortarCajon(id, data = {}) {
  const respuesta = await fetch(`${API_URL}/cajones/${id}/cortar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.error || "No se pudo registrar el corte.");
  }

  return datos;
}

// ============================================================
// CONSUMIR MATERIA PRIMA
// ============================================================

export async function consumirMateriaPrima(productoId, cantidad) {
  const respuesta = await fetch(`${API_URL}/consumo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productoId,
      cantidad,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.error || "No se pudo consumir la materia prima.");
  }

  return datos;
}

// ============================================================
// OBTENER COSTO ACTUAL DE MATERIA PRIMA
// ============================================================

export async function getCostoActual(productoId) {
  const respuesta = await fetch(`${API_URL}/costo/${productoId}`);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos?.error || "No se pudo calcular el costo actual.");
  }

  return datos;
}
