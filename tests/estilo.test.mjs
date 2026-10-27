// estilo.test.mjs · Comprueba que estilos.css respeta la ficha de diseño (PERFIL).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PERFIL } from './perfil.mjs';
import { leerSite } from './utilidades.mjs';

// Se quitan los comentarios para que no cuenten en las comprobaciones
const css = leerSite('css/estilos.css').replace(/\/\*[\s\S]*?\*\//g, '');

const bloqueRoot = css.match(/:root\s*\{([^}]*)\}/);
const dentroDeRoot = bloqueRoot?.[1] ?? '';
const fueraDeRoot = bloqueRoot ? css.replace(bloqueRoot[0], '') : css;

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('Hoja de estilos', () => {
  test('existe un bloque :root', () => {
    assert.ok(bloqueRoot, 'estilos.css: falta el bloque :root con las variables de la paleta');
  });

  for (const [variable, valor] of Object.entries(PERFIL.paleta)) {
    test(`:root define ${variable}: ${valor}`, () => {
      const re = new RegExp(`${escapar(variable)}\\s*:\\s*${escapar(valor)}\\s*;`, 'i');
      assert.match(dentroDeRoot, re, `estilos.css: :root debe definir "${variable}: ${valor};"`);
    });

    test(`el valor ${valor} no aparece fuera de :root`, () => {
      const re = new RegExp(`${escapar(valor)}(?![0-9a-f])`, 'i');
      assert.doesNotMatch(
        fueraDeRoot,
        re,
        `estilos.css: el color ${valor} está escrito a mano fuera de :root; usa var(${variable})`,
      );
    });
  }

  test('se usa var(--color-primario)', () => {
    assert.match(css, /var\(\s*--color-primario\s*\)/, 'estilos.css: no se usa var(--color-primario)');
  });

  test(`aparece la tipografía de títulos (${PERFIL.fuenteTitulos})`, () => {
    assert.ok(css.includes(PERFIL.fuenteTitulos), `estilos.css: no aparece la fuente ${PERFIL.fuenteTitulos}`);
  });

  test(`aparece la tipografía de texto (${PERFIL.fuenteTexto})`, () => {
    assert.ok(css.includes(PERFIL.fuenteTexto), `estilos.css: no aparece la fuente ${PERFIL.fuenteTexto}`);
  });

  test(`existe un @media con el punto de ruptura ${PERFIL.puntoRuptura}`, () => {
    const re = new RegExp(`@media[^{]*max-width\\s*:\\s*${escapar(PERFIL.puntoRuptura)}`, 'i');
    assert.match(css, re, `estilos.css: falta @media (max-width: ${PERFIL.puntoRuptura})`);
  });

  test(`modo oscuro ${PERFIL.modoOscuro ? 'presente' : 'ausente'} según la ficha`, () => {
    const tieneOscuro = /prefers-color-scheme\s*:\s*dark/i.test(css);
    assert.equal(
      tieneOscuro,
      PERFIL.modoOscuro,
      PERFIL.modoOscuro
        ? 'estilos.css: la ficha pide modo oscuro y falta @media (prefers-color-scheme: dark)'
        : 'estilos.css: la ficha no pide modo oscuro y hay un @media (prefers-color-scheme: dark)',
    );
  });
});
