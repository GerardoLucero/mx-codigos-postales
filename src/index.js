/**
 * Librería completa de códigos postales mexicanos
 * Incluye geolocalización, búsquedas y cálculo de distancias
 */

// Base de datos de códigos postales mexicanos (muestra representativa)
const CODIGOS_POSTALES_DATA = {
  '01000': {
    codigoPostal: '01000', estado: 'Ciudad de México', codigoEstado: '09',
    municipio: 'Álvaro Obregón', ciudad: 'Ciudad de México', colonia: 'San Ángel',
    tipoAsentamiento: 'Colonia', zona: 'Urbano',
    coordenadas: { latitud: 19.3467, longitud: -99.1869 }, region: 'Centro'
  },
  '44100': {
    codigoPostal: '44100', estado: 'Jalisco', codigoEstado: '14',
    municipio: 'Guadalajara', ciudad: 'Guadalajara', colonia: 'Centro',
    tipoAsentamiento: 'Colonia', zona: 'Urbano',
    coordenadas: { latitud: 20.6597, longitud: -103.3496 }, region: 'Occidente'
  },
  '64000': {
    codigoPostal: '64000', estado: 'Nuevo León', codigoEstado: '19',
    municipio: 'Monterrey', ciudad: 'Monterrey', colonia: 'Centro',
    tipoAsentamiento: 'Colonia', zona: 'Urbano',
    coordenadas: { latitud: 25.6714, longitud: -100.3089 }, region: 'Noreste'
  }
};

/**
 * Valida si un código postal mexicano es válido
 */
export function validarCodigoPostal(codigoPostal) {
  if (!codigoPostal || typeof codigoPostal !== 'string') return false;
  const cp = codigoPostal.replace(/[\s-]/g, '');
  const regex = /^[0-9]{5}$/;
  if (!regex.test(cp)) return false;
  const numero = parseInt(cp);
  return numero >= 1000 && numero <= 99999;
}

/**
 * Busca información de un código postal
 */
export function buscarCodigoPostal(codigoPostal) {
  if (!validarCodigoPostal(codigoPostal)) return null;
  const cp = codigoPostal.replace(/[\s-]/g, '');
  return CODIGOS_POSTALES_DATA[cp] || null;
}

/**
 * Obtiene códigos postales por estado
 */
export function getCodigosPostalesPorEstado(estado) {
  if (!estado || typeof estado !== 'string') return [];
  const estadoNormalizado = estado.toLowerCase();
  return Object.values(CODIGOS_POSTALES_DATA).filter(cp =>
    cp.estado.toLowerCase().includes(estadoNormalizado)
  );
}

/**
 * Busca códigos postales por municipio
 */
export function buscarPorMunicipio(municipio) {
  if (!municipio || typeof municipio !== 'string') return [];
  const municipioNormalizado = municipio.toLowerCase();
  return Object.values(CODIGOS_POSTALES_DATA).filter(cp =>
    cp.municipio.toLowerCase().includes(municipioNormalizado)
  );
}

/**
 * Busca códigos postales por colonia
 */
export function buscarPorColonia(colonia) {
  if (!colonia || typeof colonia !== 'string') return [];
  const coloniaNormalizada = colonia.toLowerCase();
  return Object.values(CODIGOS_POSTALES_DATA).filter(cp =>
    cp.colonia.toLowerCase().includes(coloniaNormalizada)
  );
}

/**
 * Calcula la distancia entre dos puntos usando Haversine
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
      typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    throw new Error('Las coordenadas deben ser números válidos');
  }
  
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Busca códigos postales cercanos
 */
export function buscarCercanos(codigoPostal, radioKm = 10) {
  const cpBase = buscarCodigoPostal(codigoPostal);
  if (!cpBase || !cpBase.coordenadas) return [];
  
  const { latitud, longitud } = cpBase.coordenadas;
  const cercanos = [];
  
  Object.values(CODIGOS_POSTALES_DATA).forEach(cp => {
    if (cp.codigoPostal !== codigoPostal && cp.coordenadas) {
      const distancia = calcularDistancia(latitud, longitud, cp.coordenadas.latitud, cp.coordenadas.longitud);
      if (distancia <= radioKm) {
        cercanos.push({ ...cp, distanciaKm: distancia });
      }
    }
  });
  
  return cercanos.sort((a, b) => a.distanciaKm - b.distanciaKm);
}

/**
 * Obtiene estadísticas de códigos postales
 */
export function getEstadisticas() {
  const codigos = Object.values(CODIGOS_POSTALES_DATA);
  const estadoStats = {};
  
  codigos.forEach(cp => {
    estadoStats[cp.estado] = (estadoStats[cp.estado] || 0) + 1;
  });
  
  return {
    totalCodigosPostales: codigos.length,
    estados: Object.keys(estadoStats).length,
    distribuciones: { porEstado: estadoStats },
    cobertura: {
      conCoordenadas: codigos.filter(cp => cp.coordenadas).length,
      sinCoordenadas: codigos.filter(cp => !cp.coordenadas).length
    }
  };
}

export default {
  validarCodigoPostal,
  buscarCodigoPostal,
  getCodigosPostalesPorEstado,
  buscarPorMunicipio,
  buscarPorColonia,
  calcularDistancia,
  buscarCercanos,
  getEstadisticas
};
