// main.js · se carga con "defer", así que el HTML ya está listo cuando se ejecuta.

// 1. Escribe el año actual en el pie de página.
const anio = document.getElementById('anio');
if (anio) {
  anio.textContent = String(new Date().getFullYear());
}

// 2. Botón "Volver arriba": desplaza la página al principio.
//    Si el usuario ha pedido reducir el movimiento, el salto es instantáneo.
const botonArriba = document.getElementById('volver-arriba');
if (botonArriba) {
  botonArriba.addEventListener('click', () => {
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducirMovimiento ? 'auto' : 'smooth' });
  });
}
