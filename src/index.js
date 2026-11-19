/**
 * mx-codigos-postales
 *
 * Consulta el Catalogo Nacional de Codigos Postales de Correos de Mexico (SEPOMEX):
 * estado, municipio, ciudad y asentamientos (colonias, fraccionamientos, ejidos, ...) de cada CP.
 */
import catalogo from '../data/catalogo.json';

const ALIAS_ESTADOS = {
  CDMX: '09',
  DF: '09',
  'DISTRITO FEDERAL': '09',
  'CIUDAD DE MEXICO': '09',
  EDOMEX: '15',
  'ESTADO DE MEXICO': '15',
  MEXICO: '15',
  'COAHUILA': '05',
  'MICHOACAN': '16',
  'VERACRUZ': '30'
};

let indiceCP = null;
let indiceNombres = null;

/** Mayusculas, sin acentos ni dieresis y con espacios simples. */
function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function cpComoTexto(codigoPostal) {
  if (typeof codigoPostal === 'number' && Number.isInteger(codigoPostal)) {
    return String(codigoPostal).padStart(5, '0');
  }
  return typeof codigoPostal === 'string' ? codigoPostal.replace(/[\s-]/g, '') : '';
}

function obtenerIndiceCP() {
  if (!indiceCP) {
    indiceCP = new Map(catalogo.codigos.map((entrada) => [entrada[0], entrada]));
  }
  return indiceCP;
}

function estadoDe(indiceEstado) {
  const [clave, nombre] = catalogo.estados[indiceEstado];
  return { clave, nombre };
}

function municipioDe(indiceMunicipio) {
  const [indiceEstado, clave, nombre] = catalogo.municipios[indiceMunicipio];
  return { municipio: { clave, nombre }, estado: estadoDe(indiceEstado), indiceEstado };
}

function asentamientoDe([nombre, tipo, zona, ciudad]) {
  return {
    nombre,
    tipo: catalogo.tipos[tipo],
    zona: catalogo.zonas[zona],
    ciudad: ciudad >= 0 ? catalogo.ciudades[ciudad] : null
  };
}

/** Devuelve el indice del estado a partir de su clave INEGI ('09'), nombre o abreviatura comun. */
function indiceDeEstado(estado) {
  if (estado === undefined || estado === null || estado === '') return -1;
  const texto = typeof estado === 'number' ? String(estado).padStart(2, '0') : normalizar(estado);
  const clave = /^\d{1,2}$/.test(texto) ? texto.padStart(2, '0') : ALIAS_ESTADOS[texto];
  return catalogo.estados.findIndex(([c, nombre]) => c === clave || normalizar(nombre) === texto);
}

function estadoRequerido(estado) {
  const indice = indiceDeEstado(estado);
  if (indice < 0) throw new Error(`Estado no reconocido: "${estado}"`);
  return indice;
}

/**
 * Indica si el texto tiene forma de codigo postal mexicano (5 digitos).
 * No consulta el catalogo: para eso usar existeCodigoPostal.
 * @param {string | number} codigoPostal
 * @returns {boolean}
 */
export function validarCodigoPostal(codigoPostal) {
  return /^\d{5}$/.test(cpComoTexto(codigoPostal));
}

/**
 * Indica si el codigo postal existe en el catalogo de SEPOMEX.
 * @param {string | number} codigoPostal
 * @returns {boolean}
 */
export function existeCodigoPostal(codigoPostal) {
  return obtenerIndiceCP().has(cpComoTexto(codigoPostal));
}

/**
 * Consulta un codigo postal: estado, municipio, ciudades y asentamientos.
 * @param {string | number} codigoPostal
 * @returns {object | null}
 */
export function buscarCodigoPostal(codigoPostal) {
  const entrada = obtenerIndiceCP().get(cpComoTexto(codigoPostal));
  if (!entrada) return null;

  const [cp, indiceMunicipio, asentamientos] = entrada;
  const { municipio, estado } = municipioDe(indiceMunicipio);
  const lista = asentamientos.map(asentamientoDe);
  return {
    codigoPostal: cp,
    estado,
    municipio,
    ciudades: [...new Set(lista.map((a) => a.ciudad).filter(Boolean))],
    asentamientos: lista
  };
}

/**
 * Busca asentamientos (colonias, fraccionamientos, etc.) por nombre, sin importar acentos ni mayusculas.
 * Primero las coincidencias exactas, luego las que empiezan con el texto y al final las que lo contienen.
 * @param {string} texto
 * @param {{ estado?: string | number, municipio?: string, limite?: number }} [opciones]
 * @returns {Array<object>}
 */
export function buscarPorColonia(texto, opciones = {}) {
  const buscado = normalizar(texto || '');
  if (buscado.length < 2) throw new Error('Escribe al menos 2 caracteres para buscar');

  const { estado, municipio, limite = 50 } = opciones;
  const filtroEstado = estado === undefined ? -1 : estadoRequerido(estado);
  const filtroMunicipio = municipio ? normalizar(municipio) : null;

  if (!indiceNombres) {
    indiceNombres = catalogo.codigos.map(([, , asentamientos]) => asentamientos.map(([nombre]) => normalizar(nombre)));
  }

  const resultados = [];
  catalogo.codigos.forEach(([cp, indiceMunicipio, asentamientos], i) => {
    const datos = municipioDe(indiceMunicipio);
    if (filtroEstado >= 0 && datos.indiceEstado !== filtroEstado) return;
    if (filtroMunicipio && normalizar(datos.municipio.nombre) !== filtroMunicipio) return;

    indiceNombres[i].forEach((nombre, j) => {
      const posicion = nombre.indexOf(buscado);
      if (posicion < 0) return;
      const rango = nombre === buscado ? 0 : posicion === 0 ? 1 : 2;
      resultados.push({
        rango,
        resultado: {
          codigoPostal: cp,
          ...asentamientoDe(asentamientos[j]),
          municipio: datos.municipio,
          estado: datos.estado
        }
      });
    });
  });

  return resultados
    .sort((a, b) => a.rango - b.rango || a.resultado.codigoPostal.localeCompare(b.resultado.codigoPostal))
    .slice(0, limite)
    .map((r) => r.resultado);
}

/**
 * Codigos postales de un municipio. Como hay municipios con el mismo nombre en varios estados
 * (por ejemplo, Benito Juarez), devuelve un grupo por cada coincidencia; se puede filtrar por estado.
 * @param {string} municipio
 * @param {{ estado?: string | number }} [opciones]
 * @returns {Array<{ estado: object, municipio: object, codigosPostales: string[] }>}
 */
export function buscarPorMunicipio(municipio, opciones = {}) {
  const buscado = normalizar(municipio || '');
  const filtroEstado = opciones.estado === undefined ? -1 : estadoRequerido(opciones.estado);
  const grupos = new Map();

  for (const [cp, indiceMunicipio] of catalogo.codigos) {
    const datos = municipioDe(indiceMunicipio);
    if (normalizar(datos.municipio.nombre) !== buscado) continue;
    if (filtroEstado >= 0 && datos.indiceEstado !== filtroEstado) continue;
    if (!grupos.has(indiceMunicipio)) {
      grupos.set(indiceMunicipio, { estado: datos.estado, municipio: datos.municipio, codigosPostales: [] });
    }
    grupos.get(indiceMunicipio).codigosPostales.push(cp);
  }
  return [...grupos.values()];
}

/**
 * Codigos postales de un estado (por clave INEGI, nombre o abreviatura como CDMX o Edomex).
 * @param {string | number} estado
 * @returns {string[]}
 */
export function getCodigosPostalesPorEstado(estado) {
  const indice = estadoRequerido(estado);
  return catalogo.codigos
    .filter(([, indiceMunicipio]) => catalogo.municipios[indiceMunicipio][0] === indice)
    .map(([cp]) => cp);
}

/** Los 32 estados con su clave INEGI. */
export function obtenerEstados() {
  return catalogo.estados.map((_, i) => estadoDe(i));
}

/**
 * Municipios de un estado, con su clave INEGI.
 * @param {string | number} estado
 */
export function obtenerMunicipios(estado) {
  const indice = estadoRequerido(estado);
  return catalogo.municipios
    .filter(([indiceEstado]) => indiceEstado === indice)
    .map(([, clave, nombre]) => ({ clave, nombre }))
    .sort((a, b) => a.clave.localeCompare(b.clave));
}

/** Totales del catalogo incluido. */
export function getEstadisticas() {
  return {
    codigosPostales: catalogo.codigos.length,
    asentamientos: catalogo.codigos.reduce((n, [, , a]) => n + a.length, 0),
    municipios: catalogo.municipios.length,
    estados: catalogo.estados.length,
    fechaCatalogo: catalogo.fecha
  };
}

/** Fuente, fecha y aviso de uso del catalogo, tal como los publica Correos de Mexico. */
export function infoCatalogo() {
  return { fuente: catalogo.fuente, url: catalogo.url, fecha: catalogo.fecha, aviso: catalogo.aviso };
}

export default {
  validarCodigoPostal,
  existeCodigoPostal,
  buscarCodigoPostal,
  buscarPorColonia,
  buscarPorMunicipio,
  getCodigosPostalesPorEstado,
  obtenerEstados,
  obtenerMunicipios,
  getEstadisticas,
  infoCatalogo
};
