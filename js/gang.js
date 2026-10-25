'use strict';
// ================= PANDILLAS ENEMIGAS (Los Tiburones y aliados) =================
const TIBU={jk:[.2,.55,.7],pn:[.3,.3,.33],sk:[.8,.58,.42],hr:[.08,.06,.05],sh:true,kind:'gang'};
const TIBU2={jk:[.15,.35,.5],pn:[.2,.2,.25],sk:[.7,.5,.36],hr:[.05,.05,.05],hat:true,kind:'gang'};
const CORR={jk:[.1,.15,.4],pn:[.07,.1,.25],sk:[.85,.65,.5],hr:[.1,.08,.06],hat:true,kind:'gang'};
const BOSS={jk:[.08,.2,.25],pn:[.1,.1,.12],sk:[.7,.5,.36],hr:[.05,.05,.05],sh:true,kind:'gang'};
function mkGang(x,z,o){o=o||{};const hp=o.hp||50;return{x,z,h:0,hp,mhp:hp,ph:0,mv:0,st:'idle',t:0,cool:rr(.8,1.8),los:false,losT:0,flash:0,
 look:o.look||(Math.random()<.5?TIBU:TIBU2),sc:o.sc||1,dmg:o.dmg||6,acc:o.acc||.5,boss:!!o.boss,strafe:Math.random()<.5?-1:1,sT:rr(1,3)}}
function gangFire(g,d){bang(clamp(1-d/45,.15,.5));g.flash=.08;
 const acc=clamp(g.acc-d*.012,.15,.7)*(cur?.7:1)*(cur&&Math.abs(cur.sp)>20?.6:1);
 if(Math.random()<acc){if(cur){cur.hp-=3;S.shake=Math.max(S.shake,.12)}else hurt(g.dmg)}
 else sparks.push({x:pl.x+rr(-2,2),y:.2,z:pl.z+rr(-2,2),t:.1})}
function gangDown(g){if(g.st==='down')return;g.st='down';g.t=6;Story.gangDown(g)}
function gangUpdate(dt){
 for(const g of gang){g.flash=Math.max(0,g.flash-dt);if(g.st==='down'){g.t-=dt;continue}
  const dx=pl.x-g.x,dz=pl.z-g.z,d=Math.hypot(dx,dz);if(d>90||deadT>0){g.mv=0;continue}
  g.losT-=dt;if(g.losT<=0){g.los=d<65&&lineClear(g.x,g.z,pl.x,pl.z);g.losT=.25+Math.random()*.1}
  const th=Math.atan2(dx,dz),pref=(cur?16:12)+(g.boss?4:0);let mv=0;
  g.h+=angDiff(th,g.h)*Math.min(1,dt*10);g.sT-=dt;if(g.sT<=0){g.strafe=-g.strafe;g.sT=rr(1.5,3.5)}
  if(!g.los)mv=3.8;else if(d>pref)mv=3.9;else if(d<pref*.5)mv=-2.4;
  if(mv){g.x+=Math.sin(g.h)*mv*dt;g.z+=Math.cos(g.h)*mv*dt;g.ph+=dt*Math.abs(mv)*2.4}
  else if(g.los){g.x+=Math.cos(g.h)*g.strafe*2.2*dt;g.z-=Math.sin(g.h)*g.strafe*2.2*dt;g.ph+=dt*4}
  if(mv||g.los)hitSolids(g,.45*g.sc);
  g.mv=(mv||g.los)?.55:0;
  if(g.los&&d<38){g.cool-=dt;if(g.cool<=0){g.cool=rr(1,1.9)*(g.boss?.7:1);gangFire(g,d)}}}
 gang=gang.filter(g=>g.st!=='down'||g.t>0)}
