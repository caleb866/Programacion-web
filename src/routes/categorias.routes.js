import { Router } from "express";

const router = Router();

// La estructura de la Actividad 6 incluye este archivo.
// Aquí se agregarán las rutas de categorías cuando se implemente el recurso.
router.get("/", (req, res) => {
  res.status(200).json([]);
});

export default router;