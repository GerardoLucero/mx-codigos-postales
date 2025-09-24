import lib from './index.js';

describe('mx-codigos-postales', () => {
  describe('validarCodigoPostal', () => {
    test('debe validar códigos postales válidos', () => {
      expect(lib.validarCodigoPostal('01000')).toBe(true);
      expect(lib.validarCodigoPostal('44100')).toBe(true);
      expect(lib.validarCodigoPostal('64000')).toBe(true);
    });

    test('debe rechazar códigos postales inválidos', () => {
      expect(lib.validarCodigoPostal('00000')).toBe(false);
      expect(lib.validarCodigoPostal('1234')).toBe(false);
      expect(lib.validarCodigoPostal('abcde')).toBe(false);
      expect(lib.validarCodigoPostal('')).toBe(false);
      expect(lib.validarCodigoPostal(null)).toBe(false);
    });

    test('debe manejar espacios y guiones', () => {
      expect(lib.validarCodigoPostal('01-000')).toBe(true);
      expect(lib.validarCodigoPostal('44 100')).toBe(true);
    });
  });

  describe('buscarCodigoPostal', () => {
    test('debe encontrar códigos postales existentes', () => {
      const resultado = lib.buscarCodigoPostal('01000');
      expect(resultado).not.toBeNull();
      expect(resultado.codigoPostal).toBe('01000');
      expect(resultado.estado).toBe('Ciudad de México');
      expect(resultado.colonia).toBe('San Ángel');
    });

    test('debe retornar null para códigos no encontrados', () => {
      const resultado = lib.buscarCodigoPostal('99999');
      expect(resultado).toBeNull();
    });

    test('debe retornar null para códigos inválidos', () => {
      expect(lib.buscarCodigoPostal('abcde')).toBeNull();
      expect(lib.buscarCodigoPostal('')).toBeNull();
    });
  });

  describe('getCodigosPostalesPorEstado', () => {
    test('debe encontrar códigos por estado', () => {
      const resultado = lib.getCodigosPostalesPorEstado('Jalisco');
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado[0].estado).toBe('Jalisco');
    });

    test('debe retornar array vacío para estado inexistente', () => {
      const resultado = lib.getCodigosPostalesPorEstado('EstadoInexistente');
      expect(resultado).toEqual([]);
    });

    test('debe manejar entradas inválidas', () => {
      expect(lib.getCodigosPostalesPorEstado('')).toEqual([]);
      expect(lib.getCodigosPostalesPorEstado(null)).toEqual([]);
    });
  });

  describe('buscarPorMunicipio', () => {
    test('debe encontrar códigos por municipio', () => {
      const resultado = lib.buscarPorMunicipio('Guadalajara');
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado[0].municipio).toBe('Guadalajara');
    });

    test('debe ser case insensitive', () => {
      const resultado = lib.buscarPorMunicipio('guadalajara');
      expect(resultado.length).toBeGreaterThan(0);
    });
  });

  describe('calcularDistancia', () => {
    test('debe calcular distancia entre dos puntos', () => {
      const distancia = lib.calcularDistancia(19.3467, -99.1869, 20.6597, -103.3496);
      expect(typeof distancia).toBe('number');
      expect(distancia).toBeGreaterThan(0);
      expect(distancia).toBeCloseTo(459, 0); // Aproximadamente 460km entre CDMX y Guadalajara
    });

    test('debe rechazar coordenadas inválidas', () => {
      expect(() => lib.calcularDistancia('a', 'b', 'c', 'd')).toThrow('Las coordenadas deben ser números válidos');
      expect(() => lib.calcularDistancia(null, null, null, null)).toThrow();
    });

    test('debe retornar 0 para el mismo punto', () => {
      const distancia = lib.calcularDistancia(19.3467, -99.1869, 19.3467, -99.1869);
      expect(distancia).toBe(0);
    });
  });

  describe('buscarCercanos', () => {
    test('debe encontrar códigos cercanos', () => {
      const cercanos = lib.buscarCercanos('01000', 1000);
      expect(Array.isArray(cercanos)).toBe(true);
      // Puede estar vacío si no hay otros códigos en el radio
    });

    test('debe retornar array vacío para código inexistente', () => {
      const cercanos = lib.buscarCercanos('99999', 10);
      expect(cercanos).toEqual([]);
    });

    test('debe ordenar por distancia', () => {
      const cercanos = lib.buscarCercanos('01000', 1000);
      if (cercanos.length > 1) {
        expect(cercanos[0].distanciaKm).toBeLessThanOrEqual(cercanos[1].distanciaKm);
      }
    });
  });

  describe('getEstadisticas', () => {
    test('debe retornar estadísticas válidas', () => {
      const stats = lib.getEstadisticas();
      expect(stats).toHaveProperty('totalCodigosPostales');
      expect(stats).toHaveProperty('estados');
      expect(stats).toHaveProperty('distribuciones');
      expect(stats).toHaveProperty('cobertura');
      expect(typeof stats.totalCodigosPostales).toBe('number');
      expect(stats.totalCodigosPostales).toBeGreaterThan(0);
    });

    test('debe incluir distribuciones por estado', () => {
      const stats = lib.getEstadisticas();
      expect(stats.distribuciones).toHaveProperty('porEstado');
      expect(typeof stats.distribuciones.porEstado).toBe('object');
    });
  });
});
