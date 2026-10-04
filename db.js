// ============================================================
//  SEC Precios Combustible — Capa de persistencia IndexedDB
// ============================================================

const DB_NAME = 'sec_precios_combustible_db';
const DB_VER  = 1;

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      // Registros de precios tomados
      if (!db.objectStoreNames.contains('registros')) {
        const s = db.createObjectStore('registros', { keyPath: 'id' });
        s.createIndex('fecha', 'fecha', { unique: false });
        s.createIndex('estacionId', 'estacionId', { unique: false });
      }
      // Estaciones (semilla + agregadas a mano + geocodificadas)
      if (!db.objectStoreNames.contains('estaciones')) {
        db.createObjectStore('estaciones', { keyPath: 'id' });
      }
      // Config / preferencias
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };
    req.onsuccess = e => { _db = e.target.result; res(_db); };
    req.onerror   = e => rej(e.target.error);
  });
}

// -------- REGISTROS --------
export async function saveRegistro(registro) {
  const db = await openDB();
  return tx(db, 'registros', 'readwrite', s => s.put(registro));
}

export async function getAllRegistros() {
  const db = await openDB();
  return tx(db, 'registros', 'readonly', s => s.getAll());
}

export async function deleteRegistro(id) {
  const db = await openDB();
  return tx(db, 'registros', 'readwrite', s => s.delete(id));
}

// -------- ESTACIONES --------
export async function saveEstacion(estacion) {
  const db = await openDB();
  return tx(db, 'estaciones', 'readwrite', s => s.put(estacion));
}

export async function saveEstaciones(estaciones) {
  const db = await openDB();
  const t = db.transaction('estaciones', 'readwrite');
  const s = t.objectStore('estaciones');
  for (const e of estaciones) s.put(e);
  return new Promise((res, rej) => {
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export async function getAllEstaciones() {
  const db = await openDB();
  return tx(db, 'estaciones', 'readonly', s => s.getAll());
}

export async function deleteEstacion(id) {
  const db = await openDB();
  return tx(db, 'estaciones', 'readwrite', s => s.delete(id));
}

// -------- CONFIG --------
export async function setConfig(key, value) {
  const db = await openDB();
  return tx(db, 'config', 'readwrite', s => s.put({ key, value }));
}

export async function getConfig(key) {
  const db = await openDB();
  const r = await tx(db, 'config', 'readonly', s => s.get(key));
  return r ? r.value : null;
}

// -------- HELPER --------
function tx(db, store, mode, fn) {
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    if (req && typeof req.onsuccess !== 'undefined') {
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    } else {
      t.oncomplete = () => res();
      t.onerror    = () => rej(t.error);
    }
  });
}
