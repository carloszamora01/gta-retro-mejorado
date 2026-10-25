'use strict';
// ================= BUCLE PRINCIPAL: entrada, actualización, render =================
let cool=0,shopCd=0;
const isPlay=()=>S.mode==='play';
function msg(t){$('msg').textContent=t;msgT=2}
addEventListener('keydown',e=>{if(!isPlay()||e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;S.keys[e.code]=true;S.idle=0;
 if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
 if(e.code==='KeyT'&&!e.repeat){Phone.toggle();return}
 if(Phone.open){if(e.code==='ArrowLeft'||e.code==='ArrowUp'){Phone.nav(-1);return}if(e.code==='ArrowRight'||e.code==='ArrowDown'){Phone.nav(1);return}
  if(Phone.opts&&/^Digit[1-3]$/.test(e.code)){Phone.pick(+e.code[5]-1);return}}
 if(e.code==='Space'&&!e.repeat&&!cur&&deadT<=0&&pl.y<=pl.gy+.05){pl.vy=8.5;bark('jump',.04)}
 if(e.code==='Digit1')S.weapon=1;if(e.code==='Digit2')S.weapon=2;if(e.code==='Digit3')S.weapon=3;if(e.code==='KeyZ')S.zoom=!S.zoom;
 if(e.code==='KeyE'&&!e.repeat)toggleCar();
 if(e.code==='KeyR'){snapRoad(cur||pl);if(cur){cur.h=Math.round(cur.h/(Math.PI/2))*Math.PI/2;cur.sp=0}msg('Posición recuperada')}});
addEventListener('keyup',e=>{S.keys[e.code]=false});
addEventListener('mousemove',e=>{if(!isPlay()||document.pointerLockElement!==$('c'))return;
 const k=((S.zoom||S.aim)&&S.weapon===1?.6:1)*(S.lock?.7:1);S.cy+=e.movementX*.0025*k;S.cp=clamp(S.cp+e.movementY*.002*k,-.15,1.1)});
addEventListener('mousedown',e=>{if(!isPlay())return;S.idle=0;if(e.button===0)S.fire=1;if(e.button===2)S.aim=true});
addEventListener('mouseup',e=>{if(e.button===0)S.fire=0;if(e.button===2)S.aim=false});
addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>{if(isPlay()&&document.pointerLockElement!==$('c'))pause()});
function nearCar(){let b=null,bd=4;for(const c of cars){const d=Math.hypot(c.x-pl.x,c.z-pl.z);if(d<bd){bd=d;b=c}}return b}
function toggleCar(){if(deadT>0)return;
 if(cur){if(Math.abs(cur.sp)>9){msg('Frena para salir');return}pl.x=cur.x+Math.cos(cur.h)*2.6;pl.z=cur.z-Math.sin(cur.h)*2.6;pl.h=cur.h;pl.y=0;pl.vy=0;cur=null;hitSolids(pl,.5);return}
 const c=nearCar();if(c){if(c.police){msg('No puedes robar una patrulla en servicio');return}cur=c;c.ai=null;c.sp*=0;pl.y=0;pl.vy=0;if(c===fastCar)bark('fast');else bark('car',.5)}}
function explode(c){c.boom=true;c.sp=0;boom();for(let k=0;k<14;k++)sparks.push({x:c.x+rr(-2,2),y:rr(.4,2.4),z:c.z+rr(-2,2),t:rr(.2,.5)});
 const dp=Math.hypot(c.x-pl.x,c.z-pl.z);
 if(cur===c){pl.x=c.x+Math.cos(c.h)*2.8;pl.z=c.z-Math.sin(c.h)*2.8;cur=null;hitSolids(pl,.5);S.shake=1;hurt(50)}else if(dp<9){S.shake=.6;hurt(25)}}
function shopUpdate(dt){shopCd-=dt;if(!cur||shopCd>0)return;const p=LOC.paint.m;if(Math.hypot(cur.x-p[0],cur.z-p[1])>6||Math.abs(cur.sp)>7)return;
 if(S.wanted){const nr=cars.some(c=>c.police&&c.hp>0&&Math.hypot(c.x-pl.x,c.z-pl.z)<24)||offs.some(o=>Math.hypot(o.x-pl.x,o.z-pl.z)<24);
  if(nr){msg('Hay policías cerca: no pueden repintar tu coche');shopCd=3;return}
  const cost=100+S.wanted*60;if(S.cash<cost){msg('Necesitas $'+cost+' para repintar el coche');shopCd=3;return}
  S.cash-=cost;cur.col=[rr(.1,.9),rr(.1,.9),rr(.1,.9)];cur.hp=cur.mhp;policeReset();setWanted(0);msg('Coche repintado (-$'+cost+'): la policía ya no te reconoce');shopCd=5}
 else if(cur.hp<cur.mhp*.95&&S.cash>=40){S.cash-=40;cur.hp=cur.mhp;msg('Coche reparado (-$40)');shopCd=5}}
// ---------- Actualización ----------
function update(dt){
 dlgUpdate(dt);
 const K=S.keys,ar=!Phone.open,up=K.KeyW||(ar&&K.ArrowUp),dn=K.KeyS||(ar&&K.ArrowDown),lf=K.KeyA||(ar&&K.ArrowLeft),rt=K.KeyD||(ar&&K.ArrowRight),thr=(up?1:0)-(dn?1:0),st=(lf?1:0)-(rt?1:0);
 pl.hit-=dt;pl.atk=Math.max(0,pl.atk-dt*3.2);pl.atkCd-=dt;pl.shoot-=dt;pl.flash-=dt;pl.aimT-=dt;S.hurt=Math.max(0,S.hurt-dt);S.hitT-=dt;S.shake=Math.max(0,S.shake-dt*1.8);
 const zoomOn=(S.zoom||S.aim)&&S.weapon===1;
 if(deadT>0){deadT-=dt;pl.mv=0;if(deadT<=0)respawn()}
 else if(cur){drive(cur,dt,thr,st,K.Space);if(S.aDrive&&!st&&Math.abs(cur.sp)>8)laneAssist(cur,dt);pl.x=cur.x;pl.z=cur.z;pl.h=cur.h;pl.y=0;pl.vy=0;
  if(Math.abs(cur.sp)>3&&!K.ShiftLeft)S.cy+=angDiff(cur.h+cur.str*.2,S.cy)*dt*2.2;
  if(K.Space&&Math.abs(cur.sp)>15&&Math.abs(cur.str)>.3)bark('drift',.01)}
 else{const run=K.ShiftLeft||K.ShiftRight,sp=run?6.5:3.2,aiming=S.weapon===1&&(zoomOn||S.fire||pl.aimT>0),mx=thr,mz=st;
  if(mx||mz){const l=Math.hypot(mx,mz),fx=Math.sin(S.cy),fz=Math.cos(S.cy),dx=(fx*mx+fz*mz)/l,dz=(fz*mx-fx*mz)/l;
   pl.x+=dx*sp*dt;pl.z+=dz*sp*dt;pl.ph+=dt*sp*2.3;if(!aiming)pl.h+=angDiff(Math.atan2(dx,dz),pl.h)*Math.min(1,dt*14)}
  if(aiming)pl.h+=angDiff(S.cy,pl.h)*Math.min(1,dt*16);
  pl.mv+=(((mx||mz)?(run?1:.55):0)-pl.mv)*Math.min(1,dt*10);
  hitSolids(pl,.5);
  for(const c of cars){const dx=pl.x-c.x,dz=pl.z-c.z,d=Math.hypot(dx,dz);
   if(d<2.3&&d>.01&&pl.y<.25+c.t.h+c.t.ch*.5){if(Math.abs(c.sp)>6&&pl.hit<=0){pl.hit=1;hurt(25);if(deadT>0)msg('Has caído. Reapareciendo...')}const k=(2.3-d)/d;pl.x+=dx*k;pl.z+=dz*k}}
  const gy=groundAt(pl.x,pl.z,pl.y);pl.gy=gy;pl.vy-=22*dt;pl.y+=pl.vy*dt;if(pl.y<=gy){pl.y=gy;pl.vy=0}
  if(!S.wanted&&pl.hp<100&&Math.hypot(pl.x-LOC.ceviche.c[0],pl.z-LOC.ceviche.c[1])<13){pl.hp=Math.min(100,pl.hp+14*dt);bark('ceviche',.3)}}
 if(thr||st||S.fire)S.idle=0;else{S.idle+=dt;if(S.idle>35){S.idle=0;bark('idle')}}
 // vehículos
 for(const c of cars){if(c!==cur&&!c.fixed){if(c.ai)aiStep(c,dt);else if(!c.police||c.hp<=0)drive(c,dt,0,0,false)}carWorld(c);
  if(c.hp<=0&&!c.fused){c.fused=true;c.fuse=rr(1.8,3);if(c===cur)bark('boom')}
  if(c.fuse>0){c.fuse-=dt;if(c.fuse<=0)explode(c)}
  if(c.hp<50&&!c.boom){c.sm-=dt;if(c.sm<=0&&smoke.length<60){c.sm=.15;smoke.push({x:c.x+Math.sin(c.h)*1.5,y:1.1,z:c.z+Math.cos(c.h)*1.5,t:0})}}}
 policeUpdate(dt);gangUpdate(dt);Phone.update(dt);shopUpdate(dt);carPairs();
 for(const p of pickups)if(!p.got&&Math.hypot(p.x-pl.x,p.z-pl.z)<3.4&&pl.y<2){p.got=true;Story.pick()}
 // peatones
 for(const n of npcs){const dp=Math.hypot(n.x-pl.x,n.z-pl.z),far=dp>90;n.t-=dt;
  if(n.st==='down'){if(n.t<=0)Object.assign(n,mkNpc());continue}
  if(far)continue;
  for(const c of cars)if(Math.abs(c.sp)>6&&Math.hypot(c.x-n.x,c.z-n.z)<2.1){npcDown(n,c===cur?'car':'ai');break}
  if(n.st==='down')continue;
  for(const c of cars)if(Math.abs(c.sp)>6&&Math.hypot(c.x-n.x,c.z-n.z)<9&&n.st!=='flee'){n.st='flee';n.t=3;n.h=Math.atan2(n.x-c.x,n.z-c.z)}
  if(n.tag==='debt'&&dp<30){n.st='flee';n.t=2.5}
  if(n.t<=0){if(n.st==='walk'){n.st='idle';n.t=rr(1,3)}else{n.st='walk';n.t=rr(2,6);n.h=rr(0,TAU)}}
  if(n.st==='flee'&&Math.random()<dt*2)n.h=Math.atan2(n.x-pl.x,n.z-pl.z)+rr(-.7,.7);
  if(n.st!=='idle'){const v=n.st==='flee'?5.5:1.8;n.x+=Math.sin(n.h)*v*dt;n.z+=Math.cos(n.h)*v*dt;n.ph+=dt*v*2.3;n.mv=v/6.5;
   if(hitSolids(n,.4)||n.x<-4||n.x>CITY+4||n.z<-4||n.z>CITY+4)n.h+=Math.PI*.6}else n.mv=0}
 for(const s of smoke)s.t+=dt;smoke=smoke.filter(s=>s.t<1.3);
 for(const s of sparks)s.t-=dt;sparks=sparks.filter(s=>s.t>0);
 cool-=dt;if(S.fire&&cool<=0&&deadT<=0){cool=S.weapon===1?.15:.1;shoot()}
 Story.update(dt);
 // cámara (con zoom de apuntado, FOV dinámico y sacudida)
 const foot=cur?1.4:1.6,Dd=cur?9:(zoomOn?2.6:5),side=cur?0:(zoomOn?1.3:1.15),Tx=pl.x+Math.cos(S.cy)*side,Ty=foot+pl.y,Tz=pl.z-Math.sin(S.cy)*side,cp=S.cp;let d=Dd,ex,ey,ez;
 for(;;){ex=Tx-Math.sin(S.cy)*Math.cos(cp)*d;ey=Ty+Math.sin(cp)*d+.3;ez=Tz-Math.cos(S.cy)*Math.cos(cp)*d;
  let bad=ey<.4;for(const s of solids)if(ey<s.h&&ex>s.x0-.4&&ex<s.x1+.4&&ez>s.z0-.4&&ez<s.z1+.4){bad=true;break}
  if(!bad||d<1.2)break;d-=.6}
 const sh=S.shake*.35;S.eye=[ex+rr(-sh,sh),Math.max(.4,ey+rr(-sh,sh)),ez+rr(-sh,sh)];S.T=[Tx,Ty,Tz];
 S.fov+=((zoomOn?.78:1.05+(cur?Math.min(.2,Math.abs(cur.sp)/68*.2):0))-S.fov)*Math.min(1,dt*6);
 findLock();sndUpdate();
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').textContent=''}
 else{const c=nearCar();$('msg').textContent=cur?'E: salir del '+cur.t.n+(cur.hp<=0?' (destruido)':''):c&&!c.police?'E: entrar al '+c.t.n:''}}
// ---------- Render ----------
const cubeAt=(x,y,z,s,c)=>E.draw([s,0,0,0,0,s,0,0,0,0,s,0,x,y,z,1],c[0],c[1],c[2]);
function render(){
 if(S.mode!=='play'){const a=performance.now()/9000;S.eye=[CITY/2+Math.cos(a)*140,55,CITY/2+Math.sin(a)*140];S.T=[CITY/2,5,CITY/2];S.fov=1.05}
 const e=S.eye,t=performance.now()/1000,vp=E.mul(E.persp(S.fov,E.aspect(),.3,S.fog+40),E.lookAt(e,S.T));S.vp=vp;
 E.begin(e,vp,S.fog,[.55,.7,.85]);E.drawStatic(stat);E.beginDyn();
 const nr=S.fog+20;
 for(const c of cars)if(Math.hypot(c.x-e[0],c.z-e[2])<nr)drawCar(c);
 for(const n of npcs)if(Math.hypot(n.x-e[0],n.z-e[2])<nr)human({x:n.x,z:n.z,h:n.h,ph:n.ph,mv:n.mv,t,look:n.look,lying:n.st==='down',tag:n.tag,wep:0});
 for(const g of gang)if(Math.hypot(g.x-e[0],g.z-e[2])<nr)human({x:g.x,z:g.z,h:g.h,ph:g.ph,mv:g.mv,t,look:g.look,sc:g.sc,lying:g.st==='down',wep:1,aim:g.los?1:0,pitch:0,flash:g.flash});
 if(M.lalo)human({x:M.lalo.x,z:M.lalo.z,h:Math.PI,t,look:{jk:[.9,.8,.2],pn:[.3,.3,.4],sk:[.7,.5,.35],hr:[.1,.08,.05],hat:true,kind:'npc'},wep:0});
 for(const p of pickups)if(!p.got)bag(p,t);
 for(const o of offs)human({x:o.x,z:o.z,h:o.h,ph:o.ph,mv:o.mv,t,look:o.look,lying:o.st==='down',wep:1,aim:o.los&&S.wanted>=2?1:0,pitch:0,flash:o.flash});
 if(!cur&&S.mode!=='menu')human({x:pl.x,z:pl.z,h:pl.h,y:pl.y,air:pl.y>pl.gy+.08,ph:pl.ph,mv:pl.mv,t,look:DAMIAN,lying:deadT>0,wep:S.weapon,aim:S.weapon===1&&(S.zoom||S.aim||pl.aimT>0)?1:0,pitch:S.cp*.7,atk:pl.atk,hand:pl.hand,flash:pl.flash});
 if(S.mode==='play')for(const m of S.marks)beacon(m,t);
 for(const s of smoke){const z=.3+s.t*.7;cubeAt(s.x,s.y+s.t*2,s.z,z,[.35,.35,.35])}
 for(const s of sparks)cubeAt(s.x,s.y,s.z,.35,[1,.85,.2]);
 if(S.mode==='play')Hud.lock()}
// ---------- Interfaz y bucle ----------
function setQ(q){S.fog=[110,170,240][q];E.resize([.5,.75,1][q])}
function start(){audioInit();if(audio&&audio.state==='suspended')audio.resume();
 if(S.mode==='menu'||S.restart){reset();S.restart=false;const sel=+$('mSel').value;if(sel>0){S.cash=250+sel*350;Story.jump(sel)}}
 S.mode='play';$('ov').classList.add('off');$('hud').hidden=false;$('c').requestPointerLock&&$('c').requestPointerLock()}
function pause(){S.mode='pause';S.fire=0;S.aim=false;S.keys={};sndMute();$('ov').classList.remove('off');$('ovt').textContent='Pausa';$('bPlay').textContent='Continuar';$('bRst').hidden=false}
$('bPlay').onclick=start;
$('bRst').onclick=()=>{S.mode='menu';start()};
$('q').onchange=e=>setQ(+e.target.value);$('vol').oninput=e=>S.vol=+e.target.value;
$('aAim').onchange=e=>S.aAim=e.target.checked;$('aDrive').onchange=e=>S.aDrive=e.target.checked;
addEventListener('resize',()=>setQ(+$('q').value));
let last=0;function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;
 if(S.mode==='play'){update(dt);}render();if(S.mode==='play')Hud.update(dt)}
(function(){const sel=$('mSel');if(!sel||!sel.appendChild)return;let saved=0;try{saved=+localStorage.getItem('pulpos_m')||0}catch(_){}
 for(let i=0;i<Story.count();i++){const o=document.createElement('option');o.value=i;o.textContent=(i<5?'Cap.1 · ':'Cap.2 · ')+(i+1)+'. '+Story.title(i);if(i===saved)o.selected=true;sel.appendChild(o)}})();
if(typeof E.begin==='function'){buildWorld();mmInit();reset();setQ(1);requestAnimationFrame(loop)}
