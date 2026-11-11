const BASE_URL = "https://rickandmortyapi.com/api";

async function pedir(ruta) {
  const respuesta = await fetch(BASE_URL + ruta);
  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status}`);
  }
  return respuesta.json();
}

export function obtenerPersonaje(id) {
  return pedir(`/character/${id}`);
}

export function listarPersonajes(pagina = 1, estado = "") {
  const filtroEstado = estado ? `&status=${estado}` : "";
  return pedir(`/character?page=${pagina}${filtroEstado}`);
}

export function buscarPersonajes(nombre) {
  return pedir(`/character?name=${encodeURIComponent(nombre)}`);
}