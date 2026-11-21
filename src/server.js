import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRouter from "./routes/auth.routes.js";
import productosRouter from "./routes/productos.routes.js";
import categoriasRouter from "./routes/categorias.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("json spaces", 2);
app.use(express.json());

// El front-end vive en public/ (al mismo nivel que src/).
// Express solo publica esa carpeta: .env y el código del servidor
// quedan fuera del alcance del navegador.
app.use(express.static(path.join(__dirname, "..", "public")));

// ---------- Rutas de la API ----------

app.use(authRouter);
app.use("/productos", productosRouter);
app.use("/categorias", categoriasRouter);

// ---------- Rutas y errores ----------

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido" });
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "No se pudo conectar a MySQL. Verifica que el servidor esté encendido.",
    });
  }

  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    return res.status(500).json({
      error: "Usuario o contraseña de MySQL incorrectos. Revisa el archivo .env",
    });
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ---------- Servidor ----------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});