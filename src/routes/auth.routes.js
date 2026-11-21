import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = Router();

// POST /registro  -> crea usuario guardando el HASH, nunca la clave
async function registrar(req, res) {
  try {
    const { email, password, rol } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)",
      [email, hash, rol || "usuario"]
    );

    res.status(201).json({ mensaje: "Usuario creado" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
}

// /registro es la ruta que pide la actividad; /register queda como alias.
router.post("/registro", registrar);
router.post("/register", registrar);

// POST /login  -> entrega el token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }

    const [filas] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    const usuario = filas[0];

    // mismo mensaje si el email no existe o la clave está mal
    if (!usuario) {
      return res.status(401).json({ error: "Email o clave incorrectos" });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ error: "Email o clave incorrectos" });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;