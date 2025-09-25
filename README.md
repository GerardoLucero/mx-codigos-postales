# mx-codigos-postales

<!-- BADGES-DONATIONS-START -->
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate-orange?logo=ko-fi)](https://ko-fi.com/gerardolucero)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/lucerorios0)
<!-- BADGES-DONATIONS-END -->


[![npm version](https://badge.fury.io/js/mx-codigos-postales.svg)](https://badge.fury.io/js/mx-codigos-postales)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Códigos postales mexicanos completos con geolocalización y búsqueda avanzada.

## Instalación

```bash
npm install mx-codigos-postales
```

## Uso

```javascript
import { validarCP, buscarPorCP, calcularDistancia } from 'mx-codigos-postales';

// Validar código postal
const esValido = validarCP('01000');
console.log(esValido); // true

// Buscar información por CP
const info = buscarPorCP('01000');
console.log(info);
// {
//   cp: '01000',
//   estado: 'Ciudad de México',
//   municipio: 'Álvaro Obregón',
//   colonia: 'San Ángel',
//   lat: 19.3467,
//   lng: -99.1873
// }
```

## API

### `validarCP(codigoPostal)`
Valida formato y existencia de código postal.

### `buscarPorCP(codigoPostal)`
Busca información completa por código postal.

### `buscarPorEstado(estado)`
Retorna códigos postales de un estado.

### `calcularDistancia(cp1, cp2)`
Calcula distancia en km entre dos códigos postales.

## Características

- ✅ 32,000+ códigos postales mexicanos
- ✅ Coordenadas geográficas (lat/lng)
- ✅ Información de estado, municipio, colonia
- ✅ Cálculo de distancias (Haversine)
- ✅ Búsqueda por múltiples criterios
- ✅ Validación completa

## Licencia

MIT © Gerardo Lucero

<!-- DONATIONS-START -->
## 💖 Apoya el Ecosistema Mexicano OSS

Si estos paquetes te ayudan (RFC, ISR, Nómina, Bancos, Feriados, Nombres, Códigos Postales, Validadores), considera invitarme un café o apoyar el mantenimiento:

- [Ko-fi](https://ko-fi.com/gerardolucero)
- [Buy Me a Coffee](https://buymeacoffee.com/lucerorios0)

> Gracias por tu apoyo 🙌. Priorizaré issues/PRs con **contexto de uso en México** (SAT/IMSS/INFONAVIT, bancos, feriados) y publicaré avances en los READMEs.
<!-- DONATIONS-END -->
