import jwt from "jsonwebtoken";

// Middleware: exige token válido -> 401 si falta o está vencido
export function verificarToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { id, rol, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o vencido" });
  }
}

// Middleware: deja pasar solo al rol admin -> 403 si tiene token pero no es admin
export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Solo un admin puede hacer esto" });
  }
  next();
}

// Permite exigir uno o varios roles. Se mantiene por si se necesita más adelante.
export function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      return res.status(403).json({ error: "No tienes permiso" });
    }
    next();
  };
}