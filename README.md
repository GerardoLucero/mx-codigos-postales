# mx-codigos-postales

Base de datos completa de códigos postales mexicanos. Consulta estado, municipio y colonias a partir de un CP, valida códigos postales y busca por nombre de localidad.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/gerardolucero)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/lucerorios0)
[![GitHub Stars](https://img.shields.io/github/stars/GerardoLucero/mx-codigos-postales?style=social)](https://github.com/GerardoLucero/mx-codigos-postales)
[![npm version](https://badge.fury.io/js/mx-codigos-postales.svg)](https://www.npmjs.com/package/mx-codigos-postales)
[![npm downloads](https://img.shields.io/npm/dm/mx-codigos-postales.svg)](https://www.npmjs.com/package/mx-codigos-postales)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Consulta por CP** — obtiene estado, municipio y colonias
- **Validación** — verifica si un código postal existe en México
- **Búsqueda por localidad** — encuentra el CP de una colonia o municipio
- **Datos SEPOMEX** — basados en el catálogo oficial del Servicio Postal Mexicano
- **TypeScript ready** — definiciones de tipos incluidas
- **Zero dependencies** — totalmente standalone

## Instalación

```bash
npm install mx-codigos-postales
```

## Uso

```javascript
import cp from 'mx-codigos-postales';
```

### Consultar por código postal

```javascript
const info = cp.buscarCP('06600');
console.log(info);
// {
//   codigoPostal: '06600',
//   estado: 'Ciudad de México',
//   estadoCodigo: 'CDMX',
//   municipio: 'Cuauhtémoc',
//   colonias: [
//     'Juárez',
//     'Roma Norte'
//   ]
// }
```

### Validar código postal

```javascript
const esValido = cp.validarCP('06600');
console.log(esValido); // true

const invalido = cp.validarCP('00000');
console.log(invalido); // false
```

### Buscar por colonia o municipio

```javascript
const resultados = cp.buscarPorColonia('Roma Norte');
console.log(resultados);
// [{ codigoPostal: '06600', estado: 'Ciudad de México', municipio: 'Cuauhtémoc' }]

const porMunicipio = cp.buscarPorMunicipio('Zapopan');
console.log(porMunicipio);
// Array de todos los CPs del municipio
```

### Obtener colonias por CP

```javascript
const colonias = cp.obtenerColonias('06600');
console.log(colonias);
// ['Juárez', 'Roma Norte', ...]
```

## API

| Función | Descripción |
|---------|-------------|
| `buscarCP(codigoPostal)` | Consulta completa por código postal |
| `validarCP(codigoPostal)` | Verifica si el CP existe en México |
| `obtenerColonias(codigoPostal)` | Lista de colonias para un CP |
| `buscarPorColonia(nombre)` | Busca CPs que contengan la colonia |
| `buscarPorMunicipio(municipio)` | Busca todos los CPs de un municipio |
| `obtenerEstados()` | Lista de todos los estados con sus CPs |

## Casos de uso

### Autocompletar formulario de dirección

```javascript
import cp from 'mx-codigos-postales';

function autocompletarDireccion(codigoPostal) {
  if (!cp.validarCP(codigoPostal)) {
    return { error: 'Código postal inválido' };
  }

  const info = cp.buscarCP(codigoPostal);

  return {
    estado: info.estado,
    municipio: info.municipio,
    colonias: info.colonias // Para mostrar en dropdown
  };
}
```

### Validación de formulario

```javascript
function validarDireccion(datos) {
  if (!cp.validarCP(datos.codigoPostal)) {
    throw new Error('El código postal no existe en México');
  }

  const info = cp.buscarCP(datos.codigoPostal);

  if (info.estado !== datos.estado) {
    throw new Error('El estado no corresponde al código postal');
  }

  return true;
}
```

## Fuente de datos

Los datos están basados en el catálogo de [SEPOMEX](https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/Descarga.aspx) — Servicio Postal Mexicano.

## Licencia

MIT © [Gerardo Lucero](https://github.com/GerardoLucero)

---

- [mx-bancos](https://www.npmjs.com/package/mx-bancos) — Catálogo de bancos mexicanos
- [mx-feriados](https://www.npmjs.com/package/mx-feriados) — Feriados oficiales mexicanos
- [validador-fiscal-mx](https://www.npmjs.com/package/validador-fiscal-mx) — Validación fiscal
