/* Cuerpo 3D: malla humana MakeHuman (CC0) con músculos pintados por zonas */
function make3D(THREE,canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(26,1,.1,50);cam.position.set(0,.93,4.1);cam.lookAt(0,.86,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x30342a,1.2));
  const key=new THREE.DirectionalLight(0xffffff,2.3);key.position.set(1.6,2.8,3.2);scene.add(key);
  const rim=new THREE.DirectionalLight(0xe6ffd6,1.2);rim.position.set(-2.6,2,-3);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xcfe0ff,.6);fill.position.set(-3,1,2);scene.add(fill);
  const root=new THREE.Group();scene.add(root);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(.6,48),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.35}));floor.rotation.x=-Math.PI/2;floor.position.y=.002;scene.add(floor);
  const mat=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.48,metalness:0,clearcoat:.25,clearcoatRoughness:.5});
  let mesh=null,ids=null,qs=null,cloth=null,cache={};
  const len=(x,y,z)=>Math.sqrt(x*x+y*y+z*z);
  const dec=b=>{const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
  const TRI=new Uint16Array(dec(HUMAN.t).buffer);

  /* ---------- malla: decodificar + subdividir una vez (bordes de color más finos) ---------- */
  function meshFor(sex){
    const H=HUMAN[sex],q=new Uint16Array(dec(H.p).buffer),n=q.length/3,P=new Float32Array(q.length);
    for(let i=0;i<n;i++)for(let k=0;k<3;k++)P[i*3+k]=H.lo[k]+q[i*3+k]/65535*(H.hi[k]-H.lo[k]);
    const g0=new THREE.BufferGeometry();g0.setAttribute('position',new THREE.BufferAttribute(P,3));g0.setIndex(new THREE.BufferAttribute(TRI,1));g0.computeVertexNormals();
    const N0=g0.attributes.normal.array;
    const pos=Array.from(P),nor=Array.from(N0),em=new Map(),out=[];
    const mid=(a,b)=>{const k=a<b?a*65536+b:b*65536+a;let v=em.get(k);if(v!==undefined)return v;v=pos.length/3;
      for(let c=0;c<3;c++){pos.push((pos[a*3+c]+pos[b*3+c])/2);nor.push(nor[a*3+c]+nor[b*3+c])}
      const L=Math.hypot(nor[v*3],nor[v*3+1],nor[v*3+2])||1;nor[v*3]/=L;nor[v*3+1]/=L;nor[v*3+2]/=L;em.set(k,v);return v};
    for(let t=0;t<TRI.length;t+=3){const a=TRI[t],b=TRI[t+1],c=TRI[t+2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);out.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pos),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(nor),3));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(out),1));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(pos.length),3));g.computeBoundingSphere();
    return g;
  }

  /* ---------- zonas musculares ---------- */
  function segInfo(p,a,b){const bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],l2=bx*bx+by*by+bz*bz;const t=((p[0]-a[0])*bx+(p[1]-a[1])*by+(p[2]-a[2])*bz)/l2;const tc=Math.max(0,Math.min(1,t));return {t,d:len(p[0]-a[0]-bx*tc,p[1]-a[1]-by*tc,p[2]-a[2]-bz*tc),vx:p[0]-(a[0]+bx*t),vy:p[1]-(a[1]+by*t),vz:p[2]-(a[2]+bz*t),bx,by,bz,l:Math.sqrt(l2)}}
  function limbAng(si,sg){const ux=si.bx/si.l,uy=si.by/si.l,uz=si.bz/si.l;let fx=-uz*ux,fy=-uz*uy,fz=1-uz*uz;const fl=len(fx,fy,fz);fx/=fl;fy/=fl;fz/=fl;
    let lx=uy*fz-uz*fy,ly=uz*fx-ux*fz,lz=ux*fy-uy*fx;if(lx*sg<0){lx=-lx;ly=-ly;lz=-lz}
    return Math.atan2(si.vx*lx+si.vy*ly+si.vz*lz,si.vx*fx+si.vy*fy+si.vz*fz)*180/Math.PI}
  const adiff=(a,b)=>{let d=Math.abs(a-b)%360;return d>180?360-d:d};
  const LIMB={ua:[['hombros',.04,.32,92,102],['biceps',.62,.27,4,48],['triceps',.56,.32,196,34],['triceps',.52,.26,142,28]],
    fa:[['antebrazos',.3,.3,-20,52],['antebrazos',.27,.3,95,42]],
    th:[['cuadriceps',.5,.44,4,36],['cuadriceps',.46,.4,70,30],['cuadriceps',.84,.16,-44,34],['isquios',.55,.38,162,26],['isquios',.55,.38,210,26]],
    sh:[['gemelos',.28,.25,205,32],['gemelos',.26,.23,152,28]]};
  // torso: [clave, ángulo (0 frente,180 espalda), y (en cuerpo de referencia: cadera .9, cuello 1.5), ancho, alto, giro]
  const ABS=F=>(F?[1.17,1.1,1.03,.96]:[1.19,1.115,1.04,.965]).map(y=>['abdomen',F?18:20,y,F?.042:.048,F?.03:.033,0]);
  const TOR_M=[['pecho',31,1.37,.09,.065,-14],...ABS(0),['oblicuos',64,1.07,.04,.105,14],['trapecio',150,1.47,.1,.045,10],['trapecio',180,1.36,.05,.12,0],
    ['dorsales',130,1.21,.072,.13,22],['lumbar',167,1.02,.03,.08,0],['gluteos',146,.86,.09,.095,0],['gluteos',106,.95,.04,.035,0],['hombros',84,1.44,.055,.05,0]];
  const TOR_F=[['pecho',29,1.405,.07,.04,-10],...ABS(1),['oblicuos',62,1.05,.036,.095,14],['trapecio',150,1.46,.09,.04,10],['trapecio',180,1.35,.045,.11,0],
    ['dorsales',128,1.2,.064,.12,22],['lumbar',167,1.01,.028,.075,0],['gluteos',146,.855,.1,.105,0],['gluteos',106,.95,.042,.036,0],['hombros',84,1.43,.05,.045,0]];
  function region(J,F,x,y,z){
    const sg=x>=0?1:-1,j=J[sg],p=[x,y,z],sp=J.spine,hy=sp[0][1],ny=sp[4][1],span=ny-hy,k=span/.6;
    const ua=segInfo(p,j.S,j.E),fa=segInfo(p,j.E,j.W);
    const armLike=Math.min(ua.d,fa.d)<.075&&Math.abs(x)>Math.abs(j.S[0])*.82&&ua.t>-.2&&y<ny;
    const fit=(list,si,t)=>{const a=limbAng(si,sg);let best=null,bq=1.3;for(const m of list){const q=Math.sqrt(((t-m[1])/m[2])**2+(adiff(a,m[3])/m[4])**2);if(q<bq){bq=q;best=m[0]}}return [best,bq]};
    if(len(x-j.W[0],y-j.W[1],z-j.W[2])<.15&&Math.abs(x)>Math.abs(j.H[0])+.08)return [null,9];
    if(armLike){const r1=fit(LIMB.ua,ua,ua.t),r2=fa.t>.8?[null,9]:fit(LIMB.fa,fa,fa.t);const w1=r1[1]+(ua.d>fa.d+.01?.4:0),w2=r2[1]+(fa.d>ua.d+.01?.4:0);return w1<=w2?r1:r2}
    if(y<j.H[1]-.09){const th=segInfo(p,j.H,j.K),sh=segInfo(p,j.K,j.A);const r1=th.t<1.12?fit(LIMB.th,th,th.t):[null,9],r2=sh.t>-.12?fit(LIMB.sh,sh,sh.t):[null,9];return r1[1]<=r2[1]?r1:r2}
    if(y>ny+.04)return [null,9];
    const zc=z-sp[2][2],a=Math.atan2(Math.abs(x),zc)*180/Math.PI;let best=null,bq=1.3;
    for(const m of (F?TOR_F:TOR_M)){const yy=hy+(m[2]-.9)/.6*span,da=(a-m[1])*.0027,dy=y-yy,r=m[5]*Math.PI/180,u=da*Math.cos(r)+dy*Math.sin(r),v=-da*Math.sin(r)+dy*Math.cos(r);const q=Math.sqrt((u/(m[3]*Math.sqrt(k)))**2+(v/(m[4]*k))**2);if(q<bq){bq=q;best=m[0]}}
    if((best===null||bq>1)&&y<j.H[1]){const th=segInfo(p,j.H,j.K);const r=fit(LIMB.th,th,th.t);if(r[1]<bq)return r}
    return [best,bq];
  }
  // ropa deportiva (pantaloneta y top) para que se vea como una app de fitness
  function clothing(J,F,x,y,z){const sp=J.spine,hy=sp[0][1],span=sp[4][1]-hy,j=J[x>=0?1:-1],p=[x,y,z];
    const ua=segInfo(p,j.S,j.E),fa=segInfo(p,j.E,j.W);if(Math.min(ua.d,fa.d)<.08&&Math.abs(x)>Math.abs(j.S[0])*.75)return 0;
    if(Math.abs(x)>Math.abs(j.H[0])+.13)return 0;
    if(y<hy+span*.1&&y>j.H[1]-.16)return 1;
    if(F&&y>hy+span*.5&&y<hy+span*.8&&Math.abs(x)<Math.abs(j.S[0])*.95)return 2;return 0}

  function build(sex){
    if(mesh){root.remove(mesh)}
    const F=sex==='f',J=HUMAN.J[sex];
    if(!cache[sex]){
      const g=meshFor(sex),pa=g.attributes.position.array,n=pa.length/3,I=new Array(n),Q=new Float32Array(n),C=new Uint8Array(n);
      const na=g.attributes.normal.array,BUL={pecho:.012,abdomen:.006,hombros:.01,biceps:.009,triceps:.008,antebrazos:.006,cuadriceps:.011,isquios:.008,gemelos:.01,gluteos:.01,dorsales:.008,trapecio:.007,lumbar:.005,oblicuos:.005};
      for(let i=0;i<n;i++){const x=pa[i*3],y=pa[i*3+1],z=pa[i*3+2];const [k,q]=region(J,F,x,y,z);I[i]=k;Q[i]=q;C[i]=clothing(J,F,x,y,z)}
      { // suavizar el contorno: promediar q con los vecinos (mismo músculo)
        const ix=g.index.array,nb=Array.from({length:n},()=>[]);
        for(let t=0;t<ix.length;t+=3){const A=ix[t],B=ix[t+1],C=ix[t+2];nb[A].push(B,C);nb[B].push(A,C);nb[C].push(A,B)}
        const SM={cuadriceps:1,isquios:1,gemelos:1,biceps:1,triceps:1,antebrazos:1,hombros:1};
        for(let it=0;it<3;it++){const Q2=new Float32Array(n);for(let i=0;i<n;i++){const k=I[i];if(!k||!SM[k]){Q2[i]=Q[i];continue}let s=Q[i],c=1;for(const v of nb[i]){s+=I[v]===k?Q[v]:1.3;c++}Q2[i]=s/c}Q.set(Q2)}
        // vértices sin músculo pero rodeados de un músculo: adoptar el más común
        for(let i=0;i<n;i++){if(I[i])continue;const cnt={};let tot=0;for(const v of nb[i]){if(I[v]){cnt[I[v]]=(cnt[I[v]]||0)+1;tot++}}const best=Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x])[0];if(best&&SM[best]&&cnt[best]>=nb[i].length*.7){I[i]=best;Q[i]=.95}}
      }
      for(let i=0;i<n;i++){const k=I[i],q=Q[i];if(!k||q>1.25)continue;let d=0;
        if(q<1)d+=(BUL[k]||.007)*(F?.75:1)*Math.pow(1-q*q,.6);
        d-=.0028*Math.exp(-(((q-1.02)/.06)**2));
        pa[i*3]+=na[i*3]*d;pa[i*3+1]+=na[i*3+1]*d;pa[i*3+2]+=na[i*3+2]*d}
      g.computeVertexNormals();
      cache[sex]={g,I,Q,C};
    }
    const c=cache[sex];ids=c.I;qs=c.Q;cloth=c.C;
    mesh=new THREE.Mesh(c.g,mat);root.add(mesh);paint();
  }
  const SKIN=new THREE.Color(0xd0d4d9),SHORT=new THREE.Color(0x30353c),TOP=new THREE.Color(0x30353c),LINE=new THREE.Color(0x1b1d20),tmp=new THREE.Color(),WHITE=new THREE.Color(0xffffff);
  function paint(){
    if(!mesh)return;const c=weekCounts(),col=mesh.geometry.attributes.color,arr=col.array,KC={};
    MKEYS.forEach(k=>{const b=new THREE.Color(muscleColor(k,c));if(k===selMus)b.lerp(WHITE,.45);else if(k===hoverMus)b.lerp(WHITE,.2);KC[k]=b});
    const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
    for(let i=0;i<ids.length;i++){const k=ids[i],q=qs[i];const base=cloth[i]===1?SHORT:cloth[i]===2?TOP:SKIN;let cc=base;
      if(k&&q<1.3){tmp.copy(KC[k]);const sh=.82+.18*Math.min(1,1-q*q+.2);tmp.multiplyScalar(sh>1?1:sh);tmp.lerp(base,ss(.9,1.05,q));tmp.lerp(LINE,Math.exp(-(((q-.99)/.05)**2))*.6);cc=tmp}
      arr[i*3]=cc.r;arr[i*3+1]=cc.g;arr[i*3+2]=cc.b}
    col.needsUpdate=true;
  }
  function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w)return;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(canvas);resize();
  let rot=0,vel=0,target=null,drag=null,lastHover=0;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,r:rot,moved:false};target=null;vel=0;canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{
    if(drag){const dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.moved=true;const nr=drag.r+dx*.012;vel=nr-rot;rot=nr;return}
    if(e.pointerType==='mouse'&&performance.now()-lastHover>70){lastHover=performance.now();const k=pick(e);if(k!==hoverMus){hoverMus=k;paint();setLabel(k?MUS[k].n:(selMus?MUS[selMus].n:''))}}
  });
  canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved){const k=pick(e);if(k)openMuscle(k)}drag=null});
  canvas.addEventListener('pointercancel',()=>{drag=null});
  canvas.addEventListener('pointerleave',()=>{if(hoverMus){hoverMus=null;paint();setLabel(selMus?MUS[selMus].n:'')}});
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  function pick(e){if(!mesh)return null;const r=canvas.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,cam);
    const hit=ray.intersectObject(mesh,false)[0];if(!hit)return null;const f=hit.face;
    const cand=[f.a,f.b,f.c].filter(v=>ids[v]&&qs[v]<1.02);return cand.length?ids[cand[0]]:null}
  function face(s){const goal=s==='b'?Math.PI:0;const tp=Math.PI*2;let d=((goal-rot)%tp+tp*1.5)%tp-Math.PI;target=rot+d;vel=0}
  function loop(){
    requestAnimationFrame(loop);
    if(view!=='bo'||document.hidden)return;
    if(!drag){if(target!==null){rot+=(target-rot)*.15;if(Math.abs(target-rot)<.002){rot=target;target=null}}else if(Math.abs(vel)>.0005){rot+=vel;vel*=.92}}
    root.rotation.y=rot;
    const n=((rot%(Math.PI*2))+Math.PI*2)%(Math.PI*2);const back=n>Math.PI/2&&n<Math.PI*1.5;
    if((back?'b':'f')!==side&&target===null){side=back?'b':'f';document.querySelectorAll('#segSide button').forEach(x=>x.classList.toggle('on',x.dataset.s===side))}
    renderer.render(scene,cam);
  }
  loop();
  return {build,paint,face,setRot(r){rot=r;target=null}};
}
