// ============================================================
// SEC Precios Combustible — App principal
// ============================================================

import { openDB, saveRegistro, getAllRegistros, deleteRegistro, saveEstaciones, saveEstacion, getAllEstaciones, getConfig, setConfig } from './db.js';
import { leerOdometroDesdeDataUrl, fileToDataUrl } from './ocr.js';
import { exportarExcel } from './sync.js';
import { geocodificarDireccion, obtenerGPS, estacionMasCercana } from './geo.js';
import { ESTACIONES_SEMILLA } from './estaciones.js';

const UMBRAL_MATCH_M = 40; // distancia máxima para asociar automáticamente una estación

// ===== ESTADO GLOBAL =====
const S = {
  estaciones: [],
  registroActual: null,
  online: navigator.onLine
};

const FUEL_FIELDS = [
  { campo: 'precio93', label: 'Gasolina 93' },
  { campo: 'precio95', label: 'Gasolina 95' },
  { campo: 'precio97', label: 'Gasolina 97' },
  { campo: 'precioDiesel', label: 'Petróleo Diésel' }
];

// ===== INIT =====
async function init() {
  await openDB();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  window.addEventListener('online', () => { S.online = true; actualizarConexion(); });
  window.addEventListener('offline', () => { S.online = false; actualizarConexion(); });
  actualizarConexion();

  await cargarEstaciones();
  nuevoRegistroVacio();
  renderizarTodo();
}

function actualizarConexion() {
  const pill = document.getElementById('conn-pill');
  const txt = document.getElementById('conn-txt');
  if (!pill || !txt) return;
  pill.className = 'conn-pill ' + (S.online ? 'online' : 'offline');
  txt.textContent = S.online ? 'Online' : 'Offline';
}

// ===== ESTACIONES: carga inicial (semilla + guardadas) =====
async function cargarEstaciones() {
  const guardadas = await getAllEstaciones();
  if (guardadas.length === 0) {
    // Primera vez: siembra la base de datos local con la lista inicial
    await saveEstaciones(ESTACIONES_SEMILLA);
    S.estaciones = ESTACIONES_SEMILLA.slice();
  } else {
    S.estaciones = guardadas;
  }
}

function renderizarTodo() {
  renderizarNuevoRegistro();
  renderizarEstaciones();
  renderizarHistorial();
}

// ===== NUEVO REGISTRO =====
function nuevoRegistroVacio() {
  S.registroActual = {
    id: 'REG_' + Date.now(),
    fecha: fmtFecha(),
    hora: fmtHora(),
    foto: null,
    gpsLat: null,
    gpsLon: null,
    estacionId: null,
    estacionLogo: '',
    estacionDireccion: '',
    estacionComuna: '',
    estacionManual: false,
    distanciaEstacionM: null,
    precio93: null,
    precio95: null,
    precio97: null,
    precioDiesel: null,
    creadoEn: new Date().toISOString()
  };
}

function fmtHora(d = new Date()) {
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}
function fmtFecha(d = new Date()) {
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderizarNuevoRegistro() {
  const r = S.registroActual;
  const img = document.getElementById('preview-letrero');
  const ph = document.getElementById('ph-letrero');
  if (r.foto) {
    if (img) { img.src = r.foto; img.style.display = 'block'; }
    if (ph) ph.style.display = 'none';
  } else {
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (ph) ph.style.display = 'block';
  }

  document.getElementById('reg-fecha-hora').textContent = `${r.fecha} · ${r.hora}`;

  const estBox = document.getElementById('estacion-detectada');
  if (estBox) {
    if (r.estacionId || r.estacionDireccion) {
      const distTxt = r.distanciaEstacionM != null ? ` (${Math.round(r.distanciaEstacionM)} m)` : '';
      estBox.innerHTML = `
        <div class="status-bar ${r.estacionManual ? 'warn' : 'success'}">
          <div class="sb-icon">${r.estacionManual ? '✋' : '📍'}</div>
          <div>
            <div class="sb-title">${r.estacionLogo || 'Estación'} — ${r.estacionDireccion || ''} ${r.estacionDireccion ? '' : ''}</div>
            <div class="sb-sub">${r.estacionComuna || 'Arica'}${distTxt}${r.estacionManual ? ' · seleccionada manualmente' : ' · detectada por GPS'}</div>
          </div>
        </div>`;
    } else {
      estBox.innerHTML = `
        <div class="status-bar info">
          <div class="sb-icon">📍</div>
          <div>
            <div class="sb-title">Sin estación asociada aún</div>
            <div class="sb-sub">Se detecta automáticamente al fotografiar el letrero, o elígela abajo</div>
          </div>
        </div>`;
    }
  }

  // Selector manual de estación (siempre disponible como respaldo)
  const sel = document.getElementById('sel-estacion-manual');
  if (sel && !sel.dataset.poblado) {
    sel.innerHTML = '<option value="">— Elegir estación manualmente —</option>';
    for (const e of S.estaciones) {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.logo} — ${e.direccion} ${e.nro || ''} (${e.comuna})`;
      sel.appendChild(opt);
    }
    sel.dataset.poblado = '1';
  }
  if (sel) sel.value = r.estacionManual ? (r.estacionId || '') : '';

  // Precios
  for (const f of FUEL_FIELDS) {
    const inp = document.getElementById(`inp-${f.campo}`);
    if (inp && document.activeElement !== inp) {
      inp.value = r[f.campo] != null ? r[f.campo] : '';
    }
  }

  const btnGuardar = document.getElementById('btn-guardar-registro');
  if (btnGuardar) {
    const algunPrecio = FUEL_FIELDS.some(f => r[f.campo] != null && r[f.campo] !== '');
    btnGuardar.disabled = !algunPrecio;
  }
}

async function onFotoLetrero(e) {
  const f = e.target.files[0];
  if (!f) return;
  const url = await fileToDataUrl(f);
  S.registroActual.foto = url;
  S.registroActual.fecha = fmtFecha();
  S.registroActual.hora = fmtHora();
  renderizarNuevoRegistro();

  toast('📍 Obteniendo ubicación…');
  const coords = await obtenerGPS();
  if (coords) {
    S.registroActual.gpsLat = coords.lat;
    S.registroActual.gpsLon = coords.lon;
    const match = estacionMasCercana(coords.lat, coords.lon, S.estaciones);
    if (match && match.distancia <= UMBRAL_MATCH_M) {
      aplicarEstacion(match.estacion, match.distancia, false);
      toast(`✅ Estación detectada: ${match.estacion.logo}`);
    } else {
      S.registroActual.estacionId = null;
      S.registroActual.estacionLogo = '';
      S.registroActual.estacionDireccion = '';
      S.registroActual.estacionComuna = '';
      S.registroActual.distanciaEstacionM = match ? match.distancia : null;
      toast(match
        ? `⚠️ La estación más cercana está a ${Math.round(match.distancia)} m — selecciónala manualmente si es la correcta`
        : '⚠️ No se detectó ninguna estación cercana — selecciónala manualmente');
    }
  } else {
    toast('⚠️ No se pudo obtener la ubicación — selecciona la estación manualmente');
  }
  renderizarNuevoRegistro();
}

function aplicarEstacion(estacion, distancia, manual) {
  S.registroActual.estacionId = estacion.id;
  S.registroActual.estacionLogo = estacion.logo;
  S.registroActual.estacionDireccion = `${estacion.direccion} ${estacion.nro || ''}`.trim();
  S.registroActual.estacionComuna = estacion.comuna;
  S.registroActual.distanciaEstacionM = distancia;
  S.registroActual.estacionManual = manual;
}

function onSeleccionEstacionManual() {
  const sel = document.getElementById('sel-estacion-manual');
  const id = sel.value;
  if (!id) return;
  const estacion = S.estaciones.find(e => e.id === id);
  if (!estacion) return;
  let distancia = null;
  if (S.registroActual.gpsLat != null && estacion.lat != null) {
    distancia = estacionMasCercana(S.registroActual.gpsLat, S.registroActual.gpsLon, [estacion])?.distancia ?? null;
  }
  aplicarEstacion(estacion, distancia, true);
  renderizarNuevoRegistro();
}

function onPrecioManual(campo) {
  const inp = document.getElementById(`inp-${campo}`);
  const val = parseFloat(inp.value);
  S.registroActual[campo] = isNaN(val) ? null : val;
  actualizarBotonGuardar();
}

function actualizarBotonGuardar() {
  const btnGuardar = document.getElementById('btn-guardar-registro');
  if (!btnGuardar) return;
  const algunPrecio = FUEL_FIELDS.some(f => S.registroActual[f.campo] != null && S.registroActual[f.campo] !== '');
  btnGuardar.disabled = !algunPrecio;
}

async function guardarRegistro() {
  const r = S.registroActual;
  if (!r.estacionId && !r.estacionDireccion) {
    const ok = confirm('No hay una estación asociada a este registro. ¿Guardar de todas formas?');
    if (!ok) return;
  }
  await saveRegistro({ ...r });
  toast('✅ Registro guardado');
  nuevoRegistroVacio();
  const sel = document.getElementById('sel-estacion-manual');
  if (sel) sel.dataset.poblado = '';
  renderizarTodo();
  mostrarPagina('historial');
}

// ===== RECORTE DE FOTO + OCR (igual que en Bitácora Vehicular) =====
// Un solo letrero suele mostrar varios precios (93/95/97/diésel); se
// recorta cada número por separado desde la misma foto ya tomada.
const R = {
  campo: null,
  img: null,
  canvas: null,
  ctx: null,
  escalaMostrada: 1,
  rect: null,
  arrastrando: false,
  inicioX: 0,
  inicioY: 0
};

function abrirRecortePrecio(campo) {
  if (!S.registroActual.foto) {
    toast('⚠️ Primero fotografía el letrero de precios');
    return;
  }
  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById('canvas-recorte');
    const maxDisplayW = 480;
    const escala = img.naturalWidth > maxDisplayW ? maxDisplayW / img.naturalWidth : 1;
    canvas.width = Math.round(img.naturalWidth * escala);
    canvas.height = Math.round(img.naturalHeight * escala);

    R.campo = campo;
    R.img = img;
    R.canvas = canvas;
    R.ctx = canvas.getContext('2d');
    R.escalaMostrada = escala;

    const w = canvas.width * 0.45;
    const h = canvas.height * 0.14;
    R.rect = { x: (canvas.width - w) / 2, y: (canvas.height - h) / 2, w, h };
    redibujarRecorte();

    canvas.style.touchAction = 'none';
    canvas.onpointerdown = onRecortePointerDown;
    canvas.onpointermove = onRecortePointerMove;
    canvas.onpointerup = onRecortePointerUp;
    canvas.onpointercancel = onRecortePointerUp;

    const label = FUEL_FIELDS.find(f => f.campo === campo)?.label || '';
    document.getElementById('recorte-lbl').textContent = `Encierra el precio de ${label}`;
    document.getElementById('overlay-recorte').classList.add('show');
  };
  img.src = S.registroActual.foto;
}

function redibujarRecorte() {
  const { ctx, canvas, rect } = R;
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(R.img, 0, 0, canvas.width, canvas.height);
  if (!rect) return;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.fill('evenodd');
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function posEnCanvasRecorte(e) {
  const canvasRect = R.canvas.getBoundingClientRect();
  const x = (e.clientX - canvasRect.left) * (R.canvas.width / canvasRect.width);
  const y = (e.clientY - canvasRect.top) * (R.canvas.height / canvasRect.height);
  return {
    x: Math.max(0, Math.min(R.canvas.width, x)),
    y: Math.max(0, Math.min(R.canvas.height, y))
  };
}

function onRecortePointerDown(e) {
  e.preventDefault();
  const p = posEnCanvasRecorte(e);
  R.arrastrando = true;
  R.inicioX = p.x;
  R.inicioY = p.y;
  R.rect = { x: p.x, y: p.y, w: 0, h: 0 };
}

function onRecortePointerMove(e) {
  if (!R.arrastrando) return;
  e.preventDefault();
  const p = posEnCanvasRecorte(e);
  R.rect = {
    x: Math.min(R.inicioX, p.x),
    y: Math.min(R.inicioY, p.y),
    w: Math.abs(p.x - R.inicioX),
    h: Math.abs(p.y - R.inicioY)
  };
  redibujarRecorte();
}

function onRecortePointerUp() {
  R.arrastrando = false;
}

async function procesarRecorte(usarRecorte) {
  cerrarOverlay('overlay-recorte');
  const campo = R.campo;
  let dataUrlParaOCR;

  if (usarRecorte && R.rect && R.rect.w > 10 && R.rect.h > 10) {
    const factor = 1 / R.escalaMostrada;
    const sx = R.rect.x * factor;
    const sy = R.rect.y * factor;
    const sw = R.rect.w * factor;
    const sh = R.rect.h * factor;

    const destW = Math.max(sw, 500);
    const destH = sh * (destW / sw);

    const tmp = document.createElement('canvas');
    tmp.width = Math.round(destW);
    tmp.height = Math.round(destH);
    tmp.getContext('2d').drawImage(R.img, sx, sy, sw, sh, 0, 0, tmp.width, tmp.height);
    dataUrlParaOCR = tmp.toDataURL('image/png');
  } else {
    dataUrlParaOCR = R.img.src;
  }

  toast('🔎 Leyendo precio…');
  const ocr = await leerOdometroDesdeDataUrl(dataUrlParaOCR);
  if (ocr.ok) {
    S.registroActual[campo] = ocr.valor;
    toast(`✅ Precio leído: $${ocr.valor.toLocaleString('es-CL')} — revisa que esté correcto`);
  } else {
    toast('⚠️ No se pudo leer automáticamente — ingresa el precio a mano');
  }
  renderizarNuevoRegistro();
  actualizarBotonGuardar();
}

// ===== ESTACIONES (administración) =====
function renderizarEstaciones() {
  const cnt = document.getElementById('estaciones-lista');
  if (!cnt) return;
  if (!S.estaciones.length) {
    cnt.innerHTML = '<p class="text-muted text-sm" style="text-align:center; padding:1rem 0;">Sin estaciones registradas</p>';
    return;
  }
  const pendientes = S.estaciones.filter(e => e.lat == null).length;
  const btnGeo = document.getElementById('btn-geocodificar');
  if (btnGeo) btnGeo.textContent = pendientes > 0 ? `📡 Geocodificar ${pendientes} pendiente${pendientes > 1 ? 's' : ''}` : '✅ Todas geocodificadas';
  if (btnGeo) btnGeo.disabled = pendientes === 0;

  let html = '';
  for (const e of S.estaciones.sort((a, b) => a.direccion.localeCompare(b.direccion))) {
    const ubicada = e.lat != null;
    html += `
      <div class="hist-item">
        <div class="hist-icon">⛽</div>
        <div style="flex:1; min-width:0;">
          <div class="hist-title">${e.logo} — ${e.direccion} ${e.nro || ''}</div>
          <div class="hist-meta">${e.comuna} · ${e.id}</div>
          <div style="margin-top:4px;">
            ${ubicada
              ? `<span class="chip chip-green">📍 ubicada</span>`
              : `<span class="chip chip-amber">⏳ pendiente</span>`}
          </div>
        </div>
      </div>`;
  }
  cnt.innerHTML = html;
}

async function geocodificarPendientes() {
  const pendientes = S.estaciones.filter(e => e.lat == null);
  if (!pendientes.length) return;
  const btn = document.getElementById('btn-geocodificar');
  if (btn) btn.disabled = true;

  let ok = 0, falló = 0;
  for (let i = 0; i < pendientes.length; i++) {
    const e = pendientes[i];
    toast(`📡 Geocodificando ${i + 1}/${pendientes.length}: ${e.direccion}…`, 1500);
    const res = await geocodificarDireccion(`${e.direccion} ${e.nro || ''}`.trim(), e.comuna);
    if (res) {
      e.lat = res.lat;
      e.lon = res.lon;
      await saveEstacion(e);
      ok++;
    } else {
      falló++;
    }
    renderizarEstaciones();
    if (i < pendientes.length - 1) await esperar(1100); // respeta el límite de Nominatim (1 req/seg)
  }
  toast(`✅ Geocodificación lista: ${ok} ubicadas${falló ? `, ${falló} sin resultado` : ''}`);
  renderizarEstaciones();
}

function esperar(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function resetearFormAgregarEstacion() {
  ['inp-est-logo', 'inp-est-direccion', 'inp-est-nro'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const nota = document.getElementById('est-gps-nota');
  if (nota) nota.textContent = '';
  window._gpsNuevaEstacion = null;
}

async function usarGPSParaNuevaEstacion() {
  toast('📍 Obteniendo ubicación…');
  const coords = await obtenerGPS();
  if (!coords) { toast('⚠️ No se pudo obtener la ubicación'); return; }
  window._gpsNuevaEstacion = coords;
  const nota = document.getElementById('est-gps-nota');
  if (nota) nota.textContent = `✅ Ubicación capturada (${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)})`;
}

async function guardarNuevaEstacion() {
  const logo = document.getElementById('inp-est-logo').value.trim();
  const direccion = document.getElementById('inp-est-direccion').value.trim();
  const nro = document.getElementById('inp-est-nro').value.trim();
  if (!logo || !direccion) {
    toast('⚠️ Completa al menos la marca y la dirección');
    return;
  }
  const estacion = {
    id: 'MANUAL_' + Date.now(),
    logo, direccion, nro, comuna: 'ARICA',
    lat: window._gpsNuevaEstacion?.lat ?? null,
    lon: window._gpsNuevaEstacion?.lon ?? null
  };
  await saveEstacion(estacion);
  S.estaciones.push(estacion);
  cerrarOverlay('overlay-nueva-estacion');
  const sel = document.getElementById('sel-estacion-manual');
  if (sel) sel.dataset.poblado = '';
  toast('✅ Estación agregada');
  renderizarTodo();
}

// ===== HISTORIAL =====
async function renderizarHistorial() {
  const cnt = document.getElementById('historial-lista');
  if (!cnt) return;
  const registros = await getAllRegistros();
  registros.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  if (!registros.length) {
    cnt.innerHTML = '<p class="text-muted text-sm" style="text-align:center; padding:1rem 0;">Sin registros</p>';
    return;
  }

  let html = '';
  for (const r of registros) {
    const precios = FUEL_FIELDS
      .filter(f => r[f.campo] != null && r[f.campo] !== '')
      .map(f => `${f.label.split(' ').pop()}: $${Number(r[f.campo]).toLocaleString('es-CL')}`)
      .join(' · ');
    html += `
      <div class="hist-item">
        <div class="hist-icon">⛽</div>
        <div style="flex:1; min-width:0;">
          <div class="hist-title">${r.fecha} ${r.hora} — ${r.estacionLogo || 'Sin estación'}</div>
          <div class="hist-meta">${r.estacionDireccion || ''}${r.estacionDireccion ? ' · ' : ''}${precios || 'Sin precios'}</div>
        </div>
        <div class="hist-right">
          <button class="btn btn-ghost btn-sm" onclick="accion.borrarRegistro('${r.id}')">🗑️</button>
        </div>
      </div>`;
  }
  cnt.innerHTML = html;
}

// ===== ACCIONES (expuestas al HTML) =====
window.accion = {
  onFotoLetrero,
  onSeleccionEstacionManual,
  onPrecioManual,
  guardarRegistro,
  abrirRecortePrecio,
  confirmarRecorte: () => procesarRecorte(true),
  usarFotoCompletaRecorte: () => procesarRecorte(false),
  geocodificarPendientes,
  abrirNuevaEstacion: () => { resetearFormAgregarEstacion(); document.getElementById('overlay-nueva-estacion').classList.add('show'); },
  usarGPSParaNuevaEstacion,
  guardarNuevaEstacion,
  async exportarTodo() {
    const registros = await getAllRegistros();
    await exportarExcel(registros);
  },
  async borrarRegistro(id) {
    const ok = confirm('¿Eliminar este registro?');
    if (!ok) return;
    await deleteRegistro(id);
    toast('🗑️ Registro eliminado');
    renderizarHistorial();
  }
};

window.onFotoLetrero = onFotoLetrero;
window.onSeleccionEstacionManual = onSeleccionEstacionManual;
window.onPrecioManual = onPrecioManual;

// ===== NAVEGACIÓN =====
window.mostrarPagina = function (id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.getElementById('nav-' + id).classList.add('active');
  if (id === 'historial') renderizarHistorial();
  if (id === 'estaciones') renderizarEstaciones();
};

// ===== OVERLAY =====
window.cerrarOverlay = function (id) {
  document.getElementById(id).classList.remove('show');
};

// ===== TOAST =====
window.toast = function (msg, dur = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), dur);
};
function toast(msg, dur) { window.toast(msg, dur); }

// ===== ARRANQUE =====
document.addEventListener('DOMContentLoaded', init);
