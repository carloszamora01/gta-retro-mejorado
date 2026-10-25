'use strict';
// ================= COMBATE: puntería asistida, disparo, cuerpo a cuerpo =================
let prevLock=null;
const norm3=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]};
const camDir=()=>norm3([S.T[0]-S.eye[0],S.T[1]-S.eye[1],S.T[2]-S.eye[2]]);
function losTo(e,x,y,z){const d=Math.hypot(x-e[0],z-e[2]),n=Math.ceil(d/2);
 for(let k=1;k<n;k++){const t=k/n;if(hAt(e[0]+(x-e[0])*t,e[2]+(z-e[2])*t)>e[1]+(y-e[1])*t)return false}return true}
// Fija automáticamente al objetivo más cercano a la mira (cono generoso, más amplio al apuntar con zoom)
function findLock(){S.lock=null;if(!S.aAim||S.weapon!==1||deadT>0){prevLock=null;return}
 const e=S.eye,f=camDir(),cone=S.zoom||S.aim?.3:.2,cand=[];
 const add=(ref,kind,x,y,z,r,w)=>{const vx=x-e[0],vy=y-e[1],vz=z-e[2],d=Math.hypot(vx,vy,vz);if(d<4||d>75)return;
  const dot=(vx*f[0]+vy*f[1]+vz*f[2])/d;if(dot<.9)return;const ang=Math.acos(Math.min(1,dot));if(ang>cone*w)return;
  cand.push({ref,kind,x,y,z,r,sc:ang/w+d*.0012-(prevLock&&prevLock.ref===ref?.03:0)})};
 for(const n of npcs)if(n.st!=='down')add(n,"npc",n.x,1.1,n.z,.95,.9);
 for(const o of offs)if(o.st!=='down')add(o,'off',o.x,1.15,o.z,.95,1.15);
 for(const g of gang)if(g.st!=='down')add(g,'gang',g.x,1.15*g.sc,g.z,.95*g.sc,1.15);
 for(const c of cars)if(c.police&&c.hp>0)add(c,'car',c.x,.9,c.z,2.2,1.1);
 cand.sort((a,b)=>a.sc-b.sc);
 for(let i=0;i<Math.min(3,cand.length);i++){const c=cand[i];if(losTo(e,c.x,c.y,c.z)){S.lock=c;break}}
 prevLock=S.lock}
function shoot(){
 if(S.weapon!==1){melee();return}
 bang(1);pl.shoot=.12;pl.flash=.07;pl.aimT=1.6;S.shake=Math.max(S.shake,.04);
 const e=S.eye;let f=camDir();
 if(S.lock){const L=S.lock,t=norm3([L.x-e[0],L.y-e[1],L.z-e[2]]);f=norm3([f[0]*.12+t[0]*.88,f[1]*.12+t[1]*.88,f[2]*.12+t[2]*.88])}
 for(const n of npcs)if(Math.hypot(n.x-pl.x,n.z-pl.z)<35&&n.st!=='down'&&n.st!=='flee'){n.st='flee';n.t=6}
 let tMax=90;
 for(let t=1.5;t<90;t+=.7){const x=e[0]+f[0]*t,y=e[1]+f[1]*t,z=e[2]+f[2]*t;if(y<0||hAt(x,z)>y){tMax=t;break}}
 let best=null,bt=tMax;
 const test=(ref,kind,cx,cy,cz,r)=>{const vx=cx-e[0],vy=cy-e[1],vz=cz-e[2],tt=vx*f[0]+vy*f[1]+vz*f[2];if(tt<1||tt>bt)return;
  const px=e[0]+f[0]*tt-cx,py=e[1]+f[1]*tt-cy,pz=e[2]+f[2]*tt-cz;if(px*px+py*py+pz*pz<r*r){bt=tt;best={ref,kind,y:e[1]+f[1]*tt}}};
 for(const n of npcs)if(n.st!=='down')test(n,'npc',n.x,1,n.z,1);
 for(const o of offs)if(o.st!=='down')test(o,'off',o.x,1,o.z,1);
 for(const g of gang)if(g.st!=='down')test(g,'gang',g.x,1*g.sc,g.z,1*g.sc);
 for(const c of cars)if(c!==cur)test(c,'car',c.x,.9,c.z,2.1);
 sparks.push({x:e[0]+f[0]*bt,y:Math.max(.1,e[1]+f[1]*bt),z:e[2]+f[2]*bt,t:.1});
 if(best)applyHit(best)}
function applyHit(h){const head=h.y>1.6;S.hitT=.15;
 if(h.kind==='npc'){const n=h.ref;n.hp-=26*(head?2.2:1);if(head)bark('head');if(n.hp<=0)npcDown(n,'gun');else{n.st='flee';n.t=6}}
 else if(h.kind==='off'){const o=h.ref;if(!o.hit){o.hit=1;addHeat(1)}o.hp-=22*(head?2.5:1);if(head)bark('head');if(o.hp<=0)offDown(o)}
 else if(h.kind==='gang'){const g=h.ref;g.hp-=22*(head?2.5:1);if(head)bark('head');if(g.hp<=0)gangDown(g)}
 else{const c=h.ref;c.hp-=15;if(c.ai)c.ai=null;if(c.police){c.hurtBy='pl';addHeat(.25)}}}
function npcDown(n,how){if(n.st==='down')return;n.st='down';n.t=5;n.hp=0;
 if(n.tag==='debt'){n.tag=null;Story.debtDown()}
 if(how==='gun'||how==='knife'){addHeat(1.2);bark('kill')}else if(how==='car')addHeat(1)}
function offDown(o){if(o.st==='down')return;o.st='down';o.t=4;addHeat(2.5)}
function nearestFoe(range){let t=null,bd=range;
 for(const n of npcs){const d=Math.hypot(n.x-pl.x,n.z-pl.z);if(n.st!=='down'&&d<bd){bd=d;t=n}}
 for(const o of offs){const d=Math.hypot(o.x-pl.x,o.z-pl.z);if(o.st!=='down'&&d<bd){bd=d;t=o}}
 for(const g of gang){const d=Math.hypot(g.x-pl.x,g.z-pl.z);if(g.st!=='down'&&d<bd){bd=d;t=g}}
 return t&&{t,d:bd}}
function melee(){if(pl.atkCd>0)return;const fist=S.weapon===2;pl.atkCd=fist?.38:.55;pl.atk=1;pl.hand^=1;
 const f=nearestFoe(4.2);// asistencia: se orienta y avanza hacia el objetivo cercano
 if(!f){msg(fist?'No hay nadie al alcance de los puños':'Acércate para usar el cuchillo');return}
 const t=f.t;pl.h=Math.atan2(t.x-pl.x,t.z-pl.z);const range=fist?2.2:2.8;
 if(f.d>range-.5){const k=Math.min(f.d-.8,1.4);pl.x+=Math.sin(pl.h)*k;pl.z+=Math.cos(pl.h)*k}
 if(Math.hypot(t.x-pl.x,t.z-pl.z)>range)return;
 thud(.6);S.hitT=.15;const dmg=fist?18:38;t.hp-=dmg;
 if('look'in t&&t.look.kind==='gang'){if(t.hp<=0)gangDown(t)}
 else if('look'in t&&t.look.kind==='cop'){if(!t.hit){t.hit=1;addHeat(1)}if(t.hp<=0)offDown(t)}
 else{if(t.hp<=0)npcDown(t,fist?'fist':'knife');else{t.st='flee';t.t=5}}}
function hurt(d){if(deadT>0)return;pl.hp-=d;S.hurt=.4;S.shake=Math.max(S.shake,.2);
 if(pl.hp<=0)die('ABATIDO');else if(pl.hp<30)bark('low')}
function die(txt){if(deadT>0)return;deadT=2.8;S.fire=0;Hud.banner(txt,'','#d33');msg(txt==='ARRESTADO'?'La policía te atrapó...':'Has caído...');
 if(txt==='ARRESTADO'){const f=Math.round(S.cash*.15);S.cash-=f;bark('busted')}else S.cash=Math.max(0,S.cash-50)}
function respawn(){pl.hp=100;pl.x=P*2;pl.z=P*1.4;pl.h=0;pl.y=0;pl.vy=0;cur=null;deadT=0;S.hurt=0;gang=[];
 policeReset();for(const n of npcs)if(n.st==='flee')n.st='walk';Story.retry()}
