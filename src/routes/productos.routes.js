import { Router } from "express";
import { db } from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
import {
  parsearId,
  formatearProducto,
  validarProducto,
  responder400,
  asyncHandler,
} from "../validaciones.js";

const router = Router();

// GET /productos
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [filas] = await db.execute(
      "SELECT id, nombre, precio, stock FROM productos ORDER BY id"
    );

    res.status(200).json(filas.map(formatearProducto));
  })
);

// GET /productos/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parsearId(req.params.id);

    if (id === null) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const [filas] = await db.execute(
      "SELECT id, nombre, precio, stock FROM productos WHERE id = ?",
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(formatearProducto(filas[0]));
  })
);

// POST /productos
router.post(
  "/",
  verificarToken,
  asyncHandler(async (req, res) => {
    const body = req.body ?? {};
    const errores = validarProducto(body);

    if (errores.length > 0) {
      return responder400(res, errores);
    }

    const nombre = body.nombre.trim();
    const precio = body.precio;
    const stock = body.stock ?? 0;

    const [resultado] = await db.execute(
      "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
      [nombre, precio, stock]
    );

    res.status(201).json({ id: resultado.insertId, nombre, precio, stock });
  })
);

// PUT /productos/:id
router.put(
  "/:id",
  verificarToken,
  asyncHandler(async (req, res) => {
    const id = parsearId(req.params.id);

    if (id === null) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const body = req.body ?? {};
    const errores = validarProducto(body);

    if (errores.length > 0) {
      return responder400(res, errores);
    }

    const [filas] = await db.execute(
      "SELECT id, nombre, precio, stock FROM productos WHERE id = ?",
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const actual = formatearProducto(filas[0]);
    const nombre = body.nombre.trim();
    const precio = body.precio;
    const stock = body.stock ?? actual.stock;

    await db.execute(
      "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre, precio, stock, id]
    );

    res.status(200).json({ id, nombre, precio, stock });
  })
);

// PATCH /productos/:id
router.patch(
  "/:id",
  verificarToken,
  asyncHandler(async (req, res) => {
    const id = parsearId(req.params.id);

    if (id === null) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const [filas] = await db.execute(
      "SELECT id, nombre, precio, stock FROM productos WHERE id = ?",
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const body = req.body ?? {};
    const campos = [];
    const valores = [];

    if (body.nombre !== undefined) {
      campos.push("nombre = ?");
      valores.push(body.nombre.trim());
    }

    if (body.precio !== undefined) {
      campos.push("precio = ?");
      valores.push(body.precio);
    }

    if (body.stock !== undefined) {
      campos.push("stock = ?");
      valores.push(body.stock);
    }

    if (campos.length === 0) {
      return responder400(res, [
        "Debes enviar al menos uno de los campos: nombre, precio o stock",
      ]);
    }

    const errores = validarProducto(body, true);

    if (errores.length > 0) {
      return responder400(res, errores);
    }

    valores.push(id);

    await db.execute(
      `UPDATE productos SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    const [actualizado] = await db.execute(
      "SELECT id, nombre, precio, stock FROM productos WHERE id = ?",
      [id]
    );

    res.status(200).json(formatearProducto(actualizado[0]));
  })
);

// DELETE /productos/:id
router.delete(
  "/:id",
  verificarToken,
  soloAdmin,
  asyncHandler(async (req, res) => {
    const id = parsearId(req.params.id);

    if (id === null) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const [resultado] = await db.execute(
      "DELETE FROM productos WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(204).send();
  })
);

export default router;