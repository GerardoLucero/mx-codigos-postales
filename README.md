# mx-codigos-postales

Consulta los códigos postales de México con el Catálogo Nacional de Códigos Postales de Correos de México (SEPOMEX): estado, municipio, ciudad y todos los asentamientos (colonias, fraccionamientos, pueblos, ejidos…) de cada código.

[![npm](https://img.shields.io/npm/v/mx-codigos-postales.svg)](https://www.npmjs.com/package/mx-codigos-postales)
[![CI](https://github.com/GerardoLucero/mx-codigos-postales/actions/workflows/ci.yml/badge.svg)](https://github.com/GerardoLucero/mx-codigos-postales/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

- Catálogo completo: 31,862 códigos postales, 159,488 asentamientos, 2,478 municipios, 32 estados.
- Funciona sin conexión: los datos van dentro del paquete y no se llama a ninguna API.
- Búsqueda sin importar acentos ni mayúsculas.
- Funciona con `import` y `require` en Node 20 o superior. Tipos de TypeScript incluidos.
- Sin dependencias. Cada versión se publica con [procedencia firmada](https://docs.npmjs.com/generating-provenance-statements).

## Instalación

```bash
npm install mx-codigos-postales
```

## Consultar un código postal

```js
import { buscarCodigoPostal } from 'mx-codigos-postales';
// o: const { buscarCodigoPostal } = require('mx-codigos-postales');

buscarCodigoPostal('06700');
// {
//   codigoPostal: '06700',
//   estado: { clave: '09', nombre: 'Ciudad de México' },
//   municipio: { clave: '015', nombre: 'Cuauhtémoc' },
//   ciudades: ['Ciudad de México'],
//   asentamientos: [
//     { nombre: 'Roma Norte', tipo: 'Colonia', zona: 'Urbano', ciudad: 'Ciudad de México' }
//   ]
// }

buscarCodigoPostal('00000'); // null
```

Las claves de estado y municipio son las del INEGI. Un código postal puede tener muchos asentamientos.

## Autocompletar una dirección

```js
import { buscarCodigoPostal } from 'mx-codigos-postales';

function alCapturarCP(cp) {
  const datos = buscarCodigoPostal(cp);
  if (!datos) return { error: 'El código postal no existe' };
  return {
    estado: datos.estado.nombre,
    municipio: datos.municipio.nombre,
    colonias: datos.asentamientos.map((a) => a.nombre)
  };
}
```

## Buscar colonias por nombre

```js
import { buscarPorColonia } from 'mx-codigos-postales';

buscarPorColonia('del valle', { estado: 'CDMX', limite: 3 });
// [
//   { codigoPostal: '03100', nombre: 'Del Valle Centro', municipio: { nombre: 'Benito Juárez', … }, … },
//   { codigoPostal: '03103', nombre: 'Del Valle Norte', … },
//   { codigoPostal: '03104', nombre: 'Del Valle Sur', … }
// ]
```

Primero salen las coincidencias exactas, después las que empiezan con el texto y al final las que lo contienen. Se puede filtrar por `estado` y `municipio`. El `limite` por defecto es 50.

## Códigos postales de un municipio

Hay municipios con el mismo nombre en varios estados. "Benito Juárez", por ejemplo, existe en 7. Por eso el resultado viene agrupado por estado:

```js
import { buscarPorMunicipio } from 'mx-codigos-postales';

buscarPorMunicipio('Benito Juárez', { estado: 'Quintana Roo' });
// [{ estado: { clave: '23', nombre: 'Quintana Roo' }, municipio: { … }, codigosPostales: ['77500', '77503', '77504', …] }]
```

## Estados

Las funciones que reciben un estado aceptan la clave INEGI (`'09'` o `9`), el nombre oficial con o sin acentos (`'Ciudad de México'`, `'ciudad de mexico'`) o una abreviatura común (`'CDMX'`, `'DF'`, `'Edomex'`, `'Veracruz'`, `'Michoacan'`, `'Coahuila'`).

## API

| Función | Devuelve |
|---|---|
| `validarCodigoPostal(cp)` | `true` si tiene forma de CP (5 dígitos); no consulta el catálogo |
| `existeCodigoPostal(cp)` | `true` si el CP existe en el catálogo |
| `buscarCodigoPostal(cp)` | Estado, municipio, ciudades y asentamientos, o `null` |
| `buscarPorColonia(texto, { estado, municipio, limite })` | Asentamientos que coinciden |
| `buscarPorMunicipio(nombre, { estado })` | CP del municipio, agrupados por estado |
| `getCodigosPostalesPorEstado(estado)` | Lista de CP del estado |
| `obtenerEstados()` | Los 32 estados con clave INEGI |
| `obtenerMunicipios(estado)` | Municipios del estado con clave INEGI |
| `getEstadisticas()` | Totales y fecha del catálogo |
| `infoCatalogo()` | Fuente, URL, fecha y aviso de uso del catálogo |

Los códigos postales se pueden pasar como texto (`'06700'`) o como número (`6700`). Un estado que no se reconoce lanza un `Error`.

```js
getEstadisticas();
// { codigosPostales: 31862, asentamientos: 159488, municipios: 2478, estados: 32, fechaCatalogo: '2026-11-12' }
```

## Datos

- **Fuente:** [Catálogo Nacional de Códigos Postales](https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx), Correos de México (SEPOMEX).
- **Fecha del catálogo incluido:** 2026-11-12. `getEstadisticas().fechaCatalogo` siempre dice qué versión trae el paquete.
- **Cobertura:** todos los registros del archivo oficial, sin filtrar.
- **Sin coordenadas:** el catálogo oficial no las incluye, así que esta librería tampoco.
- **Actualización:** con `node scripts/actualizar-catalogo.mjs CPdescarga.txt AAAA-MM-DD` a partir del TXT oficial. El script se detiene si el formato del archivo cambia.

### Aviso de uso de Correos de México

El archivo oficial incluye este aviso, que se reproduce sin cambios:

> El Catálogo Nacional de Códigos Postales, es elaborado por Correos de México y se proporciona en forma gratuita para uso particular, no estando permitida su comercialización, total o parcial, ni su distribución a terceros bajo ningún concepto.

La licencia MIT de este paquete cubre el **código**, no los datos. Si vas a usar el catálogo con fines comerciales, revisa antes los términos vigentes de Correos de México.

## Cambios

Ver [CHANGELOG.md](CHANGELOG.md).

## Licencia

MIT (código).
