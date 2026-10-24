import json,sys,statistics as st,collections as C
R=[json.loads(l) for l in open(sys.argv[1])]
err=[r for r in R if r.get('error') or r.get('errs')]
print('partidas',len(R),'con errores',len(err),[ (r.get('error') or r.get('errs'))[:1] for r in err][:5])
R=[r for r in R if not r.get('error')]
def m(xs):return round(st.mean(xs),2) if xs else '-'
by=C.defaultdict(list)
for r in R:by[r['profile']].append(r)
print(f"{'perfil':11} n  gana  pierdeMar pierdeCalor  temp  año_fin aciertos% paneles misiones basura atascado_min")
for k,v in list(by.items())+[('TOTAL',R)]:
    w=sum(r['title'].startswith('¡Lo')for r in v);sea_=sum('mar' in r['title'] for r in v);hot=sum('calor' in r['title'] for r in v)
    acc=m([r['ok']/r['ans']*100 for r in v if r['ans']])
    print(f"{k:11}{len(v):3} {w:4} {sea_:6} {hot:9}  {m([r['temp'] for r in v]):5} {m([r['year'] for r in v]):7} {acc:8} {m([r['read'] for r in v]):7} {m([r['quests'] for r in v]):6} {m([r['litter'] for r in v]):6} {m([r['stuckS']/60 for r in v]):6}")
print('recargas',sum(r['reload'] for r in R),'· terminadas tras recargar',sum(r['reload'] and r['over'] for r in R))
print('sin terminar',sum(not r['over'] for r in R))
print('compras medias: placas',m([r['solar'] for r in R]),'árboles vivos',m([r['tree'] for r in R]),'posidonia',m([r['pos'] for r in R]),'medidas',m([len(r['pol']) for r in R]),'muertos',m([r['dead'] for r in R]))
print('Ciencia sobrante al final',m([r['sci'] for r in R]),'máx',max(r['sci'] for r in R))
print('preguntas respondidas',m([r['ans'] for r in R]))
pol=C.Counter(x for r in R for x in r['pol']);print('medidas aprobadas',dict(pol))
print('temp ganadores',m([r['temp'] for r in R if r['title'].startswith('¡Lo')]),'perdedores',m([r['temp'] for r in R if not r['title'].startswith('¡Lo')]))
