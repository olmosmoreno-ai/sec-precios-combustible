# Precios Combustible SEC

PWA para registrar precios de combustible en estaciones de servicio: foto del letrero, lectura automática de precios (OCR gratuito, 100% en el navegador), detección de la estación por GPS, y exportación a Excel.

## Cómo funciona

1. **Nuevo registro** — fotografía el letrero de precios. La app obtiene la ubicación GPS y detecta automáticamente a qué estación corresponde (dentro de 40 m), comparando contra la lista de estaciones. Si no la detecta, se elige manualmente de la lista.
2. Para cada combustible (93 / 95 / 97 / Diésel), se puede ingresar el precio a mano o tocar ✂️ para encerrar el número en la foto y que la IA (OCR local, gratis) lo lea automáticamente.
3. **Estaciones** — lista de estaciones conocidas (semilla inicial: Arica). El botón "Geocodificar pendientes" convierte cada dirección en coordenadas (gratis, vía OpenStreetMap/Nominatim) para que la detección automática funcione. Se pueden agregar estaciones nuevas a mano, con la opción de usar el GPS del momento como coordenada.
4. **Historial** — todos los registros guardados, con exportación a Excel (SheetJS).

## Por qué no usa una API de pago

El OCR corre enteramente en el navegador (Tesseract.js) para que la app no tenga costo por uso — pensada para que la pueda usar cualquier persona de la institución sin depender de presupuesto para una API externa.

## Pendiente / ideas futuras

- Respaldo automático a Google Drive (como en Bitácora Vehicular SEC) — requiere autorizar el dominio final de este sitio en el cliente OAuth de Google Cloud.
- Expandir la lista semilla de estaciones a otras comunas/regiones.
