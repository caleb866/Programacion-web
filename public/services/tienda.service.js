// Este es el único archivo que habla con la API (fetch).

const API_PRODUCTOS = "/productos";

async function peticion(url, opciones = {}) {
  const headers = {
    ...(opciones.body ? { "Content-Type": "application/json" } : {}),
    ...(opciones.headers ?? {}),
  };

  const respuesta = await fetch(url, { ...opciones, headers });

  if (respuesta.status === 204) {
    return null;
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const error = new Error(datos.error ?? `Error ${respuesta.status}`);
    error.status = respuesta.status;
    error.detalles = datos.detalles;
    throw error;
  }

  return datos;
}

export function login(email, password) {
  return peticion("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getProductos() {
  return peticion(API_PRODUCTOS);
}

export function crearProducto(producto, token) {
  return peticion(API_PRODUCTOS, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(producto),
  });
}

export function actualizarProducto(id, producto, token) {
  return peticion(`${API_PRODUCTOS}/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(producto),
  });
}

export function eliminarProducto(id, token) {
  return peticion(`${API_PRODUCTOS}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}