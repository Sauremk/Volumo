const ROUTINES=[
  {n:'Cuerpo completo',d:'Ideal para empezar',ids:['sq','pb','jp','pmm','bic']},
  {n:'Empuje',d:'Pecho · hombro · tríceps',ids:['pb','pi','pmm','el','eoh']},
  {n:'Jalón',d:'Espalda · bíceps',ids:['dm','rb','rm','pj','cc']},
  {n:'Pierna',d:'Cuádriceps · glúteo · isquios',ids:['sq','hp','ext','cfs','gm']}
];
const work=sets=>(sets||[]).filter(s=>!s.w);
function startRoutine(r){newWorkout(r.n);P().workout.plan=!!r.plan;r.ids.filter(id=>byId[id]).forEach(id=>P().workout.items.push(mkItem(id,r.sets)));save();badge();renderWk();toast('¡A entrenar! '+r.n)}
const names=ids=>ids.map(id=>byId[id]?byId[id].n:'').filter(Boolean).join(' · ');

/* ---- Sugerencia de peso (sobrecarga progresiva) ---- */
function repRange(){return P().goal==='fuerza'?[3,6]:P().goal==='grasa'?[12,15]:[8,12]}
function incFor(id){const e=byId[id];if(!e)return 5;if(/Peso corporal|Barra fija|Paralelas/.test(e.eq))return 0;if(/Mancuernas/.test(e.eq))return 5;if(e.g==='Piernas'&&/Barra|Máquina/.test(e.eq))return 10;return 5}
function suggest(id){
  const last=work(lastSets(id));if(!last.length)return null;
  const best=last.reduce((a,b)=>(+b.kg||0)>(+a.kg||0)?b:a),kg=+best.kg||0,reps=+best.reps||0,[lo,hi]=repRange(),inc=incFor(id);
  if(!reps)return null;
  if(inc===0)return {kg,reps:reps+1,why:'Intenta una repetición más'};
  if(reps>=hi)return {kg:kg+inc,reps:lo,why:`Llegaste a ${reps} reps: sube el peso`};
  return {kg,reps:reps+1,why:`Mismo peso, una rep más (rango ${lo}–${hi})`};
}
/* ---- Récords ---- */
function prMap(hist){const m={};(hist||P().history).forEach(h=>h.items.forEach(it=>work(it.sets).forEach(s=>{const kg=+s.kg||0,r=+s.reps||0;if(!kg)return;const o=m[it.id]||(m[it.id]={kg:0,e1:0,kgT:0,e1T:0});if(kg>o.kg){o.kg=kg;o.kgR=r;o.kgT=h.start}const e=e1rm(kg,r);if(e>o.e1){o.e1=e;o.e1T=h.start}})));return m}
function prCount(){let n=0;const hist=P().history.slice().sort((a,b)=>a.start-b.start);const m={};hist.forEach(h=>{h.items.forEach(it=>{const top=Math.max(0,...work(it.sets).map(s=>+s.kg||0));if(!top)return;if(m[it.id]!=null&&top>m[it.id])n++;m[it.id]=Math.max(m[it.id]||0,top)})});return n}

/* ---- Calculadora de discos ---- */
function platesFor(total,bar){let side=(total-bar)/2;const out=[];if(side<0)return null;[45,35,25,10,5,2.5].forEach(p=>{while(side>=p-1e-9){out.push(p);side-=p}});return {out,rest:+side.toFixed(2)}}
function openPlates(start){
  let bar=+(localStorage.getItem('fz-bar')||45);
  $('#sheet').innerHTML=`<div class="grab"></div><h3>Calculadora de discos</h3><div class="sub">Escribe el peso total y te digo qué poner en <b>cada lado</b> de la barra.</div>
    <div class="form"><label>Peso total (lb)</label><input id="plW" inputmode="decimal" value="${esc(start||'')}" placeholder="185"></div>
    <h4>Barra</h4><div class="opts" id="plB">${[45,35,25,15,0].map(b=>`<button data-b="${b}" class="${b===bar?'on':''}">${b?b+' lb':'Sin barra'}</button>`).join('')}</div>
    <div id="plOut" style="margin-top:16px"></div>`;
  const draw=()=>{const w=parseFloat(($('#plW').value||'').replace(',','.'));const o=$('#plOut');
    if(!(w>0)){o.innerHTML='<p class="muted">Escribe un peso.</p>';return}
    const r=platesFor(w,bar);if(!r){o.innerHTML=`<p class="muted">El peso es menor que la barra (${bar} lb).</p>`;return}
    const H={45:120,35:104,25:88,10:66,5:52,2.5:40},C={45:'#c6f432',35:'#e3a23b',25:'#4fa3e0',10:'#e8eaed',5:'#b5473e',2.5:'#8d939b'};
    const cnt={};r.out.forEach(p=>cnt[p]=(cnt[p]||0)+1);
    o.innerHTML=`<div class="plviz"><i class="barend"></i>${r.out.map(p=>`<i style="height:${H[p]}px;background:${C[p]}"></i>`).join('')}<i class="sleeve"></i></div>
      <div class="card" style="background:var(--card2);margin-top:12px"><b>Por cada lado:</b> ${r.out.length?Object.entries(cnt).sort((a,b)=>b[0]-a[0]).map(([p,n])=>`${n}× ${p} lb`).join(' + '):'nada, solo la barra'}
      ${r.rest>0?`<div class="muted" style="margin-top:6px">Sobran ${r.rest} lb por lado que no se pueden poner con discos normales.</div>`:''}</div>`};
  $('#plW').oninput=draw;$('#plB').querySelectorAll('button').forEach(b=>b.onclick=()=>{bar=+b.dataset.b;try{localStorage.setItem('fz-bar',bar)}catch(e){}$('#plB').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));draw()});
  draw();showSheet();
}

/* ---- Plan automático ---- */
const PLAN_DAYS={
  E:['Empuje',['pb','pi','pmm','el','eoh','tpc']],J:['Jalón',['dm','rb','jp','pj','cc','cm']],L:['Pierna',['sq','hp','ext','cfs','gm','ep']],
  E2:['Empuje B',['pi','pmq','pmi','elp','fd','pt']],J2:['Jalón B',['rps','pul','rm','fp','cinc','cpo']],L2:['Pierna B',['hack','pmr','bulg','ci','gm','bic']],
  TA:['Torso A',['pb','rb','pmm','jp','cc','eoh']],TB:['Torso B',['pi','dm','el','rm','cbb','tpc']],PA:['Pierna A',['sq','pmr','ext','cfs','gm','bic']],PB:['Pierna B',['hack','hp','bulg','ci','gm','ep']],
  FA:['Cuerpo completo A',['sq','pb','jp','pmm','cfs','bic']],FB:['Cuerpo completo B',['pmr','pi','rb','el','ext','cc']]
};
const PLAN_SPLIT={2:['FA','FB'],3:['E','J','L'],4:['TA','PA','TB','PB'],5:['E','J','L','TB','PB'],6:['E','J','L','E2','J2','L2']};
const SCHEME={fuerza:['4 series × 4–6 reps',4],musculo:['3 series × 8–12 reps',3],grasa:['3 series × 12–15 reps',3],salud:['3 series × 10 reps',3]};
function buildPlan(days,goal){return PLAN_SPLIT[days].map((k,i)=>({n:`Plan · Día ${i+1} · ${PLAN_DAYS[k][0]}`,ids:PLAN_DAYS[k][1],plan:true,sets:SCHEME[goal][1],scheme:SCHEME[goal][0]}))}
function planRoutines(){return P().routines.filter(r=>r.plan)}
function nextPlanDay(){const pr=planRoutines();if(!pr.length)return null;const last=P().history.find(h=>pr.some(r=>r.n===h.name));if(!last)return pr[0];const i=pr.findIndex(r=>r.n===last.name);return pr[(i+1)%pr.length]}
function openPlanBuilder(){
  const p=P();let days=p.days||3,goal=p.goal;
  const draw=()=>{const plan=buildPlan(days,goal);
    $('#sheet').innerHTML=`<div class="grab"></div><h3>Tu plan</h3><div class="sub">Lo armo con los mejores ejercicios de cada músculo, según tu objetivo y los días que puedes ir.</div>
      <h4>Días por semana</h4><div class="opts" id="pd">${[2,3,4,5,6].map(n=>`<button data-v="${n}" class="${n===days?'on':''}">${n} días</button>`).join('')}</div>
      <h4>Objetivo</h4><div class="opts" id="pg">${Object.entries(GOALS).map(([k,v])=>`<button data-v="${k}" class="${k===goal?'on':''}">${v}</button>`).join('')}</div>
      <h4>Así queda · ${SCHEME[goal][0]}</h4>
      ${plan.map(r=>`<div class="rrow"><div class="meta"><b>${r.n.replace('Plan · ','')}</b><span>${names(r.ids)}</span></div></div>`).join('')}
      <p class="muted" style="font-size:13px;margin:8px 0 14px">Cada músculo queda entrenado unas 2 veces por semana${days===2?' (con 2 días, todo el cuerpo cada vez)':''}. Reemplaza el plan anterior si tenías uno.</p>
      <button class="btn pri" id="pOk">Guardar mi plan</button>`;
    $('#pd').querySelectorAll('button').forEach(b=>b.onclick=()=>{days=+b.dataset.v;draw()});
    $('#pg').querySelectorAll('button').forEach(b=>b.onclick=()=>{goal=b.dataset.v;draw()});
    $('#pOk').onclick=()=>{p.routines=p.routines.filter(r=>!r.plan).concat(plan);p.days=days;p.goal=goal;p.planMade=true;save();closeSheet();renderWk();updateBell();toast('Plan guardado ✓')};
  };draw();showSheet();
}

/* ---- Pantalla Entrenar ---- */
let tick;
function renderWk(){
  clearInterval(tick);
  const p=P(),W=p.workout,el=$('#wkBody');wake(!!W);
  if(!W){
    const nx=nextPlanDay(),mine=p.routines.filter(r=>!r.plan),plan=planRoutines();
    el.innerHTML=`
      ${nx?`<div class="today"><small>Hoy toca</small><b>${esc(nx.n.replace('Plan · ',''))}</b><span>${nx.scheme||''} · ${names(nx.ids)}</span><button class="btn pri" id="goToday">Empezar</button></div>`
        :`<button class="planbtn" id="mkPlan"><span>✨</span><div><b>Crear mi plan automático</b><small>Según tu objetivo y tus días disponibles</small></div></button>`}
      <button class="bigstart ${nx?'alt':''}" id="startEmpty"><span class="pl">▶</span><div><b>Empezar entreno vacío</b><span>Añade ejercicios a medida que entrenas</span></div></button>
      ${plan.length?`<div class="sec"><h2>Mi plan</h2><button class="linkbtn" id="mkPlan2" style="margin:0">Cambiar</button></div>
        ${plan.map(r=>`<div class="rrow ${nx&&r.n===nx.n?'next':''}"><div class="meta"><b>${esc(r.n.replace('Plan · ',''))}</b><span>${r.ids.length} ejercicios · ${names(r.ids)}</span></div><button class="go ${nx&&r.n===nx.n?'':'sec'}" data-pr="${esc(r.n)}">Empezar</button></div>`).join('')}`:''}
      <div class="sec"><h2>Mis rutinas</h2><small>${mine.length||''}</small></div>
      ${mine.length?mine.map(r=>`<div class="rrow"><div class="meta"><b>${esc(r.n)}</b><span>${r.ids.length} ejercicios · ${names(r.ids)}</span></div><button class="x" data-del="${esc(r.n)}" aria-label="Borrar">×</button><button class="go" data-pr="${esc(r.n)}">Empezar</button></div>`).join('')
        :`<p class="muted">Cuando estés entrenando, toca <b>⋯ → Guardar como rutina</b> y aparecerá aquí.</p>`}
      <div class="confirm" id="delBox"><button style="background:var(--card);border:1px solid var(--line)" id="dNo">Cancelar</button><button style="background:var(--red);color:#fff" id="dYes">Borrar</button></div>
      <div class="sec"><h2>Sugeridas</h2></div>
      ${ROUTINES.map((r,i)=>`<div class="rrow"><div class="meta"><b>${r.n}</b><span>${r.d} · ${r.ids.length} ejercicios</span></div><button class="go sec" data-r="${i}">Empezar</button></div>`).join('')}
      <button class="btn sec2" id="plates" style="margin-top:14px">🧮 Calculadora de discos</button>`;
    $('#startEmpty').onclick=()=>{newWorkout();save();badge();renderWk();openPicker()};
    if($('#goToday'))$('#goToday').onclick=()=>startRoutine(nx);
    [$('#mkPlan'),$('#mkPlan2')].forEach(b=>b&&(b.onclick=openPlanBuilder));
    $('#plates').onclick=()=>openPlates('');
    el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>startRoutine(ROUTINES[b.dataset.r]));
    el.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>startRoutine(p.routines.find(r=>r.n===b.dataset.pr)));
    let pend=null;
    el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{pend=b.dataset.del;$('#delBox').classList.add('on');$('#dYes').textContent='Borrar "'+pend+'"'});
    $('#dNo').onclick=()=>$('#delBox').classList.remove('on');
    $('#dYes').onclick=()=>{p.routines=p.routines.filter(r=>r.n!==pend);save();renderWk();toast('Rutina borrada')};
    return;
  }
  const PR=prMap();let ssN=0;
  const allDone=it=>{const w=work(it.sets);return w.length>0&&w.every(s=>s.done)};
  const curI=W.items.findIndex(it=>byId[it.id]&&!allDone(it));
  const stepOf=(id,v)=>{if(!/Mancuernas|Barra|Máquina|Polea|Smith|Disco|Kettlebell/.test(byId[id].eq))return 5;return num(v)<20?2.5:5};
  const short=s=>`${s.kg===''||s.kg==null?0:s.kg}×${s.reps||0}`;
  el.innerHTML=`<div class="wkbar">
      <div class="r1"><div class="nm"><small>${esc(W.name)}</small><b id="clock">${fmt((Date.now()-W.start)/1000)}</b></div>
        <button class="more" id="wkMore" aria-label="Opciones">⋯</button><button class="fin" id="finish">Terminar</button></div>
      <div class="prog"><i id="progI"></i></div>
      <div class="r2"><span id="hSum">0/0 series · 0 lb</span><button class="restchip" id="restCfg">⏱ ${fmt(p.rest)}${AL().sound!=='off'?' 🔔':''} <em>${p.auto?'auto':'manual'}</em></button></div>
    </div>
    ${W.items.length?'<p class="muted" style="font-size:12px;margin:-4px 0 10px">Ajusta el peso y las reps con <b>−</b> / <b>+</b> (o escríbelos) y toca <b>✓</b> al terminar cada serie. Toca el número para marcarla como calentamiento <b style="color:var(--mid)">C</b>.</p>':`<div class="empty"><b>Entreno vacío</b>Añade tu primer ejercicio</div><div style="height:12px"></div>`}
    ${W.items.map((it,ii)=>{const e=byId[it.id];if(!e)return '';const inSS=it.ss||(ii>0&&W.items[ii-1].ss);if(inSS&&!(ii>0&&W.items[ii-1].ss))ssN++;
      const pr=PR[it.id],db=isDB(it.id),one=SINGLE_DB.includes(it.id);
      if(allDone(it)&&!it.open)return `<div class="wk fold ${inSS?'ssc':''}" data-open="${ii}"><div class="foldrow"><span class="okc">✓</span><div><b>${e.n}</b><small>${work(it.sets).map(short).join(' · ')}${db?' (lb c/u)':''}</small></div><em>Editar</em></div></div>`;
      const sg=suggest(it.id),pv=work((it.prev||[]).filter(Boolean));
      return `<div class="wk ${inSS?'ssc':''} ${ii===curI?'cur':''}">
      ${ii===curI?'<span class="curtag">AHORA</span>':''}
      ${inSS?`<div class="sstag">Superserie ${String.fromCharCode(64+ssN)} ${it.ss?'· sin descanso, pasa al siguiente':'· ahora descansa'}</div>`:''}
      <div class="wk-h"><div class="t" data-info="${it.id}"><b>${e.n}</b><small>${(EX2MUS[it.id]||[]).slice(0,2).map(m=>MUS[m].n).join(' · ')||e.g}${pr?` · 🏆 ${pr.kg} lb`:''}</small></div><button data-im="${ii}" aria-label="Opciones del ejercicio">⋯</button></div>
      <div class="exinfo">
        ${db?`<span class="dbchip">🏋️ ${one?'Anota el peso de la mancuerna':'Anota el peso de UNA mancuerna'}</span>`:''}
        ${pv.length?`<span class="lastl">Última vez: <b>${pv.map(short).join(' · ')}</b></span>`:'<span class="lastl">Primera vez con este ejercicio: anota con qué peso empiezas.</span>'}
      </div>
      ${sg?`<div class="sug"><span>💡</span><div><b>Hoy intenta ${sg.kg?sg.kg+' lb'+(db?' c/u':'')+' × ':''}${sg.reps} reps</b><small>${sg.why}</small></div><button data-sug="${ii}">Usar</button></div>`:''}
      <div class="heads"><span>Serie</span><span class="${db?'dbh':''}">${db&&!one?'lb c/u':'lb'}</span><span>Reps</span><span>✓</span></div>
      ${it.sets.map((s,si)=>`<div class="set ${s.done?'done':''} ${s.w?'wu':''}">
        <button class="n" data-wu="${ii}-${si}" aria-label="Cambiar tipo de serie">${s.w?'C':si+1-it.sets.slice(0,si).filter(x=>x.w).length}</button>
        <div class="stp"><button data-st="${ii}-${si}-kg-m" aria-label="Menos peso">−</button><input inputmode="decimal" data-i="${ii}" data-s="${si}" data-f="kg" value="${esc(s.kg)}" placeholder="lb" aria-label="Peso en lb"><button data-st="${ii}-${si}-kg-p" aria-label="Más peso">+</button></div>
        <div class="stp"><button data-st="${ii}-${si}-reps-m" aria-label="Menos reps">−</button><input inputmode="numeric" data-i="${ii}" data-s="${si}" data-f="reps" value="${esc(s.reps)}" placeholder="reps" aria-label="Repeticiones"><button data-st="${ii}-${si}-reps-p" aria-label="Más reps">+</button></div>
        <button class="chk ${s.done?'ok':''}" data-ck="${ii}-${si}" aria-label="Serie hecha"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg></button></div>`).join('')}
      <div class="setbtns"><button class="addset" data-as="${ii}">+ Serie</button><button class="addset" data-aw="${ii}">+ Calentamiento</button>${it.sets.length>1?`<button class="addset" data-rs="${ii}" style="flex:none;width:auto;padding:10px 14px" aria-label="Quitar una serie">− Serie</button>`:''}</div>
      ${it.open?`<button class="linkbtn" data-close="${ii}" style="margin-top:8px">Listo, cerrar</button>`:''}</div>`}).join('')}
    <button class="btn ghost" id="moreEx">+ Añadir ejercicio</button>`;
  summary();
  tick=setInterval(()=>{const c=$('#clock');if(c)c.textContent=fmt((Date.now()-W.start)/1000)},1000);
  el.querySelectorAll('input[data-i]').forEach(inp=>{
    inp.onfocus=()=>{try{inp.select()}catch(e){}};
    inp.oninput=()=>{const v=clean(inp.value);if(v!==inp.value)inp.value=v;W.items[inp.dataset.i].sets[inp.dataset.s][inp.dataset.f]=v;save();summary()};
  });
  el.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{
    const [i,s,f,d]=b.dataset.st.split('-');
    const it=W.items[+i],set=it.sets[+s],dir=d==='p'?1:-1,cur=num(set[f]);
    const step=f==='reps'?1:stepOf(it.id,dir<0?cur-0.01:cur);
    let v=Math.max(0,+(cur+dir*step).toFixed(2));set[f]=String(v);
    const inp=el.querySelector(`input[data-i="${i}"][data-s="${s}"][data-f="${f}"]`);if(inp)inp.value=set[f];save();summary()});
  el.querySelectorAll('[data-ck]').forEach(b=>b.onclick=()=>{
    const [i,s]=b.dataset.ck.split('-').map(Number),it=W.items[i],set=it.sets[s],pv=it.sets[s-1]||{};
    set.done=!set.done;
    if(set.done){if(set.kg==='')set.kg=pv.kg||'';if(set.reps==='')set.reps=pv.reps||'';
      if(!set.reps){set.done=false;toast('Escribe cuántas reps hiciste');return}
      const old=PR[it.id];if(!set.w&&num(set.kg)>0&&old&&num(set.kg)>old.kg)toast('🏆 ¡Nuevo récord de peso!')}
    if(allDone(it))it.open=false;
    save();renderWk();
    if(set.done){if(it.ss&&W.items[i+1]){toast('Superserie: pasa a '+byId[W.items[i+1].id].n)}else if(p.auto)startRest(set.w?Math.min(60,p.rest):p.rest)}
  });
  el.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{W.items[b.dataset.open].open=true;save();renderWk()});
  el.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{W.items[b.dataset.close].open=false;save();renderWk()});
  el.querySelectorAll('[data-wu]').forEach(b=>b.onclick=()=>{const [i,s]=b.dataset.wu.split('-').map(Number);const st=W.items[i].sets[s];st.w=!st.w;save();renderWk()});
  el.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{const it=W.items[b.dataset.as];const l=work(it.sets).slice(-1)[0]||{};it.sets.push({kg:l.kg||'',reps:l.reps||'',done:false});save();renderWk()});
  el.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>{const it=W.items[b.dataset.rs];let k=it.sets.length-1;while(k>0&&it.sets[k].done)k--;it.sets.splice(k,1);save();renderWk()});
  el.querySelectorAll('[data-aw]').forEach(b=>b.onclick=()=>{const it=W.items[b.dataset.aw];const n=it.sets.filter(s=>s.w).length;it.sets.splice(n,0,{kg:'',reps:'',done:false,w:true});if(it.prev)it.prev.splice(n,0,null);save();renderWk()});
  el.querySelectorAll('[data-sug]').forEach(b=>b.onclick=()=>{const it=W.items[b.dataset.sug],sg=suggest(it.id);it.sets.forEach(s=>{if(!s.done&&!s.w){if(sg.kg)s.kg=String(sg.kg);s.reps=String(sg.reps)}});save();renderWk();toast('Sugerencia aplicada')});
  el.querySelectorAll('[data-im]').forEach(b=>b.onclick=()=>openItemMenu(+b.dataset.im));
  el.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>openSheet(b.dataset.info));
  $('#restCfg').onclick=openRestCfg;
  $('#moreEx').onclick=openPicker;
  $('#wkMore').onclick=openWkMenu;
  $('#finish').onclick=()=>finish();
}
function openItemMenu(i){
  const W=P().workout,it=W.items[i],e=byId[it.id],nx=W.items[i+1];
  const cur=work(it.sets).find(s=>!s.done)||work(it.sets)[0]||{};
  $('#sheet').innerHTML=`<div class="grab"></div><h3>${e.n}</h3><div style="height:14px"></div>
    ${nx?`<button class="btn sec2" id="imSS">${it.ss?'🔗 Separar de '+byId[nx.id].n:'🔗 Hacer superserie con '+byId[nx.id].n}</button>`:'<p class="muted" style="margin-bottom:10px">Añade otro ejercicio debajo para poder hacer una superserie.</p>'}
    <button class="btn sec2" id="imPl">🧮 Calculadora de discos</button>
    <button class="btn sec2" id="imInfo">▶ Ver cómo se hace</button>
    ${i>0?'<button class="btn sec2" id="imUp">↑ Subir</button>':''}
    <button class="btn danger" id="imRm">Quitar del entreno</button>`;
  if($('#imSS'))$('#imSS').onclick=()=>{it.ss=!it.ss;save();closeSheet();renderWk();toast(it.ss?'Superserie creada':'Superserie separada')};
  $('#imPl').onclick=()=>openPlates(cur.kg||(it.prev&&it.prev[0]&&it.prev[0].kg)||'');
  $('#imInfo').onclick=()=>openSheet(it.id,()=>openItemMenu(i));
  if($('#imUp'))$('#imUp').onclick=()=>{W.items.splice(i,1);W.items.splice(i-1,0,it);save();closeSheet();renderWk()};
  $('#imRm').onclick=()=>{if(i>0&&W.items[i-1].ss&&!it.ss)W.items[i-1].ss=false;W.items.splice(i,1);if(!W.items.length){}save();badge();closeSheet();renderWk()};
  showSheet();
}
function summary(){
  const W=P().workout;if(!W)return;let tot=0,dn=0,vol=0;
  W.items.forEach(it=>it.sets.forEach(s=>{if(s.w)return;tot++;if(s.done){dn++;vol+=num(s.kg)*num(s.reps)*dbf(it.id)}}));
  const a=$('#hSum'),b=$('#progI');if(a)a.textContent=`${dn}/${tot} series · ${Math.round(vol).toLocaleString('es')} lb`;if(b)b.style.width=(tot?dn/tot*100:0)+'%';
}
function openPicker(){
  let g='Todos';
  $('#sheet').innerHTML=`<div class="grab"></div><h3>Añadir ejercicio</h3><div style="height:12px"></div>
    <div class="search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8d939b" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="pq" placeholder="Buscar…" autocomplete="off"></div>
    <div class="chips" id="pchips"></div><div class="list" id="plist"></div>
    <div class="sticky-foot"><button class="btn pri" id="pDone">Listo</button></div>`;
  const draw=()=>{$('#pchips').innerHTML=chipsHTML(g);$('#pchips').querySelectorAll('.chip').forEach(c=>c.onclick=()=>{g=c.dataset.g;draw()});
    $('#plist').innerHTML=filterEx($('#pq').value,g).map(exRow).join('');bindExList($('#plist'),openPicker)};
  $('#pq').oninput=draw;draw();
  $('#pDone').onclick=()=>{closeSheet();if(view==='wk')renderWk()};
  showSheet();
}
function openRestCfg(){
  const p=P(),al=AL();
  const opt=(id,list,key)=>`<div class="opts" id="${id}">${list.map(([v,t])=>`<button data-v="${v}" class="${String(al[key])===String(v)?'on':''}">${t}</button>`).join('')}</div>`;
  const tg=(k,t,d)=>`<div class="tgl ${al[k]?'on':''}" data-tg="${k}"><div><b>${t}</b><small>${d}</small></div><i></i></div>`;
  $('#sheet').innerHTML=`<div class="grab"></div><h3>Descanso y alarma</h3><div class="sub">Tiempo entre series. Si está en automático, arranca solo al marcar una serie ✓ (las de calentamiento descansan como máximo 1 min).</div>
    <h4>Duración</h4><div class="opts" id="rOpts">${[30,45,60,90,120,150,180,240].map(s=>`<button data-rs="${s}" class="${p.rest===s?'on':''}">${s<60?s+' s':fmt(s)}</button>`).join('')}</div>
    <h4>Modo</h4><div class="opts" id="rMode"><button data-a="1" class="${p.auto?'on':''}">Automático</button><button data-a="0" class="${p.auto?'':'on'}">Manual</button></div>
    <h4>🔔 Sonido al terminar</h4>${opt('aSnd',[['campana','🔔 Campana'],['pitido','📟 Pitido'],['alarma','🚨 Alarma'],['off','🔇 Silencio']],'sound')}
    <h4>Volumen</h4>${opt('aVol',[[.4,'Bajo'],[.7,'Medio'],[1,'Alto']],'vol')}
    <h4>Repetir</h4>${opt('aRep',[[1,'1 vez'],[3,'3 veces'],[5,'5 veces']],'rep')}
    <button class="btn sec2" id="aTest" style="margin-top:12px">🔊 Probar sonido</button>
    ${tg('warn','Aviso antes de terminar','Un toque a los 10 s y cuenta 3, 2, 1')}
    ${tg('vib','Vibrar','Funciona en Android (el iPhone no deja vibrar desde la web)')}
    ${tg('wake','Mantener la pantalla encendida','Mientras entrenas, para que la alarma siempre suene')}
    ${tg('bg','Sonar con la pantalla bloqueada','Usa una pista de audio. En iPhone puede pausar la música que estés escuchando')}
    <div style="height:18px"></div><button class="btn pri" id="rNow">Iniciar descanso ahora</button><button class="btn sec2" id="rOk">Guardar</button>`;
  $('#rOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>{p.rest=+b.dataset.rs;save();$('#rOpts').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});
  $('#rMode').querySelectorAll('button').forEach(b=>b.onclick=()=>{p.auto=b.dataset.a==='1';save();$('#rMode').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b))});
  [['aSnd','sound',String],['aVol','vol',Number],['aRep','rep',Number]].forEach(([id,k,f])=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{AL()[k]=f(b.dataset.v);save();$('#'+id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(k!=='rep')testAlarm()}));
  $('#sheet').querySelectorAll('[data-tg]').forEach(b=>b.onclick=()=>{const k=b.dataset.tg,a=AL();a[k]=!a[k];save();b.classList.toggle('on',a[k]);if(k==='wake')wake(a.wake&&!!P().workout)});
  $('#aTest').onclick=testAlarm;
  $('#rNow').onclick=()=>{closeSheet();renderWk();startRest(p.rest)};
  $('#rOk').onclick=()=>{closeSheet();renderWk()};
  showSheet();
}
function openWkMenu(){
  const W=P().workout;
  $('#sheet').innerHTML=`<div class="grab"></div><h3>Opciones</h3><div style="height:14px"></div>
    <div class="card" style="background:var(--card2)"><b style="display:block;margin-bottom:8px">💾 Guardar como rutina</b>
      <div class="wrow"><input id="rName" placeholder="Nombre (ej. Pierna lunes)" maxlength="30" value="${W.name==='Entreno libre'||W.plan?'':esc(W.name)}" style="background:var(--card)"><button id="rOk">Guardar</button></div></div>
    <div style="height:10px"></div>
    <button class="btn sec2" id="restB">⏱ Ajustes de descanso</button>
    <button class="btn sec2" id="platesB">🧮 Calculadora de discos</button>
    <button class="btn danger" id="cancel">Descartar entreno</button>
    <div class="confirm" id="cancelBox"><button style="background:var(--card2)" id="cNo">No, seguir</button><button style="background:var(--red);color:#fff" id="cYes">Sí, descartar</button></div>`;
  const doSave=()=>{const n=$('#rName').value.trim();if(!n){toast('Ponle un nombre');return}
    const ids=W.items.map(i=>i.id);if(!ids.length){toast('Añade ejercicios primero');return}
    const rs=P().routines,ex=rs.findIndex(r=>!r.plan&&r.n.toLowerCase()===n.toLowerCase());
    if(ex>=0)rs[ex].ids=ids;else rs.push({n,ids});W.name=n;save();closeSheet();renderWk();toast(ex>=0?'Rutina actualizada':'Rutina guardada ✓')};
  $('#rOk').onclick=doSave;$('#rName').onkeydown=e=>{if(e.key==='Enter')doSave()};
  $('#restB').onclick=openRestCfg;$('#platesB').onclick=()=>openPlates('');
  $('#cancel').onclick=()=>{$('#cancelBox').classList.add('on');$('#cancel').style.display='none'};
  $('#cNo').onclick=()=>{$('#cancelBox').classList.remove('on');$('#cancel').style.display='block'};
  $('#cYes').onclick=()=>{P().workout=null;save();badge();stopRest();wake(false);closeSheet();renderWk();toast('Entreno descartado')};
  showSheet();
}
function finish(mode){
  const p=P(),W=p.workout;
  const pend=W.items.reduce((a,it)=>a+it.sets.filter(s=>!s.done&&num(s.reps)>0).length,0);
  const doneN=W.items.reduce((a,it)=>a+it.sets.filter(s=>s.done&&!s.w).length,0);
  if(!mode&&pend){
    $('#sheet').innerHTML=`<div class="grab"></div><h3>Tienes ${pend} serie${pend>1?'s':''} sin marcar ✓</h3>
      <p class="muted" style="margin:6px 0 14px">Solo se guardan las series que marcaste. ¿Hiciste también las que no marcaste?</p>
      <button class="btn pri" id="fAll">Sí, guardarlas todas</button>
      ${doneN?`<button class="btn sec2" id="fDone">No, guardar solo las ${doneN} marcadas</button>`:''}
      <button class="btn sec2" id="fBack">Seguir entrenando</button>`;
    $('#fAll').onclick=()=>{W.items.forEach(it=>it.sets.forEach(s=>{if(num(s.reps)>0)s.done=true}));closeSheet();finish('ok')};
    if($('#fDone'))$('#fDone').onclick=()=>{closeSheet();finish('ok')};
    $('#fBack').onclick=closeSheet;
    showSheet();return;
  }
  if(!W.items.some(it=>it.sets.some(s=>s.done&&!s.w))){toast('Marca al menos una serie ✓');return}
  W.items.forEach(it=>{delete it.open;it.sets.forEach(s=>{s.kg=clean(s.kg);s.reps=clean(s.reps)})});
  const before=prMap(),achBefore=achievements().filter(a=>a.ok).map(a=>a.id);
  W.end=Date.now();
  W.items=W.items.map(it=>({id:it.id,ss:it.ss||undefined,sets:it.sets.filter(s=>s.done).map(s=>s.w?{kg:s.kg,reps:s.reps,w:true}:{kg:s.kg,reps:s.reps})})).filter(it=>it.sets.length);
  p.history.unshift(W);p.workout=null;save();badge();stopRest();wake(false);updateBell();
  const prs=[];W.items.forEach(it=>{const top=work(it.sets).reduce((a,b)=>num(b.kg)>num(a.kg)?b:a,{kg:0,reps:0});const o=before[it.id];if(o&&num(top.kg)>o.kg)prs.push({id:it.id,kg:+top.kg,reps:+top.reps,old:o.kg})});
  const newAch=achievements().filter(a=>a.ok&&!achBefore.includes(a.id));
  chartEx=W.items[0].id;
  const v=vol(W),mins=Math.max(1,Math.round((W.end-W.start)/60000));
  $('#sheet').innerHTML=`<div class="grab"></div><div class="done-hero"><div class="big">🔥</div><h3>¡Entreno terminado!</h3><div class="sub">${mins} min · ${work(W.items.flatMap(i=>i.sets)).length} series · ${Math.round(v).toLocaleString('es')} lb</div></div>
    ${prs.length?`<h4>🏆 Nuevos récords</h4>${prs.map(r=>`<div class="rrow"><div class="meta"><b>${byId[r.id].n}</b><span>${r.old} lb → <em style="color:var(--acc);font-style:normal;font-weight:800">${r.kg} lb × ${r.reps}</em></span></div></div>`).join('')}`:''}
    ${newAch.length?`<h4>🎖️ Logros desbloqueados</h4>${newAch.map(a=>`<div class="rrow"><span style="font-size:26px">${a.ic}</span><div class="meta"><b>${a.n}</b><span>${a.d}</span></div></div>`).join('')}`:''}
    <div style="height:10px"></div><button class="btn pri" id="dOk">Ver mi cuerpo</button><button class="btn sec2" id="dPr">Ver mi progreso</button>`;
  $('#dOk').onclick=()=>{closeSheet();go('bo')};$('#dPr').onclick=()=>{closeSheet();go('hi')};
  go('bo');showSheet();
}
