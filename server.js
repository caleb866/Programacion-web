const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// "Base de datos" en memoria
let productos = [
  { id: 1, nombre: 'Colonia Aqua', precio: 50000, stock: 10 },
  { id: 2, nombre: 'Colonia Noir', precio: 65000, stock: 5 },
  { id: 3, nombre: 'Colonia Citrus', precio: 45000, stock: 8 },
];
let siguienteId = 4;

// Busca un producto por id (devuelve undefined si no existe)
function buscarProducto(idTexto) {
  const id = Number(idTexto);
  return productos.find((p) => p.id === id);
}

// Valida los campos que vengan en "datos".
function validar(datos, completo) {
  if (completo || datos.nombre !== undefined) {
    if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
      return 'El nombre es obligatorio y debe ser texto';
    }
  }
  if (completo || datos.precio !== undefined) {
    if (typeof datos.precio !== 'number' || Number.isNaN(datos.precio) || datos.precio < 0) {
      return 'El precio es obligatorio y debe ser un número mayor o igual a 0';
    }
  }
  if (datos.stock !== undefined) {
    if (!Number.isInteger(datos.stock) || datos.stock < 0) {
      return 'El stock debe ser un entero mayor o igual a 0';
    }
  }
  return null; 
}

// 1. GET /productos -> lista todos (200)
app.get('/productos', (req, res) => {
  res.status(200).json(productos);
});

// 2. GET /productos/:id -> devuelve uno (200 / 404)
app.get('/productos/:id', (req, res) => {
  const producto = buscarProducto(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.status(200).json(producto);
});

// 3. POST /productos -> crea uno nuevo (201 / 400)
app.post('/productos', (req, res) => {
  const datos = req.body || {};
  const error = validar(datos, true);
  if (error) {
    return res.status(400).json({ error });
  }

  const nuevo = {
    id: siguienteId++,
    nombre: datos.nombre.trim(),
    precio: datos.precio,
    stock: datos.stock ?? 0,
  };
  productos.push(nuevo);
  res.status(201).json(nuevo);
});

// 4. PUT /productos/:id -> reemplaza todos los campos (200 / 400 / 404)
app.put('/productos/:id', (req, res) => {
  const producto = buscarProducto(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const datos = req.body || {};
  const error = validar(datos, true);
  if (error) {
    return res.status(400).json({ error });
  }

  producto.nombre = datos.nombre.trim();
  producto.precio = datos.precio;
  producto.stock = datos.stock ?? 0;
  res.status(200).json(producto);
});

// 5. PATCH /productos/:id -> cambia solo algunos campos (200 / 400 / 404)
app.patch('/productos/:id', (req, res) => {
  const producto = buscarProducto(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const datos = req.body || {};
  if (Object.keys(datos).length === 0) {
    return res.status(400).json({ error: 'Debes enviar al menos un campo' });
  }
  const error = validar(datos, false);
  if (error) {
    return res.status(400).json({ error });
  }

  if (datos.nombre !== undefined) producto.nombre = datos.nombre.trim();
  if (datos.precio !== undefined) producto.precio = datos.precio;
  if (datos.stock !== undefined) producto.stock = datos.stock;
  res.status(200).json(producto);
});

// 6. DELETE /productos/:id -> borra el producto (204 / 404)
app.delete('/productos/:id', (req, res) => {
  const producto = buscarProducto(req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  productos = productos.filter((p) => p.id !== producto.id);
  res.status(204).send(); // éxito sin body
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`API de productos corriendo en http://localhost:${PORT}`);
});