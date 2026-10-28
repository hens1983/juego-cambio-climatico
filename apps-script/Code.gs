// Resultados de "Guardianes de Cabo de Gata" en una Hoja de cálculo de Google.
// 1) Cambia la clave de la línea siguiente por una que solo conozcas tú.
const CLAVE_PROFE = 'escribe-aqui-tu-clave';
const HOJA = 'Resultados';
const HOJA_PREG = 'Preguntas';
const CAB_PREG = ['id', 'sobre', 'texto', 'pregunta', 'correcta', 'incorrecta 1', 'incorrecta 2', 'incorrecta 3'];

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
// El panel de la profe también guarda aquí sus preguntas (con la clave).
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.tipo === 'preguntas') return guardarPreguntas_(d);
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

// El juego pide las preguntas (?preguntas=1, sin clave) y la página de la profe pide los resultados con la clave.
function doGet(e) {
  const p = e.parameter || {};
  if (p.preguntas) return salida_({ ok: true, preguntas: preguntas_() });
  if (p.clave !== CLAVE_PROFE) return salida_({ ok: false, error: 'clave' });
  const sh = hoja_();
  const ultima = sh.getLastRow();
  const filas = ultima > 1 ? sh.getRange(2, 1, ultima - 1, 8).getValues() : [];
  const datos = filas.map(f => { try { return JSON.parse(f[7]); } catch (err) { return null; } }).filter(Boolean);
  return salida_({ ok: true, filas: datos });
}

// Pestaña "Preguntas": una fila por reto o panel. También se puede editar a mano en la hoja.
function preguntas_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_PREG);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, CAB_PREG.length).getDisplayValues()
    .filter(f => f[0])
    .map(f => ({ id: f[0], sobre: f[1], texto: f[2], pregunta: f[3], correcta: f[4], incorrectas: f.slice(5) }));
}

function guardarPreguntas_(d) {
  if (d.clave !== CLAVE_PROFE) return salida_({ ok: false, error: 'clave' });
  if (!Array.isArray(d.preguntas)) return salida_({ ok: false, error: 'datos' });
  // El apóstrofo guarda todo como texto: "+1.5 °C" no se convierte en fórmula ni "1/2" en fecha.
  const txt = v => { v = String(v == null ? '' : v).trim().slice(0, 500); return v ? "'" + v : ''; };
  const filas = [CAB_PREG].concat(d.preguntas.map(p =>
    [p.id, p.sobre, p.texto, p.pregunta, p.correcta].concat([0, 1, 2].map(i => (p.incorrectas || [])[i])).map(txt)));
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(HOJA_PREG) || ss.insertSheet(HOJA_PREG);
  sh.clearContents();
  sh.getRange(1, 1, filas.length, CAB_PREG.length).setValues(filas);
  sh.setFrozenRows(1);
  return salida_({ ok: true });
}

function salida_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
