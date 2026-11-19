import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import cp, {
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
} from './index.js';

describe('catalogo', () => {
  it('incluye el catalogo nacional completo', () => {
    const e = getEstadisticas();
    expect(e.estados).toBe(32);
    expect(e.codigosPostales).toBeGreaterThan(30000);
    expect(e.asentamientos).toBeGreaterThan(150000);
    expect(e.municipios).toBeGreaterThan(2400);
    expect(e.fechaCatalogo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('expone la fuente y el aviso de uso de Correos de Mexico', () => {
    const info = infoCatalogo();
    expect(info.fuente).toContain('Correos de Mexico');
    expect(info.url).toContain('correosdemexico.gob.mx');
    expect(info.aviso).toContain('Correos de México');
  });
});

describe('validarCodigoPostal y existeCodigoPostal', () => {
  it('valida la forma de 5 digitos', () => {
    expect(validarCodigoPostal('06700')).toBe(true);
    expect(validarCodigoPostal('067-00')).toBe(true);
    expect(validarCodigoPostal(6700)).toBe(true);
    expect(validarCodigoPostal('6700')).toBe(false);
    expect(validarCodigoPostal('abcde')).toBe(false);
    expect(validarCodigoPostal(null)).toBe(false);
  });

  it('distingue los codigos que existen en el catalogo', () => {
    expect(existeCodigoPostal('06700')).toBe(true);
    expect(existeCodigoPostal(1000)).toBe(true);
    expect(existeCodigoPostal('00000')).toBe(false);
  });
});

describe('buscarCodigoPostal', () => {
  it('devuelve estado, municipio, ciudad y asentamientos', () => {
    expect(buscarCodigoPostal('06700')).toEqual({
      codigoPostal: '06700',
      estado: { clave: '09', nombre: 'Ciudad de México' },
      municipio: { clave: '015', nombre: 'Cuauhtémoc' },
      ciudades: ['Ciudad de México'],
      asentamientos: [{ nombre: 'Roma Norte', tipo: 'Colonia', zona: 'Urbano', ciudad: 'Ciudad de México' }]
    });
  });

  it.each([
    ['44100', 'Jalisco', 'Guadalajara'],
    ['64000', 'Nuevo León', 'Monterrey'],
    ['01000', 'Ciudad de México', 'Álvaro Obregón']
  ])('%s esta en %s, %s', (codigo, estado, municipio) => {
    const r = buscarCodigoPostal(codigo);
    expect(r.estado.nombre).toBe(estado);
    expect(r.municipio.nombre).toBe(municipio);
  });

  it('acepta numeros y devuelve null si no existe', () => {
    expect(buscarCodigoPostal(1000).codigoPostal).toBe('01000');
    expect(buscarCodigoPostal('00000')).toBeNull();
    expect(buscarCodigoPostal('x')).toBeNull();
  });

  it('cada asentamiento tiene tipo y zona del catalogo', () => {
    for (const a of buscarCodigoPostal('03100').asentamientos) {
      expect(typeof a.tipo).toBe('string');
      expect(['Urbano', 'Rural', 'Semiurbano']).toContain(a.zona);
    }
  });
});

describe('buscarPorColonia', () => {
  it('encuentra sin importar acentos ni mayusculas', () => {
    expect(buscarPorColonia('roma norte')[0]).toMatchObject({ codigoPostal: '06700', nombre: 'Roma Norte' });
    expect(buscarPorColonia('SAN ANGEL', { estado: 'CDMX' })[0].nombre).toBe('San Ángel');
  });

  it('ordena coincidencias exactas, luego prefijos, luego contenidas', () => {
    const r = buscarPorColonia('del valle', { estado: '09' });
    expect(r[0].nombre.startsWith('Del Valle')).toBe(true);
    expect(r.every((x) => x.estado.clave === '09')).toBe(true);
  });

  it('filtra por municipio y respeta el limite', () => {
    const r = buscarPorColonia('centro', { estado: 'Jalisco', municipio: 'Guadalajara', limite: 3 });
    expect(r.length).toBeLessThanOrEqual(3);
    expect(r.every((x) => x.municipio.nombre === 'Guadalajara')).toBe(true);
  });

  it('exige al menos 2 caracteres y un estado valido', () => {
    expect(() => buscarPorColonia('a')).toThrow('al menos 2 caracteres');
    expect(() => buscarPorColonia('roma', { estado: 'Atlantida' })).toThrow('Estado no reconocido');
  });
});

describe('buscarPorMunicipio', () => {
  it('agrupa municipios homonimos por estado', () => {
    const grupos = buscarPorMunicipio('Benito Juárez');
    expect(grupos.length).toBeGreaterThan(1);
    expect(grupos.map((g) => g.estado.nombre)).toEqual(expect.arrayContaining(['Ciudad de México', 'Quintana Roo']));
  });

  it('filtra por estado', () => {
    const [grupo, ...resto] = buscarPorMunicipio('benito juarez', { estado: 'Quintana Roo' });
    expect(resto).toHaveLength(0);
    expect(grupo.estado.clave).toBe('23');
    expect(grupo.codigosPostales.length).toBeGreaterThan(0);
  });

  it('devuelve una lista vacia si no hay coincidencias', () => {
    expect(buscarPorMunicipio('Municipio Inexistente')).toEqual([]);
  });
});

describe('estados y municipios', () => {
  it('lista los 32 estados con su clave INEGI', () => {
    const estados = obtenerEstados();
    expect(estados).toHaveLength(32);
    expect(estados[8]).toEqual({ clave: '09', nombre: 'Ciudad de México' });
  });

  it.each(['09', 9, 'Ciudad de México', 'ciudad de mexico', 'CDMX', 'DF'])('reconoce la CDMX como %s', (estado) => {
    expect(obtenerMunicipios(estado)).toHaveLength(16);
  });

  it('reconoce abreviaturas y nombres cortos', () => {
    expect(getCodigosPostalesPorEstado('Edomex')).toEqual(getCodigosPostalesPorEstado('15'));
    expect(getCodigosPostalesPorEstado('Veracruz')).toEqual(getCodigosPostalesPorEstado('Veracruz de Ignacio de la Llave'));
    expect(getCodigosPostalesPorEstado('Michoacan').length).toBeGreaterThan(0);
  });

  it('todos los CP de un estado empiezan con un prefijo de ese estado', () => {
    for (const codigo of getCodigosPostalesPorEstado('Colima')) {
      expect(codigo.startsWith('28')).toBe(true);
    }
  });

  it('rechaza estados desconocidos', () => {
    expect(() => obtenerMunicipios('Atlantida')).toThrow('Estado no reconocido');
    expect(() => getCodigosPostalesPorEstado(99)).toThrow('Estado no reconocido');
  });
});

describe('exportacion por defecto', () => {
  it('expone las mismas funciones', () => {
    expect(cp.buscarCodigoPostal('06700').municipio.nombre).toBe('Cuauhtémoc');
    expect(Object.keys(cp)).toHaveLength(10);
  });
});

describe('ejemplos del README', () => {
  const readme = readFileSync(join(process.cwd(), 'README.md'), 'utf8');

  it('muestra resultados reales', () => {
    expect(readme).toContain('\'Roma Norte\'');
    expect(readme).toContain('\'Cuauhtémoc\'');
    expect(readme).toContain(`codigosPostales: ${getEstadisticas().codigosPostales}`);
    expect(readme).toContain(`asentamientos: ${getEstadisticas().asentamientos}`);
    expect(readme).toContain(`fechaCatalogo: '${getEstadisticas().fechaCatalogo}'`);
    expect(readme).toContain(infoCatalogo().aviso);
  });
});
