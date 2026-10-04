// ============================================================
// SEC Precios Combustible — Geolocalización
// ============================================================
// Geocodifica direcciones con Nominatim (OpenStreetMap, gratis)
// y calcula distancias entre coordenadas (fórmula de Haversine)
// para asociar automáticamente la foto tomada con la estación
// de servicio más cercana.
// ============================================================

// Geocodifica una dirección → { lat, lon } o null si no se encontró.
// Debe llamarse desde el navegador del usuario (no desde un servidor
// o script automatizado): Nominatim bloquea tráfico tipo bot.
export async function geocodificarDireccion(direccion, comuna = 'Arica', pais = 'Chile') {
  const query = `${direccion}, ${comuna}, ${pais}`;
  const url = `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=cl`;
  try {
    const r = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const data = await r.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {
    /* sin conexión u otro error: se deja pendiente para reintentar luego */
  }
  return null;
}

export function obtenerGPS() {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Distancia en metros entre dos coordenadas (fórmula de Haversine)
export function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Dada una coordenada y una lista de estaciones (con lat/lon ya
// geocodificados), devuelve la más cercana y su distancia en metros.
// Ignora estaciones sin coordenadas todavía.
export function estacionMasCercana(lat, lon, estaciones) {
  let mejor = null;
  let mejorDist = Infinity;
  for (const e of estaciones) {
    if (e.lat == null || e.lon == null) continue;
    const d = distanciaMetros(lat, lon, e.lat, e.lon);
    if (d < mejorDist) { mejorDist = d; mejor = e; }
  }
  return mejor ? { estacion: mejor, distancia: mejorDist } : null;
}
