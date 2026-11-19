// Genera dist/index.js (ESM) y dist/index.d.ts reexportando el build CommonJS,
// para que el catalogo (5 MB) vaya una sola vez en el paquete.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const modulo = require('../dist/index.cjs');
const nombres = Object.keys(modulo).filter((n) => n !== 'default' && n !== '__esModule');

writeFileSync(new URL('../dist/index.js', import.meta.url),
  'import modulo from \'./index.cjs\';\n\n' +
  `export const { ${nombres.join(', ')} } = modulo;\n` +
  'export default modulo.default;\n');

writeFileSync(new URL('../dist/index.d.ts', import.meta.url), readFileSync(new URL('../dist/index.d.cts', import.meta.url)));
console.log(`dist/index.js: ${nombres.length} exportaciones`);
