const formulario = document.getElementById("formulario");
const tabla = document.querySelector("#tabla tbody");

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", cargarDatos);

formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value,
    categoria: document.getElementById("categoria").value,
    precio: document.getElementById("precio").value,
    cantidad: document.getElementById("cantidad").value,
    observaciones: document.getElementById("observaciones").value,
  };

  agregarFila(producto);
  guardarProducto(producto);
  formulario.reset();
});

function agregarFila(producto) {
  const fila = tabla.insertRow();
  fila.innerHTML = `
    <td>${producto.nombre}</td>
    <td>${producto.categoria}</td>
    <td>${producto.precio}</td>
    <td>${producto.cantidad}</td>
    <td>${producto.observaciones}</td>
    <td><button onclick="eliminarFila(this, '${producto.nombre}')">🗑️</button></td>
  `;
}

function guardarProducto(producto) {
  let productos = JSON.parse(localStorage.getItem("inventario")) || [];
  productos.push(producto);
  localStorage.setItem("inventario", JSON.stringify(productos));
}

function cargarDatos() {
  const productos = JSON.parse(localStorage.getItem("inventario")) || [];
  productos.forEach(agregarFila);
}

function eliminarFila(boton, nombre) {
  const fila = boton.parentNode.parentNode;
  fila.remove();

  let productos = JSON.parse(localStorage.getItem("inventario")) || [];
  productos = productos.filter(item => item.nombre !== nombre);
  localStorage.setItem("inventario", JSON.stringify(productos));
}

function exportar() {
  const productos = localStorage.getItem("inventario");
  const blob = new Blob([productos], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = "inventario.json";
  enlace.click();
}

async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Base64 completo de tu imagen
  const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAgCAYAAADkRlkIAAAACXBIWXMAAAsTAAALEwEAmpwYAAAACXZwQWcAAAAkAAAAJABIgaFAAAAJcEhZcwAAHsQAAB7EAZUrDhsAAAFGSURBVEjH7ZbNKgVBFIXPIMF24OAPQRDYWFhYGMzB3YWFiEKPgOKT2IFQYWEVhaGq5ANq5JlgUGFMF7UQmWFp0Ekv98PlnGxg+3LDfv/fMzZ77Hs5LTTXLhFu9QOeZmKa+8EcTdwBZUwHK1AO3gTXTTXotI8R+rdnUB17wJ5JUZAp7QYqz1bgz5TP4vI9Qndyn/PLfwH6KhFUR8nM84sQpmvAjmiCRP7IuV7wJcg3A9EGHTAdGwAnUFUVge9ROFcbqBVj4L3+KtWBaNYHlEO8GeLYvPGoOsHoS4hcO+NBrFStCMXnUvCNzhhCzhy3YYoB1ZxHVEQpP1LLKrbUVUfIP2ekPqkJDIZvUXr6pXxPq4yY72VsgGzDoGuSB3BzRKMEpgdmchDeJFOB2lZSBuHXpMDTEe3c2w0msW2TqS3F9HLDaqc3hKnl8O+Aw+AkM8HLTZ1FTgAAAABJRU5ErkJggg==";

  // Agregar el logo
  doc.addImage(logoBase64, 'PNG', 150, 10, 40, 40);

  // Título principal
  doc.setFontSize(18);
  doc.text("Reporte de Inventario de Bisutería", 14, 20);

  // Fecha del reporte
  const fecha = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 14, 30);

  const productos = JSON.parse(localStorage.getItem("inventario")) || [];

  const filas = productos.map(prod => [
    prod.nombre,
    prod.categoria,
    prod.precio,
    prod.cantidad,
    prod.observaciones
  ]);

  doc.autoTable({
    startY: 50,
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
