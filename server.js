import express from "express";
import { db } from "./db.js";

const app = express();
app.use(express.json());
app.set("json spaces", 2);

// ---------- Validaciones ----------
const nombreValido = (v) => typeof v === "string" && v.trim() !== "";
const precioValido = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;
const stockValido = (v) => Number.isInteger(v) && v >= 0;

const errorServidor = (res, e) => {
  console.error(e);
  res.status(500).json({ error: "Error del servidor" });
};

// ---------- GET /productos ----------
app.get("/productos", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos");
    res.status(200).json(filas);
  } catch (e) {
    errorServidor(res, e);
  }
});

// ---------- GET /productos/:id ----------
app.get("/productos/:id", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [
      req.params.id,
    ]);
    if (filas.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(filas[0]);
  } catch (e) {
    errorServidor(res, e);
  }
});

// ---------- POST /productos ----------
app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock = 0 } = req.body;
    if (!nombreValido(nombre) || !precioValido(precio) || !stockValido(stock)) {
      return res.status(400).json({ error: "Datos faltantes o inválidos" });
    }
    const [resultado] = await db.query(
      "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
      [nombre.trim(), precio, stock]
    );
    res.status(201).json({ id: resultado.insertId, nombre: nombre.trim(), precio, stock });
  } catch (e) {
    errorServidor(res, e);
  }
});

// ---------- PUT /productos/:id (reemplazo completo) ----------
app.put("/productos/:id", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    if (!nombreValido(nombre) || !precioValido(precio) || !stockValido(stock)) {
      return res.status(400).json({ error: "Datos faltantes o inválidos" });
    }
    const [resultado] = await db.query(
      "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre.trim(), precio, stock, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ id: Number(req.params.id), nombre: nombre.trim(), precio, stock });
  } catch (e) {
    errorServidor(res, e);
  }
});

// ---------- PATCH /productos/:id (cambio parcial) ----------
app.patch("/productos/:id", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const campos = [];
    const valores = [];

    if (nombre !== undefined) {
      if (!nombreValido(nombre)) return res.status(400).json({ error: "Nombre inválido" });
      campos.push("nombre = ?");
      valores.push(nombre.trim());
    }
    if (precio !== undefined) {
      if (!precioValido(precio)) return res.status(400).json({ error: "Precio inválido" });
      campos.push("precio = ?");
      valores.push(precio);
    }
    if (stock !== undefined) {
      if (!stockValido(stock)) return res.status(400).json({ error: "Stock inválido" });
      campos.push("stock = ?");
      valores.push(stock);
    }
    if (campos.length === 0) {
      return res.status(400).json({ error: "No enviaste ningún campo para actualizar" });
    }

    const [resultado] = await db.query(
      `UPDATE productos SET ${campos.join(", ")} WHERE id = ?`,
      [...valores, req.params.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    res.status(200).json(filas[0]);
  } catch (e) {
    errorServidor(res, e);
  }
});

// ---------- DELETE /productos/:id ----------
app.delete("/productos/:id", async (req, res) => {
  try {
    const [resultado] = await db.query("DELETE FROM productos WHERE id = ?", [
      req.params.id,
    ]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(204).send();
  } catch (e) {
    errorServidor(res, e);
  }
});

app.listen(3000, () => console.log("API en http://localhost:3000"));