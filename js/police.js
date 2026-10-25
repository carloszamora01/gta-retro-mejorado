'use strict';
// ================= POLICÍA: niveles de búsqueda que de verdad cambian el juego =================
// cars: patrullas simultáneas · gap: segundos entre refuerzos · boost: velocidad extra · crew: agentes por patrulla
// rb: retenes · need: segundos ocultos para bajar una estrella · types: c=patrulla i=interceptor s=SWAT
const LV=[null,
 {cars:2,gap:7,boost:0,crew:1,rb:0,need:8,types:'c'},
 {cars:3,gap:5.5,boost:4,crew:1,rb:0,need:13,types:'cc'},
 {cars:5,gap:4,boost:8,crew:1,rb:0,need:18,types:'cci'},
 {cars:7,gap:3,boost:12,crew:2,rb:1,need:25,types:'cis'},
 {cars:9,gap:2.2,boost:16,crew:2,rb:1,need:34,types:'iss'}];
const HEAT=[0,1,3,6,10,15];
const POL={next:0,search:0,esc:0,rbT:10,lkp:null,heat:0,bust:0,seen:false,radio:0};
const starsFor=h=>{let s=0;for(let i=1;i<=5;i++)if(h>=HEAT[i])s=i;return s};
function addHeat(a){POL.heat+=a;const s=starsFor(POL.heat);if(s>S.wanted)setWanted(s)}
function setWanted(n){n=clamp(n|0,0,5);if(n===S.wanted)return;const up=n>S.wanted;S.wanted=n;POL.search=0;POL.esc=0;
 if(n>0){POL.heat=Math.max(POL.heat,HEAT[n]);if(up){POL.next=Math.min(POL.next,1.5);POL.lkp=[pl.x,pl.z];onWantedUp(n)}}
 else{POL.heat=0;bark('lost');msg('¡Has perdido a la policía!')}}
function onWantedUp(n){msg('Nivel de búsqueda: '+'★'.repeat(n));if(n===1)bark('w1');else if(n===3)bark('w3');else if(n===5)bark('w5');
 if(POL.radio<=0){POL.radio=14;Story.say('Radio',pick(['Central: sospechoso a la vista, soliciten refuerzos.','Unidades en camino, intercepten por la avenida.','Código rojo: todas las unidades al sector.']))}}
function policeReset(){cars=cars.filter(c=>!c.police);offs=[];S.wanted=0;Object.assign(POL,{next:0,search:0,esc:0,rbT:10,lkp:null,heat:0,bust:0,seen:false,radio:0})}
// ---------- Aparición ----------
function spawnCop(){const lv=LV[S.wanted],k=pick(lv.types.split('')),base=COPT[k==='c'?'cop':k==='i'?'inter':'swat'];
 let best=null;
 for(let a=0;a<16;a++){const i=Math.random()*(N+1)|0,j=Math.random()*(N+1)|0,x=i*P,z=j*P,d=Math.hypot(x-pl.x,z-pl.z);if(d<70||d>160)continue;
  const dot=((x-pl.x)*Math.sin(S.cy)+(z-pl.z)*Math.cos(S.cy))/d;if(dot>.35&&d<S.fog*.9&&a<12)continue;best=[x,z];break}
 if(!best)return;
 let [x,z]=best,h;if(Math.random()<.5){z+=3;x+=rr(-8,8);h=pl.x>x?Math.PI/2:-Math.PI/2}else{x+=3;z+=rr(-8,8);h=pl.z>z?0:Math.PI}
 const c=mkCar(Object.assign({},base,{m:base.m+lv.boost,a:base.a+lv.boost*.5}),clamp(x,0,CITY),clamp(z,0,CITY),h,null);
 c.police=true;c.crew=lv.crew;c.hp=c.mhp=k==='s'?220:k==='i'?75:100;c.sp=12;c.stuck=0;c.rev=0;c.wanderT=0;cars.push(c)}
function spawnRoadblock(){if(cars.some(c=>c.rb)||!cur)return false;const vx=Math.sin(cur.h),vz=Math.cos(cur.h),ax=Math.abs(vx)>Math.abs(vz);
 const px=clamp(cur.x+vx*115,10,CITY-10),pz=clamp(cur.z+vz*115,10,CITY-10);let x,z;
 if(ax){z=Math.round(cur.z/P)*P;x=px}else{x=Math.round(cur.x/P)*P;z=pz}
 if(Math.hypot(x-pl.x,z-pl.z)<70)return false;
 for(const s of[-1,1]){const cx=ax?x:x+s*2.8,cz=ax?z+s*2.8:z,c=mkCar(Object.assign({},COPT.cop),cx,cz,ax?0:Math.PI/2,null);
  c.police=true;c.fixed=true;c.rb=true;c.age=0;c.crew=0;cars.push(c);
  offs.push(mkOff(cx+(ax?-3:0),cz+(ax?0:-3)))}
 msg('¡Retén policial adelante!');return true}
function mkOff(x,z){return{x,z,h:0,hp:60,ph:0,mv:0,st:'chase',t:0,cool:rr(.5,1.5),los:false,losT:0,atk:0,hit:0,flash:0,look:COPLOOK}}
// ---------- Navegación por calles ----------
// Devuelve [x,z,giro]: nodo al que dirigirse y si habrá que girar allí (para frenar antes)
function bestNode(i,j,dx0,dz0,gi,gj){let b=null,bs=1e9;
 for(const [dx,dz] of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+dx,nj=j+dz;if(ni<0||nj<0||ni>N||nj>N)continue;
  let sc=Math.abs(ni-gi)+Math.abs(nj-gj);if(dx*dx0+dz*dz0<-.3)sc+=1.6;if(sc<bs){bs=sc;b=[ni*P,nj*P,(dx*dx0+dz*dz0)>.7?0:1]}}
 return b}
function navTarget(c,gx,gz){const gi=clamp(Math.round(gx/P),0,N),gj=clamp(Math.round(gz/P),0,N),i=Math.round(c.x/P),j=Math.round(c.z/P),ox=c.x-i*P,oz=c.z-j*P,
 onZ=Math.abs(ox)<W/2-1,onX=Math.abs(oz)<W/2-1;
 if(!onZ&&!onX)return Math.abs(ox)<Math.abs(oz)?[i*P,c.z,1]:[c.x,j*P,1];
 if(onZ&&onX)return bestNode(i,j,Math.sin(c.h),Math.cos(c.h),gi,gj)||[gx,gz,0];
 if(onZ){const fwd=(gi===i?Math.sign(gz-c.z):Math.cos(c.h))>=0?1:-1,nj=clamp(fwd>0?Math.floor(c.z/P)+1:Math.ceil(c.z/P)-1,0,N),pl2=bestNode(i,nj,0,fwd,gi,gj);
  return[i*P,nj*P,pl2?pl2[2]:0]}
 const fwd=(gj===j?Math.sign(gx-c.x):Math.sin(c.h))>=0?1:-1,ni=clamp(fwd>0?Math.floor(c.x/P)+1:Math.ceil(c.x/P)-1,0,N),pl2=bestNode(ni,j,fwd,0,gi,gj);
 return[ni*P,j*P,pl2?pl2[2]:0]}
function copDrive(c,dt){const dx=pl.x-c.x,dz=pl.z-c.z,dist=Math.hypot(dx,dz),los=dist<80&&lineClear(c.x,c.z,pl.x,pl.z);let tx,tz,turn=0;
 if(los&&dist<70){let lead=0,vx=0,vz=0;if(S.wanted>=3&&cur){lead=clamp(dist/Math.max(20,c.sp),0,1.2);vx=Math.sin(cur.h)*cur.sp;vz=Math.cos(cur.h)*cur.sp}
  tx=pl.x+vx*lead;tz=pl.z+vz*lead;if(!los||dist<24){tx=pl.x;tz=pl.z}}
 else{const g=POL.lkp||[pl.x,pl.z];let gx=g[0],gz=g[1];turn=0;
  if(Math.hypot(g[0]-c.x,g[1]-c.z)<16){c.wanderT-=dt;if(c.wanderT<=0||!c.wp){c.wp=[clamp(Math.round(g[0]/P)+(Math.random()*5|0)-2,0,N)*P,clamp(Math.round(g[1]/P)+(Math.random()*5|0)-2,0,N)*P];c.wanderT=rr(4,8)}gx=c.wp[0];gz=c.wp[1]}
  const t=navTarget(c,gx,gz);tx=t[0];tz=t[1];turn=t[2]}
 const da=angDiff(Math.atan2(tx-c.x,tz-c.z),c.h);let desired=c.t.m*clamp(1-Math.abs(da)*.5,.3,1),thr,st=clamp(da*2.5,-1,1);
 if(turn){const dn=Math.hypot(tx-c.x,tz-c.z);desired=Math.min(desired,9+Math.sqrt(2*18*Math.max(0,dn-8)))}
 if(!cur&&dist<60)desired=Math.min(desired,Math.max(0,(dist-16)*.9));
 if(Math.abs(da)>2.3&&c.sp>8)desired=0;
 thr=c.sp>desired+6?-1:c.sp>desired+2?-.6:(c.sp<desired?1:0);
 if(Math.abs(c.sp)<1.5&&desired>3)c.stuck+=dt;else c.stuck=Math.max(0,c.stuck-dt);
 if(c.stuck>1.1){c.rev=1.1;c.stuck=0}
 if(c.rev>0){c.rev-=dt;thr=-1;st=-st}
 drive(c,dt,thr,st,false);
 if(!cur&&c.crew>0&&Math.abs(c.sp)<2&&dist<36){for(let k=0;k<c.crew&&offs.length<12;k++)offs.push(mkOff(c.x+Math.cos(c.h)*2.6*(k?-1:1),c.z-Math.sin(c.h)*2.6*(k?-1:1)));c.crew=0}}
// ---------- Agentes a pie ----------
function offFire(o,d){bang(clamp(1-d/45,.15,.5));o.flash=.08;
 const acc=clamp(.8-d*.018,.18,.75)*(cur?.7:1)*(cur&&Math.abs(cur.sp)>20?.6:1);
 if(Math.random()<acc){if(cur){cur.hp-=3.5;S.shake=Math.max(S.shake,.15)}else hurt(5+S.wanted*1.6)}
 else sparks.push({x:pl.x+rr(-2,2),y:.2,z:pl.z+rr(-2,2),t:.1})}
function officersUpdate(dt){let near=0;
 for(const o of offs){o.flash=Math.max(0,o.flash-dt);o.atk=Math.max(0,o.atk-dt*3);
  if(o.st==='down'){o.t-=dt;continue}
  const dx=pl.x-o.x,dz=pl.z-o.z,d=Math.hypot(dx,dz);o.losT-=dt;if(o.losT<=0){o.los=d<60&&lineClear(o.x,o.z,pl.x,pl.z);o.losT=.25+Math.random()*.1}
  const armed=S.wanted>=2,pref=armed?(cur?18:10):1.2;let mv=0,th=o.h;
  if(S.wanted===0){mv=0}
  else if(o.los||d<20){th=Math.atan2(dx,dz);if(d>pref)mv=(armed?3.8:4.4)+S.wanted*.25}
  else if(POL.lkp){th=Math.atan2(POL.lkp[0]-o.x,POL.lkp[1]-o.z);if(Math.hypot(POL.lkp[0]-o.x,POL.lkp[1]-o.z)>4)mv=3.5}
  o.h+=angDiff(th,o.h)*Math.min(1,dt*10);
  if(mv){o.x+=Math.sin(o.h)*mv*dt;o.z+=Math.cos(o.h)*mv*dt;o.ph+=dt*mv*2.4;hitSolids(o,.45)}
  o.mv=mv/6;
  if(armed&&o.los&&d<34){o.cool-=dt;if(o.cool<=0){o.cool=rr(.8,1.6)-S.wanted*.05;offFire(o,d)}}
  if(!cur&&d<2.2&&S.wanted>0)near++}
 offs=offs.filter(o=>(o.st!=='down'||o.t>0)&&Math.hypot(o.x-pl.x,o.z-pl.z)<130);
 // arresto: si te rodean a pie, pierdes
 if(near&&deadT<=0)POL.bust+=dt*near;else POL.bust=Math.max(0,POL.bust-dt*2);
 if(POL.bust>2.4){POL.bust=0;die('ARRESTADO')}}
// ---------- Bucle principal de la policía ----------
function policeUpdate(dt){POL.radio-=dt;const pc=cars.filter(c=>c.police&&!c.fixed&&c.hp>0);
 for(const c of cars)if(c.police&&c.hp<=0&&!c.dead){c.dead=true;if(c.hurtBy==='pl')addHeat(1.5)}
 if(!S.wanted){ // se retiran: los que quedan lejos desaparecen
  for(const c of cars)if(c.police){c.stand=true;c.standT=(c.standT||0)+dt}
  cars=cars.filter(c=>!c.police||(Math.hypot(c.x-pl.x,c.z-pl.z)<50&&c.standT<20));
  offs=offs.filter(o=>Math.hypot(o.x-pl.x,o.z-pl.z)<50);officersUpdate(dt);return}
 const lv=LV[S.wanted];
 for(const c of pc)copDrive(c,dt);
 // visibilidad: si algún policía te ve (o está muy cerca) la búsqueda no baja
 let seen=false;
 for(const c of pc){const d=Math.hypot(c.x-pl.x,c.z-pl.z);if(d<26||(d<85&&lineClear(c.x,c.z,pl.x,pl.z))){seen=true;break}}
 if(!seen)for(const o of offs)if(o.st!=='down'&&o.los){seen=true;break}
 POL.seen=seen;
 if(seen){POL.search=0;POL.lkp=[pl.x,pl.z];POL.esc+=dt;if(POL.esc>45&&S.wanted<5){POL.esc=0;setWanted(S.wanted+1)}}
 else{POL.esc=Math.max(0,POL.esc-dt*.5);POL.search+=dt;if(POL.search>=lv.need)setWanted(S.wanted-1)}
 POL.next-=dt;if(pc.length<lv.cars&&POL.next<=0){spawnCop();POL.next=lv.gap}
 if(lv.rb){POL.rbT-=dt;if(POL.rbT<=0&&cur&&Math.abs(cur.sp)>14){POL.rbT=spawnRoadblock()?18:3}}
 for(const c of cars)if(c.rb){c.age+=dt;c.sp=0}
 cars=cars.filter(c=>!c.rb||(c.age<35&&Math.hypot(c.x-pl.x,c.z-pl.z)<150));
 officersUpdate(dt)}
