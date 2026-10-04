// ============================================================
// SEC Precios Combustible — Exportación a Excel (SheetJS)
// ============================================================

function cargarSheetJS() {
  if (window.XLSX) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

function construirWorkbook(registros) {
  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  const filas = [];
  filas.push(['SUPERINTENDENCIA DE ELECTRICIDAD Y COMBUSTIBLES', '', '', '', '', '', '', '', '', '', '']);
  filas.push([`Registro de Precios de Combustible — Exportado: ${new Date().toLocaleDateString('es-CL')}`, '', '', '', '', '', '', '', '', '', '']);
  filas.push([]);
  filas.push([
    'Fecha', 'Hora', 'ID Estación', 'Marca', 'Dirección', 'Comuna',
    'Gasolina 93', 'Gasolina 95', 'Gasolina 97', 'Petróleo Diésel', 'Kerosene',
    'Distancia GPS a estación (m)'
  ]);

  for (const r of registros) {
    filas.push([
      r.fecha || '', r.hora || '', r.estacionId || '', r.estacionLogo || '',
      r.estacionDireccion || '', r.estacionComuna || '',
      r.precio93 || '', r.precio95 || '', r.precio97 || '', r.precioDiesel || '', r.precioKerosene || '',
      (r.distanciaEstacionM != null) ? Math.round(r.distanciaEstacionM) : ''
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = [
    { wch: 11 }, { wch: 8 }, { wch: 13 }, { wch: 14 }, { wch: 30 }, { wch: 10 },
    { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 15 }, { wch: 11 }, { wch: 14 }
  ];
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Precios Combustible');
  return wb;
}

export async function exportarExcel(registros) {
  if (!registros.length) { window.toast?.('Sin registros para exportar'); return; }
  await cargarSheetJS();
  const wb = construirWorkbook(registros);
  const fecha = new Date().toISOString().slice(0, 10);
  window.XLSX.writeFile(wb, `Precios_Combustible_SEC_${fecha}.xlsx`);
}

export async function generarExcelBlob(registros) {
  if (!registros.length) return null;
  await cargarSheetJS();
  const wb = construirWorkbook(registros);
  const arrBuf = window.XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([arrBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
