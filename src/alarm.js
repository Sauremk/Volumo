/* ================= Alarma del descanso ================= */
const ALARM_DEF={sound:'campana',vol:.7,warn:true,rep:3,vib:true,wake:true,bg:false};
function AL(){const p=P();return p.alarm=Object.assign({},ALARM_DEF,p.alarm||{})}
let actx=null;
document.addEventListener('pointerdown',()=>{try{if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){}});
function tone(type,sr,v){
  const L=type==='campana'?1.6:type==='pitido'?1.0:1.8,a=new Float32Array(Math.round(L*sr));
  for(let i=0;i<a.length;i++){const t=i/sr;let x=0;
    if(type==='campana'){[0,.5].forEach(s=>{const u=t-s;if(u>=0){const e=Math.exp(-u*4);x+=e*(Math.sin(2*Math.PI*1046*u)+.45*Math.sin(2*Math.PI*2093*u)+.2*Math.sin(2*Math.PI*3140*u))*.6}})}
    else if(type==='pitido'){const k=Math.floor(t/.2),u=t-k*.2;if(k<4&&u<.12){const e=Math.min(1,u/.005,(.12-u)/.005);x=e*(Math.sin(2*Math.PI*1000*u)+.3*Math.sin(2*Math.PI*3000*u))*.8}}
    else{const k=Math.floor(t/.15),f=k%2?1320:880,e=Math.min(1,t/.01,(L-t)/.02);x=e*(Math.sin(2*Math.PI*f*t)+.25*Math.sin(2*Math.PI*f*3*t))*.7}
    a[i]=Math.max(-1,Math.min(1,x*v))}
  return a;
}
function blip(f,len,sr,v){const a=new Float32Array(Math.round(len*sr));for(let i=0;i<a.length;i++){const t=i/sr,e=Math.min(1,t/.004,(len-t)/.01);a[i]=e*Math.sin(2*Math.PI*f*t)*v}return a}
function planAlarm(sec,al,sr){
  const ev=[],v=al.vol;
  if(al.warn){if(sec>12)ev.push({t:sec-10,a:blip(990,.14,sr,.55*v)});[3,2,1].forEach(k=>{if(sec>k+.4)ev.push({t:sec-k,a:blip(700,.09,sr,.45*v)})})}
  if(al.sound!=='off'){const b=tone(al.sound,sr,v),L=b.length/sr;for(let r=0;r<al.rep;r++)ev.push({t:sec+r*(L+.45),a:b})}
  return ev;
}
let alNodes=[],alAudio=null,alURL=null;
function cancelAlarm(){alNodes.forEach(n=>{try{n.stop()}catch(e){}});alNodes=[];if(alAudio){try{alAudio.pause()}catch(e){}alAudio=null}if(alURL){URL.revokeObjectURL(alURL);alURL=null}}
function wavURL(ev,sr){
  const end=ev.reduce((m,e)=>Math.max(m,e.t+e.a.length/sr),0)+.2,n=Math.ceil(end*sr),mix=new Float32Array(n);
  ev.forEach(e=>{const o=Math.max(0,Math.round(e.t*sr));for(let i=0;i<e.a.length&&o+i<n;i++)mix[o+i]+=e.a[i]});
  const buf=new ArrayBuffer(44+n*2),d=new DataView(buf),w=(o,s)=>{for(let i=0;i<s.length;i++)d.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');d.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);
  d.setUint32(24,sr,true);d.setUint32(28,sr*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*2,true);
  for(let i=0;i<n;i++)d.setInt16(44+i*2,Math.max(-1,Math.min(1,mix[i]))*32767,true);
  return URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));
}
function schedAlarm(sec){
  cancelAlarm();const al=AL();if(al.sound==='off'&&!al.warn)return;
  if(al.bg){ // pista de audio: sigue sonando con la pantalla bloqueada
    const sr=8000;alURL=wavURL(planAlarm(sec,al,sr),sr);alAudio=new Audio(alURL);alAudio.setAttribute('playsinline','');
    alAudio.play().catch(()=>{alAudio=null;schedFg(sec,al)});return;
  }
  schedFg(sec,al);
}
function schedFg(sec,al){
  try{if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){return}
  const sr=actx.sampleRate,now=actx.currentTime;
  planAlarm(sec,al,sr).forEach(e=>{try{const b=actx.createBuffer(1,e.a.length,sr);b.getChannelData(0).set(e.a);const s=actx.createBufferSource();s.buffer=b;s.connect(actx.destination);s.start(now+Math.max(0,e.t));alNodes.push(s)}catch(err){}});
}
function testAlarm(){const al=AL();if(al.sound==='off'){toast('El sonido está en silencio');return}schedFg(0.05,Object.assign({},al,{warn:false,rep:1}))}
// Mantener la pantalla encendida mientras entrenas
let wl=null;
async function wake(on){try{if(on&&AL().wake&&'wakeLock' in navigator){if(!wl){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}}else if(!on&&wl){const x=wl;wl=null;await x.release()}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){try{if(P()&&P().workout)wake(true)}catch(e){}if(restEnd&&restEnd<Date.now()&&$('#rest').classList.contains('on'))upRest()}});
function beep(){const al=AL();if(al.sound==='off')return;schedFg(0,Object.assign({},al,{warn:false,rep:1}))}
