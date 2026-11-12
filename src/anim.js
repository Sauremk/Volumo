/* ================= Animaciones de ejercicios =================
   Figura 2D vista de lado (o de frente). Ángulos de extremidades: 0 abajo, 90 adelante, 180 arriba, -90 atrás.
   Torso: 0 vertical, 90 inclinado hacia delante (boca abajo), -90 acostado boca arriba (cabeza a la izquierda). */
const LEN={to:.52,nk:.07,hr:.105,th:.44,sh:.42,ft:.19,ua:.29,fa:.27};
const RD=Math.PI/180;
const vA=a=>[Math.sin(a*RD),-Math.cos(a*RD)],vT=t=>[Math.sin(t*RD),Math.cos(t*RD)];
const ad=(a,b)=>[a[0]+b[0],a[1]+b[1]],sb=(a,b)=>[a[0]-b[0],a[1]-b[1]],ml=(a,k)=>[a[0]*k,a[1]*k],nr=a=>{const l=Math.hypot(a[0],a[1])||1;return [a[0]/l,a[1]/l]},lp=(a,b,k)=>ad(a,ml(sb(b,a),k));
const angOf=v=>Math.atan2(v[0],-v[1])/RD;
function ik2(root,tgt,a,b,bend){const d=sb(tgt,root);const dist=Math.min(Math.max(Math.hypot(d[0],d[1]),1e-4),a+b-1e-4);const base=Math.atan2(d[1],d[0]);const c=(a*a+dist*dist-b*b)/(2*a*dist);const A=Math.acos(Math.max(-1,Math.min(1,c)));const t=base+bend*A;const j=[root[0]+a*Math.cos(t),root[1]+a*Math.sin(t)];return [j,ad(j,ml(nr(sb(tgt,j)),b))]}
function legOf(hip,g){let k,a;
  if(g.foot)[k,a]=ik2(hip,g.foot,LEN.th,LEN.sh,g.kb||1);else{k=ad(hip,ml(vA(g.th||0),LEN.th));a=ad(k,ml(vA(g.sh||0),LEN.sh))}
  const fa=g.ft!=null?g.ft:(g.foot?90:angOf(sb(a,k))+90);return {k,a,toe:ad(a,ml(vA(fa),LEN.ft))}}
function armOf(sh,td,fr,g){let e,w;
  if(g.hand||g.rel||g.hv){const tg=g.hand||(g.hv?ad(sh,g.hv):ad(sh,ad(ml(td,g.rel[0]),ml(fr,g.rel[1]))));[e,w]=ik2(sh,tg,LEN.ua,LEN.fa,g.eb||-1)}
  else{e=ad(sh,ml(vA(g.ua||0),LEN.ua));w=ad(e,ml(vA(g.fa||0),LEN.fa))}
  const ha=g.ha!=null?g.ha:angOf(sb(w,e));return {e,w,h:ad(w,ml(vA(ha),.07))}}
function solveSide(p){
  const t=p.t||0,td=vT(t),fr=[td[1],-td[0]],an=p.anchor,L=LEN.to+(p.shrug||0)*.05;
  let hip=p.hip?p.hip.slice():[0,0];
  if(an&&an[0]==='sh')hip=sb(an[1],ml(td,L));
  const legs=[p.l||{},p.l2||p.l||{}].map(g=>legOf(hip,g));
  const mv=(s)=>{hip=ad(hip,s);legs.forEach(G=>['k','a','toe'].forEach(n=>G[n]=ad(G[n],s)))};
  if(an&&['k','a','toe'].includes(an[0]))mv(sb(an[1],legs[0][an[0]]));
  let sh=ad(hip,ml(td,L));
  const arms=[p.a||{},p.a2||p.a||{}].map(g=>armOf(sh,td,fr,g));
  if(an&&(an[0]==='e'||an[0]==='w')){const s=sb(an[1],arms[0][an[0]]);mv(s);sh=ad(sh,s);arms.forEach(A=>['e','w','h'].forEach(n=>A[n]=ad(A[n],s)))}
  const nk=ad(sh,ml(td,LEN.nk)),hd=ad(nk,ml(vT(t+(p.hd||0)),LEN.hr*.95));
  return {v:'s',hip,sh,nk,hd,td,fr,legs,arms};
}
function solveFront(p){
  const seated=!!p.seat,hy=seated?.55:.93,sy=hy+.5,sw=p.sw||.19;
  const sh=[[sw,sy],[-sw,sy]];
  const arms=sh.map((s,i)=>{const sg=i?-1:1;const hh=(i&&p.hand2)?p.hand2:p.hand;const tg=hh?[hh[0]*sg,hh[1]]:[(sw+.04)*sg,sy-.55];const[e,w]=ik2(s,tg,LEN.ua,LEN.fa,(p.eb||1)*sg);return {e,w,h:ad(w,ml(nr(sb(w,e)),.07))}});
  const legs=[1,-1].map(sg=>{const H=[.09*sg,hy];if(seated){const kx=(p.kx||.12)*sg;return {H,k:[kx,hy-.02],a:[kx,.1]}}return {H,k:[.1*sg,.5],a:[.11*sg,.08]}});
  return {v:'f',hy,sy,sh,arms,legs,hd:[0,sy+.17],seated};
}
function lerpP(a,b,k){if(typeof a==='number')return a+((typeof b==='number'?b:a)-a)*k;if(Array.isArray(a))return a.map((x,i)=>lerpP(x,b?b[i]:x,k));if(a&&typeof a==='object'){const o={};new Set([...Object.keys(a),...Object.keys(b||{})]).forEach(key=>{o[key]=(key in a)?((b&&key in b)?lerpP(a[key],b[key],k):a[key]):b[key]});return o}return k<.5?a:b}
function X(a,b){const o=JSON.parse(JSON.stringify(a));for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&o[k]&&typeof o[k]==='object')o[k]=Object.assign(o[k],b[k]);else o[k]=b[k]}return o}
const SQ=(l1,d1,l2,d2,h1,h2)=>[['A','B',d1,l1],['B','B',h1==null?.35:h1,''],['B','A',d2,l2],['A','A',h2==null?.5:h2,'']];
const AW=sq=>sq; // alias

/* ---- Bases ---- */
const STD={t:0,anchor:['a',[0,.08]],l:{th:0,sh:0},l2:{th:0,sh:0},a:{ua:0,fa:0}};
const SEAT=(t,hipY)=>({t:t||0,hip:[0,hipY||.55],l:{th:88,sh:0},l2:{th:88,sh:0}});
const LYB={t:-90,hip:[.2,.53],l:{th:86,sh:-3},l2:{th:86,sh:-3}};// acostado en banco
const BENCH=(x0,x1,y)=>[['bench',x0,x1,y]];
const PT=(x,y)=>[x,y];
const RV=(t,a,f)=>{const td=vT(t),fr=[td[1],-td[0]];return ad(ml(td,a),ml(fr,f))};const HANG=[0,-.555];
const bbHand=J=>[['bb',J.arms[0].w]];
const dbHands=J=>[['db',J.arms[1].w,1],['db',J.arms[0].w,0]];
const cable=(from,i)=>J=>[['cab',from,J.arms[i||0].w]];
const both=(...fs)=>J=>fs.flatMap(f=>f(J));

/* ---- Plantillas por ejercicio ---- */
const ANIMS={};
function def(ids,o){ids.split(' ').forEach(id=>ANIMS[id]=o)}

// PECHO
{const A=X(LYB,{a:{hand:PT(-.29,1.08),eb:1}}),B=X(A,{a:{hand:PT(-.22,.67),eb:1}});
 def('pb pc',{A,B,scene:BENCH(-.9,.3,.44),dyn:bbHand,seq:SQ('Baja la barra al pecho',2,'Empuja hacia arriba',1.1),mus:['pecho','triceps','hombros']});}
{const base={t:-52,hip:[.16,.56],l:{th:78,sh:-2},l2:{th:78,sh:-2}};const A=X(base,{a:{hand:PT(-.19,1.36),eb:1}}),B=X(A,{a:{hand:PT(-.15,.98),eb:1}});
 def('pi',{A,B,scene:[['ln',PT(.2,.46),PT(-.42,.95),.07],['ln',PT(.05,.46),PT(.4,.46),.07],['ln',PT(.1,.44),PT(.1,.08),.04]],dyn:dbHands,seq:SQ('Baja lento hasta abrir el pecho',2,'Empuja juntando arriba',1.1),mus:['pecho','hombros']});}
{const A=X(SEAT(-8),{a:{hand:PT(.12,1.12),eb:-1}}),B=X(A,{a:{hand:PT(.5,1.1),eb:-1}});
 def('pmq',{A,B,scene:[['ln',PT(-.02,.47),PT(-.2,1.2),.07],['ln',PT(-.05,.47),PT(.42,.47),.07]],dyn:J=>[['pad',J.arms[0].w,.04]],seq:SQ('Empuja al frente',1.1,'Vuelve controlado',2),mus:['pecho','triceps']});}
{const A={t:66,anchor:['w',PT(0,.05)],a:{ua:0,fa:0},l:{th:-66,sh:-66,ft:12},l2:{th:-66,sh:-66,ft:12}},B=X(A,{t:79,a:{ua:-92,fa:2},l:{th:-79,sh:-79,ft:5},l2:{th:-79,sh:-79,ft:5}});
 def('fl fdi',{A,B,scene:[],seq:SQ('Baja el pecho casi al suelo',1.6,'Empuja manteniendo el cuerpo recto',1),mus:['pecho','triceps','abdomen']});}
{const A={t:5,hip:PT(-.05,1.2),l:{th:12,sh:-55},l2:{th:12,sh:-55},a:{hand:PT(.02,1.2),eb:1}},B=X(A,{t:22,hip:PT(-.12,.94)});
 def('fd',{A,B,scene:[['ln',PT(-.15,1.18),PT(.25,1.18),.05],['ln',PT(.2,1.18),PT(.2,.08),.05]],seq:SQ('Baja hasta 90° en los codos',1.6,'Empuja hacia arriba',1.1),mus:['triceps','pecho']});}
// HOMBROS
{const A=X(SEAT(-6),{a:{rel:[.07,.09],eb:-1}}),B=X(A,{a:{rel:[.55,.04],eb:-1}});
 def('pmm',{A,B,scene:[['ln',PT(-.04,.48),PT(-.13,1.25),.07],['ln',PT(-.05,.47),PT(.35,.47),.07]],dyn:dbHands,seq:SQ('Empuja sobre la cabeza',1.1,'Baja hasta las orejas',1.8),mus:['hombros','triceps']});}
{const A=X(STD,{a:{rel:[.02,.12],eb:-1}}),B=X(A,{a:{rel:[.57,.02],eb:-1}});
 def('pmi',{A,B,dyn:bbHand,seq:SQ('Empuja la barra arriba',1.1,'Baja a las clavículas',1.8),mus:['hombros','triceps']});}
{const A=X(STD,{a:{ua:3,fa:3}}),B=X(STD,{a:{ua:90,fa:90}});
 def('ef',{A,B,dyn:dbHands,seq:SQ('Sube el brazo al frente',1.1,'Baja lento',1.8),mus:['hombros']});}
{const A={v:'f',hand:PT(.25,.92),eb:1},B={v:'f',hand:PT(.78,1.42),eb:1};
 def('el',{A,B,dyn:J=>[['db',J.arms[0].w,0],['db',J.arms[1].w,0]],seq:SQ('Sube hasta la altura del hombro',1.1,'Baja lento',1.8),mus:['hombros']});
 def('pj',{A,B,dyn:J=>[['db',J.arms[0].w,0],['db',J.arms[1].w,0]],seq:SQ('Abre los brazos (torso inclinado)',1.1,'Baja controlado',1.8),mus:['hombros','trapecio'],note:'Vista de frente: hazlo sentado e inclinado hacia delante'});
 const C={v:'f',hand:PT(.25,.92),hand2:PT(.22,.95),eb:1},D={v:'f',hand:PT(.8,1.4),hand2:PT(.22,.95),eb:1};
 def('elp',{A:C,B:D,scene:[['circ',PT(-.5,.12),.05]],dyn:J=>[['cab',[-.5,.12],J.arms[0].w]],seq:SQ('Sube el brazo hacia un lado',1.1,'Baja sin soltar la tensión',1.8),mus:['hombros']});}
{const A=X(STD,{t:-6,a:{hv:[.55,.02],eb:1}}),B=X(A,{a:{hv:RV(-6,.17,.1),eb:1}});
 def('fp',{A,B,scene:[['circ',PT(1,1.58),.05]],dyn:cable([1,1.58]),seq:SQ('Tira hacia la cara, codos altos',1.1,'Vuelve estirando',1.6),mus:['hombros','trapecio']});}
{const A=X(STD,{t:48,hip:PT(0,.6),l:{foot:PT(-.18,.08),kb:1},l2:{foot:PT(-.18,.08),kb:1},anchor:null,a:{hv:HANG,eb:1}}),B=X(A,{a:{hv:RV(48,-.1,.14),eb:1}});
 def('ri45',{A,B,scene:[['ln',PT(-.08,.52),PT(.42,1.02),.08],['ln',PT(-.1,.5),PT(-.1,.08),.04]],dyn:dbHands,seq:SQ('Tira con los codos abiertos',1.1,'Baja lento',1.6),mus:['hombros','trapecio']});}
// BRAZOS
{const A=X(STD,{a:{ua:0,fa:2}}),B=X(A,{a:{ua:-4,fa:145}});
 def('cbb cz',{A,B,dyn:bbHand,seq:SQ('Sube sin mover los codos',1.1,'Baja lento',1.8),mus:['biceps']});
 def('cinvb',{A,B,dyn:bbHand,seq:SQ('Sube con palmas hacia abajo',1.1,'Baja lento',1.8),mus:['antebrazos','biceps']});
 def('cm',{A,B,dyn:dbHands,seq:SQ('Sube con agarre neutro',1.1,'Baja controlado',1.8),mus:['antebrazos','biceps']});
 def('cpo',{A,B,scene:[['circ',PT(.32,.12),.05]],dyn:cable([.32,.12]),seq:SQ('Sube la barra',1.1,'Baja sin soltar la tensión',1.8),mus:['biceps']});
 const C=X(A,{a:{ua:0,fa:2},a2:{ua:-4,fa:145}}),B2=X(A,{a:{ua:-4,fa:145},a2:{ua:0,fa:2}}),A2=X(A,{a2:{ua:0,fa:2}});
 def('cb',{A:A2,B:B2,C,dyn:dbHands,seq:[['A','B',1.1,'Sube un brazo'],['B','A',1.6,'Baja lento'],['A','C',1.1,'Ahora el otro brazo'],['C','A',1.6,'Baja lento']],mus:['biceps']});}
{const A={t:32,hip:PT(0,.52),l:{th:82,sh:-6},l2:{th:82,sh:-6},a:{ua:22,fa:22},a2:{ua:30,fa:60}},B=X(A,{a:{ua:22,fa:165}});
 def('cc',{A,B,scene:[['rect',-.25,.32,.12,.44]],dyn:J=>[['db',J.arms[0].w,0]],seq:SQ('Sube girando la palma',1.1,'Baja hasta estirar',1.8),mus:['biceps']});}
{const A={t:-34,hip:PT(.05,.56),l:{th:78,sh:0},l2:{th:78,sh:0},a:{ua:-12,fa:-12}},B=X(A,{a:{ua:-12,fa:140}});
 def('cinc',{A,B,scene:[['ln',PT(.08,.48),PT(-.32,1.08),.07],['ln',PT(0,.48),PT(.4,.48),.07]],dyn:dbHands,seq:SQ('Sube sin adelantar los codos',1.1,'Baja hasta estirar del todo',1.9),mus:['biceps']});}
{const A={t:12,hip:PT(0,.58),l:{th:86,sh:0},l2:{th:86,sh:0},a:{ua:48,fa:52}},B=X(A,{a:{ua:48,fa:165}});
 def('cpr',{A,B,scene:[['ln',PT(.13,1.18),PT(.36,.92),.06],['rect',-.15,.5,.25,.56]],dyn:bbHand,seq:SQ('Sube la barra',1.1,'Baja casi hasta estirar',1.9),mus:['biceps']});}
{const A={t:24,hip:PT(0,.52),l:{th:86,sh:-4},l2:{th:86,sh:-4},a:{ua:42,fa:88,ha:40}},B=X(A,{a:{ha:140}});
 def('cmu',{A,B,scene:[['rect',-.2,.42,.15,.48]],dyn:J=>[['bb',J.arms[0].h,.6]],seq:SQ('Sube solo con las muñecas',.9,'Baja dejando rodar la barra',1.4),mus:['antebrazos']});}
{const A=X(STD,{a:{ua:0,fa:0}}),B=X(A,{l:{th:22,sh:-6},l2:{th:-20,sh:-28}}),C=X(A,{l:{th:-20,sh:-28},l2:{th:22,sh:-6}});
 def('farm',{A,B,C,dyn:dbHands,seq:[['A','B',.45,'Camina erguido'],['B','A',.45,'Pasos cortos'],['A','C',.45,'Hombros atrás'],['C','A',.45,'Agarre fuerte']],mus:['antebrazos','trapecio']});}
{const A={t:-3,hip:PT(.04,1.12),l:{th:6,sh:-8},l2:{th:6,sh:-8},a:{hand:PT(.06,2.2),eb:1}},B=X(A,{hip:PT(.04,1.105)});
 def('colg',{A,B,scene:[['ln',PT(-.25,2.2),PT(.35,2.2),.04]],seq:[['A','B',1.5,'Aguanta colgado'],['B','A',1.5,'Respira normal']],mus:['antebrazos']});}
{const A=X(STD,{l2:{th:-12,sh:-12},t:22,a:{ua:162,fa:-38,eb:1}}),B=X(A,{a:{ua:162,fa:-196}});
 def('eoh',{A,B,scene:[['circ',PT(-.62,.9),.05]],dyn:J=>[['cab',[-.62,.9],J.arms[0].w]],seq:SQ('Extiende arriba y adelante',1.1,'Vuelve estirando el tríceps',1.9),mus:['triceps']});}
{const A=X(STD,{t:58,l:{th:22,sh:-12},l2:{th:22,sh:-12},a:{ua:0,fa:0}}),B=X(A,{a:{ua:5,fa:4}});A.a={hand:null};
 const K={t:62,anchor:['a',[0,.08]],l:{th:24,sh:-14},l2:{th:24,sh:-14},a:{ua:-62,fa:0},a2:{ua:0,fa:0}},K2=X(K,{a:{ua:-62,fa:-62}});
 def('pt',{A:K,B:K2,dyn:J=>[['db',J.arms[0].w,0]],seq:SQ('Extiende el brazo atrás',1,'Vuelve a 90°',1.6),mus:['triceps']});}
{const A=X(STD,{t:8,a:{ua:-4,fa:92}}),B=X(A,{a:{ua:-4,fa:-4}});
 def('tpc tp',{A,B,scene:[['circ',PT(.3,2.15),.05]],dyn:cable([.3,2.15]),seq:SQ('Extiende hacia abajo',1,'Vuelve hasta 90°',1.6),mus:['triceps']});}
// ESPALDA
{const A={t:-6,hip:PT(.08,1.12),l:{th:16,sh:-48},l2:{th:16,sh:-48},a:{hand:PT(.06,2.2),eb:1}},B=X(A,{hip:PT(.07,1.5)});
 def('dm',{A,B,scene:[['ln',PT(-.25,2.2),PT(.35,2.2),.04]],seq:SQ('Sube llevando el pecho a la barra',1.2,'Baja completo',1.8),mus:['dorsales','biceps']});
 def('dms',{A,B,scene:[['ln',PT(-.25,2.2),PT(.35,2.2),.04]],seq:SQ('Sube hasta pasar la barbilla',1.2,'Baja completo',1.8),mus:['biceps','dorsales']});}
{const A=X(SEAT(-12),{a:{hand:PT(-.06,1.62),eb:1}}),B=X(A,{a:{hand:PT(.06,1.15),eb:1}});
 def('jp',{A,B,scene:[['circ',PT(-.05,2.25),.05],['rect',.25,.6,.5,.68],['ln',PT(-.02,.47),PT(.4,.47),.07]],dyn:cable([-.05,2.25]),seq:SQ('Tira hacia el pecho',1.1,'Sube lento estirando',1.8),mus:['dorsales','biceps']});}
{const A=X(STD,{t:32,l:{th:12,sh:-6},l2:{th:12,sh:-6},a:{ua:142,fa:142}}),B=X(A,{a:{ua:12,fa:12}});
 def('pul',{A,B,scene:[['circ',PT(.9,2.05),.05]],dyn:cable([.9,2.05]),seq:SQ('Lleva la barra a los muslos en arco',1.2,'Vuelve lento',1.8),mus:['dorsales']});}
{const A=X(STD,{t:58,l:{th:26,sh:-14},l2:{th:26,sh:-14},a:{hv:HANG,eb:1}}),B=X(A,{a:{hv:RV(58,-.36,.13),eb:1}});
 def('rb',{A,B,dyn:bbHand,seq:SQ('Tira la barra al ombligo',1.1,'Baja controlado',1.7),mus:['dorsales','trapecio']});}
{const A={t:76,hip:PT(0,.9),l:{foot:PT(.14,.08),kb:1},l2:{th:0,sh:-90},a:{hv:HANG,eb:1},a2:{ua:0,fa:0}},B=X(A,{a:{hv:RV(76,-.42,.12),eb:1}});
 def('rm',{A,B,scene:BENCH(-.35,.75,.42),dyn:J=>[['db',J.arms[0].w,0]],seq:SQ('Codo hacia la cadera',1.1,'Baja estirando el hombro',1.7),mus:['dorsales']});}
{const A={t:14,hip:PT(0,.27),l:{th:84,sh:78},l2:{th:84,sh:78},a:{hand:PT(.74,.62),eb:1}},B=X(A,{t:-6,a:{hand:PT(.18,.6),eb:1}});
 def('rps',{A,B,scene:[['rect',-.3,.14,.3,.2],['ln',PT(.92,.08),PT(.92,.42),.05],['circ',PT(1.15,.6),.05]],dyn:cable([1.15,.6]),seq:SQ('Tira hacia el abdomen',1.1,'Vuelve sin encorvarte',1.7),mus:['dorsales','trapecio']});}
{const A={t:-77,anchor:['a',PT(1.05,.1)],l:{th:77,sh:77,ft:180},l2:{th:77,sh:77,ft:180},a:{hand:PT(-.29,.95),eb:-1}},B=X(A,{t:-60,l:{th:60,sh:60,ft:160},l2:{th:60,sh:60,ft:160}});
 def('rinv',{A,B,scene:[['ln',PT(-.6,.95),PT(.1,.95),.04]],seq:SQ('Tira el pecho a la barra',1.1,'Baja controlado',1.6),mus:['dorsales','biceps']});}
{const A=X(STD,{t:52,l:{th:58,sh:-28},l2:{th:58,sh:-28},a:{ua:0,fa:0}}),B=X(STD,{a:{ua:0,fa:0}});
 def('pm',{A,B,dyn:bbHand,seq:SQ('Empuja el suelo y extiende la cadera',1.4,'Baja la barra pegada a las piernas',1.8,.5,.5),mus:['lumbar','gluteos','isquios','trapecio']});}
{const A=X(STD,{a:{ua:0,fa:0}}),B=X(A,{t:76,l:{th:14,sh:-6},l2:{th:14,sh:-6}});
 def('pmr',{A,B,dyn:bbHand,seq:SQ('Cadera atrás, barra por las piernas',1.9,'Sube apretando glúteos',1.2),mus:['isquios','gluteos','lumbar']});}
{const A=X(STD,{a:{rel:[.02,-.07],eb:-1}}),B=X(A,{t:72,l:{th:14,sh:-8},l2:{th:14,sh:-8}});
 def('bd',{A,B,dyn:J=>[['bb',ad(J.sh,ml(J.fr,-.07))]],seq:SQ('Inclina llevando la cadera atrás',1.8,'Vuelve arriba',1.2),mus:['lumbar','isquios']});}
{const A={t:150,hip:PT(0,.82),l:{th:-42,sh:-42,ft:50},l2:{th:-42,sh:-42,ft:50},a:{rel:[-.14,.11],eb:1}},B=X(A,{t:42});
 def('hip',{A,B,scene:[['ln',PT(-.05,.76),PT(.12,.88),.08],['ln',PT(-.62,.2),PT(-.48,.12),.06],['ln',PT(0,.76),PT(-.3,.08),.04]],seq:SQ('Sube hasta quedar en línea',1.2,'Baja el torso',1.6),mus:['lumbar','gluteos']});}
{const A={t:90,hip:PT(0,.1),l:{th:-90,sh:-90,ft:-180},l2:{th:-90,sh:-90,ft:-180},a:{ua:90,fa:90}},B=X(A,{t:78,l:{th:-104,sh:-104},l2:{th:-104,sh:-104},a:{ua:104,fa:104}});
 def('sup',{A,B,seq:SQ('Eleva brazos y piernas',1,'Baja lento',1.4,.8),mus:['lumbar','gluteos']});}
{const A=X(STD,{a:{ua:0,fa:0}}),B=X(A,{shrug:1});
 def('enc',{A,B,dyn:dbHands,seq:SQ('Sube los hombros a las orejas',.9,'Baja lento',1.4,.8),mus:['trapecio']});}
{const A=X(STD,{a:{hv:[.02,-.555],eb:1}}),B=X(A,{a:{hv:RV(0,-.1,.1),eb:1}});
 def('rmen',{A,B,dyn:bbHand,seq:SQ('Sube con los codos por delante',1.1,'Baja lento',1.7),mus:['trapecio','hombros']});}
// PIERNAS
{const A=X(STD,{t:6,a:{rel:[-.02,-.1],eb:-1}}),B=X(A,{t:40,l:{th:80,sh:-32},l2:{th:80,sh:-32}});
 def('sq',{A,B,dyn:J=>[['bb',ad(ad(J.sh,ml(J.fr,-.08)),ml(J.td,.02))]],seq:SQ('Baja: cadera atrás y abajo',2,'Sube empujando con todo el pie',1.2),mus:['cuadriceps','gluteos']});}
{const A=X(STD,{t:-20,anchor:['a',PT(.18,.12)],l:{th:-20,sh:-20},l2:{th:-20,sh:-20},a:{rel:[.02,.1],eb:-1}}),B=X(A,{l:{th:70,sh:-38},l2:{th:70,sh:-38}});
 def('hack',{A,B,scene:[['ln',PT(.05,.1),PT(.45,.1),.05]],dyn:J=>[['ln',ad(J.hip,ml(J.fr,-.12)),ad(J.sh,ml(J.fr,-.12)),.06]],seq:SQ('Baja pasando de paralelo',2,'Empuja hacia arriba',1.2),mus:['cuadriceps','gluteos']});}
{const A={t:-50,hip:PT(0,.45),l:{th:122,sh:122,ft:175},l2:{th:122,sh:122,ft:175},a:{ua:22,fa:70}},B=X(A,{l:{th:166,sh:98},l2:{th:166,sh:98}});
 def('pr',{A,B,scene:[['ln',PT(.05,.38),PT(-.42,.82),.08],['ln',PT(-.05,.38),PT(.25,.38),.08]],dyn:J=>[['ln',ad(J.legs[0].a,PT(.02,-.2)),ad(J.legs[0].a,PT(.02,.22)),.05]],seq:SQ('Baja hasta 90° en rodillas',2,'Empuja sin bloquear',1.2),mus:['cuadriceps','gluteos']});
 const C=X(A,{l:{ft:175},l2:{ft:175}}),D=X(A,{l:{ft:140},l2:{ft:140}});
 def('gpr',{A:C,B:D,scene:[['ln',PT(.05,.38),PT(-.42,.82),.08],['ln',PT(-.05,.38),PT(.25,.38),.08]],dyn:J=>[['ln',ad(J.legs[0].toe,PT(-.05,-.18)),ad(J.legs[0].toe,PT(-.05,.15)),.05]],seq:SQ('Empuja con las puntas',.9,'Vuelve estirando',1.4,.4,.6),mus:['gemelos']});}
{const A={t:0,hip:PT(0,.86),l:{foot:PT(.33,.08),kb:1},l2:{foot:PT(-.4,.17),kb:1,ft:58},a:{ua:0,fa:0}},B=X(A,{hip:PT(-.03,.52),t:4});
 def('zc',{A,B,dyn:dbHands,seq:SQ('Baja hasta casi tocar el suelo',1.6,'Sube con la pierna de delante',1.1),mus:['cuadriceps','gluteos']});}
{const A={t:14,hip:PT(-.04,.84),l:{foot:PT(.26,.08),kb:1},l2:{foot:PT(-.62,.48),kb:1,ft:-95},a:{ua:0,fa:0}},B=X(A,{hip:PT(-.1,.5),t:24});
 def('bulg',{A,B,scene:BENCH(-.95,-.5,.42),dyn:dbHands,seq:SQ('Baja con la pierna de delante',1.7,'Sube empujando',1.1),mus:['cuadriceps','gluteos']});}
{const A={t:-12,hip:PT(0,.56),l:{th:90,sh:-12},l2:{th:90,sh:-12},a:{ua:10,fa:30}},B=X(A,{l:{th:90,sh:84},l2:{th:90,sh:84}});
 def('ext',{A,B,scene:[['ln',PT(-.02,.48),PT(-.18,1.15),.07],['ln',PT(-.05,.48),PT(.42,.48),.07]],dyn:J=>[['pad',ad(J.legs[0].a,ml(nr(sb(J.legs[0].a,J.legs[0].k)),-.0)),.05]],seq:SQ('Extiende las piernas',1.1,'Baja lento',1.8),mus:['cuadriceps']});}
{const A={t:12,hip:PT(0,.56),l:{th:90,sh:72},l2:{th:90,sh:72},a:{ua:20,fa:60}},B=X(A,{l:{th:90,sh:-28},l2:{th:90,sh:-28}});
 def('cfs',{A,B,scene:[['ln',PT(-.02,.48),PT(-.18,1.1),.07],['ln',PT(-.05,.48),PT(.42,.48),.07],['rect',.1,.62,.42,.68]],dyn:J=>[['pad',ad(J.legs[0].a,PT(0,-.02)),.05]],seq:SQ('Talones hacia abajo y atrás',1.1,'Vuelve lento',1.8),mus:['isquios']});}
{const A={t:93,hip:PT(0,.56),l:{th:-90,sh:-90,ft:-180},l2:{th:-90,sh:-90,ft:-180},a:{ua:20,fa:90}},B=X(A,{l:{th:-90,sh:-212},l2:{th:-90,sh:-212}});
 def('ci',{A,B,scene:BENCH(-.5,.7,.48),dyn:J=>[['pad',J.legs[0].a,.05]],seq:SQ('Talones a los glúteos',1.1,'Vuelve lento',1.8),mus:['isquios']});}
{const A={t:0,anchor:['k',PT(0,.1)],l:{th:0,sh:-90,ft:-180},l2:{th:0,sh:-90,ft:-180},a:{rel:[-.12,.12],eb:1}},B=X(A,{t:58,l:{th:-58,sh:-90},l2:{th:-58,sh:-90},a:{rel:[-.02,.3],eb:1}});
 def('nord',{A,B,scene:[['rect',-.12,.02,.12,.08],['rect',-.52,.1,-.38,.2]],seq:SQ('Déjate caer lo más lento posible',2.6,'Vuelve ayudándote con las manos',1.2,.3,.6),mus:['isquios']});}
{const A={t:-55,anchor:['sh',PT(-.45,.48)],l:{foot:PT(.4,.08),kb:1},l2:{foot:PT(.4,.08),kb:1},a:{hand:null}},B=X(A,{t:-94});
 A.a={rel:[-.5,.12],eb:1};B.a={rel:[-.5,.12],eb:1};
 def('hp',{A,B,scene:BENCH(-.95,-.38,.42),dyn:J=>[['bb',ad(J.hip,ml(J.fr,.12))]],seq:SQ('Sube la cadera apretando glúteos',1.1,'Baja controlado',1.7,.6),mus:['gluteos','isquios']});}
{const A={t:-90,anchor:['sh',PT(-.5,.1)],l:{foot:PT(.36,.08),kb:1},l2:{foot:PT(.36,.08),kb:1},a:{ua:90,fa:90}},B=X(A,{t:-117});
 def('pg',{A,B,seq:SQ('Sube la cadera',1,'Baja lento',1.5,.7),mus:['gluteos']});}
{const A={v:'f',seat:1,kx:.11,hand:PT(.25,.62)},B={v:'f',seat:1,kx:.32,hand:PT(.25,.62)};
 def('abd',{A,B,dyn:J=>[['pad',J.legs[0].k,.05],['pad',J.legs[1].k,.05]],seq:SQ('Abre las piernas',1,'Vuelve controlado',1.6),mus:['gluteos']});}
{const A=X(STD,{anchor:['toe',PT(.17,.15)],l:{th:0,sh:0,ft:108},l2:{th:0,sh:0,ft:108},a:{rel:[.0,.1],eb:-1}}),B=X(A,{l:{ft:58},l2:{ft:58}});
 def('gm',{A,B,scene:[['rect',.02,0,.45,.15]],seq:SQ('Sube lo más alto posible',.9,'Baja hasta estirar el talón',1.5,.5,.7),mus:['gemelos']});
 const C=X(A,{a:{ua:0,fa:0}}),D=X(B,{a:{ua:0,fa:0}});
 def('gup',{A:C,B:D,scene:[['rect',.02,0,.45,.15]],dyn:J=>[['db',J.arms[0].w,0]],seq:SQ('Sube con un pie',.9,'Baja estirando',1.5,.5,.7),mus:['gemelos']});}
{const A={t:2,anchor:['toe',PT(.62,.13)],l:{th:90,sh:0,ft:100},l2:{th:90,sh:0,ft:100},a:{ua:30,fa:80}},B=X(A,{l:{th:80,ft:55},l2:{th:80,ft:55}});
 def('gs',{A,B,scene:[['rect',.35,0,.7,.13],['rect',-.22,.4,.14,.47]],dyn:J=>[['pad',ad(J.legs[0].k,PT(0,.06)),.05]],seq:SQ('Sube los talones',.9,'Baja hasta estirar',1.5),mus:['gemelos']});}
// CORE
{const A={t:-90,hip:PT(0,.11),l:{foot:PT(.42,.08),kb:-1},l2:{foot:PT(.42,.08),kb:-1},a:{rel:[.13,-.08],eb:1}},B=X(A,{t:-62});
 def('crt',{A,B,seq:SQ('Despega los hombros',.9,'Baja lento',1.3),mus:['abdomen']});}
{const A={t:-110,hip:PT(.22,.52),l:{foot:PT(.62,.08),kb:-1},l2:{foot:PT(.62,.08),kb:-1},a:{rel:[.13,-.08],eb:1}},B=X(A,{t:-55});
 def('cfb',{A,B,scene:[['ball',PT(-.02,.3),.3]],seq:SQ('Sube el torso',.9,'Baja estirando',1.4),mus:['abdomen']});}
{const A={t:-90,hip:PT(0,.11),l:{th:178,sh:178},l2:{th:178,sh:178},a:{ua:172,fa:172}},B=X(A,{t:-62,a:{ua:150,fa:150}});
 def('cpv',{A,B,seq:SQ('Sube hacia los pies',.9,'Baja controlado',1.3),mus:['abdomen','oblicuos']});}
{const A={t:-68,hip:PT(0,.11),l:{th:200,sh:100},l2:{th:110,sh:105},a:{rel:[.13,-.08],eb:1}},B=X(A,{t:-66,l:{th:110,sh:105},l2:{th:200,sh:100}});
 def('bic',{A,B,seq:[['A','B',.9,'Codo a la rodilla contraria'],['B','A',.9,'Cambia de lado, lento']],mus:['abdomen','oblicuos']});}
{const A={t:0,hip:PT(0,1.05),l:{th:2,sh:0},l2:{th:2,sh:0},a:{ua:0,fa:90}},B=X(A,{t:-6,l:{th:108,sh:8},l2:{th:108,sh:8}});
 def('ep',{A,B,scene:[['ln',PT(-.13,.82),PT(-.13,1.75),.08],['ln',PT(-.1,1.27),PT(.32,1.27),.06]],seq:SQ('Rodillas al pecho',1,'Baja sin balancearte',1.6),mus:['abdomen','oblicuos']});}
{const A={t:-90,hip:PT(0,.11),l:{th:178,sh:90},l2:{th:178,sh:90},a:{ua:90,fa:90}},B=X(A,{t:-100,hip:PT(0,.17),l:{th:222,sh:122},l2:{th:222,sh:122}});
 def('cinv',{A,B,seq:SQ('Rodillas al pecho despegando la cadera',1,'Baja lento',1.5),mus:['abdomen','oblicuos']});}
{const A={t:80,anchor:['e',PT(0,.05)],l:{th:-80,sh:-80,ft:8},l2:{th:-80,sh:-80,ft:8},a:{ua:0,fa:90}},B=X(A,{t:81});
 def('pl',{A,B,seq:[['A','B',2,'Cuerpo recto, abdomen firme'],['B','A',2,'Respira y aguanta']],mus:['abdomen']});
 def('pll',{A,B,seq:[['A','B',2,'Cadera arriba, en línea'],['B','A',2,'Respira y aguanta']],mus:['oblicuos','abdomen'],note:'De lado, apoyado en un solo antebrazo'});}
{const A={t:12,anchor:['k',PT(0,.08)],l:{th:-2,sh:-90,ft:-180},l2:{th:-2,sh:-90,ft:-180},a:{rel:[.1,.1],eb:1}},B=X(A,{t:96});
 def('cr',{A,B,scene:[['circ',PT(.38,2.15),.05]],dyn:cable([.38,2.15]),seq:SQ('Enrolla el torso',1.1,'Vuelve lento',1.6),mus:['abdomen']});}
// PECHO de frente
{const A={v:'f',seat:1,hand:PT(.72,1.36),eb:1},B={v:'f',seat:1,hand:PT(.12,1.3),eb:1};
 def('pd',{A,B,dyn:J=>[['pad',J.arms[0].w,.05],['pad',J.arms[1].w,.05]],seq:SQ('Junta los brazos al frente',1.1,'Vuelve lento hasta estirar',1.8),mus:['pecho']});
 const C={v:'f',hand:PT(.76,1.58),eb:1},D={v:'f',hand:PT(.1,1.12),eb:1};
 def('ap',{A:C,B:D,scene:[['circ',PT(1.05,2.15),.05],['circ',PT(-1.05,2.15),.05]],dyn:J=>[['cab',[1.05,2.15],J.arms[0].w],['cab',[-1.05,2.15],J.arms[1].w]],seq:SQ('Abrazo: junta las manos',1.1,'Vuelve abriendo el pecho',1.8),mus:['pecho']});}

/* ---- Dibujo ---- */
const MUSREG={ // regiones en vista lateral: [segmento, t0, t1, lado(+1 frente/-1 atrás/0), grosor]
  pecho:[['to',.6,.9,1,.1]],abdomen:[['to',.12,.55,1,.09]],oblicuos:[['to',.15,.5,0,.14]],dorsales:[['to',.38,.85,-1,.11]],lumbar:[['to',.04,.36,-1,.08]],trapecio:[['to',.82,1.06,-1,.09]],
  hombros:[['shc']],biceps:[['ua',.18,.85,1,.06]],triceps:[['ua',.1,.88,-1,.065]],antebrazos:[['fa',.08,.8,0,.07]],gluteos:[['glu']],cuadriceps:[['th',.08,.9,1,.08]],isquios:[['th',.1,.9,-1,.075]],gemelos:[['shn',.08,.55,-1,.07]]
};
const SKIN='#d8a888',SKIN2='#9c735c',SHIRT='#566273',SHIRT2='#39414c',SHORT='#2c333d',SHORT2='#20252c',SHOE='#e9ecef',SHOE2='#9aa0a7',HAIR='#2a221d',GLOW='#c6f432';
function drawAnim(ctx,W,H,T,J,fit,o){
  o=o||{};const S=fit.s,ox=fit.ox,oy=fit.oy;const X_=p=>ox+p[0]*S,Y_=p=>oy-p[1]*S;
  const ln=(a,b,w,c,cap)=>{ctx.strokeStyle=c;ctx.lineWidth=w*S;ctx.lineCap=cap||'round';ctx.beginPath();ctx.moveTo(X_(a),Y_(a));ctx.lineTo(X_(b),Y_(b));ctx.stroke()};
  const ci=(p,r,c,st)=>{ctx.beginPath();ctx.arc(X_(p),Y_(p),r*S,0,7);if(st){ctx.strokeStyle=c;ctx.lineWidth=st*S;ctx.stroke()}else{ctx.fillStyle=c;ctx.fill()}};
  // cápsula con grosor distinto en cada extremo
  const cap=(a,b,ra,rb,c)=>{const d=nr(sb(b,a)),n=[-d[1],d[0]];const ang=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);ctx.fillStyle=c;ctx.beginPath();
    ctx.moveTo(X_(ad(a,ml(n,ra))),Y_(ad(a,ml(n,ra))));ctx.lineTo(X_(ad(b,ml(n,rb))),Y_(ad(b,ml(n,rb))));
    ctx.arc(X_(b),Y_(b),rb*S,ang-Math.PI/2,ang+Math.PI/2,false);ctx.lineTo(X_(ad(a,ml(n,-ra))),Y_(ad(a,ml(n,-ra))));ctx.arc(X_(a),Y_(a),ra*S,ang+Math.PI/2,ang+Math.PI*1.5,false);ctx.closePath();ctx.fill()};
  const poly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(X_(q),Y_(q)):ctx.moveTo(X_(q),Y_(q)));ctx.closePath();ctx.fill()};
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,.03)';ctx.fillRect(0,Y_([0,0]),W,H);ln([-6,0],[6,0],.012,'#3a4048','butt');
  // sombra en el suelo
  const cx=J.v==='s'?(J.hip[0]+J.legs[0].a[0])/2:0;ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(X_([cx,0]),Y_([0,0]),.42*S,.05*S,0,0,7);ctx.fill();ctx.restore();
  const prim=q=>{const t=q[0];
    if(t==='bench'){ln([q[1],q[3]],[q[2],q[3]],.07,'#454c55','butt');ln([q[1]+.08,q[3]],[q[1]+.08,0],.035,'#353b42','butt');ln([q[2]-.08,q[3]],[q[2]-.08,0],.035,'#353b42','butt')}
    else if(t==='ln')ln(q[1],q[2],q[3]||.05,q[4]||'#454c55');
    else if(t==='rect'){ctx.fillStyle=q[5]||'#3a4048';ctx.fillRect(X_([q[1],0]),Y_([0,q[4]]),(q[3]-q[1])*S,(q[4]-q[2])*S)}
    else if(t==='circ')ci(q[1],q[2],'#6b737c');
    else if(t==='ball')ci(q[1],q[2],'#2f4a5c');
    else if(t==='cab')ln(q[1],q[2],.008,'#8b939c');
    else if(t==='bb'){const r=.2*(q[2]||1);ci(q[1],r,'#22272c');ci(q[1],r,'#7d858e',.02);ci(q[1],r*.55,'#5b636c',.012);ci(q[1],.025,'#c9ced4')}
    else if(t==='db'){const c=q[2]?'#5a6068':'#a9b0b8';ci(q[1],.052,c);ci(q[1],.052,'#22272c',.01)}
    else if(t==='pad')ci(q[1],q[2],'#59606a');
  };
  (T.scene||[]).forEach(prim);
  const dyn=T.dyn?T.dyn(J):[];
  dyn.filter(q=>q[0]!=='db'&&q[0]!=='pad').forEach(prim);
  // fantasma de la posición a la que vas
  if(o.ghost){ctx.save();ctx.globalAlpha=.16;const G=o.ghost;const c='#ffffff';
    if(G.v==='s'){[0,1].forEach(i=>{ln(G.hip,G.legs[i].k,.12,c);ln(G.legs[i].k,G.legs[i].a,.09,c);ln(G.sh,G.arms[i].e,.08,c);ln(G.arms[i].e,G.arms[i].w,.065,c)});ln(G.hip,G.sh,.2,c);ci(G.hd,.095,c)}
    else{G.legs.forEach(L=>{ln(L.H,L.k,.12,c);ln(L.k,L.a,.09,c)});G.arms.forEach((A,i)=>{ln(G.sh[i],A.e,.08,c);ln(A.e,A.w,.065,c)});ln([0,G.hy],[0,G.sy],.3,c);ci(G.hd,.095,c)}
    ctx.restore()}
  // trayectoria con flecha
  if(o.path&&o.path.length>1){ctx.save();ctx.strokeStyle=GLOW;ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();o.path.forEach((q,i)=>i?ctx.lineTo(X_(q),Y_(q)):ctx.moveTo(X_(q),Y_(q)));ctx.stroke();ctx.setLineDash([]);
    if(o.arrow){const[a,b]=o.arrow;const ang=Math.atan2(Y_(b)-Y_(a),X_(b)-X_(a));ctx.globalAlpha=.9;ctx.fillStyle=GLOW;ctx.beginPath();ctx.moveTo(X_(b),Y_(b));ctx.lineTo(X_(b)-12*Math.cos(ang-.45),Y_(b)-12*Math.sin(ang-.45));ctx.lineTo(X_(b)-12*Math.cos(ang+.45),Y_(b)-12*Math.sin(ang+.45));ctx.closePath();ctx.fill()}
    ctx.restore()}
  const ga=.5+.4*(o.hl||0);
  const glowSeg=(a,b,w)=>{ctx.save();ctx.globalAlpha=ga;ctx.shadowColor=GLOW;ctx.shadowBlur=10;ln(a,b,w,GLOW);ctx.restore()};
  const glowCi=(p,r)=>{ctx.save();ctx.globalAlpha=ga;ctx.shadowColor=GLOW;ctx.shadowBlur=10;ci(p,r,GLOW);ctx.restore()};
  if(J.v==='s'){
    const td=J.td,fr=J.fr,h=J.hip,s=J.sh;const pt=(a,f)=>ad(lp(h,s,a),ml(fr,f));
    const leg=(i,far)=>{const L=J.legs[i];const sk=far?SKIN2:SKIN;
      cap(L.k,L.a,.05,.034,sk);cap(h,L.k,.078,.054,sk);
      cap(h,lp(h,L.k,.55),.088,.07,far?SHORT2:SHORT);
      const fd=nr(sb(L.toe,L.a));cap(ad(L.a,ml(fd,-.045)),ad(L.toe,ml(fd,-.01)),.04,.032,far?SHOE2:SHOE)};
    const arm=(i,far)=>{const A=J.arms[i];const sk=far?SKIN2:SKIN;
      cap(A.e,A.w,.04,.028,sk);cap(s,A.e,.05,.04,sk);cap(s,lp(s,A.e,.45),.058,.05,far?SHIRT2:SHIRT);ci(A.h,.036,sk)};
    const regs=(i)=>({ua:[s,J.arms[i].e],fa:[J.arms[i].e,J.arms[i].w],th:[h,J.legs[i].k],shn:[J.legs[i].k,J.legs[i].a]});
    const hlLimb=i=>(T.mus||[]).forEach(m=>(MUSREG[m]||[]).forEach(r=>{const sg=regs(i)[r[0]];if(!sg)return;const d=nr(sb(sg[1],sg[0])),n=[-d[1],d[0]];const off=ml(n,r[3]*r[4]*.32);glowSeg(ad(lp(sg[0],sg[1],r[1]),off),ad(lp(sg[0],sg[1],r[2]),off),r[4]*.75)}));
    arm(1,true);hlLimb(1);leg(1,true);hlLimb(1);
    // torso con forma (pecho, cintura, espalda)
    ctx.fillStyle=SHIRT;ctx.beginPath();
    const P0=pt(-.02,-.095),P1=pt(.5,-.11),P2=pt(.98,-.075),P3=ad(s,ml(td,.035)),P4=pt(.98,.07),P5=pt(.72,.125),P6=pt(.4,.1),P7=pt(.08,.1);
    const mv=q=>ctx.moveTo(X_(q),Y_(q)),qd=(c,q)=>ctx.quadraticCurveTo(X_(c),Y_(c),X_(q),Y_(q));
    mv(P0);qd(pt(.25,-.12),P1);qd(pt(.8,-.1),P2);qd(ad(P2,ml(td,.05)),P3);qd(ad(P4,ml(td,.04)),P4);qd(pt(.88,.13),P5);qd(pt(.55,.12),P6);qd(pt(.22,.095),P7);ctx.closePath();ctx.fill();
    poly([pt(-.12,-.1),pt(.16,-.11),pt(.16,.105),pt(-.12,.1)],SHORT);ci(lp(h,s,-.04),.1,SHORT);
    // cuello y cabeza
    cap(J.sh,J.nk,.04,.036,SKIN);
    ci(ad(ad(J.hd,ml(fr,-.016)),ml(td,.014)),.104,HAIR);ci(ad(ad(J.hd,ml(fr,.012)),ml(td,-.01)),.092,SKIN);
    ci(ad(J.hd,ml(fr,-.012)),.022,SKIN2);
    ci(ad(ad(J.hd,ml(fr,.062)),ml(td,.012)),.011,'#1a1d21');
    (T.mus||[]).forEach(m=>(MUSREG[m]||[]).forEach(r=>{
      if(r[0]==='to')glowSeg(pt(r[1],r[3]*.06),pt(r[2],r[3]*.06),r[4]*.85);
      else if(r[0]==='glu')glowCi(ad(pt(.03,-.075),ml(td,-.01)),.075);
      else if(r[0]==='shc')glowCi(J.sh,.058);
    }));
    leg(0,false);hlLimb(0);arm(0,false);hlLimb(0);
  }else{
    J.legs.forEach(L=>{cap(L.k,L.a,.05,.034,SKIN);cap(L.H,L.k,.075,.054,SKIN);cap(L.H,lp(L.H,L.k,.5),.085,.07,SHORT);cap(ad(L.a,[0,-.02]),ad(L.a,[0,-.04]),.045,.045,SHOE)});
    if(J.seated){ctx.fillStyle='#3a4048';ctx.fillRect(X_([-.3,0]),Y_([0,.5]),.6*S,.06*S)}
    J.arms.forEach((A,i)=>{cap(A.e,A.w,.04,.028,SKIN);cap(J.sh[i],A.e,.05,.04,SKIN);cap(J.sh[i],lp(J.sh[i],A.e,.45),.058,.05,SHIRT);ci(A.h,.036,SKIN)});
    poly([[-.2,J.sy+.03],[.2,J.sy+.03],[.17,J.hy+.28],[.14,J.hy+.05],[-.14,J.hy+.05],[-.17,J.hy+.28]],SHIRT);
    poly([[-.15,J.hy+.08],[.15,J.hy+.08],[.16,J.hy-.1],[-.16,J.hy-.1]],SHORT);
    cap([0,J.sy],[0,J.sy+.08],.04,.036,SKIN);ci([0,J.hd[1]+.012],.104,HAIR);ci([0,J.hd[1]-.01],.092,SKIN);
    [1,-1].forEach(sg=>{ci([.022*sg,J.hd[1]],.009,'#1a1d21')});
    (T.mus||[]).forEach(m=>{
      if(m==='hombros')J.sh.forEach(p=>glowCi(p,.06));
      if(m==='pecho')[1,-1].forEach(sg=>glowCi([.085*sg,J.sy-.09],.07));
      if(m==='trapecio')[1,-1].forEach(sg=>glowSeg([.04*sg,J.sy+.06],[.15*sg,J.sy+.01],.045));
      if(m==='gluteos')[1,-1].forEach(sg=>glowCi([.15*sg,J.hy+.03],.055));
    });
  }
  dyn.filter(q=>q[0]==='db'||q[0]==='pad').forEach(prim);
}
// punto que más se mueve (para dibujar su trayectoria)
function trackFn(T){
  const pick={hand:J=>J.v==='s'?J.arms[0].w:J.arms[0].w,hip:J=>J.v==='s'?J.hip:[0,J.hy],sh:J=>J.v==='s'?J.sh:J.sh[0],knee:J=>J.legs[0].k,ankle:J=>J.legs[0].a,head:J=>J.hd};
  const sol=p=>p.v==='f'?solveFront(p):solveSide(p);const A=sol(T.A),B=sol(T.B);let best='hand',bd=-1;
  for(const k in pick){const d=Math.hypot(...sb(pick[k](A),pick[k](B)));if(d>bd+.03){bd=d;best=k}}
  return pick[best];
}

function animFit(T,W,H){
  const pts=[];['A','B','C'].forEach(k=>{if(!T[k])return;const J=T[k].v==='f'?solveFront(T[k]):solveSide(T[k]);
    if(J.v==='s'){pts.push(J.hip,J.sh,J.hd,...J.legs.flatMap(L=>[L.k,L.a,L.toe]),...J.arms.flatMap(A=>[A.e,A.w,A.h]))}else{pts.push(J.hd,...J.arms.flatMap(A=>[A.e,A.w]),...J.legs.flatMap(L=>[L.a]),[-.25,J.sy],[.25,J.sy])}
    (T.dyn?T.dyn(J):[]).forEach(q=>{if(q[0]==='bb'){pts.push(ad(q[1],[.2,.2]),ad(q[1],[-.2,-.2]))}})});
  (T.scene||[]).forEach(q=>{if(q[0]==='bench'){pts.push([q[1],q[3]],[q[2],q[3]])}else if(q[0]==='ln'){pts.push(q[1],q[2])}else if(q[0]==='circ'||q[0]==='ball'){pts.push(ad(q[1],[q[2],q[2]]),ad(q[1],[-q[2],-q[2]]))}else if(q[0]==='rect'){pts.push([q[1],q[2]],[q[3],q[4]])}});
  pts.push([0,0]);
  let x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=0,y1=Math.max(...pts.map(p=>p[1]));
  const pad=.18;x0-=pad;x1+=pad;y1+=pad;y0-=.06;
  const s=Math.min(W/(x1-x0),H/(y1-y0));
  return {s,ox:(W-(x1-x0)*s)/2-x0*s,oy:H-(H-(y1-y0)*s)/2+y0*s};
}
let PLAYER=null;
function mountAnim(box,id){
  if(PLAYER){PLAYER.stop();PLAYER=null}
  const T=ANIMS[id];if(!T){box.style.display='none';return}
  box.innerHTML=`<canvas class="anim"></canvas><div class="aphase"><span class="pn"></span><b class="pl"></b></div><div class="abar"><i></i></div><div class="actl"><button class="ab-play">❚❚ Pausa</button><button class="ab-spd">Velocidad 1×</button></div>${T.note?`<div class="anote">${T.note}</div>`:''}`;
  const cv=box.querySelector('canvas'),ctx=cv.getContext('2d');
  let W=0,H=0,fit=null;
  const size=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);fit=animFit(T,W,H)};
  size();
  const seq=T.seq,total=seq.reduce((a,s)=>a+s[2],0);
  const track=trackFn(T),paths={},solved={};['A','B','C'].forEach(k=>{if(T[k])solved[k]=T[k].v==='f'?solveFront(T[k]):solveSide(T[k])});
  let tm=0,last=performance.now(),run=true,spd=1,alive=true,lbl='';
  const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  const frame=(now)=>{if(!alive)return;if(!cv.isConnected){alive=false;return}requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;if(run)tm=(tm+dt*spd)%total;
    if(!cv.clientWidth)return;if(cv.clientWidth!==W)size();
    let acc=0,ph=seq[0],k=0,pi=0;for(let i=0;i<seq.length;i++){if(tm<acc+seq[i][2]){ph=seq[i];k=(tm-acc)/seq[i][2];pi=i;break}acc+=seq[i][2]}
    const a=T[ph[0]],b=T[ph[1]];const pose=lerpP(a,b,ease(k));
    const J=pose.v==='f'?solveFront(pose):solveSide(pose);
    const moving=ph[0]!==ph[1];const hl=moving?(.5+.5*Math.sin(now/180)):.6;
    let mv=ph;if(!moving){mv=seq[(pi+1)%seq.length];if(mv[0]===mv[1])mv=seq[(pi+2)%seq.length]}
    const pk=mv[0]+mv[1];if(!paths[pk]){const pts=[];for(let q=0;q<=16;q++){const pp=lerpP(T[mv[0]],T[mv[1]],ease(q/16));pts.push(track(pp.v==='f'?solveFront(pp):solveSide(pp)))}paths[pk]=pts}
    const path=paths[pk];
    drawAnim(ctx,W,H,T,J,fit,{hl,ghost:solved[mv[1]],path,arrow:[path[path.length-3],path[path.length-1]]});
    if(ph[3]&&ph[3]!==lbl){lbl=ph[3];box.querySelector('.pl').textContent=lbl;const steps=seq.filter(s=>s[3]);box.querySelector('.pn').textContent=(steps.indexOf(ph)+1)+'/'+steps.length}
    box.querySelector('.abar i').style.width=(tm/total*100)+'%';
  };
  requestAnimationFrame(frame);
  box.querySelector('.ab-play').onclick=e=>{run=!run;e.target.textContent=run?'❚❚ Pausa':'▶ Seguir'};
  box.querySelector('.ab-spd').onclick=e=>{spd=spd===1?.5:1;e.target.textContent='Velocidad '+(spd===1?'1×':'½×')};
  PLAYER={stop(){alive=false}};
}
