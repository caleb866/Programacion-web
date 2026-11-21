// Utilidades y validaciones compartidas por las rutas.

export function parsearId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// MySQL devuelve DECIMAL como texto; lo convertimos a número para la API.
export function formatearProducto(fila) {
  return { ...fila, precio: Number(fila.precio) };
}

// Valida nombre, precio y stock. Con `parcial = true` (PATCH) solo valida los campos enviados.
export function validarProducto(body, parcial = false) {
  const errores = [];

  if (!parcial || body.nombre !== undefined) {
    if (typeof body.nombre !== "string" || body.nombre.trim() === "") {
      errores.push("El nombre es obligatorio y no puede estar vacío");
    }
  }

  if (!parcial || body.precio !== undefined) {
    if (
      typeof body.precio !== "number" ||
      !Number.isFinite(body.precio) ||
      body.precio < 0
    ) {
      errores.push("El precio es obligatorio y debe ser un número mayor o igual a 0");
    }
  }

  if (body.stock !== undefined) {
    if (!Number.isInteger(body.stock) || body.stock < 0) {
      errores.push("El stock debe ser un entero mayor o igual a 0");
    }
  }

  return errores;
}

export function responder400(res, errores) {
  return res.status(400).json({ error: "Datos inválidos", detalles: errores });
}

// Envuelve handlers async para que Express reciba los errores con next().
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}