# Cambios

## 2.0.0

### Nuevo
- Catalogo Nacional de Codigos Postales completo de Correos de Mexico (SEPOMEX), corte 2026-11-12:
  31,862 codigos postales y 159,488 asentamientos. Antes el paquete traia solo 3 codigos de ejemplo.
- `existeCodigoPostal`, `obtenerEstados`, `obtenerMunicipios` e `infoCatalogo`.
- Busquedas sin importar acentos ni mayusculas; filtros por estado y municipio.
- Estados por clave INEGI, nombre o abreviatura (CDMX, Edomex, ...).
- Script `scripts/actualizar-catalogo.mjs` para regenerar los datos desde el TXT oficial.

### Cambios incompatibles
- `buscarCodigoPostal` devuelve `{ codigoPostal, estado, municipio, ciudades, asentamientos }`.
- `buscarPorColonia` y `buscarPorMunicipio` cambian de forma (ver README).
- Se quitan `calcularDistancia` y `buscarCercanos`: las coordenadas no venian de una fuente
  y el catalogo oficial no las incluye.
