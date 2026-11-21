import {
  login,
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./services/tienda.service.js";

const sesionInfo = document.querySelector("#sesion-info");
const btnSalir = document.querySelector("#btn-salir");
const panelLogin = document.querySelector("#panel-login");
const formLogin = document.querySelector("#form-login");
const loginMensaje = document.querySelector("#login-mensaje");

const cuerpoProductos = document.querySelector("#cuerpo-productos");
const btnRecargar = document.querySelector("#btn-recargar");
const btnAgregar = document.querySelector("#btn-agregar");
const tablaMensaje = document.querySelector("#tabla-mensaje");

const panelFormulario = document.querySelector("#panel-formulario");
const tituloFormulario = document.querySelector("#titulo-formulario");
const formProducto = document.querySelector("#form-producto");
const btnGuardar = document.querySelector("#btn-guardar");
const btnCancelar = document.querySelector("#btn-cancelar");
const productoMensaje = document.querySelector("#producto-mensaje");

const campoNombre = document.querySelector("#producto-nombre");
const campoPrecio = document.querySelector("#producto-precio");
const campoStock = document.querySelector("#producto-stock");

let token = localStorage.getItem("token") ?? "";
let rol = localStorage.getItem("rol") ?? "";
let productosActuales = [];
let productoEnEdicion = null;

function decodificarToken(valor) {
  try {
    const base64 = valor.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(base64 + relleno));
  } catch {
    return null;
  }
}

function limpiarSesion() {
  token = "";
  rol = "";
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
}

function actualizarVistaSesion() {
  const payload = token ? decodificarToken(token) : null;
  const vencido = !payload || !payload.exp || payload.exp * 1000 <= Date.now();

  if (token && vencido) {
    limpiarSesion();
  } else if (payload?.rol) {
    rol = payload.rol;
    localStorage.setItem("rol", rol);
  }

  const haySesion = Boolean(token);
  panelLogin.classList.toggle("oculto", haySesion);
  btnSalir.classList.toggle("oculto", !haySesion);
  sesionInfo.textContent = haySesion ? `Sesión: ${rol}` : "Sin sesión";

  if (!haySesion) {
    panelFormulario.classList.add("oculto");
    productoEnEdicion = null;
  }
}

function mostrarMensaje(elemento, texto, tipo = "") {
  elemento.textContent = texto;
  elemento.className = `mensaje ${tipo}`.trim();
}

function formatearPrecio(precio) {
  return `$${Number(precio).toLocaleString("es-CO")}`;
}

function crearCelda(texto, className = "") {
  const celda = document.createElement("td");
  if (className) {
    celda.className = className;
  }
  celda.textContent = texto;
  return celda;
}

function crearAcciones(producto) {
  const celda = document.createElement("td");
  celda.className = "col-acciones";

  if (!token) {
    const aviso = document.createElement("span");
    aviso.className = "texto-suave";
    aviso.textContent = "Inicia sesión";
    celda.append(aviso);
    return celda;
  }

  const acciones = document.createElement("div");
  acciones.className = "acciones";

  const btnEditar = document.createElement("button");
  btnEditar.type = "button";
  btnEditar.className = "boton boton-pequeno";
  btnEditar.textContent = "Editar";
  btnEditar.dataset.accion = "editar";
  btnEditar.dataset.id = producto.id;
  acciones.append(btnEditar);

  if (rol === "admin") {
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "boton peligro boton-pequeno";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.dataset.accion = "eliminar";
    btnEliminar.dataset.id = producto.id;
    acciones.append(btnEliminar);
  }

  celda.append(acciones);
  return celda;
}

function renderizarProductos(productos) {
  cuerpoProductos.replaceChildren();

  if (productos.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.className = "vacio";
    celda.textContent = "No hay productos todavía.";
    fila.append(celda);
    cuerpoProductos.append(fila);
    return;
  }

  for (const producto of productos) {
    const fila = document.createElement("tr");
    fila.append(crearCelda(producto.id));
    fila.append(crearCelda(producto.nombre));
    fila.append(crearCelda(formatearPrecio(producto.precio), "numero"));
    fila.append(crearCelda(producto.stock, "numero"));
    fila.append(crearAcciones(producto));
    cuerpoProductos.append(fila);
  }
}

async function cargarProductos() {
  try {
    productosActuales = await getProductos();
    renderizarProductos(productosActuales);
  } catch (error) {
    productosActuales = [];
    cuerpoProductos.replaceChildren();
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.className = "vacio";
    celda.textContent = `No se pudieron cargar los productos: ${error.message}`;
    fila.append(celda);
    cuerpoProductos.append(fila);
  }
}

function mostrarFormulario(producto = null) {
  if (!token) {
    mostrarMensaje(
      tablaMensaje,
      "Inicia sesión para agregar o editar productos.",
      "error"
    );
    panelLogin.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  productoEnEdicion = producto;

  if (producto) {
    tituloFormulario.textContent = "Editar producto";
    btnGuardar.textContent = "Guardar cambios";
    campoNombre.value = producto.nombre;
    campoPrecio.value = producto.precio;
    campoStock.value = producto.stock;
  } else {
    tituloFormulario.textContent = "Agregar producto";
    btnGuardar.textContent = "Guardar producto";
    formProducto.reset();
    campoStock.value = "0";
  }

  mostrarMensaje(productoMensaje, "");
  mostrarMensaje(tablaMensaje, "");
  panelFormulario.classList.remove("oculto");
  panelFormulario.scrollIntoView({ behavior: "smooth", block: "start" });
  campoNombre.focus();
}

function ocultarFormulario() {
  productoEnEdicion = null;
  formProducto.reset();
  campoStock.value = "0";
  tituloFormulario.textContent = "Agregar producto";
  btnGuardar.textContent = "Guardar producto";
  mostrarMensaje(productoMensaje, "");
  panelFormulario.classList.add("oculto");
}

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  mostrarMensaje(loginMensaje, "Entrando...");

  try {
    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;
    const datos = await login(email, password);
    const payload = decodificarToken(datos.token);

    token = datos.token;
    rol = payload?.rol ?? "usuario";
    localStorage.setItem("token", token);
    localStorage.setItem("rol", rol);

    formLogin.reset();
    mostrarMensaje(loginMensaje, "");
    mostrarMensaje(tablaMensaje, "");
    actualizarVistaSesion();
    await cargarProductos();
  } catch (error) {
    mostrarMensaje(loginMensaje, error.message, "error");
  }
});

formProducto.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!token) {
    mostrarMensaje(tablaMensaje, "Inicia sesión para guardar productos.", "error");
    return;
  }

  mostrarMensaje(productoMensaje, "Guardando...");

  const datos = {
    nombre: campoNombre.value.trim(),
    precio: Number(campoPrecio.value),
    stock: Number(campoStock.value),
  };

  try {
    const editando = Boolean(productoEnEdicion);
    let mensaje;

    if (editando) {
      await actualizarProducto(productoEnEdicion.id, datos, token);
      mensaje = "Producto actualizado correctamente.";
    } else {
      await crearProducto(datos, token);
      mensaje = "Producto creado correctamente.";
    }

    await cargarProductos();
    ocultarFormulario();
    mostrarMensaje(tablaMensaje, mensaje, "ok");
  } catch (error) {
    if (error.status === 401) {
      limpiarSesion();
      actualizarVistaSesion();
      mostrarMensaje(
        tablaMensaje,
        "Tu sesión venció. Inicia sesión de nuevo.",
        "error"
      );
      await cargarProductos();
    } else {
      mostrarMensaje(productoMensaje, error.message, "error");
    }
  }
});

cuerpoProductos.addEventListener("click", async (event) => {
  const boton = event.target.closest("button[data-accion]");

  if (!boton) {
    return;
  }

  const producto = productosActuales.find(
    (item) => item.id === Number(boton.dataset.id)
  );

  if (!producto) {
    return;
  }

  if (boton.dataset.accion === "editar") {
    mostrarFormulario(producto);
    return;
  }

  if (boton.dataset.accion !== "eliminar") {
    return;
  }

  if (!token) {
    mostrarMensaje(
      tablaMensaje,
      "Inicia sesión para eliminar productos.",
      "error"
    );
    return;
  }

  if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) {
    return;
  }

  try {
    await eliminarProducto(producto.id, token);

    if (productoEnEdicion?.id === producto.id) {
      ocultarFormulario();
    }

    await cargarProductos();
    mostrarMensaje(tablaMensaje, "Producto eliminado correctamente.", "ok");
  } catch (error) {
    if (error.status === 401) {
      limpiarSesion();
      actualizarVistaSesion();
      mostrarMensaje(
        tablaMensaje,
        "Tu sesión venció. Inicia sesión de nuevo.",
        "error"
      );
      await cargarProductos();
    } else {
      mostrarMensaje(tablaMensaje, error.message, "error");
    }
  }
});

btnAgregar.addEventListener("click", () => mostrarFormulario(null));
btnCancelar.addEventListener("click", ocultarFormulario);

btnSalir.addEventListener("click", async () => {
  limpiarSesion();
  actualizarVistaSesion();
  ocultarFormulario();
  mostrarMensaje(loginMensaje, "Sesión cerrada.");
  mostrarMensaje(tablaMensaje, "");
  await cargarProductos();
});

btnRecargar.addEventListener("click", () => {
  mostrarMensaje(tablaMensaje, "");
  cargarProductos();
});

actualizarVistaSesion();
cargarProductos();