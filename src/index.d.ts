/** Clave INEGI de 2 digitos ('09'), nombre ('Ciudad de México'), abreviatura ('CDMX', 'Edomex') o numero (9). */
export type Estado = string | number;

export interface Clave {
  clave: string;
  nombre: string;
}

export interface Asentamiento {
  nombre: string;
  /** Colonia, Fraccionamiento, Pueblo, Ejido, ... */
  tipo: string;
  /** Urbano, Rural o Semiurbano. */
  zona: string;
  ciudad: string | null;
}

export interface CodigoPostal {
  codigoPostal: string;
  estado: Clave;
  municipio: Clave;
  ciudades: string[];
  asentamientos: Asentamiento[];
}

export interface ResultadoColonia extends Asentamiento {
  codigoPostal: string;
  municipio: Clave;
  estado: Clave;
}

export interface GrupoMunicipio {
  estado: Clave;
  municipio: Clave;
  codigosPostales: string[];
}

export interface Estadisticas {
  codigosPostales: number;
  asentamientos: number;
  municipios: number;
  estados: number;
  /** AAAA-MM-DD */
  fechaCatalogo: string;
}

export interface InfoCatalogo {
  fuente: string;
  url: string;
  fecha: string;
  /** Aviso de uso tal como lo publica Correos de Mexico. */
  aviso: string;
}

/** True si tiene forma de codigo postal (5 digitos). No consulta el catalogo. */
export function validarCodigoPostal(codigoPostal: string | number): boolean;

/** True si el codigo postal existe en el catalogo de SEPOMEX. */
export function existeCodigoPostal(codigoPostal: string | number): boolean;

/** Estado, municipio, ciudades y asentamientos de un codigo postal; null si no existe. */
export function buscarCodigoPostal(codigoPostal: string | number): CodigoPostal | null;

/** Busca asentamientos por nombre, sin importar acentos ni mayusculas. */
export function buscarPorColonia(
  texto: string,
  opciones?: { estado?: Estado; municipio?: string; limite?: number }
): ResultadoColonia[];

/** Codigos postales de un municipio, agrupados por estado (hay municipios homonimos). */
export function buscarPorMunicipio(municipio: string, opciones?: { estado?: Estado }): GrupoMunicipio[];

/** Codigos postales de un estado. */
export function getCodigosPostalesPorEstado(estado: Estado): string[];

/** Los 32 estados con su clave INEGI. */
export function obtenerEstados(): Clave[];

/** Municipios de un estado con su clave INEGI. */
export function obtenerMunicipios(estado: Estado): Clave[];

/** Totales del catalogo incluido. */
export function getEstadisticas(): Estadisticas;

/** Fuente, fecha y aviso de uso del catalogo. */
export function infoCatalogo(): InfoCatalogo;

declare const _default: {
  validarCodigoPostal: typeof validarCodigoPostal;
  existeCodigoPostal: typeof existeCodigoPostal;
  buscarCodigoPostal: typeof buscarCodigoPostal;
  buscarPorColonia: typeof buscarPorColonia;
  buscarPorMunicipio: typeof buscarPorMunicipio;
  getCodigosPostalesPorEstado: typeof getCodigosPostalesPorEstado;
  obtenerEstados: typeof obtenerEstados;
  obtenerMunicipios: typeof obtenerMunicipios;
  getEstadisticas: typeof getEstadisticas;
  infoCatalogo: typeof infoCatalogo;
};
export default _default;
