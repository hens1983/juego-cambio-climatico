// Resultados de "Guardianes de Cabo de Gata" en una Hoja de cálculo de Google.
// 1) Cambia la clave de la línea siguiente por una que solo conozcas tú.
const CLAVE_PROFE = 'escribe-aqui-tu-clave';
const HOJA = 'Resultados';

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(['sid', 'actualizado', 'grupo', 'nombre', 'estado', 'año', 'temperatura', 'datos']);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Los alumnos envían su partida aquí (se actualiza la misma fila mientras juegan).
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.sid || !d.nombre) return salida_({ ok: false, error: 'datos' });
    const sh = hoja_();
    const ultima = sh.getLastRow();
    const ids = ultima > 1 ? sh.getRange(2, 1, ultima - 1, 1).getValues().flat() : [];
    const i = ids.indexOf(d.sid);
    const fila = [d.sid, new Date(), d.grupo || '', d.nombre, d.estado || '', d.year || '', d.temp || '', JSON.stringify(d)];
    if (i >= 0) sh.getRange(i + 2, 1, 1, fila.length).setValues([fila]);
    else sh.appendRow(fila);
    return salida_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// La página de la profe pide los resultados con la clave.
function doGet(e) {
  if (!e.parameter || e.parameter.clave !== CLAVE_PROFE) return salida_({ ok: false, error: 'clave' });
  const sh = hoja_();
  const ultima = sh.getLastRow();
  const filas = ultima > 1 ? sh.getRange(2, 1, ultima - 1, 8).getValues() : [];
  const datos = filas.map(f => { try { return JSON.parse(f[7]); } catch (err) { return null; } }).filter(Boolean);
  return salida_({ ok: true, filas: datos });
}

function salida_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
