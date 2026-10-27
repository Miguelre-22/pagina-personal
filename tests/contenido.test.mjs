// contenido.test.mjs · Comprueba el HTML de cada página contra la ficha (PERFIL).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PERFIL } from './perfil.mjs';
import {
  leerSite,
  etiquetas,
  atributo,
  contarEtiquetas,
  bloques,
  bloquePorId,
  bloquesPorClase,
  texto,
  urls,
  esExterno,
  esInterno,
  existeEnlaceRelativo,
} from './utilidades.mjs';

const PAGINAS = ['index.html', 'proyectos.html'];

// ---------- Comprobaciones comunes a todas las páginas ----------
for (const pagina of PAGINAS) {
  describe(`Contenido común de ${pagina}`, () => {
    const html = leerSite(pagina);

    test('el documento está en español (lang="es")', () => {
      const etiquetaHtml = etiquetas(html, 'html')[0] ?? '';
      assert.equal(atributo(etiquetaHtml, 'lang'), 'es', `${pagina}: falta lang="es" en <html>`);
    });

    test('tiene meta viewport y meta description de más de 20 caracteres', () => {
      const metas = etiquetas(html, 'meta');
      const viewport = metas.find((m) => atributo(m, 'name') === 'viewport');
      const descripcion = metas.find((m) => atributo(m, 'name') === 'description');
      assert.ok(viewport, `${pagina}: falta <meta name="viewport">`);
      assert.ok(descripcion, `${pagina}: falta <meta name="description">`);
      assert.ok(
        (atributo(descripcion, 'content') ?? '').length > 20,
        `${pagina}: la meta description debe tener más de 20 caracteres`,
      );
    });

    test('tiene un único h1 que contiene el nombre', () => {
      const h1 = bloques(html, 'h1');
      assert.equal(h1.length, 1, `${pagina}: debe haber exactamente un <h1> y hay ${h1.length}`);
      assert.ok(
        texto(h1[0]).includes(PERFIL.nombre),
        `${pagina}: el <h1> debe contener el nombre "${PERFIL.nombre}"`,
      );
    });

    test('tiene header, nav, main y footer', () => {
      for (const elemento of ['header', 'nav', 'main', 'footer']) {
        assert.ok(contarEtiquetas(html, elemento) >= 1, `${pagina}: falta el elemento <${elemento}>`);
      }
    });

    test('toda imagen tiene un alt de 3 o más caracteres', () => {
      for (const img of etiquetas(html, 'img')) {
        const alt = atributo(img, 'alt');
        assert.ok(
          alt !== null && alt.trim().length >= 3,
          `${pagina}: la imagen ${atributo(img, 'src')} necesita un alt de al menos 3 caracteres`,
        );
      }
    });

    test('ningún href ni src empieza por "/" (rutas relativas)', () => {
      for (const url of urls(html)) {
        assert.ok(
          !url.startsWith('/') || url.startsWith('//'),
          `${pagina}: la ruta "${url}" empieza por "/"; debe ser relativa porque la web se publica en /pagina-personal/`,
        );
      }
    });

    test('todo enlace interno apunta a un fichero existente', () => {
      for (const url of urls(html).filter(esInterno)) {
        assert.ok(
          existeEnlaceRelativo(pagina, url),
          `${pagina}: el enlace "${url}" apunta a un fichero que no existe en site/`,
        );
      }
    });
  });
}

// ---------- index.html ----------
describe('Contenido de index.html', () => {
  const html = leerSite('index.html');

  test('el <title> es el de la ficha', () => {
    const titulo = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    assert.equal(titulo, PERFIL.titulo, `index.html: el <title> debe ser "${PERFIL.titulo}"`);
  });

  for (const id of PERFIL.secciones) {
    test(`existe la sección #${id} con su h2`, () => {
      const seccion = bloquePorId(html, 'section', id);
      assert.ok(seccion, `index.html: falta <section id="${id}">`);
      assert.ok(contarEtiquetas(seccion, 'h2') >= 1, `index.html: la sección #${id} no tiene <h2>`);
    });
  }

  test(`#habilidades tiene al menos ${PERFIL.minimoHabilidades} habilidades`, () => {
    const seccion = bloquePorId(html, 'section', 'habilidades') ?? '';
    const n = contarEtiquetas(seccion, 'li');
    assert.ok(
      n >= PERFIL.minimoHabilidades,
      `index.html: #habilidades tiene ${n} <li> y necesita al menos ${PERFIL.minimoHabilidades}`,
    );
  });

  test('#contacto tiene el mailto con el correo y el enlace a GitHub', () => {
    const seccion = bloquePorId(html, 'section', 'contacto') ?? '';
    const hrefs = etiquetas(seccion, 'a').map((a) => atributo(a, 'href'));
    assert.ok(
      hrefs.includes(`mailto:${PERFIL.email}`),
      `index.html: #contacto debe tener un enlace mailto:${PERFIL.email}`,
    );
    const github = `https://github.com/${PERFIL.usuarioGithub}`;
    assert.ok(
      hrefs.some((h) => h?.replace(/\/$/, '') === github),
      `index.html: #contacto debe tener un enlace a ${github}`,
    );
  });
});

// ---------- proyectos.html ----------
describe('Contenido de proyectos.html', () => {
  const html = leerSite('proyectos.html');
  const proyectos = bloquesPorClase(html, 'article', 'proyecto');

  test(`hay al menos ${PERFIL.minimoProyectos} proyectos (article.proyecto)`, () => {
    assert.ok(
      proyectos.length >= PERFIL.minimoProyectos,
      `proyectos.html: hay ${proyectos.length} article.proyecto y se necesitan al menos ${PERFIL.minimoProyectos}`,
    );
  });

  test('cada proyecto tiene título (h2 o h3), descripción (p) y ul.tecnologias', () => {
    proyectos.forEach((p, i) => {
      const n = i + 1;
      assert.ok(
        contarEtiquetas(p, 'h2') + contarEtiquetas(p, 'h3') >= 1,
        `proyectos.html: el proyecto ${n} no tiene título <h2> o <h3>`,
      );
      assert.ok(contarEtiquetas(p, 'p') >= 1, `proyectos.html: el proyecto ${n} no tiene descripción <p>`);
      assert.ok(
        bloquesPorClase(p, 'ul', 'tecnologias').length >= 1,
        `proyectos.html: el proyecto ${n} no tiene <ul class="tecnologias">`,
      );
    });
  });

  test('los enlaces externos llevan target="_blank" y rel con noopener', () => {
    for (const a of etiquetas(html, 'a')) {
      const href = atributo(a, 'href') ?? '';
      if (!esExterno(href)) continue;
      assert.equal(atributo(a, 'target'), '_blank', `proyectos.html: el enlace ${href} necesita target="_blank"`);
      assert.ok(
        (atributo(a, 'rel') ?? '').split(/\s+/).includes('noopener'),
        `proyectos.html: el enlace ${href} necesita rel="noopener noreferrer"`,
      );
    }
  });
});
