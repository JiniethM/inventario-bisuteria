const formulario = document.getElementById("formulario");
const tabla = document.querySelector("#tabla tbody");
const busqueda = document.getElementById("busqueda");
const idInput = document.getElementById("producto-id");

const costoInput = document.getElementById("costo");
const precioInput = document.getElementById("precio");
const gananciaInput = document.getElementById("ganancia");

document.addEventListener("DOMContentLoaded", () => {
  cargarDatos();
  calcularGanancia();
});

busqueda.addEventListener("input", filtrarTabla);
costoInput.addEventListener("input", calcularGanancia);
precioInput.addEventListener("input", calcularGanancia);

formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const costo = parseFloat(costoInput.value);
  const precio = parseFloat(precioInput.value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const observaciones = document.getElementById("observaciones").value.trim();

  if (!nombre || !categoria || isNaN(costo) || isNaN(precio) || isNaN(cantidad) || costo < 0 || precio < 0 || cantidad < 0) {
    alert("Por favor completa correctamente todos los campos.");
    return;
  }

  const producto = {
    id: idInput.value ? parseInt(idInput.value) : Date.now(),
    nombre,
    categoria,
    costo,
    precio,
    cantidad,
    observaciones,
  };

  if (idInput.value) {
    actualizarProducto(producto);
  } else {
    guardarProducto(producto);
  }

  limpiarFormulario();
  cargarDatos();
});

function calcularGanancia() {
  const costo = parseFloat(costoInput.value) || 0;
  const precio = parseFloat(precioInput.value) || 0;
  const ganancia = precio - costo;
  gananciaInput.value = ganancia.toFixed(2);
}

function agregarFila(producto) {
  const ganancia = producto.precio - producto.costo;
  const fila = tabla.insertRow();
  fila.innerHTML = `
    <td>${producto.nombre}</td>
    <td>${producto.categoria}</td>
    <td>${producto.costo.toFixed(2)}</td>
    <td>${producto.precio.toFixed(2)}</td>
    <td>${ganancia.toFixed(2)}</td>
    <td>${producto.cantidad}</td>
    <td>${producto.observaciones}</td>
    <td>
      <button onclick="editarProducto(${producto.id})">✏️</button>
      <button onclick="eliminarProducto(${producto.id})">🗑️</button>
    </td>
  `;
}

function guardarProducto(producto) {
  let productos = obtenerProductos();
  productos.push(producto);
  localStorage.setItem("inventario", JSON.stringify(productos));
}

function actualizarProducto(productoActualizado) {
  let productos = obtenerProductos();
  productos = productos.map(p => p.id === productoActualizado.id ? productoActualizado : p);
  localStorage.setItem("inventario", JSON.stringify(productos));
}

function cargarDatos() {
  tabla.innerHTML = "";
  const productos = obtenerProductos();
  productos.forEach(agregarFila);
}

function eliminarProducto(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    let productos = obtenerProductos();
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem("inventario", JSON.stringify(productos));
    cargarDatos();
  }
}

function editarProducto(id) {
  const productos = obtenerProductos();
  const producto = productos.find(p => p.id === id);

  if (producto) {
    idInput.value = producto.id;
    document.getElementById("nombre").value = producto.nombre;
    document.getElementById("categoria").value = producto.categoria;
    costoInput.value = producto.costo;
    precioInput.value = producto.precio;
    calcularGanancia();
    document.getElementById("cantidad").value = producto.cantidad;
    document.getElementById("observaciones").value = producto.observaciones;
  }
}

function obtenerProductos() {
  return JSON.parse(localStorage.getItem("inventario")) || [];
}

function limpiarFormulario() {
  formulario.reset();
  idInput.value = "";
  calcularGanancia();
}

function filtrarTabla() {
  const texto = busqueda.value.toLowerCase();
  const filas = tabla.getElementsByTagName("tr");

  Array.from(filas).forEach(fila => {
    const celdas = fila.getElementsByTagName("td");
    let coincide = false;

    for (let i = 0; i < celdas.length - 1; i++) {
      if (celdas[i].innerText.toLowerCase().includes(texto)) {
        coincide = true;
        break;
      }
    }
    fila.style.display = coincide ? "" : "none";
  });
}

async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte de Inventario de Bisutería", 14, 20);

  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 14, 30);

  const productos = obtenerProductos();

  const filas = productos.map(prod => [
    prod.nombre,
    prod.categoria,
    prod.costo.toFixed(2),
    prod.precio.toFixed(2),
    (prod.precio - prod.costo).toFixed(2),
    prod.cantidad,
    prod.observaciones
  ]);

  doc.autoTable({
    startY: 40,
    head: [['Nombre', 'Categoría', 'Costo', 'Precio', 'Ganancia', 'Cantidad', 'Observaciones']],
    body: filas,
    theme: 'grid',
    headStyles: { fillColor: [140, 0, 50] },
    margin: { left: 14, right: 14 }
  });

  doc.setFontSize(10);
  doc.text(`Total de productos: ${productos.length}`, 14, 290);
  doc.save("inventario-bisuteria.pdf");
}

function exportar() {
  const productos = obtenerProductos();
  const blob = new Blob([JSON.stringify(productos)], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = "inventario.json";
  enlace.click();
}
