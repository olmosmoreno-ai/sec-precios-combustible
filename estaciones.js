// ============================================================
// SEC Precios Combustible — Estaciones semilla (Arica)
// ============================================================
// Lista inicial transcrita por Carlos desde el registro de
// instalaciones de la SEC. lat/lon quedan en null hasta que la
// app las geocodifica (una vez, con Nominatim, gratis) — ver
// accion.geocodificarPendientes() en app.js.
// Esta lista puede crecer: nuevas estaciones agregadas a mano
// desde la app se guardan en IndexedDB y se combinan con esta.
export const ESTACIONES_SEMILLA = [
  {
    "id": "AB1510101",
    "logo": "ABASTIBLE",
    "comuna": "ARICA",
    "direccion": "Alejandro Azolas",
    "nro": "2693",
    "lat": null,
    "lon": null
  },
  {
    "id": "PB151011",
    "logo": "BALTOLU",
    "comuna": "ARICA",
    "direccion": "Punta Arenas",
    "nro": "2044",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1410106",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Av. Diego Portales",
    "nro": "1072",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1510101",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "San Martín",
    "nro": "699",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1510102",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Panamericana Sur",
    "nro": "2824",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1510103",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Luis Valente Rossi",
    "nro": "1990",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1510104",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "18 de Septiembre",
    "nro": "2401",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1510105",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Diego Portales",
    "nro": "1115",
    "lat": null,
    "lon": null
  },
  {
    "id": "CO1510106",
    "logo": "COPEC",
    "comuna": "ARICA",
    "direccion": "Av. Santiago Arata",
    "nro": "3190",
    "lat": null,
    "lon": null
  },
  {
    "id": "LI1510101",
    "logo": "LIPIGAS",
    "comuna": "ARICA",
    "direccion": "Barros Arana",
    "nro": "2931",
    "lat": null,
    "lon": null
  },
  {
    "id": "LI1510102",
    "logo": "LIPIGAS",
    "comuna": "ARICA",
    "direccion": "Maipú",
    "nro": "982",
    "lat": null,
    "lon": null
  },
  {
    "id": "LI1510103",
    "logo": "LIPIGAS",
    "comuna": "ARICA",
    "direccion": "Avenida Alcalde Manuel Castillo Ibáñez",
    "nro": "3055",
    "lat": null,
    "lon": null
  },
  {
    "id": "PE1510101",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "18 de Septiembre esq. Lastarria",
    "nro": "1709",
    "lat": null,
    "lon": null
  },
  {
    "id": "PE1510102",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "Av. Diego Portales",
    "nro": "2462",
    "lat": null,
    "lon": null
  },
  {
    "id": "PE1510103",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "General Velásquez",
    "nro": "922",
    "lat": null,
    "lon": null
  },
  {
    "id": "PE1510104",
    "logo": "PETROBRAS",
    "comuna": "ARICA",
    "direccion": "Avda. Capitán Ávalos",
    "nro": "2220",
    "lat": null,
    "lon": null
  },
  {
    "id": "SH1510101",
    "logo": "SHELL",
    "comuna": "ARICA",
    "direccion": "Panamericana Norte",
    "nro": "3545",
    "lat": null,
    "lon": null
  },
  {
    "id": "SH1510102",
    "logo": "SHELL",
    "comuna": "ARICA",
    "direccion": "Gonzalo Cerda esq. Azola",
    "nro": "1330",
    "lat": null,
    "lon": null
  },
  {
    "id": "SH1510103",
    "logo": "SHELL",
    "comuna": "ARICA",
    "direccion": "Avda. Manuel Castillo",
    "nro": "2920",
    "lat": null,
    "lon": null
  },
  {
    "id": "PB151012",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Barros Arana",
    "nro": "3221",
    "lat": null,
    "lon": null
  },
  {
    "id": "PB151013",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Ramón Barros Luco",
    "nro": "2364",
    "lat": null,
    "lon": null
  },
  {
    "id": "PB151015",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Avenida Azolas",
    "nro": "3315",
    "lat": null,
    "lon": null
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
    "lat": null,
    "lon": null
  },
  {
    "id": "UL1510102A",
    "logo": "SIN BANDERA",
    "comuna": "ARICA",
    "direccion": "Av. Simón Bolívar",
    "nro": "85",
    "lat": null,
    "lon": null
  },
  {
    "id": "UL1510101",
    "logo": "ULIGAS",
    "comuna": "ARICA",
    "direccion": "Barros Arana",
    "nro": "3081",
    "lat": null,
    "lon": null
  }
];
