# Página personal de Miguel Re Ibarra

Página personal estática (HTML, CSS y JavaScript) con tests automáticos y despliegue en GitHub Pages mediante GitHub Actions.

**Web publicada:** https://Miguelre-22.github.io/pagina-personal/

## Cómo ejecutar

Requisitos: Node.js 22 (22.22 o superior) y npm.

```bash
# Instalar las dependencias exactas del package-lock.json
npm ci

# Validar el HTML y ejecutar los tests
npm test

# Servir la web en http://localhost:8080
npm start
```

## Estructura

- `site/`: la web que se publica (lo único que ve el público).
- `tests/`: tests con `node:test`; los valores esperados están en `tests/perfil.mjs`.
- `.github/workflows/pages.yml`: pipeline que ejecuta los tests y, si pasan en `main`, despliega `site/` en GitHub Pages.
