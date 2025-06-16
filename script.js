const formulario = document.getElementById("formulario");
const tabla = document.querySelector("#tabla tbody");
const busqueda = document.getElementById("busqueda");
const idInput = document.getElementById("producto-id");

document.addEventListener("DOMContentLoaded", cargarDatos);
busqueda.addEventListener("input", filtrarTabla);

formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  // VALIDACIÓN
  const nombre = document.getElementById("nombre").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const observaciones = document.getElementById("observaciones").value.trim();

  if (!nombre || !categoria || isNaN(precio) || isNaN(cantidad) || precio < 0 || cantidad < 0) {
    alert("Por favor completa correctamente todos los campos. Precio y cantidad deben ser positivos.");
    return;
  }

  const producto = {
    id: idInput.value ? parseInt(idInput.value) : Date.now(),
    nombre,
    categoria,
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

function agregarFila(producto) {
  const fila = tabla.insertRow();
  fila.innerHTML = `
    <td>${producto.nombre}</td>
    <td>${producto.categoria}</td>
    <td>${producto.precio}</td>
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
    document.getElementById("precio").value = producto.precio;
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
    prod.precio,
    prod.cantidad,
    prod.observaciones
  ]);

  doc.autoTable({
    startY: 40,
    head: [['Nombre', 'Categoría', 'Precio', 'Cantidad', 'Observaciones']],
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
