/* ================= Semanas, racha y logros ================= */
const WEEK=7*864e5;
function weekOf(t){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()}
function weekStats(ws){const H=P().history.filter(h=>h.start>=ws&&h.start<ws+WEEK);const ms=new Set();H.forEach(h=>h.items.forEach(it=>(EX2MUS[it.id]||[]).forEach(m=>ms.add(m))));
  return {n:H.length,vol:H.reduce((a,h)=>a+vol(h),0),sets:H.reduce((a,h)=>a+h.items.reduce((b,it)=>b+work(it.sets).length,0),0),ms}}
function streak(){const d=P().days,cnt={};P().history.forEach(h=>{const w=weekOf(h.start);cnt[w]=(cnt[w]||0)+1});
  let cur=0,w=weekStart();if((cnt[w]||0)>=d)cur++;w-=WEEK;while((cnt[w]||0)>=d){cur++;w-=WEEK}
  let best=0,run=0;const ws=Object.keys(cnt).map(Number).sort();if(ws.length){for(let x=ws[0];x<=weekStart();x+=WEEK){if((cnt[x]||0)>=d){run++;best=Math.max(best,run)}else if(x!==weekStart())run=0}}
  return {cur,best:Math.max(best,cur)}}
function achievements(){
  const p=P(),H=p.history,n=H.length,v=H.reduce((a,h)=>a+vol(h),0),st=streak(),prs=prCount();
  const full=(()=>{const cnt={};H.forEach(h=>{const w=weekOf(h.start);const c=cnt[w]||(cnt[w]={});new Set(h.items.flatMap(it=>EX2MUS[it.id]||[])).forEach(m=>c[m]=(c[m]||0)+1)});return Object.values(cnt).some(c=>MKEYS.every(m=>(c[m]||0)>=1))})();
  return [
    {id:'e1',ic:'🎯',n:'Primer entreno',d:'Termina tu primer entreno',ok:n>=1},
    {id:'e10',ic:'💪',n:'Constante',d:'10 entrenos completados',ok:n>=10,pg:[n,10]},
    {id:'e50',ic:'🦾',n:'Imparable',d:'50 entrenos completados',ok:n>=50,pg:[n,50]},
    {id:'v10',ic:'🏋️',n:'10.000 lb',d:'Levanta 10.000 lb en total',ok:v>=1e4,pg:[Math.round(v),1e4]},
    {id:'v100',ic:'🏗️',n:'100.000 lb',d:'Levanta 100.000 lb en total',ok:v>=1e5,pg:[Math.round(v),1e5]},
    {id:'s2',ic:'🔥',n:'Racha de 2',d:'2 semanas seguidas cumpliendo tu meta',ok:st.best>=2,pg:[st.best,2]},
    {id:'s4',ic:'☄️',n:'Racha de 4',d:'4 semanas seguidas cumpliendo tu meta',ok:st.best>=4,pg:[st.best,4]},
    {id:'pr1',ic:'🏆',n:'Primer récord',d:'Supera tu mejor peso en un ejercicio',ok:prs>=1},
    {id:'pr10',ic:'👑',n:'Rompe récords',d:'Consigue 10 récords',ok:prs>=10,pg:[prs,10]},
    {id:'full',ic:'🧩',n:'Cuerpo completo',d:'Entrena los 14 músculos en una semana',ok:full},
    {id:'plan',ic:'✨',n:'Con plan',d:'Crea tu plan automático',ok:!!p.planMade},
    {id:'foto',ic:'📸',n:'Antes y después',d:'Sube tu primera foto de progreso',ok:(p.photos||[]).length>0},
    {id:'med',ic:'📏',n:'Medido',d:'Registra tu primera medida',ok:(p.measures||[]).length>0},
  ];
}

/* ================= Progreso ================= */
function renderHist(){
  const H=P().history,p=P();
  $('#sSes').textContent=H.length;const v=H.reduce((a,h)=>a+vol(h),0);
  $('#sVol').textContent=v>=10000?(v/1000).toFixed(1)+'k':Math.round(v);
  $('#sSets').textContent=H.reduce((a,h)=>a+h.items.reduce((b,it)=>b+work(it.sets).length,0),0);
  // racha
  const st=streak();
  $('#streakBox').innerHTML=`<div class="streak"><div class="fl">🔥</div><div><b>${st.cur} semana${st.cur===1?'':'s'} de racha</b><span>Cumpliendo ${p.days} entrenos por semana · mejor: ${st.best}</span></div></div>`;
  // resumen semanal
  const a=weekStats(weekStart()),b=weekStats(weekStart()-WEEK);
  const dl=(x,y,u)=>{if(!y)return x?'<em class="up">nuevo</em>':'';const d=Math.round((x-y)/y*100);return `<em class="${d>=0?'up':'down'}">${d>=0?'▲':'▼'} ${Math.abs(d)}%</em>`};
  const miss=MKEYS.filter(m=>!a.ms.has(m));
  $('#weekSum').innerHTML=`<div class="card"><div class="wsum">
      <div><span>Entrenos</span><b>${a.n}</b>${dl(a.n,b.n)}</div><div><span>Volumen</span><b>${Math.round(a.vol).toLocaleString('es')}</b>${dl(a.vol,b.vol)}</div><div><span>Series</span><b>${a.sets}</b>${dl(a.sets,b.sets)}</div></div>
      <p class="muted" style="font-size:13px;margin-top:10px">Semana pasada: ${b.n} entrenos · ${Math.round(b.vol).toLocaleString('es')} lb · ${b.sets} series</p>
      ${miss.length?`<p style="font-size:14px;margin-top:8px">Te faltan esta semana: <b style="color:var(--mid)">${miss.map(m=>MUS[m].n).join(', ')}</b></p>`:'<p style="font-size:14px;margin-top:8px;color:var(--acc)">✅ Entrenaste todos los músculos esta semana</p>'}</div>`;
  renderChart();
  // récords
  const PR=prMap(),ids=Object.keys(PR).filter(id=>byId[id]).sort((x,y)=>PR[y].kgT-PR[x].kgT);
  $('#records').innerHTML=ids.length?`<div class="card">${ids.slice(0,8).map(id=>`<div class="prow"><span style="font-size:20px">🏆</span><div class="meta"><b>${byId[id].n}</b><span>${dstr(PR[id].kgT)} · 1RM estimado ${Math.round(PR[id].e1)} lb</span></div><b class="prv">${PR[id].kg} lb × ${PR[id].kgR}</b></div>`).join('')}</div>`:'<p class="muted">Tus mejores marcas aparecerán aquí.</p>';
  // logros
  const A=achievements();
  $('#achBox').innerHTML=`<div class="ach">${A.map(x=>`<div class="ab ${x.ok?'ok':''}"><span>${x.ok?x.ic:'🔒'}</span><b>${x.n}</b><small>${x.d}</small>${!x.ok&&x.pg?`<i><u style="width:${Math.min(100,x.pg[0]/x.pg[1]*100)}%"></u></i>`:''}</div>`).join('')}</div>`;
  $('#achN').textContent=A.filter(x=>x.ok).length+'/'+A.length;
  const today=new Date();today.setHours(0,0,0,0);const ws=weekStart();
  const trained=new Set(H.map(h=>{const d=new Date(h.start);d.setHours(0,0,0,0);return d.getTime()}));
  let w='';for(let i=0;i<7;i++){const d=new Date(ws);d.setDate(d.getDate()+i);w+=`<div class="day ${trained.has(d.getTime())?'on':''} ${d.getTime()===today.getTime()?'today':''}">${DAYS[d.getDay()][0]}<i></i></div>`}
  $('#week').innerHTML=w;
  $('#hist').innerHTML=H.length?H.slice(0,20).map(h=>{const d=new Date(h.start);const mins=Math.max(1,Math.round((h.end-h.start)/60000));
    return `<div class="ses"><div class="h"><b>${esc(h.name)}</b><span>${DAYS[d.getDay()]} ${dstr(h.start)} · ${mins} min</span></div>
    <ul>${h.items.filter(it=>byId[it.id]&&work(it.sets).length).map(it=>{const ws_=work(it.sets);const best=ws_.reduce((a,b)=>(+b.kg||0)>(+a.kg||0)?b:a,ws_[0]);const wu=it.sets.length-ws_.length;return `<li><em>${byId[it.id].n}</em> — ${ws_.length}×${wu?` (+${wu} C)`:''} · mejor ${best.kg||0} lb × ${best.reps||0}</li>`}).join('')}</ul>
    <div style="margin-top:8px;font-size:13px;font-weight:700">${Math.round(vol(h)).toLocaleString('es')} lb de volumen</div></div>`}).join('')
    :`<div class="empty"><b>Aún no hay entrenos</b>Termina tu primer entreno y aparecerá aquí</div>`;
}

/* ================= Mapa de calor ================= */
let bodyMode='week';
function heatSets(){const since=Date.now()-30*864e5,c={};P().history.filter(h=>h.start>=since).forEach(h=>h.items.forEach(it=>{const n=work(it.sets).length;(EX2MUS[it.id]||[]).forEach(m=>c[m]=(c[m]||0)+n)}));return c}
const HEAT=['#3b4148','#3d4a1c','#566c1f','#7d9a22','#a6c826','#c6f432'];
function heatColor(n){if(!n)return HEAT[0];return HEAT[Math.min(5,1+Math.floor(n/6))]}
let _heat=null;
function muscleColor(k,c){if(bodyMode==='heat'){_heat=_heat||heatSets();return heatColor(_heat[k]||0)}return COL[level(k,c)]}

/* ================= Nutrición ================= */
const ACT={sed:['Sedentario',1.2],lig:['Ligero (1–3 días)',1.375],mod:['Moderado (3–5 días)',1.55],alt:['Alto (6–7 días)',1.725],muy:['Muy alto (2 veces al día)',1.9]};
function nutrition(p){const lb=curWeight(p),cm=+p.height,age=+p.age;if(!lb||!cm||!age)return null;const kg=lb/2.20462;
  const bmr=10*kg+6.25*cm-5*age+(p.sex==='f'?-161:5),tdee=bmr*ACT[p.act||'mod'][1];
  const adj={grasa:-.2,musculo:.1,fuerza:.05,salud:0}[p.goal]||0,kcal=Math.round(tdee*(1+adj)/10)*10;
  const pro=Math.round(kg*(p.goal==='grasa'?2.0:1.8)),fat=Math.round(kcal*.25/9),carb=Math.max(0,Math.round((kcal-pro*4-fat*9)/4));
  return {bmr:Math.round(bmr),tdee:Math.round(tdee),kcal,pro,fat,carb,adj}}

/* ================= Medidas ================= */
const MEAS={brazo:'Brazo',pecho:'Pecho',cintura:'Cintura',cadera:'Cadera',muslo:'Muslo',pantorrilla:'Pantorrilla'};
let measSel='brazo';
/* ================= Fotos ================= */
const PHKEY='fuerzaapp-fotos';
function localPhotos(){try{return JSON.parse(localStorage.getItem(PHKEY)||'{}')}catch(e){return {}}}
function photoSrc(ph){if(ph.aid)return '/_blob/'+ph.aid;return localPhotos()[ph.id]||''}
async function downscale(file,max){const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(file)});
  const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  return await new Promise(r=>c.toBlob(b=>r({blob:b,url:c.toDataURL('image/jpeg',.72)}),'image/jpeg',.82))}
async function addPhoto(file){
  const p=P();p.photos=p.photos||[];const id=uid();toast('Subiendo foto…');
  try{const {blob,url}=await downscale(file,1100);let ok=false;
    if(CLOUD.assets){try{const a=await CLOUD.assets.upload(blob);p.photos.push({id,t:Date.now(),aid:a.id});ok=true}catch(e){}}
    if(!ok){const {url:small}=await downscale(file,600);const L=localPhotos();L[id]=small;try{localStorage.setItem(PHKEY,JSON.stringify(L));p.photos.push({id,t:Date.now(),local:1})}catch(e){toast('No hay espacio para más fotos en este navegador');return}}
    save();renderProfile();toast('Foto guardada 📸')}catch(e){toast('No se pudo leer la foto')}
}
function openPhoto(i){
  const p=P(),ph=p.photos[i],others=p.photos.filter((_,j)=>j!==i);
  $('#sheet').innerHTML=`<div class="grab"></div><h3>Foto · ${dstr(ph.t)}</h3><div style="height:12px"></div>
    <img class="phbig" src="${photoSrc(ph)}" alt="Foto de progreso">
    ${others.length?`<h4>Comparar con</h4><div class="phgrid">${p.photos.map((x,j)=>j===i?'':`<button data-cmp="${j}"><img src="${photoSrc(x)}" alt=""><small>${dstr(x.t)}</small></button>`).join('')}</div>`:''}
    <div style="height:12px"></div><button class="btn danger" id="phDel">Borrar foto</button>
    <div class="confirm" id="phBox"><button style="background:var(--card2)" id="phNo">Cancelar</button><button style="background:var(--red);color:#fff" id="phYes">Sí, borrar</button></div>`;
  $('#sheet').querySelectorAll('[data-cmp]').forEach(b=>b.onclick=()=>{const j=+b.dataset.cmp,[a,c]=[ph,p.photos[j]].sort((x,y)=>x.t-y.t);
    $('#sheet').innerHTML=`<div class="grab"></div><h3>Antes y después</h3><div class="sub">${Math.round((c.t-a.t)/864e5)} días de diferencia</div><div style="height:12px"></div>
      <div class="cmp"><figure><img src="${photoSrc(a)}" alt=""><figcaption>Antes · ${dstr(a.t)}</figcaption></figure><figure><img src="${photoSrc(c)}" alt=""><figcaption>Después · ${dstr(c.t)}</figcaption></figure></div>
      <div style="height:12px"></div><button class="btn sec2" id="bk">← Volver</button>`;$('#bk').onclick=()=>openPhoto(i)});
  $('#phDel').onclick=()=>{$('#phBox').classList.add('on');$('#phDel').style.display='none'};$('#phNo').onclick=()=>openPhoto(i);
  $('#phYes').onclick=async()=>{p.photos.splice(i,1);if(ph.aid&&CLOUD.assets){try{await CLOUD.assets.delete(ph.aid)}catch(e){}}if(ph.local){const L=localPhotos();delete L[ph.id];try{localStorage.setItem(PHKEY,JSON.stringify(L))}catch(e){}}save();closeSheet();renderProfile();toast('Foto borrada')};
  showSheet();
}

/* ================= Perfil ================= */
function curWeight(p){return p.weights.length?p.weights[p.weights.length-1].kg:(+p.weight||null)}
function renderProfile(){
  const p=P(),cw=curWeight(p),gw=+p.goalWeight||null,c=weekCounts(),s=sessionsThisWeek();p.measures=p.measures||[];p.photos=p.photos||[];
  const done=MKEYS.filter(m=>(c[m]||0)>=p.freq).length;
  let wpct=0,wtxt='Pon un peso meta para ver tu avance';
  if(cw&&gw){const start=p.weights.length?p.weights[0].kg:+p.weight;const tot=Math.abs(gw-start);wpct=tot?Math.max(0,Math.min(100,(1-Math.abs(gw-cw)/tot)*100)):100;const left=+(gw-cw).toFixed(1);wtxt=left===0?'¡Meta alcanzada!':`${cw} → ${gw} lb · ${left>0?'subir':'bajar'} ${Math.abs(left)} lb`}
  const others=DB.profiles.filter(x=>x.id!==p.id),N=nutrition(p),mu=p.munit||'cm';
  const mList=Object.keys(MEAS).map(k=>{const r=p.measures.filter(m=>m.k===k);return {k,last:r[r.length-1],first:r[0],n:r.length}});
  const mSeries=p.measures.filter(m=>m.k===measSel).map(m=>({t:m.t,v:m.v}));
  $('#pfBody').innerHTML=`<div class="card pcard"><div class="pav">${esc(p.name.trim()[0]||'?').toUpperCase()}</div><div class="meta"><b>${esc(p.name)}</b><span>${p.sex==='f'?'Mujer':'Hombre'}${p.age?' · '+p.age+' años':''}${cw?' · '+cw+' lb':''}${p.height?' · '+p.height+' cm':''}</span></div><button class="edit" id="pEdit">Editar</button></div>
    <div class="cloud ${CLOUD.state}" id="cloudBox">${cloudText()}</div>
    <div class="sec"><h2>Mis metas</h2><small>${GOALS[p.goal]}</small></div>
    <div class="card">
      <div class="goal"><div class="gh"><b>Peso</b><span>${wtxt}</span></div><div class="bar"><i style="width:${wpct}%"></i></div></div>
      <div class="goal"><div class="gh"><b>Entrenos esta semana</b><span>${s} de ${p.days}</span></div><div class="bar"><i style="width:${Math.min(100,s/p.days*100)}%"></i></div></div>
      <div class="goal"><div class="gh"><b>Músculos ${p.freq}×/semana</b><span>${done} de ${MKEYS.length}</span></div><div class="bar"><i style="width:${done/MKEYS.length*100}%"></i></div></div>
    </div>
    <div class="sec"><h2>Calorías y proteína</h2><small>estimado</small></div>
    ${N?`<div class="card"><div class="kcal"><b>${N.kcal.toLocaleString('es')}</b><span>kcal al día para ${GOALS[p.goal].toLowerCase()}</span></div>
      <div class="macros"><div style="--c:#c6f432"><b>${N.pro} g</b><span>Proteína</span></div><div style="--c:#4fa3e0"><b>${N.carb} g</b><span>Carbohidratos</span></div><div style="--c:#e3a23b"><b>${N.fat} g</b><span>Grasa</span></div></div>
      <p class="muted" style="font-size:12px;margin-top:10px">Gasto en reposo ${N.bmr} kcal · gasto total ${N.tdee} kcal (${ACT[p.act||'mod'][0].toLowerCase()})${N.adj?` · ${N.adj>0?'+':''}${Math.round(N.adj*100)}% por tu objetivo`:''}. Fórmula Mifflin-St Jeor: es una guía, no reemplaza a un nutricionista.</p></div>`
      :`<div class="card"><p class="muted">Para calcularlo necesito tu <b>edad</b>, <b>altura</b> y <b>peso</b>.</p><div style="height:10px"></div><button class="btn sec2" id="nFill">Completar mis datos</button></div>`}
    <div class="sec"><h2>Peso corporal</h2><small>${p.weights.length} registros</small></div>
    <div class="card"><div class="wrow"><input id="wIn" inputmode="decimal" placeholder="Peso de hoy (lb)"><button id="wAdd">Registrar</button></div>
      ${p.weights.length>1?`<div style="height:14px"></div><div class="chartbox" id="wbox">${chartSVG(p.weights.map(w=>({t:w.t,v:w.kg})),gw)}<div class="ctip"></div></div>`:'<p class="muted" style="margin-top:10px">Registra tu peso cada semana para ver la gráfica.</p>'}</div>
    <div class="sec"><h2>Medidas</h2><div class="seg mini" id="muSeg"><button data-u="cm" class="${mu==='cm'?'on':''}">cm</button><button data-u="in" class="${mu==='in'?'on':''}">pulg</button></div></div>
    <div class="card"><div class="chips" id="mChips">${Object.entries(MEAS).map(([k,v])=>`<button class="chip ${k===measSel?'on':''}" data-mk="${k}">${v}</button>`).join('')}</div>
      <div class="wrow"><input id="mIn" inputmode="decimal" placeholder="${MEAS[measSel]} (${mu==='cm'?'cm':'pulg'})"><button id="mAdd">Registrar</button></div>
      ${mSeries.length>1?`<div style="height:14px"></div><div class="chartbox" id="mbox">${chartSVG(mSeries)}<div class="ctip"></div></div>`:''}
      <div class="mtable">${mList.map(x=>`<div><span>${MEAS[x.k]}</span><b>${x.last?x.last.v+' '+(mu==='cm'?'cm':'"'):'—'}</b>${x.n>1?`<em class="${x.last.v-x.first.v>=0?'up':'down'}">${x.last.v-x.first.v>=0?'+':''}${+(x.last.v-x.first.v).toFixed(1)}</em>`:'<em></em>'}</div>`).join('')}</div></div>
    <div class="sec"><h2>Fotos de progreso</h2><small>${p.photos.length}</small></div>
    <div class="card"><div class="phgrid">${p.photos.map((ph,i)=>`<button data-ph="${i}"><img src="${photoSrc(ph)}" alt="Foto ${dstr(ph.t)}"><small>${dstr(ph.t)}</small></button>`).join('')}
      <label class="phadd"><input type="file" accept="image/*" id="phIn" hidden><span>＋</span><small>Añadir foto</small></label></div>
      <p class="muted" style="font-size:12px;margin-top:10px">${CLOUD.assets?'Tus fotos se guardan en tu nube privada.':'Las fotos se guardan solo en este navegador.'} Toca una para compararla con otra.</p></div>
    <div class="sec"><h2>Perfiles</h2><small>${DB.profiles.length}</small></div>
    <div class="card">
      <div class="prow"><div class="pav">${esc(p.name.trim()[0]||'?').toUpperCase()}</div><div class="meta"><b>${esc(p.name)}</b><span>Activo</span></div></div>
      ${others.map(o=>`<div class="prow"><div class="pav off">${esc(o.name.trim()[0]||'?').toUpperCase()}</div><div class="meta"><b>${esc(o.name)}</b><span>${o.history.length} entrenos</span></div><button data-sw="${o.id}">Cambiar</button></div>`).join('')}
      <div style="height:10px"></div><button class="btn ghost" id="pNew">+ Nuevo perfil</button>
    </div>
    ${DB.profiles.length>1?`<button class="btn danger" id="pDel" style="margin-top:10px">Borrar este perfil</button><div class="confirm" id="pDelBox"><button style="background:var(--card);border:1px solid var(--line)" id="pdNo">Cancelar</button><button style="background:var(--red);color:#fff" id="pdYes">Borrar "${esc(p.name)}"</button></div>`:''}}<p class="muted" style="font-size:11px;text-align:center;margin-top:18px">Modelo 3D del cuerpo: MakeHuman / MPFB (CC0)</p>`;
  $('#pEdit').onclick=()=>openProfileForm(p);if($('#nFill'))$('#nFill').onclick=()=>openProfileForm(p);
  $('#pNew').onclick=()=>openProfileForm(null);
  const add=()=>{const v=parseFloat(($('#wIn').value||'').replace(',','.'));if(!(v>50&&v<900)){toast('Escribe un peso válido en libras');return}p.weights.push({t:Date.now(),kg:v});p.weight=v;save();renderProfile();toast('Peso registrado')};
  $('#wAdd').onclick=add;$('#wIn').onkeydown=e=>{if(e.key==='Enter')add()};
  if($('#wbox'))bindChart($('#wbox'),p.weights.map(w=>({t:w.t,v:w.kg})),q=>`<b>${q.v} lb</b><br>${dstr(q.t)}`);
  if($('#mbox'))bindChart($('#mbox'),mSeries,q=>`<b>${q.v} ${mu==='cm'?'cm':'pulg'}</b><br>${dstr(q.t)}`);
  $('#mChips').querySelectorAll('[data-mk]').forEach(b=>b.onclick=()=>{measSel=b.dataset.mk;renderProfile()});
  $('#muSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{const nu=b.dataset.u;if(nu===mu)return;const f=nu==='in'?1/2.54:2.54;p.measures.forEach(m=>m.v=+(m.v*f).toFixed(1));p.munit=nu;save();renderProfile()});
  const madd=()=>{const v=parseFloat(($('#mIn').value||'').replace(',','.'));if(!(v>0&&v<400)){toast('Escribe una medida válida');return}p.measures.push({t:Date.now(),k:measSel,v});save();renderProfile();toast(MEAS[measSel]+' registrado')};
  $('#mAdd').onclick=madd;$('#mIn').onkeydown=e=>{if(e.key==='Enter')madd()};
  $('#phIn').onchange=e=>{const f=e.target.files[0];if(f)addPhoto(f)};
  document.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>openPhoto(+b.dataset.ph));
  document.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>switchProfile(b.dataset.sw));
  if($('#pDel')){$('#pDel').onclick=()=>{$('#pDelBox').classList.add('on');$('#pDel').style.display='none'};$('#pdNo').onclick=renderProfile;
    $('#pdYes').onclick=()=>{const gone=p.id;DB.profiles=DB.profiles.filter(x=>x.id!==gone);DB.active=DB.profiles[0].id;DB.deleted=(DB.deleted||[]).concat(gone);save();afterSwitch();toast('Perfil borrado')}}
}
function switchProfile(id){stopRest();DB.active=id;save();afterSwitch();toast('Hola, '+P().name.split(' ')[0])}
function afterSwitch(){_heat=null;greet();badge();updateBell();if(T3){T3.build(P().sex);T3.paint()}if(view==='pf')renderProfile();else if(view==='bo')renderBodyView()}
function openProfileForm(p,first){
  const isNew=!p;const d=p||newProfile({name:''});
  let sex=d.sex,goal=d.goal,days=d.days,freq=d.freq,act=d.act||'mod';
  $('#sheet').dataset.lock=first?'1':'';
  $('#sheet').innerHTML=`<div class="grab"></div><h3>${first?'Bienvenido 👋':isNew?'Nuevo perfil':'Editar perfil'}</h3>
    ${first?'<div class="sub">Crea tu perfil para personalizar el cuerpo, tus metas y tu progreso.</div>':''}
    <div class="form">
      <label>Nombre</label><input id="fN" value="${esc(d.name)}" placeholder="Tu nombre" maxlength="24">
      <label>Sexo (cambia el modelo del cuerpo)</label><div class="opts" id="fS"><button data-v="m">Hombre</button><button data-v="f">Mujer</button></div>
      <div class="three"><div><label>Edad</label><input id="fA" inputmode="numeric" value="${esc(d.age||'')}" placeholder="25"></div>
      <div><label>Peso (lb)</label><input id="fW" inputmode="decimal" value="${esc(curWeight(d)||'')}" placeholder="165"></div>
      <div><label>Altura (cm)</label><input id="fH" inputmode="numeric" value="${esc(d.height)}" placeholder="170"></div></div>
      <label>Objetivo principal</label><div class="opts" id="fG">${Object.entries(GOALS).map(([k,v])=>`<button data-v="${k}">${v}</button>`).join('')}</div>
      <label>Peso meta (lb)</label><input id="fGW" inputmode="decimal" value="${esc(d.goalWeight)}" placeholder="Opcional">
      <label>Actividad física (para calcular calorías)</label><div class="opts" id="fAc">${Object.entries(ACT).map(([k,v])=>`<button data-v="${k}">${v[0]}</button>`).join('')}</div>
      <label>Entrenos por semana</label><div class="opts" id="fD">${[2,3,4,5,6].map(n=>`<button data-v="${n}">${n} días</button>`).join('')}</div>
      <label>Veces por semana que quieres entrenar cada músculo</label><div class="opts" id="fF">${[1,2,3].map(n=>`<button data-v="${n}">${n}×${n===2?' (recomendado)':''}</button>`).join('')}</div>
    </div>
    <div style="height:18px"></div><button class="btn pri" id="fOk">${first?'Empezar':isNew?'Crear perfil':'Guardar cambios'}</button>${first?'':'<button class="btn sec2" id="fX">Cancelar</button>'}`;
  const grp=(id,get,set)=>{const r=$(id);const paint=()=>r.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v==String(get())));r.querySelectorAll('button').forEach(b=>b.onclick=()=>{set(b.dataset.v);paint()});paint()};
  grp('#fS',()=>sex,v=>sex=v);grp('#fG',()=>goal,v=>goal=v);grp('#fD',()=>days,v=>days=+v);grp('#fF',()=>freq,v=>freq=+v);grp('#fAc',()=>act,v=>act=v);
  $('#fOk').onclick=()=>{
    const name=$('#fN').value.trim();if(!name){toast('Escribe tu nombre');$('#fN').focus();return}
    const w=parseFloat(($('#fW').value||'').replace(',','.')),gw=parseFloat(($('#fGW').value||'').replace(',','.')),age=parseInt($('#fA').value,10);
    const t=isNew?newProfile():p;Object.assign(t,{name,sex,goal,days,freq,act,age:age>9&&age<100?age:'',height:$('#fH').value.trim(),goalWeight:gw>0?gw:''});
    if(w>50&&w<900&&w!==curWeight(t)){t.weight=w;t.weights.push({t:Date.now(),kg:w})}
    if(isNew){DB.profiles.push(t);DB.active=t.id}
    save();$('#sheet').dataset.lock='';closeSheet();afterSwitch();if(first)go('bo');toast(isNew?'Perfil creado ✓':'Perfil actualizado');
  };
  if($('#fX'))$('#fX').onclick=closeSheet;
  showSheet();
}

/* ================= Nube ================= */
const CLOUD={db:null,uid:null,assets:null,state:'local',busy:false,pending:false,hashes:{}};
function cloudText(){return {local:'📱 Guardado solo en este navegador',sync:'☁️ Guardando en tu nube…',ok:'☁️ Sincronizado en tu nube privada',err:'⚠️ No se pudo sincronizar; tus datos siguen en este navegador'}[CLOUD.state]}
function setCloud(s){CLOUD.state=s;const b=$('#cloudBox');if(b){b.className='cloud '+s;b.textContent=cloudText()}}
function profDoc(id){return CLOUD.db.collection('data/users/'+CLOUD.uid).doc('p_'+id)}
function metaDoc(){return CLOUD.db.collection('data/users/'+CLOUD.uid).doc('meta')}
let cloudTimer=null;
function cloudSoon(){if(!CLOUD.db)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(cloudPush,1500)}
async function cloudPush(){
  if(!CLOUD.db)return;if(CLOUD.busy){CLOUD.pending=true;return}
  CLOUD.busy=true;setCloud('sync');
  try{
    for(const p of DB.profiles){const s=JSON.stringify(p);if(CLOUD.hashes[p.id]!==s){await profDoc(p.id).set(JSON.parse(s));CLOUD.hashes[p.id]=s}}
    for(const id of (DB.deleted||[])){try{await profDoc(id).delete()}catch(e){}}DB.deleted=[];
    const meta={ids:DB.profiles.map(p=>p.id),active:DB.active,unit:'lb',updated:DB.updated||Date.now()};const ms=JSON.stringify(meta);
    if(CLOUD.hashes.meta!==ms){await metaDoc().set(meta);CLOUD.hashes.meta=ms}
    setCloud('ok');
  }catch(e){setCloud('err');if(e&&e.code==='quota_exceeded')toast('Tu nube está llena: borra entrenos o fotos viejas')}
  CLOUD.busy=false;if(CLOUD.pending){CLOUD.pending=false;cloudPush()}
}
async function cloudInit(){
  if(!window.claude||!window.claude.use)return;
  try{
    const [db,user,assets]=await Promise.all([claude.use('db'),claude.use('user'),claude.use('assets')]);
    CLOUD.assets=assets||null;
    if(!db||!user)return;const id=await user.id();if(!id)return;
    CLOUD.db=db;CLOUD.uid=id;setCloud('sync');
    const timer=setTimeout(()=>setCloud('err'),10000);
    const m=await metaDoc().get();clearTimeout(timer);
    const cm=m.exists?m.data():null;
    if(cm&&cm.ids&&cm.ids.length&&(!DB.updated||cm.updated>DB.updated||!hasRealData())){
      const profs=[];for(const pid of cm.ids){const d=await profDoc(pid).get();if(d.exists){const o=JSON.parse(JSON.stringify(d.data()));profs.push(o);CLOUD.hashes[pid]=JSON.stringify(o)}}
      if(profs.length){DB.profiles=profs;DB.active=profs.some(x=>x.id===cm.active)?cm.active:profs[0].id;DB.updated=cm.updated;CLOUD.hashes.meta=JSON.stringify({ids:cm.ids,active:cm.active,unit:'lb',updated:cm.updated});
        try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}
        $('#sheet').dataset.lock='';closeSheet();afterSwitch();badge();go(view);toast('☁️ Datos cargados de tu nube')}
      setCloud('ok');
    }else if(hasRealData()){await cloudPush()}else setCloud('ok');
  }catch(e){setCloud('err')}
}
function hasRealData(){return DB.profiles.some(p=>p.name)}
