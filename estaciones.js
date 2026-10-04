// ============================================================
// SEC Precios Combustible — Estaciones semilla (Arica)
// ============================================================
// Lista inicial transcrita por Carlos desde el registro de
// instalaciones de la SEC. lat/lon ya vienen incorporadas de
// fábrica (geocodificadas una vez, vía Nominatim/OpenStreetMap,
// gratis) — así cada instalación nueva de la app ya tiene las
// estaciones listas para la detección automática por GPS, sin
// que cada persona tenga que geocodificar al abrirla por primera
// vez. El botón "📡 Geocodificar pendientes" en la app sigue
// disponible para resolver las que quedaron pendientes (null) o
// para estaciones nuevas que se agreguen sin coordenadas.
//
// Nota de precisión: Nominatim es gratuito pero no siempre tiene
// el catastro exacto por número de puerta — en calles largas
// (ej. Barros Arana) puede devolver un punto aproximado de la
// calle en vez del número exacto. Si el GPS de una foto no logra
// asociar automáticamente una estación (porque el punto real está
// a más de 40 m del punto aproximado), se elige manualmente de la
// lista — no afecta el registro del precio, solo el autocompletado.
//
// Esta lista puede crecer: nuevas estaciones agregadas a mano
// desde la app se guardan en IndexedDB y se combinan con esta.
export const ESTACIONES_SEMILLA = [
  {
    "id": "AB1510101",
    "logo": "ABASTIBLE",
    "comuna": "ARICA",
    "direccion": "Alejandro Azolas",
    "nro": "2693",
    "lat": -18.4740352,
    "lon": -70.2996019
  },
  {
    "id": "PB151011",
    "logo": "BALTOLU",
    "comuna": "ARICA",
    "direccion": "Punta Arenas",
    "nro": "2044",
    "lat": -18.4820037,
    "lon": -70.2960974
  },
  {
    "id": "CO1410106",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Av. Diego Portales",
    "nro": "1072",
    "lat": -18.4732869,
    "lon": -70.3030846
  },
  {
    "id": "CO1510101",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "San Martín",
    "nro": "699",
    "lat": -18.4817696,
    "lon": -70.3150249
  },
  {
    "id": "CO1510102",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Panamericana Sur",
    "nro": "2824",
    "lat": -18.493495,
    "lon": -70.288923
  },
  {
    "id": "CO1510103",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Luis Valente Rossi",
    "nro": "1990",
    "lat": -18.4926012,
    "lon": -70.2974928
  },
  {
    "id": "CO1510104",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "18 de Septiembre",
    "nro": "2401",
    "lat": -18.4856859,
    "lon": -70.3008449
  },
  {
    "id": "CO1510105",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Diego Portales",
    "nro": "1115",
    "lat": -18.4822471,
    "lon": -70.2949345
  },
  {
    "id": "CO1510106",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Av. Santiago Arata",
    "nro": "3190",
    "lat": -18.4273612,
    "lon": -70.2951942
  },
  {
    "id": "LI1510101",
    "logo": "LIPIGAS",
    "comuna": "ARICA",
    "direccion": "Barros Arana",
    "nro": "2931",
    "lat": -18.4586513,
    "lon": -70.2886073
  },
  {
    "id": "LI1510102",
    "logo": "LIPIGAS",
    "comuna": "ARICA",
    "direccion": "Maipú",
    "nro": "982",
    "lat": -18.4795622,
    "lon": -70.3150415
  },
  {
    "id": "LI1510103",
    "logo": "LIPIGAS",
    "comuna": "ARICA",
    "direccion": "Avenida Alcalde Manuel Castillo Ibáñez",
    "nro": "3055",
    "lat": -18.4918073,
    "lon": -70.2894304
  },
  {
    "id": "PE1510101",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "18 de Septiembre esq. Lastarria",
    "nro": "1709",
    "lat": -18.4856859,
    "lon": -70.3008449
  },
  {
    "id": "PE1510102",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "Av. Diego Portales",
    "nro": "2462",
    "lat": -18.4709583,
    "lon": -70.3063970
  },
  {
    "id": "PE1510103",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "General Velásquez",
    "nro": "922",
    "lat": -18.4765156,
    "lon": -70.3181491
  },
  {
    "id": "PE1510104",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "Avda. Capitán Ávalos",
    "nro": "2220",
    "lat": -18.4612666,
    "lon": -70.2807711
  },
  {
    "id": "SH1510101",
    "logo": "SHELL",
    "comuna": "ARICA",
    "direccion": "Panamericana Norte",
    "nro": "3545",
    "lat": -18.4990309,
    "lon": -70.2852817
  },
  {
    "id": "SH1510102",
    "logo": "SHELL",
    "comuna": "ARICA",
    "direccion": "Gonzalo Cerda esq. Azola",
    "nro": "1330",
    "lat": -18.4737613,
    "lon": -70.2963211
  },
  {
    "id": "SH1510103",
    "logo": "SHELL",
    "comuna": "ARICA",
    "direccion": "Avda. Manuel Castillo",
    "nro": "2920",
    "lat": -18.4918073,
    "lon": -70.2894304
  },
  {
    "id": "PB151012",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Barros Arana",
    "nro": "3221",
    "lat": -18.4586513,
    "lon": -70.2886073
  },
  {
    "id": "PB151013",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Ramón Barros Luco",
    "nro": "2364",
    "lat": -18.4859889,
    "lon": -70.2835330
  },
  {
    "id": "PB151015",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Avenida Azolas",
    "nro": "3315",
    "lat": -18.4688995,
    "lon": -70.2936964
  },
  {
    "id": "PB151016",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Valle de Azapa Km 13.5",
    "nro": "0",
    "lat": null,
    "lon": null
  },
  {
    "id": "UL1510102",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Av. Simón Bolívar",
    "nro": "085",
    "lat": -18.4887602,
    "lon": -70.3026447
  },
  {
    "id": "UL1510102A",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Av. Simón Bolívar",
    "nro": "85",
    "lat": -18.4887602,
    "lon": -70.3026447
  },
  {
    "id": "UL1510101",
    "logo": "ULIGAS",
    "comuna": "ARICA",
    "direccion": "Barros Arana",
    "nro": "3081",
    "lat": -18.4586513,
    "lon": -70.2886073
  }
];
