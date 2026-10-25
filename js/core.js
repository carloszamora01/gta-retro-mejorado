'use strict';
// ================= NÚCLEO: constantes, mundo, vehículos, sonido =================
const $=id=>document.getElementById(id);
const N=8,P=52,W=12,CITY=N*P,TAU=Math.PI*2;
let seed=7;const rnd=()=>{seed=seed*16807%2147483647;return seed/2147483647},rr=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b)),pick=a=>a[Math.random()*a.length|0],BC=(i,j)=>[i*P+P/2,j*P+P/2];
const S={mode:'menu',keys:{},cy:0,cp:.35,vol:.5,fog:200,eye:[130,60,130],T:[130,0,130],fire:0,weapon:1,zoom:false,aim:false,wanted:0,cash:0,
 aAim:true,aDrive:true,shake:0,hurt:0,hitT:0,fov:1.05,mmz:1.7,vp:null,lock:null,idle:0,restart:false,marks:[]};
const solids=[];
let stat,cars=[],npcs=[],offs=[],gang=[],pickups=[],smoke=[],sparks=[],pl,cur=null,msgT=0,deadT=0,spots=[],fastCar=null;
const FAST={n:'Superdeportivo',c:[.1,.9,.8],w:1.9,l:4.4,h:.5,ch:.4,m:68,a:30};
const TYPES=[
 {n:'Sedán',c:[.75,.15,.15],w:1.9,l:4.2,h:.8,ch:.7,m:30,a:12},
 {n:'Deportivo',c:[.95,.8,.1],w:1.9,l:4.2,h:.55,ch:.45,m:42,a:20},
 {n:'Furgoneta',c:[.9,.9,.9],w:2.1,l:5,h:1.5,ch:.7,m:24,a:8},
 {n:'Camioneta',c:[.2,.4,.75],w:2,l:4.8,h:.9,ch:.8,m:27,a:10}];
const COPT={
 cop:{n:'Patrulla',c:[.1,.12,.3],w:2,l:4.5,h:.9,ch:.65,m:34,a:16,liv:1},
 inter:{n:'Interceptor',c:[.05,.06,.1],w:1.95,l:4.4,h:.55,ch:.42,m:52,a:26,liv:1},
 swat:{n:'Camión SWAT',c:[.1,.12,.1],w:2.3,l:5.6,h:1.5,ch:.8,m:34,a:12,liv:2}};
// Lugares importantes: c = centro del local, m = punto de llegada frente a la puerta
const LOC={
 club:{n:'Club Neón',c:BC(1,3),m:[78,194],col:'#ee3fa3',ch:'N'},
 ceviche:{n:'Cevichería Don Lucho',c:BC(3,3),m:[182,192],col:'#f39a2b',ch:'C'},
 paint:{n:'Pintura Express',c:BC(0,2),m:[38,130],col:'#f4d03f',ch:'P'},
 casa:{n:'Casa de Doña Chela',c:BC(0,0),m:[26,36],col:'#6fd4a8',ch:'H'},
 mansion:{n:'Mansión de Don Lucho',c:BC(6,1),m:[338,92],col:'#c9a227',ch:'M'},
 marea:{n:'Discoteca Marea',c:BC(5,5),m:[286,300],col:'#2fb8c9',ch:'D'},
 puerto:{n:'Almacén del Puerto',c:BC(7,7),m:[375,392],in:[395,398],col:'#9aa0a8',ch:'A'},
 mirador:{n:'Mirador',c:BC(7,3),m:[390,192],col:'#7ac74f',ch:'V'}};
// ---------- Rejilla de alturas (disparos y línea de visión rápidos) ----------
const GC=2,GO=12,GW=Math.ceil((CITY+2*GO)/GC);const GH=new Float32Array(GW*GW);
const gi=v=>Math.floor((v+GO)/GC);
function buildGrid(){GH.fill(0);for(const s of solids){if(s.x1-s.x0<2||s.z1-s.z0<2)continue;
 for(let i=gi(s.x0);i<=gi(s.x1);i++)for(let j=gi(s.z0);j<=gi(s.z1);j++)if(i>=0&&j>=0&&i<GW&&j<GW)GH[i*GW+j]=Math.max(GH[i*GW+j],s.h)}}
const hAt=(x,z)=>{const i=gi(x),j=gi(z);return i<0||j<0||i>=GW||j>=GW?0:GH[i*GW+j]};
function lineClear(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/2);for(let k=1;k<n;k++){const t=k/n;if(hAt(x0+(x1-x0)*t,z0+(z1-z0)*t)>1.6)return false}return true}
// ---------- Mundo ----------
function buildWorld(){
 const a=[],B=(x,y,z,sx,sy,sz,c)=>E.box9(a,x,y,z,sx,sy,sz,c),pal=[[.7,.5,.4],[.55,.6,.7],[.8,.75,.6],[.6,.4,.45],[.5,.55,.5],[.75,.65,.55]];
 solids.length=0;spots.length=0;
 const rect=(x,z,hw,hd,h,col)=>solids.push({x0:x-hw,x1:x+hw,z0:z-hd,z1:z+hd,h,col}),s=P-W;
 B(CITY/2,-.1,CITY/2,CITY+400,.2,CITY+400,[.3,.45,.3]);
 for(let i=0;i<=N;i++){B(i*P,.03,CITY/2,W,.06,CITY+W,[.2,.2,.22]);B(CITY/2,.03,i*P,CITY+W,.06,W,[.2,.2,.22]);
  for(let t=-W/2;t<CITY+W/2;t+=8){B(i*P,.07,t,.25,.02,3,[.9,.8,.3]);B(t,.07,i*P,3,.02,.25,[.9,.8,.3])}}
 const club=(cx,cz)=>{B(cx,.17,cz,s-6,.02,s-6,[.16,.1,.2]);
  for(let k=0;k<6;k++)for(let m=0;m<3;m++)B(cx-10+k*4,.19,cz+9+m*3,3.4,.02,2.6,(k+m)%2?[.9,.2,.6]:[.2,.8,.9]);
  B(cx,3.25,cz,20,6.5,14,[.32,.08,.38]);rect(cx,cz,10,7,6.5,'#ee3fa3');B(cx,6.7,cz,20.8,.4,14.8,[.95,.08,.55]);
  for(let k=0;k<5;k++)B(cx-8+k*4,3.4,cz+7.06,.6,5.2,.1,k%2?[.1,.9,.95]:[.95,.08,.55]);
  B(cx,1.4,cz+7.07,3.2,2.8,.12,[.06,.04,.08]);B(cx,3.2,cz+7.6,5.6,.3,1.4,[.95,.8,.2]);
  const L=[[.95,.08,.55],[.1,.9,.95],[.95,.85,.2],[.6,.3,1]];for(let k=0;k<4;k++)B(cx-4.5+k*3,8.6,cz+1,2.2,3,.7,L[k]);
  B(cx-12.5,1,cz+5,1.4,2,1.4,[.08,.08,.1]);B(cx+12.5,1,cz+5,1.4,2,1.4,[.08,.08,.1])};
 const cevi=(cx,cz)=>{B(cx,.17,cz,s-6,.02,s-6,[.75,.7,.55]);
  B(cx,1.8,cz-2,12,3.6,6,[.9,.43,.12]);rect(cx,cz-2,6,3,3.6,'#f39a2b');
  B(cx,3.75,cz+1.4,12.6,.3,6.6,[1,.85,.35]);for(let k=0;k<6;k++)B(cx-5.5+k*2.2,3.78,cz+1.4,1.1,.3,6.7,[.95,.25,.2]);
  B(cx,1,cz+1.6,11,.9,1,[.5,.3,.15]);
  B(cx,5,cz-2,3.4,1.5,.6,[.2,.7,.9]);B(cx+2.4,5,cz-2,1.2,1.3,.6,[.2,.7,.9]);B(cx-1.2,5.2,cz-1.65,.3,.3,.1,[1,1,1]);
  for(const [tx,tz] of [[-8,8],[0,10],[8,8],[-5,14],[5,14]]){const x=cx+tx,z=cz+tz;
   rect(x,z,.8,.8,.9,'#ddd');B(x,.9,z,1.6,.12,1.6,[.95,.95,.9]);B(x,.45,z,.2,.9,.2,[.4,.4,.4]);B(x,3,z,3.6,.25,3.6,[.2,.55,.85]);B(x,1.7,z,.12,2.6,.12,[.3,.3,.3]);
   B(x+1.3,.4,z,.6,.8,.6,[.8,.2,.2]);B(x-1.3,.4,z,.6,.8,.6,[.8,.2,.2])}};
 const paint=(cx,cz)=>{B(cx,.17,cz,s-6,.02,s-6,[.3,.3,.33]);
  B(cx,2.5,cz,14,5,12,[.85,.86,.9]);rect(cx,cz,7,6,5,'#f4d03f');B(cx,5.1,cz,14.8,.4,12.8,[.95,.75,.1]);
  B(cx+7.05,1.9,cz,.12,3.8,9,[.95,.75,.1]);for(let k=0;k<6;k++)B(cx+7.13,.7+k*.6,cz,.1,.28,9,k%2?[.9,.2,.2]:[.2,.5,.9]);
  B(cx,6.6,cz,2,2.4,2,[.9,.2,.2]);B(cx,8.2,cz,1,.8,1,[.9,.9,.9]);
  B(cx+12,.2,cz,8,.03,10,[.95,.85,.15]);for(let k=0;k<4;k++)B(cx+12,.22,cz-4+k*2.6,7,.02,.3,[1,1,1])};
 const casa=(cx,cz)=>{B(cx,.17,cz,s-6,.02,s-6,[.3,.55,.3]);
  B(cx,2.3,cz,10,4.6,9,[.92,.62,.72]);rect(cx,cz,5,4.5,4.6,'#e89ab0');B(cx,5.1,cz,11.4,1,10.4,[.25,.5,.3]);B(cx,5.9,cz,8,.8,7,[.25,.5,.3]);
  B(cx,1.2,cz+4.54,1.4,2.2,.1,[.35,.2,.1]);for(const sx of[-3,3])B(cx+sx,2.4,cz+4.54,1.6,1.4,.1,[.5,.7,.9]);
  for(let k=-8;k<=8;k+=1.6)B(cx+k,.5,cz+12,.15,1,.15,[.95,.95,.9]);B(cx,.9,cz+12,17,.1,.1,[.95,.95,.9]);
  for(let k=0;k<10;k++)B(cx+rr(-8,8),.3,cz+rr(7,11),.4,.6,.4,pick([[1,.4,.6],[1,.8,.2],[.9,.3,.3]]));
  B(cx-12,1.5,cz-3,.6,3,.6,[.4,.25,.1]);B(cx-12,4,cz-3,3,3,3,[.15,.5,.15]);rect(cx-12,cz-3,.4,.4,5)};
 const mansion=(cx,cz)=>{B(cx,.17,cz,s-4,.02,s-4,[.25,.55,.25]);
  B(cx,4,cz,22,8,14,[.92,.9,.82]);rect(cx,cz,11,7,8,'#c9a227');B(cx,8.4,cz,23,.8,15,[.55,.15,.12]);B(cx,9.4,cz,16,1.2,10,[.55,.15,.12]);
  for(let k=0;k<4;k++)B(cx-7.5+k*5,3.5,cz+7.6,.9,7,.9,[.97,.97,.95]);B(cx,7.2,cz+7.8,22,.6,1.8,[.97,.97,.95]);
  B(cx,1.4,cz+7.05,3,2.8,.12,[.3,.15,.08]);for(let k=0;k<3;k++)B(cx,.1+k*.1,cz+8.6+(2-k)*.7,6,.2,.7,[.8,.8,.75]);
  B(cx,.6,cz+14,6,.8,6,[.7,.7,.7]);B(cx,1.4,cz+14,1.2,1.2,1.2,[.4,.7,.95]);
  for(const k of[-1,1]){B(cx+k*9,.9,cz+17,.5,1.8,.5,[.2,.2,.22]);B(cx+k*9,1.9,cz+17,.7,.2,.7,[.9,.8,.3]);B(cx+k*14,.6,cz+17,8,1.2,.3,[.85,.85,.8]);rect(cx+k*14,cz+17,4,.15,1.2,'#bbb')}
  for(const [dx,dz] of[[-16,-12],[16,-12],[-16,4],[16,4]]){B(cx+dx,1,cz+dz,.5,2,.5,[.4,.25,.1]);B(cx+dx,3.2,cz+dz,2.6,2.4,2.6,[.15,.5,.15]);rect(cx+dx,cz+dz,.4,.4,5)}};
 const marea=(cx,cz)=>{B(cx,.17,cz,s-6,.02,s-6,[.1,.2,.25]);
  for(let k=0;k<6;k++)for(let m=0;m<3;m++)B(cx-10+k*4,.19,cz+9+m*3,3.4,.02,2.6,(k+m)%2?[.1,.7,.8]:[.9,.95,.95]);
  B(cx,3.25,cz,20,6.5,14,[.1,.42,.5]);rect(cx,cz,10,7,6.5,'#2fb8c9');B(cx,6.7,cz,20.8,.4,14.8,[.2,.85,.95]);
  for(let k=0;k<5;k++)B(cx-8+k*4,3.4,cz+7.06,.6,5.2,.1,k%2?[.9,.95,.95]:[.2,.85,.95]);
  B(cx,1.4,cz+7.07,3.2,2.8,.12,[.04,.06,.08]);B(cx,3.2,cz+7.6,5.6,.3,1.4,[.9,.95,.95]);
  B(cx-2,8.5,cz+1,6,2,.7,[.2,.85,.95]);B(cx+3,9.4,cz+1,3,2.4,.7,[.2,.85,.95]);B(cx+5.8,8.8,cz+1,2,1.2,.7,[.9,.95,.95])};
 const puerto=(cx,cz)=>{B(cx,.17,cz,s-2,.02,s-2,[.22,.23,.25]);
  B(cx,3.5,cz-8,20,7,12,[.45,.47,.5]);rect(cx,cz-8,10,6,7,'#9aa0a8');B(cx,7.2,cz-8,20.6,.4,12.6,[.3,.32,.35]);B(cx,1.6,cz-1.9,6,3.2,.12,[.9,.7,.1]);
  const cc=[[.7,.15,.12],[.15,.35,.7],[.15,.55,.3],[.8,.55,.1]];
  [[-14,6],[-7,6],[0,6],[7,6],[14,6],[-14,12],[-7,12],[7,12]].forEach(([dx,dz],k)=>{B(cx+dx,1.3,cz+dz,6,2.6,2.4,cc[k%4]);rect(cx+dx,cz+dz,3,1.2,2.6,'#9aa0a8')});
  B(cx+16,7,cz-10,.8,14,.8,[.9,.7,.1]);B(cx+10,14,cz-10,14,.8,.8,[.9,.7,.1]);
  for(let k=0;k<14;k++){B(cx-19,.8,cz-18+k*3,.2,1.6,.2,[.5,.5,.5]);B(cx+19,.8,cz-18+k*3,.2,1.6,.2,[.5,.5,.5])}};
 const mirador=(cx,cz)=>{B(cx,.17,cz,s-2,.02,s-2,[.3,.6,.3]);B(cx,.2,cz,12,.1,12,[.75,.7,.6]);
  for(const [dx,dz] of[[-3,-3],[3,-3],[-3,3],[3,3]])B(cx+dx,1.8,cz+dz,.4,3.6,.4,[.9,.9,.9]);B(cx,3.8,cz,8.5,.4,8.5,[.7,.2,.2]);B(cx,4.4,cz,4,.8,4,[.7,.2,.2]);
  B(cx,.5,cz-2,5,.5,.8,[.4,.25,.1]);
  for(let k=0;k<18;k++){const a=k/18*TAU,tx=cx+Math.cos(a)*16,tz=cz+Math.sin(a)*16;B(tx,1,tz,.5,2,.5,[.4,.25,.1]);B(tx,3.2,tz,2.6,2.4,2.6,[.15,.5,.15]);rect(tx,tz,.4,.4,5)}
  B(cx,.6,cz+19,36,1.2,.4,[.7,.7,.65]);rect(cx,cz+19,18,.2,1.2,'#999')};
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const x0=i*P+W/2,z0=j*P+W/2,cx=x0+s/2,cz=z0+s/2,key=i+','+j;
  B(cx,.08,cz,s,.16,s,[.58,.58,.56]);
  for(const [lx,lz] of [[1,1],[s-1,1],[1,s-1],[s-1,s-1]]){B(x0+lx,3,z0+lz,.2,6,.2,[.3,.3,.3]);B(x0+lx,6.1,z0+lz,.9,.2,.9,[1,.9,.5])}
  if(key==='2,2'){B(cx,.17,cz,s-4,.02,s-4,[.25,.6,.25]);B(cx,.2,cz,10,.1,10,[.7,.7,.6]);
   for(let k=0;k<16;k++){const tx=cx+rr(-17,17),tz=cz+rr(-17,17);if(Math.hypot(tx-cx,tz-cz)<7)continue;B(tx,1,tz,.5,2,.5,[.4,.25,.1]);B(tx,3.2,tz,2.6,2.4,2.6,[.15,.5,.15]);rect(tx,tz,.4,.4,5)}}
  else if(key==='3,1'){B(cx,.17,cz,s-4,.02,s-4,[.15,.15,.17]);
   for(let k=0;k<6;k++){const px=cx-15+k*6;B(px-3,.19,cz-9,.2,.02,6,[.9,.9,.9]);spots.push([px,cz-9,0]);spots.push([px,cz+9,Math.PI])}}
  else if(key==='1,3')club(cx,cz);
  else if(key==='3,3')cevi(cx,cz);
  else if(key==='0,2')paint(cx,cz);
  else if(key==='0,0')casa(cx,cz);
  else if(key==='6,1')mansion(cx,cz);
  else if(key==='5,5')marea(cx,cz);
  else if(key==='7,7')puerto(cx,cz);
  else if(key==='7,3')mirador(cx,cz);
  else for(let u=0;u<2;u++)for(let v=0;v<2;v++){
   const bx=x0+2+u*21+7.5,bz=z0+2+v*21+7.5,out=i>=5||j>=5,house=rnd()<(out?.3:.48),h=house?rr(3.5,6):out?rr(6,16):rr(10,30),sx=house?rr(8,12):out?rr(15,18):15,sz=house?rr(8,12):out?rr(14,18):15,c=out&&!house?[.5+rnd()*.12,.52+rnd()*.1,.55]:pal[rnd()*6|0];
   B(bx,h/2,bz,sx,h,sz,c);
   if(house){B(bx,h+.5,bz,sx*1.1,1,sz*1.1,[.45,.18,.15]);B(bx,1.2,bz+sz/2+.04,1.2,2,.08,[.2,.15,.1])}
   else{B(bx,h+.3,bz,sx+.6,.6,sz+.6,[.3,.3,.32]);B(bx,1.5,bz,sx+.3,3,sz+.3,[c[0]*.6,c[1]*.6,c[2]*.6]);for(let y=5;y<h-1;y+=4)B(bx,y,bz,sx+.15,1.2,sz+.15,[.2,.3,.4])}
   rect(bx,bz,sx/2,sz/2,h,house?'#6c7889':'#4f5f74')}}
 stat=E.makeStatic(a);buildGrid()}
// ---------- Entidades ----------
function mkCar(t,x,z,h,ai){const ty=typeof t==='number'?TYPES[t]:t;return{t:ty,x,z,h,sp:0,hp:100,mhp:100,ai,st:0,sm:0,str:0,col:null,fuse:0,boom:false}}
function mkAI(){const axis=rnd()<.5?'z':'x',dir=rnd()<.5?1:-1,line=1+(Math.random()*(N-1)|0),u=rr(10,CITY-10);
 const c=mkCar(Math.random()*4|0,0,0,0,{axis,dir,line,last:-1});placeAI(c,u);return c}
function placeAI(c,u){const a=c.ai,lat=a.line*P+(a.axis=='z'?3*a.dir:-3*a.dir);
 if(a.axis=='z'){c.x=lat;c.z=u;c.h=a.dir>0?0:Math.PI}else{c.z=lat;c.x=u;c.h=a.dir>0?Math.PI/2:-Math.PI/2}}
function aiStep(v,dt){const a=v.ai;if(v.hp<=0){v.ai=null;return}
 let blk=false;const fx=Math.sin(v.h),fz=Math.cos(v.h);
 for(const o of cars.concat([pl])){if(o===v||o===cur)continue;const dx=o.x-v.x,dz=o.z-v.z,d=dx*fx+dz*fz;if(d>0&&d<9&&Math.abs(dx*fz-dz*fx)<2.6){blk=true;break}}
 if(cur&&cur!==v){const dx=cur.x-v.x,dz=cur.z-v.z;if(dx*fx+dz*fz>0&&dx*fx+dz*fz<9&&Math.abs(dx*fz-dz*fx)<2.6)blk=true}
 drive(v,dt,blk?-.8:(v.sp<(a.fast?24:11)?.6:0),0,blk&&v.sp<1);
 const u=a.axis=='z'?v.z:v.x,k=Math.round(u/P);
 if(a.last!==k&&Math.abs(u-k*P)<1.2){a.last=k;const opts=[];
  if(clamp(k+a.dir,0,N)==k+a.dir)opts.push(0,0,0);
  for(const nd of[-1,1])if(clamp(a.line+nd,0,N)==a.line+nd)opts.push(nd);
  const ch=opts[Math.random()*opts.length|0];
  if(ch){const old=a.line;a.axis=a.axis=='z'?'x':'z';a.dir=ch;a.line=k;a.last=old;placeAI(v,old*P)}
  else if(!opts.length){a.dir*=-1;placeAI(v,u)}}
 if(u<-5||u>CITY+5){a.dir*=-1;placeAI(v,clamp(u,0,CITY))}}
function roadPos(){const i=Math.random()*(N+1)|0;return[i*P+rr(-4,4),rr(5,CITY-5)]}
const SKIN=[[.93,.74,.58],[.8,.58,.42],[.6,.4,.28],[.45,.3,.2]],HAIR=[[.08,.06,.05],[.25,.15,.08],[.5,.35,.15],[.15,.15,.18],[.7,.7,.7]];
function mkNpc(){const [x,z]=roadPos();return{x,z,h:rr(0,TAU),st:'walk',t:rr(1,4),hp:50,ph:rr(0,6),mv:0,tag:null,
 look:{jk:[rr(.2,.9),rr(.2,.9),rr(.2,.9)],pn:pick([[.15,.15,.3],[.25,.25,.28],[.4,.3,.2],[.2,.3,.45]]),sk:pick(SKIN),hr:pick(HAIR),hat:Math.random()<.2,sh:Math.random()<.15,kind:'npc'}}}
function reset(){
 cars=[];npcs=[];offs=[];gang=[];pickups=[];smoke=[];sparks=[];cur=null;seed=11;deadT=0;
 S.wanted=0;S.weapon=1;S.zoom=false;S.aim=false;S.cash=250;S.lock=null;S.marks=[];S.idle=0;S.shake=0;S.hurt=0;
 pl={x:P*2,z:P*1.4,h:0,hp:100,hit:0,atk:0,atkCd:0,hand:0,ph:0,mv:0,shoot:0,aimT:0,flash:0,heal:0,y:0,vy:0,gy:0};S.cy=0;S.cp=.35;
 spots.forEach((s,i)=>{if(i%2==0)cars.push(mkCar(i/2%4|0,s[0],s[1],s[2],null))});
 for(let k=0;k<16;k++){const i=1+k%(N-1),side=k%2?1:-1,z=40+k*24;cars.push(mkCar(k%4,i*P+side*(W/2-2.2),z,side>0?0:Math.PI,null))}
 cars.push(mkCar(1,P*2+3.5,P*1.4+8,0,null));
 spawnFast();
 for(let k=0;k<11;k++)cars.push(mkAI());
 for(let k=0;k<26;k++)npcs.push(mkNpc());
 policeReset();Phone.reset();Story.reset()}
function spawnFast(){if(fastCar)cars=cars.filter(c=>c!==fastCar);fastCar=mkCar(FAST,64,194,Math.PI/2,null);cars.push(fastCar)}
// ---------- Física ----------
function hitSolids(o,r){let hit=false;for(const s of solids){if(o.y&&s.h<=o.y+.15)continue;const cx=clamp(o.x,s.x0,s.x1),cz=clamp(o.z,s.z0,s.z1);let dx=o.x-cx,dz=o.z-cz,d2=dx*dx+dz*dz;
 if(d2<r*r){if(d2<1e-6){dx=o.x-(s.x0+s.x1)/2;dz=o.z-(s.z0+s.z1)/2;d2=dx*dx+dz*dz||1}const d=Math.sqrt(d2),k=(r-d)/d;o.x+=dx*k;o.z+=dz*k;hit=true}}
 o.x=clamp(o.x,-W,CITY+W);o.z=clamp(o.z,-W,CITY+W);return hit}
// Dirección más ágil: el volante se suaviza, gira más a baja/media velocidad y el freno de mano permite derrapar
function drive(v,dt,thr,st,hb){const t=v.t;if(v.hp<=0){thr=0;st=0}
 if(thr>0)v.sp+=t.a*thr*dt*(v.sp<0?2:1);else if(thr<0)v.sp-=(v.sp>.5?t.a*1.6:t.a*.6)*dt*-thr;
 else v.sp-=Math.sign(v.sp)*Math.min(Math.abs(v.sp),4*dt);
 if(hb)v.sp-=Math.sign(v.sp)*Math.min(Math.abs(v.sp),(Math.abs(st)>.2?13:22)*dt);
 v.sp=clamp(v.sp,-t.m*.3,t.m*(v.hp<30?.6:1));
 v.str+=(st-v.str)*Math.min(1,dt*(st?10:16));
 const rate=2.9/Math.sqrt(1+(v.sp/22)**2)*clamp(v.sp/5,-1,1)*(hb&&Math.abs(v.sp)>6?1.8:1);
 v.h+=v.str*rate*dt;
 v.x+=Math.sin(v.h)*v.sp*dt;v.z+=Math.cos(v.h)*v.sp*dt}
// Asistente de conducción: al soltar el volante en una calle, el coche se alinea suavemente con ella
function laneAssist(v,dt){const q=Math.PI/2,tg=Math.round(v.h/q)*q,e=angDiff(tg,v.h);if(Math.abs(e)>.32)return;
 const nx=Math.abs(v.x-Math.round(v.x/P)*P)<W/2-1.5,nz=Math.abs(v.z-Math.round(v.z/P)*P)<W/2-1.5,alongZ=Math.abs(Math.sin(tg))<.5;
 if(alongZ?nx:nz)v.h+=e*2*dt}
function carWorld(v){if(hitSolids(v,1.9)){const im=Math.abs(v.sp);if(im>7){v.hp-=im*.9;crashFx(v,im)}v.sp*=-.3;if(v.ai&&!v.ai.keep)v.ai=null}}
function crashFx(v,im){for(let k=0;k<3;k++)sparks.push({x:v.x+rr(-1,1),y:rr(.4,1),z:v.z+rr(-1,1),t:.15});
 if(v===cur){S.shake=Math.max(S.shake,clamp(im/28,.12,.7));thud(clamp(im/30,.3,1));Story.crash(im);if(im>13)bark('crash')}}
function carPairs(){for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j],dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
 if(d<3.8&&d>.01){const wa=a.fixed?0:1,wb=b.fixed?0:1,tot=wa+wb;if(!tot)continue;const k=(3.8-d)/d;
  a.x-=dx*k*wa/tot;a.z-=dz*k*wa/tot;b.x+=dx*k*wb/tot;b.z+=dz*k*wb/tot;const rel=Math.abs(a.sp-b.sp);
  if(rel>6){a.hp-=rel*.6;b.hp-=rel*.6;a.sp*=.4;b.sp*=.4;if(a.ai&&!a.ai.keep&&a!==cur)a.ai=null;if(b.ai&&!b.ai.keep&&b!==cur)b.ai=null;
   if(a===cur){b.hurtBy='pl';crashFx(a,rel)}if(b===cur){a.hurtBy='pl';crashFx(b,rel)}}}}}
// Altura del suelo bajo (x,z): muros bajos, mesas y techos de coches deportivos se pueden pisar al saltar
function groundAt(x,z,y){let g=0;for(const s of solids)if(s.h<=y+.5&&s.h>g&&x>s.x0-.3&&x<s.x1+.3&&z>s.z0-.3&&z<s.z1+.3)g=s.h;
 for(const c of cars){const h=.45+c.t.h+c.t.ch*.5;if(h<=y+.5&&h>g&&Math.hypot(c.x-x,c.z-z)<1.5)g=h}return g}
function snapRoad(o){o.x=clamp(Math.round(o.x/P)*P,0,CITY);o.z=clamp(o.z,0,CITY)}
// ---------- Sonido (todo sintetizado) ----------
let audio=null;const SND={};
function audioInit(){if(audio)return;try{audio=new(window.AudioContext||window.webkitAudioContext)();
 const mk=type=>{const o=audio.createOscillator(),g=audio.createGain();o.type=type;g.gain.value=0;o.connect(g);g.connect(audio.destination);o.start();return{o,g}};
 SND.eng=mk('sawtooth');SND.sir=mk('square')}catch(_){audio=null}}
function noiseBurst(dur,vol,pow,lp){if(!audio)return;const n=audio.sampleRate*dur|0,b=audio.createBuffer(1,n,audio.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n)**pow;const s=audio.createBufferSource(),g=audio.createGain();g.gain.value=S.vol*vol;s.buffer=b;
 if(lp){const f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;s.connect(f);f.connect(g)}else s.connect(g);g.connect(audio.destination);s.start()}
const bang=(v=1)=>noiseBurst(.12,v,2),thud=(v=1)=>noiseBurst(.25,v,2,380),boom=()=>noiseBurst(.9,1.4,1.5,260);
function tone(f,t0,dur,type,vol){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+t0;o.type=type;o.frequency.value=f;
 g.gain.setValueAtTime(S.vol*vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+dur+.05)}
function jingle(ok){const n=ok?[523,659,784,1047]:[330,262,220];n.forEach((f,i)=>tone(f,i*.13,.35,'triangle',.18))}
function sndUpdate(){if(!audio||!SND.eng)return;const t=audio.currentTime;
 SND.eng.o.frequency.setTargetAtTime(40+(cur?Math.abs(cur.sp):0)*3.4,t,.08);SND.eng.g.gain.setTargetAtTime(cur&&cur.hp>0?S.vol*.035:0,t,.1);
 let nd=1e9;for(const c of cars)if(c.police&&c.hp>0&&!c.stand)nd=Math.min(nd,Math.hypot(c.x-pl.x,c.z-pl.z));
 SND.sir.o.frequency.setTargetAtTime((performance.now()/480|0)%2?900:640,t,.01);SND.sir.g.gain.setTargetAtTime(S.wanted&&nd<110?S.vol*.03*(1-nd/110):0,t,.1)}
function sndMute(){if(!audio||!SND.eng)return;SND.eng.g.gain.value=0;SND.sir.g.gain.value=0}
