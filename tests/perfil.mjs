// perfil.mjs · Valores esperados de la ficha de diseño.
// Es el ÚNICO sitio donde se escriben: los tests los leen de aquí.
// Si cambia la ficha (por ejemplo, el color de acento), solo se cambia este fichero.

export const PERFIL = {
  nombre: 'Miguel Re Ibarra',
  titulo: 'Miguel Re Ibarra · Página personal',
  usuarioGithub: 'Miguelre-22',
  email: '4075291@alu.murciaeduca.es',

  minimoProyectos: 3,
  minimoHabilidades: 6,

  // Secciones obligatorias de index.html (valor del atributo id)
  secciones: ['sobre-mi', 'formacion', 'habilidades', 'contacto'],

  // Paleta: nombre de la variable CSS → valor hexadecimal exacto
  paleta: {
    '--color-primario': '#1E3A5F',
    '--color-secundario': '#2F6F7E',
    '--color-fondo': '#F7F5F0',
    '--color-texto': '#1F2328',
    '--color-acento': '#6D28D9',
  },

  fuenteTitulos: 'Georgia',
  fuenteTexto: 'system-ui',
  puntoRuptura: '768px',
  modoOscuro: false,
};
