// Simula una clase: N alumnos con perfiles distintos juegan el juego real (sin dibujar) con reloj acelerado.
const {chromium}=require('playwright');const fs=require('fs');const base64=s=>Buffer.from(s).toString('base64url');
const N=+process.argv[2]||100,K=+process.argv[3]||8,OUT=process.argv[4]||'res.jsonl',BASE='http://localhost:8765/index.html';
const PROFILES=[
 ['aplicado',.20,{p:.82,read:.9,reto:.9,lit:.5,cave:.8,idle:[2,5],w:{solar:3,tree:2,pos:2,pol:2},quest:.8}],
 ['normal',.40,{p:.65,read:.6,reto:.6,lit:.4,cave:.4,idle:[4,10],w:{solar:1.5,tree:2,pos:1.5,pol:1},quest:.4}],
 ['plantador',.15,{p:.6,read:.5,reto:.5,lit:.4,cave:.3,idle:[4,10],w:{solar:.3,tree:4,pos:3,pol:.2},quest:.1}],
 ['despistado',.15,{p:.45,read:.3,reto:.3,lit:.3,cave:.2,idle:[10,30],w:{solar:1,tree:1.5,pos:1,pol:.5},quest:.2}],
 ['pasivo',.05,{p:.4,read:.15,reto:.15,lit:.15,cave:.05,idle:[25,60],w:{solar:.5,tree:1,pos:.5,pol:.2},quest:0}],
 ['explorador',.05,{p:.6,read:.7,reto:.6,lit:.9,cave:1,idle:[2,6],w:{solar:1,tree:1,pos:1,pol:1},quest:.3}]];
const NAMES='Lucía Martín,Hugo García,Martina López,Pablo Sánchez,Sofía Pérez,Álvaro Gómez,Paula Ruiz,Daniel Díaz,Valeria Moreno,Adrián Muñoz,Carmen Romero,Mario Navarro,Alba Torres,Javier Domínguez,Noa Vázquez,Iker Ramos,Elena Gil,Marcos Serrano,Irene Molina,Leo Ortega,Claudia Castro,Diego Rubio,Vega Morales,Bruno Iglesias,Aitana Medina'.split(',');
const PAN={'0,0':[[4,4],[3,8]],'1,0':[[2,1],[5,9]],'0,1':[[1,6],[5,9]],'1,1':[[4,1],[6,2]]};
const TS=[[5,1],[3,2],[7,2],[2,5],[7,5],[5,7],[5,10]],SS=[[2,2],[3,2],[6,2],[7,2]],PS=[[8,4],[8,6],[8,8],[7,10]];
const POLC={bus:14,reci:12,ev:16,agua:12,dunas:16};
const EX={E:[[9,5],'ArrowRight'],W:[[0,5],'ArrowLeft'],S:[[4,11],'ArrowDown'],N:[[4,0],'ArrowUp']};
const NEXT={'0,0':{E:'1,0',S:'0,1'},'1,0':{W:'0,0',S:'1,1'},'0,1':{N:'0,0',E:'1,1'},'1,1':{N:'1,0',W:'0,1'}};
async function game(browser,i){
 let rs=i*7919+13;const rnd=()=>{rs=(rs*9301+49297)%233280;return rs/233280};const pick=a=>a[Math.floor(rnd()*a.length)];
 let x=rnd(),prof=PROFILES[0];for(const pr of PROFILES){if(x<pr[1]){prof=pr;break}x-=pr[1]}
 const [pname,,P]=prof;const nombre=NAMES[i%NAMES.length]+(i>=NAMES.length?' '+(1+Math.floor(i/NAMES.length)):'');
 const grupo='1º '+'ABCD'[i%4];const link=BASE+'#c='+base64(JSON.stringify({u:'http://localhost:8765/exec',g:grupo}));
 const ctx=await browser.newContext({viewport:{width:390,height:780}});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 if(process.env.BAL)await p.addInitScript(b=>{window.__BAL__=b},JSON.parse(process.env.BAL));
 await p.addInitScript(()=>{window.__TEST__=true;window.__FAST__=true;const C=CanvasRenderingContext2D.prototype;['fillRect','strokeRect','fillText','beginPath','moveTo','lineTo','stroke','arc','fill','closePath'].forEach(k=>C[k]=function(){})});
 await p.goto(link);
 const adv=ms=>p.evaluate(x=>__g.run(x),ms/1000);
 const st=()=>p.evaluate(()=>{const S=__g.S;const free=(sx,sy,l)=>l.filter(([c,r])=>{const o=S.spots[sx+','+sy+','+c+','+r];return !o||o.dead});
   return {sx:S.sx,sy:S.sy,x:S.x,y:S.y,mode:S.mode,sci:S.sci,year:S.year,yt:S.yt,over:S.over,paused:S.paused,reto:S.reto,
   read:Object.keys(S.read),found:Object.keys(S.found).length,litter:S.litter.map(l=>[l.sx,l.sy,l.c,l.r]),pol:Object.keys(S.pol),
   moving:S.path.length>0||!!S.after||S.vx!==S.x||S.vy!==S.y,
   fT:free(0,0,[[5,1],[3,2],[7,2],[2,5],[7,5],[5,7],[5,10]]).length,fS:free(0,1,[[2,2],[3,2],[6,2],[7,2]]).length,fP:free(1,1,[[8,4],[8,6],[8,8],[7,10]]).length}});
 const T0=Date.now();const log={profile:pname,nombre,grupo,stuckS:0,richIdleS:0,actions:{},reload:false,modals:0,errs};
 const modalOpen=()=>p.isVisible('#modal');
 async function closeModals(){
  for(let k=0;k<8;k++){
   if(!(await modalOpen()))return;log.modals++;
   if(await p.$('#pNombre')){await p.fill('#pNombre',nombre);if(await p.$('#pGrupo'))await p.fill('#pGrupo',grupo);await p.click('[data-act=start]');continue}
   if(await p.$('[data-act=resume]')){await p.click('[data-act=resume]');continue}
   const nx=await p.$('#card .btn[data-act=help]');if(nx){await nx.click();continue}
   const opts=await p.$$('.opt[data-act=opt]');
   if(opts.length&&!(await opts[0].isDisabled())){const key=await opts[0].getAttribute('data-k');const ans=await p.evaluate(k=>__g.CARDS[k].a_,key);
     const idx=[];for(const o of opts)idx.push(+(await o.getAttribute('data-i')));
     await opts[rnd()<P.p?idx.indexOf(ans):Math.floor(rnd()*opts.length)].click();continue}
   if(await p.$('[data-act=again]'))return;
   const b=await p.$('#card [data-act=close]');if(b){await b.click();continue}
   return;
  }
 }
 const tap=async(c,r)=>{const bx=await p.locator('#cv').boundingBox();const rows=(await p.evaluate(()=>__g.S.mode))==='cave'?14:12;await p.mouse.click(bx.x+(c+.5)*bx.width/10,bx.y+(r+.5)*bx.height/rows)};
 async function walk(c,r){await tap(c,r);for(let k=0;k<20;k++){await adv(300);if(await modalOpen())break;const s=await st();if(!s.moving)break}await closeModals()}
 async function toScreen(tx,ty){
  for(let g=0;g<6;g++){const s=await st();if(s.over)return;if(s.mode==='cave'){await p.click('#bExit');await adv(200)}
   const cur=s.sx+','+s.sy,tgt=tx+','+ty;if(cur===tgt)return;
   const q=[[cur,[]]],seen=new Set([cur]);let path=null;while(q.length){const [n,pa]=q.shift();if(n===tgt){path=pa;break}for(const [d,m] of Object.entries(NEXT[n]))if(!seen.has(m)){seen.add(m);q.push([m,[...pa,d]])}}
   const [tile,key]=EX[path[0]];await walk(...tile);await p.keyboard.down(key);await adv(300);await p.keyboard.up(key);await adv(150);await closeModals()}
 }
 const act=k=>{log.actions[k]=(log.actions[k]||0)+1};
 await adv(200);await closeModals();await closeModals();
 const CO=await p.evaluate(()=>({c:__g.COST,p:Object.fromEntries(__g.POLICIES.map(x=>[x.id,x.cost]))}));
 const reloadAt=rnd()<.1?2028+Math.floor(rnd()*15):0;let lastT=0,caveDone=false,loops=0;
 while(loops++<900){
  const s=await st();if(s.over)break;
  const gt=(s.year-2025)*36+s.yt,dt=Math.max(0,gt-lastT);lastT=gt;
  const unread=[];for(const [k,l] of Object.entries(PAN))l.forEach((t,j)=>unread.push([k,j,t]));
  const BOARD_IDS={'0,0':['desert','agua'],'1,0':['clima','mitig'],'0,1':['gei','causas'],'1,1':['mar','oceano']};
  const unr=unread.filter(([k,j])=>!s.read.includes(BOARD_IDS[k][j]));
  const opts=[];if(s.fS)opts.push(['solar',CO.c.solar]);if(s.fT)opts.push(['tree',CO.c.tree]);if(s.fP)opts.push(['pos',CO.c.pos]);for(const [id,c] of Object.entries(CO.p))if(!s.pol.includes(id))opts.push(['pol:'+id,c]);
  const canBuy=opts.some(o=>s.sci>=o[1]),canEarn=unr.length||s.reto||s.litter.length||s.found<5;
  if(!canBuy&&!canEarn&&opts.length)log.stuckS+=dt;
  if(canBuy)log.richIdleS+=0; // se mide abajo
  if(reloadAt&&!log.reload&&s.year>=reloadAt){log.reload=true;await p.reload();await p.waitForFunction(()=>window.__g&&__g.S);await closeModals();act('recarga');continue}
  if(s.reto&&rnd()<P.reto){await toScreen(0,1);await walk(3,4);act('reto');continue}
  if(unr.length&&rnd()<P.read*.6){const [k,,t]=unr.find(u=>u[0]===s.sx+','+s.sy)||pick(unr);await toScreen(...k.split(',').map(Number));await walk(...t);act('panel');continue}
  const aff=opts.filter(o=>s.sci>=o[1]);
  if(aff.length){
   const ws=aff.map(([k])=>k.startsWith('pol')?P.w.pol:P.w[k]);let tot=ws.reduce((a,b)=>a+b,0),r=rnd()*tot,ch=aff[0][0];
   for(let j=0;j<aff.length;j++){r-=ws[j];if(r<=0){ch=aff[j][0];break}}
   if(rnd()<.85){
    if(ch==='solar'){await toScreen(0,1);const f=await p.evaluate(()=>[[2,2],[3,2],[6,2],[7,2]].find(([c,r])=>!__g.S.spots['0,1,'+c+','+r]));if(f)await walk(...f)}
    else if(ch==='tree'){await toScreen(0,0);const f=await p.evaluate(()=>[[5,1],[3,2],[7,2],[2,5],[7,5],[5,7],[5,10]].find(([c,r])=>{const o=__g.S.spots['0,0,'+c+','+r];return !o||o.dead}));if(f)await walk(...f)}
    else if(ch==='pos'){await toScreen(1,1);const f=await p.evaluate(()=>[[8,4],[8,6],[8,8],[7,10]].find(([c,r])=>{const o=__g.S.spots['1,1,'+c+','+r];return !o||o.dead}));if(f)await walk(...f)}
    else{await toScreen(0,1);await tap(5,3);for(let k=0;k<20&&!(await modalOpen());k++)await adv(300);const id=ch.slice(4);const b=await p.$(`[data-act=buy][data-id=${id}]`);if(b)await b.click();await closeModals()}
    act(ch);continue}
  }else if(opts.length)log.richIdleS+=0;
  if(s.litter.length&&rnd()<P.lit){const here=s.litter.find(l=>l[0]===s.sx&&l[1]===s.sy)||pick(s.litter);await toScreen(here[0],here[1]);await walk(here[2],here[3]);act('basura');continue}
  if(!caveDone&&rnd()<P.cave*.15){caveDone=true;await toScreen(1,0);await walk(6,2);if((await st()).mode==='cave'){for(let r=1;r<13;r+=2)for(let c=0;c<10;c+=2){await tap(c,r);await adv(150);await closeModals()}await p.click('#bExit').catch(()=>{});await adv(200)}act('cueva');continue}
  if(rnd()<.2){const bx=1+Math.floor(rnd()*8),by=1+Math.floor(rnd()*10);await walk(bx,by);act('pasear');continue}
  const [a,b]=P.idle;await adv(1000*(a+rnd()*(b-a)));await closeModals();act('esperar');
 }
 for(let k=0;k<60&&!(await st()).over;k++){await adv(10000);await closeModals()}
 await p.waitForTimeout(800);
 const fin=await p.evaluate(()=>{const S=__g.S;const a=S.ans;return {over:S.over,year:S.year,ppm:Math.round(S.ppm),temp:+(1.1+(S.ppm-420)*.012).toFixed(2),sci:S.sci,
   solar:__g.count('solar'),tree:__g.count('tree'),pos:__g.count('pos'),pol:Object.keys(S.pol),read:Object.keys(S.read).length,quests:Object.keys(S.qdone).length,
   found:Object.keys(S.found).length,litter:S.litterGot,ans:a.length,ok:a.filter(x=>x.ok).length,
   okPanel:a.filter(x=>x.ok&&!/^r\d$|^reto|^(tree|solar|pos)$/.test(x.k)).length,okReto:a.filter(x=>x.ok&&/^reto/.test(x.k)).length,
   okRock:a.filter(x=>x.ok&&/^r\d$/.test(x.k)).length,okConc:a.filter(x=>x.ok&&/^(tree|solar|pos)$/.test(x.k)).length,
   dead:Object.values(S.spots).filter(o=>o.dead).length}});
 const title=await p.evaluate(()=>{const h=document.querySelector('#card h2');return h?h.textContent:''});
 Object.assign(log,fin,{title,wall:Math.round((Date.now()-T0)/1000)});
 await ctx.close();return log;
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 fs.writeFileSync(OUT,'');let next=0,done=0;
 async function worker(){while(next<N){const i=next++;let r;try{r=await game(browser,i)}catch(e){r={i,error:String(e).slice(0,200)}}fs.appendFileSync(OUT,JSON.stringify(r)+'\n');done++;if(done%10===0)console.log('hechas',done)}}
 await Promise.all(Array.from({length:K},worker));
 await browser.close();console.log('fin');
})();
