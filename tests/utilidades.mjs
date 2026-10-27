// utilidades.mjs · Funciones auxiliares para los tests (sin dependencias externas).
// Analizan el HTML con expresiones regulares sencillas: suficiente para una web
// pequeña y escrita a mano como esta.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Carpeta raíz del proyecto (la que contiene site/ y tests/)
export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = join(RAIZ, 'site');

/** Lee un fichero indicando su ruta desde la raíz del proyecto. */
export function leerFichero(rutaDesdeRaiz) {
  return readFileSync(join(RAIZ, rutaDesdeRaiz), 'utf8');
}

/** Lee un fichero de la carpeta site/. */
export function leerSite(rutaDesdeSite) {
  return readFileSync(join(SITE, rutaDesdeSite), 'utf8');
}

/** Indica si existe un fichero (no carpeta) dentro del proyecto. */
export function existeEnProyecto(rutaDesdeRaiz) {
  const ruta = join(RAIZ, rutaDesdeRaiz);
  return existsSync(ruta) && statSync(ruta).isFile();
}

/** Devuelve todas las etiquetas de apertura de un tipo, p. ej. etiquetas(html, 'img'). */
export function etiquetas(html, nombre) {
  const re = new RegExp(`<${nombre}\\b[^>]*>`, 'gi');
  return html.match(re) ?? [];
}

/** Extrae el valor de un atributo de una etiqueta de apertura (o null si no lo tiene). */
export function atributo(etiqueta, nombre) {
  const re = new RegExp(`(?:^|\\s)${nombre}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const m = etiqueta.match(re);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? '';
}

/** Cuenta cuántas veces aparece una etiqueta de apertura. */
export function contarEtiquetas(html, nombre) {
  return etiquetas(html, nombre).length;
}

/**
 * Devuelve el HTML completo (apertura, contenido y cierre) de cada elemento
 * <etiqueta> cuya etiqueta de apertura cumple la condición. Respeta el anidamiento.
 */
export function bloques(html, nombre, condicion = () => true) {
  const re = new RegExp(`<(/?)${nombre}\\b[^>]*>`, 'gi');
  const pila = [];
  const resultado = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1] === '') {
      pila.push({ inicio: m.index, coincide: condicion(m[0]) });
    } else {
      const abierto = pila.pop();
      if (abierto?.coincide) {
        resultado.push({ inicio: abierto.inicio, html: html.slice(abierto.inicio, re.lastIndex) });
      }
    }
  }
  return resultado.sort((a, b) => a.inicio - b.inicio).map((b) => b.html);
}

/** Devuelve el bloque <etiqueta id="..."> ... </etiqueta> o null si no existe. */
export function bloquePorId(html, nombre, id) {
  return bloques(html, nombre, (t) => atributo(t, 'id') === id)[0] ?? null;
}

/** Devuelve los bloques <etiqueta class="... clase ..."> ... </etiqueta>. */
export function bloquesPorClase(html, nombre, clase) {
  return bloques(html, nombre, (t) => (atributo(t, 'class') ?? '').split(/\s+/).includes(clase));
}

/** Quita las etiquetas y deja solo el texto. */
export function texto(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Todas las URL de href y src de una página. */
export function urls(html) {
  const lista = [];
  for (const t of html.match(/<[a-z][^>]*>/gi) ?? []) {
    for (const nombre of ['href', 'src']) {
      const valor = atributo(t, nombre);
      if (valor !== null) lista.push(valor);
    }
  }
  return lista;
}

/** Enlace externo: empieza por http://, https:// o //. */
export function esExterno(url) {
  return /^(https?:)?\/\//i.test(url);
}

/** Enlace interno: apunta a un fichero de la propia web (no externo, ni mailto, ni solo #ancla). */
export function esInterno(url) {
  return url !== '' && !esExterno(url) && !url.startsWith('#') && !/^(mailto|tel|javascript|data):/i.test(url);
}

/** Comprueba si el fichero al que apunta un enlace relativo existe dentro de site/. */
export function existeEnlaceRelativo(paginaOrigen, url) {
  const sinAncla = decodeURI(url.split('#')[0].split('?')[0]);
  if (sinAncla === '') return true; // enlace a la propia página
  const destino = resolve(dirname(join(SITE, paginaOrigen)), sinAncla);
  if (!destino.startsWith(SITE)) return false; // se sale de site/
  return existsSync(destino) && statSync(destino).isFile();
}
