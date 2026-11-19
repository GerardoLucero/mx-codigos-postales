#!/usr/bin/env node
/**
 * Convierte el Catalogo Nacional de Codigos Postales de Correos de Mexico (formato TXT,
 * separado por |, codificacion ISO-8859-1) al formato compacto que usa la libreria.
 *
 * Uso:
 *   1. Descargar el TXT en https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
 *   2. node scripts/actualizar-catalogo.mjs ruta/CPdescarga.txt AAAA-MM-DD
 *      (la fecha es la de publicacion del catalogo)
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , rutaTxt, fecha] = process.argv;
if (!rutaTxt || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) {
  console.error('Uso: node scripts/actualizar-catalogo.mjs ruta/CPdescarga.txt AAAA-MM-DD');
  process.exit(1);
}

const lineas = readFileSync(rutaTxt, 'latin1').split(/\r?\n/).filter(Boolean);
const aviso = lineas[0];
const encabezado = lineas[1].split('|');
const ESPERADO = ['d_codigo', 'd_asenta', 'd_tipo_asenta', 'D_mnpio', 'd_estado', 'd_ciudad', 'd_CP',
  'c_estado', 'c_oficina', 'c_CP', 'c_tipo_asenta', 'c_mnpio', 'id_asenta_cpcons', 'd_zona', 'c_cve_ciudad'];
if (encabezado.join('|') !== ESPERADO.join('|')) {
  console.error('El encabezado del archivo no coincide con el formato conocido:\n' + encabezado.join('|'));
  process.exit(1);
}

const indice = (lista, mapa, clave, valor = clave) => {
  if (!mapa.has(clave)) {
    mapa.set(clave, lista.length);
    lista.push(valor);
  }
  return mapa.get(clave);
};

const estados = []; const mapaEstados = new Map();
const municipios = []; const mapaMunicipios = new Map();
const ciudades = []; const mapaCiudades = new Map();
const tipos = []; const mapaTipos = new Map();
const zonas = []; const mapaZonas = new Map();
const porCP = new Map();

for (const linea of lineas.slice(2)) {
  const c = linea.split('|');
  if (c.length !== ESPERADO.length) {
    console.error('Fila con numero de campos inesperado: ' + linea);
    process.exit(1);
  }
  const [cp, asentamiento, tipo, municipio, estado, ciudad, , cEstado, , , , cMunicipio, , zona] = c;
  if (!/^\d{5}$/.test(cp)) {
    console.error('Codigo postal invalido: ' + cp);
    process.exit(1);
  }
  const iEstado = indice(estados, mapaEstados, cEstado, [cEstado, estado]);
  const iMunicipio = indice(municipios, mapaMunicipios, `${cEstado}-${cMunicipio}`, [iEstado, cMunicipio, municipio]);
  const iCiudad = ciudad ? indice(ciudades, mapaCiudades, ciudad) : -1;
  const iTipo = indice(tipos, mapaTipos, tipo);
  const iZona = indice(zonas, mapaZonas, zona);

  if (!porCP.has(cp)) porCP.set(cp, { municipio: iMunicipio, asentamientos: [] });
  const registro = porCP.get(cp);
  if (registro.municipio !== iMunicipio) {
    console.error(`El CP ${cp} aparece en mas de un municipio; el formato compacto no lo contempla`);
    process.exit(1);
  }
  registro.asentamientos.push([asentamiento, iTipo, iZona, iCiudad]);
}

const codigos = [...porCP.keys()].sort();
const catalogo = {
  fuente: 'Catalogo Nacional de Codigos Postales, Correos de Mexico (SEPOMEX)',
  url: 'https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx',
  fecha,
  aviso,
  estados: estados.sort((a, b) => a[0].localeCompare(b[0])),
  municipios,
  ciudades,
  tipos,
  zonas,
  // Cada entrada: [codigoPostal, indiceMunicipio, [[asentamiento, indiceTipo, indiceZona, indiceCiudad o -1], ...]]
  codigos: codigos.map((cp) => [cp, porCP.get(cp).municipio, porCP.get(cp).asentamientos])
};

// Los municipios guardan el indice de estado previo al orden; se reasigna al orden final.
const ordenEstados = new Map(catalogo.estados.map(([clave], i) => [clave, i]));
const estadosOriginales = [...mapaEstados.entries()].sort((a, b) => a[1] - b[1]).map(([clave]) => clave);
catalogo.municipios = municipios.map(([iEstado, clave, nombre]) => [ordenEstados.get(estadosOriginales[iEstado]), clave, nombre]);

writeFileSync(new URL('../data/catalogo.json', import.meta.url), JSON.stringify(catalogo));
const total = codigos.reduce((n, cp) => n + porCP.get(cp).asentamientos.length, 0);
console.log(`Catalogo ${fecha}: ${codigos.length} codigos postales, ${total} asentamientos, ${catalogo.municipios.length} municipios, ${catalogo.estados.length} estados`);
