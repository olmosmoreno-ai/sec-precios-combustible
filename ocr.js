// ============================================================
// SEC Bitácora — Lectura de odómetro por OCR (Tesseract.js)
// ============================================================
// Corre 100% en el navegador: sin conexión a internet, sin API
// externa y sin costo. Como contraparte, es menos preciso que
// un modelo de IA para fotos con reflejos, ángulo o pantallas
// LCD de segmentos — por eso siempre queda disponible el
// ingreso manual como respaldo cuando la lectura falla.
// ============================================================

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

let _tesseractCargado = null;
function cargarTesseract() {
    if (window.Tesseract) return Promise.resolve();
    if (_tesseractCargado) return _tesseractCargado;
    _tesseractCargado = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = TESSERACT_CDN;
        s.onload = resolve;
        s.onerror = () => { _tesseractCargado = null; reject(new Error('No se pudo cargar Tesseract.js')); };
        document.head.appendChild(s);
    });
    return _tesseractCargado;
}

// ===== UTILIDADES =====
export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

// Prepara distintas variantes de la misma foto para dárselas a Tesseract.
// En pruebas con fotos reales de tablero (pantalla LCD con brillo/reflejos,
// no un display plano tipo calculadora), forzar blanco y negro con un
// umbral fijo resultó CONTRAPRODUCENTE: el halo/desenfoque de los dígitos
// se rompe en manchas y confunde al OCR más que ayudarlo. La imagen a
// color (o en su defecto en escala de grises), solo agrandada, leyó mejor.
// Por eso se intentan varias variantes de la más suave a la más agresiva,
// en vez de aplicar siempre el umbral como antes.
//   'color'            → solo agranda la imagen, sin tocar los colores
//   'gris'              → escala de grises, sin umbral
//   'umbral'            → blanco y negro con umbral fijo (sirve para
//                         odómetros mecánicos de rodillo muy bien iluminados)
//   'umbral-invertido'  → el umbral anterior pero invertido (pantallas con
//                         dígitos claros sobre fondo oscuro)
function preprocesar(dataUrl, { modo = 'umbral', maxW = 1200 } = {}) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const escala = img.width > maxW ? maxW / img.width : 1;
            canvas.width = Math.round(img.width * escala);
            canvas.height = Math.round(img.height * escala);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            if (modo === 'color') {
                resolve(canvas.toDataURL('image/png'));
                return;
            }

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
                const gris = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                let v = gris;
                if (modo === 'umbral' || modo === 'umbral-invertido') {
                    v = gris > 150 ? 255 : gris < 70 ? 0 : gris;
                }
                if (modo === 'umbral-invertido') v = 255 - v;
                d[i] = d[i + 1] = d[i + 2] = v;
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
        img.src = dataUrl;
    });
}

// Tesseract 'eng' (el idioma por defecto) está entrenado con fuentes de
// documentos normales y le cuesta mucho leer dígitos de pantallas LCD de
// segmentos, que es justamente el tipo de odómetro más común hoy en día.
// '7seg' es un set de datos entrenado específicamente para dígitos de
// siete segmentos (pantallas digitales).
const SEVEN_SEG_LANG = '7seg';
const SEVEN_SEG_PATH = 'https://cdn.jsdelivr.net/gh/Shreeshrii/tessdata_ssd@master';

async function crearWorker(lang, langPath) {
    return langPath
        ? await Tesseract.createWorker(lang, 1, { langPath, gzip: false })
        : await Tesseract.createWorker(lang);
}

// Reutiliza el mismo worker para varias imágenes (en vez de crear uno por
// intento, que es la parte lenta): se prueban todas las variantes de
// preprocesado con este modelo antes de pasar al siguiente modelo.
async function reconocerVariantes(worker, variantes) {
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: '7'
    });
    for (const imgProcesada of variantes) {
        const { data: { text } } = await worker.recognize(imgProcesada);
        const valor = aNumero(text);
        if (valor !== null) return valor;
    }
    return null;
}

function aNumero(texto) {
    const soloDigitos = (texto || '').replace(/[^\d]/g, '');
    const valor = parseInt(soloDigitos, 10);
    if (!soloDigitos || isNaN(valor) || valor <= 0) return null;
    return valor;
}

// ===== OCR PRINCIPAL =====
// Devuelve { ok: true, valor: number } o { ok: false, reason: string }
// Acepta directamente un dataURL (por ejemplo, ya recortado y acercado
// a solo los dígitos del odómetro por el usuario) para evitar una
// conversión de más cuando ya se tiene la imagen en memoria.
export async function leerOdometroDesdeDataUrl(dataUrl) {
    try {
        await cargarTesseract();

        const variantes = await Promise.all([
            preprocesar(dataUrl, { modo: 'color' }),
            preprocesar(dataUrl, { modo: 'gris' }),
            preprocesar(dataUrl, { modo: 'umbral' }),
            preprocesar(dataUrl, { modo: 'umbral-invertido' })
        ]);

        // 1er intento: modelo especializado en dígitos de 7 segmentos
        // (odómetros digitales — el caso más común y el que más fallaba).
        try {
            const worker7seg = await crearWorker(SEVEN_SEG_LANG, SEVEN_SEG_PATH);
            try {
                const valor = await reconocerVariantes(worker7seg, variantes);
                if (valor !== null) return { ok: true, valor };
            } finally {
                await worker7seg.terminate();
            }
        } catch (err) {
            console.warn('OCR 7-segmentos no disponible, se usa modelo estándar:', err);
        }

        // 2do intento: modelo estándar (mejor para odómetros mecánicos
        // de rodillos con números impresos normales, y el que mejor leyó
        // en pruebas con fotos de tablero reales).
        const workerEng = await crearWorker('eng');
        try {
            const valor = await reconocerVariantes(workerEng, variantes);
            if (valor !== null) return { ok: true, valor };
        } finally {
            await workerEng.terminate();
        }

        return { ok: false, reason: 'no-legible' };
    } catch (err) {
        console.error('Error leyendo odómetro (OCR):', err);
        return { ok: false, reason: 'error-ocr' };
    }
}

// Variante de conveniencia para cuando se parte de un File (input de
// cámara) en vez de un dataURL ya en memoria.
export async function leerOdometro(file) {
    const dataUrl = await fileToDataUrl(file);
    return leerOdometroDesdeDataUrl(dataUrl);
}
