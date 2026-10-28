// profe.html lleva dos copias: el código de apps-script/Code.gs (para pegarlo) y las preguntas originales del juego
// (para que la profe parta de ellas). Este script comprueba que coinciden; con --arreglar las actualiza.
//   node pruebas/comprobar-copias.js [--arreglar]
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..'),rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const game=rd('index.html'),code=rd('apps-script/Code.gs');
let profe=rd('profe.html');

// Preguntas originales: se evalúa el bloque de datos del juego, de ROCKS a BOARDS.
const src=game.slice(game.indexOf('const ROCKS='),game.indexOf('const BOARDS='));
const box={window:{}};vm.runInNewContext(src+';this.out={CARDS,RETOS:Q0.r,PANELS,BOARDS:null}',box);
const {CARDS,RETOS,PANELS}=box.out;
const NAMES=['Desierto de Tabernas','Sorbas','Pueblo','Costa de Cabo de Gata'];
const where={};JSON.parse(/const BOARDS=(\[.*?\]);/.exec(game)[1].replace(/'/g,'"')).flat().forEach((s,i)=>s.flat().forEach(k=>where[k]=NAMES[i]));
const row=(id,sobre,texto,c)=>({id,sobre,texto,pregunta:c.q,correcta:c.o[c.a_],incorrectas:c.o.filter((o,i)=>i!==c.a_)});
const def=RETOS.map((r,i)=>row('reto'+(i+1),'Reto '+(i+1)+' (año '+(2027+2*i)+')',r.fact,r))
  .concat(PANELS.map(k=>row(k,'Panel: '+CARDS[k].n+' ('+where[k]+')',CARDS[k].fact,CARDS[k])));
const defTxt='const DEF='+JSON.stringify(def)+';';

const escHtml=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const reDef=/const DEF=\[.*\];/,reCode=/(<textarea id="cCode"[^>]*>)([\s\S]*?)(<\/textarea>)/;
const okDef=(reDef.exec(profe)||[])[0]===defTxt,okCode=(reCode.exec(profe)||[])[2]===escHtml(code);
console.log('Preguntas originales en profe.html:',okDef?'al día':'DISTINTAS');
console.log('Código de Code.gs en profe.html:',okCode?'al día':'DISTINTO');
if(process.argv.includes('--arreglar')&&!(okDef&&okCode)){
  profe=profe.replace(reDef,()=>defTxt).replace(reCode,(m,a,b,c)=>a+escHtml(code)+c);
  fs.writeFileSync(path.join(ROOT,'profe.html'),profe);console.log('profe.html actualizado.');
}else if(!(okDef&&okCode))process.exitCode=1;
