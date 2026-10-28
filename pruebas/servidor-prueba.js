const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),rows=new Map();let preg=[];const KEY='clave-test';
http.createServer((req,res)=>{
 const u=new URL(req.url,'http://x');
 const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'};
 if(u.pathname==='/exec'){
  if(req.method==='POST'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{const d=JSON.parse(b);if(d.tipo==='preguntas'){res.writeHead(200,{...cors,'Content-Type':'application/json'});if(d.clave!==KEY){res.end('{"ok":false,"error":"clave"}');return}preg=d.preguntas;res.end('{"ok":true}');return}if(!d.sid||!d.nombre)throw 0;rows.set(d.sid,d);res.writeHead(200,{...cors,'Content-Type':'application/json'});res.end('{"ok":true}')}catch(e){res.writeHead(200,{...cors,'Content-Type':'application/json'});res.end('{"ok":false}')}});return}
  res.writeHead(200,{...cors,'Content-Type':'application/json'});
  if(u.searchParams.get('preguntas')){res.end(JSON.stringify({ok:true,preguntas:preg}));return}
  if(u.searchParams.get('clave')!==KEY){res.end('{"ok":false,"error":"clave"}');return}
  res.end(JSON.stringify({ok:true,filas:[...rows.values()]}));return}
 if(req.method==='OPTIONS'){res.writeHead(204,cors);res.end();return}
 let f=path.join(ROOT,u.pathname==='/'?'index.html':u.pathname);
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html; charset=utf-8':'text/plain'});res.end(d)});
}).listen(8765,()=>console.log('listo'));
