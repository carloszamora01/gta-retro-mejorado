'use strict';
// ================= HUD: minimapa estilo GTA V, estrellas, objetivos =================
const MM={w:236,h:176,K:3,X0:-40,Z0:-40,SZ:CITY+80,dpr:1,map:null,ctx:null};
function mmInit(){const c=$('mm');MM.dpr=Math.min(2,window.devicePixelRatio||1);c.width=MM.w*MM.dpr;c.height=MM.h*MM.dpr;MM.ctx=c.getContext('2d');buildMiniMap()}
function buildMiniMap(){const K=MM.K,c=document.createElement('canvas');c.width=c.height=MM.SZ*K;const g=c.getContext('2d');
 g.scale(K,K);g.translate(-MM.X0,-MM.Z0);
 g.fillStyle='#1b2733';g.fillRect(MM.X0,MM.Z0,MM.SZ,MM.SZ);
 g.fillStyle='#2f3f4f';g.fillRect(-W,-W,CITY+2*W,CITY+2*W);
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){g.fillStyle='#3a4c5e';g.fillRect(i*P+W/2,j*P+W/2,P-W,P-W)}
 g.fillStyle='#3f6b48';g.fillRect(2*P+W/2,2*P+W/2,P-W,P-W);
 g.fillStyle='#2b3440';g.fillRect(3*P+W/2,1*P+W/2,P-W,P-W);g.fillRect(7*P+W/2,7*P+W/2,P-W,P-W);
 g.fillStyle='#3f6b48';g.fillRect(7*P+W/2,3*P+W/2,P-W,P-W);g.fillRect(6*P+W/2,1*P+W/2,P-W,P-W);
 g.fillStyle='#c3c9ce';for(let i=0;i<=N;i++){g.fillRect(i*P-W/2,-W/2,W,CITY+W);g.fillRect(-W/2,i*P-W/2,CITY+W,W)}
 g.fillStyle='#9aa2a9';for(let i=0;i<=N;i++)for(let t=0;t<CITY;t+=8){g.fillRect(i*P-.12,t,.24,3);g.fillRect(t,i*P-.12,3,.24)}
 for(const s of solids){if(s.x1-s.x0<2)continue;g.fillStyle=s.col||'#566474';g.fillRect(s.x0,s.z0,s.x1-s.x0,s.z1-s.z0)}
 MM.map=c}
function rrPath(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function drawMini(dt){const g=MM.ctx,w=MM.w,h=MM.h,v=cur||pl;g.setTransform(MM.dpr,0,0,MM.dpr,0,0);g.clearRect(0,0,w,h);
 const tz=1.8-clamp(cur?Math.abs(cur.sp)/60:0,0,1)*.85;S.mmz+=(tz-S.mmz)*Math.min(1,dt*2.5);const s=S.mmz,cx=w/2,cy=h*.58,cs=Math.cos(S.cy),sn=Math.sin(S.cy);
 const pt=(x,z)=>{const dx=x-v.x,dz=z-v.z;return[cx+s*(-dx*cs+dz*sn),cy-s*(dx*sn+dz*cs)]};
 g.save();rrPath(g,0,0,w,h,16);g.clip();
 g.fillStyle='#1b2733';g.fillRect(0,0,w,h);
 g.save();g.translate(cx,cy);g.rotate(S.cy+Math.PI);g.scale(s,s);g.translate(-v.x,-v.z);
 g.drawImage(MM.map,MM.X0,MM.Z0,MM.SZ,MM.SZ);
 if(S.wanted&&POL.lkp&&!POL.seen){g.beginPath();g.arc(POL.lkp[0],POL.lkp[1],70,0,TAU);g.fillStyle='rgba(220,40,40,.14)';g.fill();g.lineWidth=1.5/s;g.strokeStyle='rgba(255,80,80,.7)';g.stroke()}
 g.restore();
 const inside=(p,m)=>p[0]>m&&p[0]<w-m&&p[1]>m&&p[1]<h-m,
  clampEdge=p=>{const ex=p[0]-cx,ey=p[1]-cy,m=13;let f=1;if(ex>0)f=Math.min(f,(w-m-cx)/ex);else if(ex<0)f=Math.min(f,(m-cx)/ex);
   if(ey>0)f=Math.min(f,(h-m-cy)/ey);else if(ey<0)f=Math.min(f,(m-cy)/ey);return f<1?[cx+ex*f,cy+ey*f,1]:[p[0],p[1],0]},
  dot=(p,col,r,ch)=>{g.beginPath();g.arc(p[0],p[1],r,0,TAU);g.fillStyle=col;g.fill();g.lineWidth=2;g.strokeStyle='#0a1118';g.stroke();
   if(ch){g.fillStyle='#fff';g.font='bold '+(r+1)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,p[0],p[1]+.5)}};
 for(const k in LOC){const l=LOC[k],p=pt(l.c[0],l.c[1]);if(inside(p,8))dot(p,l.col,7,l.ch)}
 const fl=(performance.now()/300|0)%2;
 for(const c of cars)if(c.police&&c.hp>0&&!c.stand){const p=pt(c.x,c.z);if(inside(p,5))dot(p,fl?'#e33':'#36f',4.5)}
 for(const o of offs)if(o.st!=='down'){const p=pt(o.x,o.z);if(inside(p,5))dot(p,'#fff',2.6)}
 for(const q of gang)if(q.st!=='down'){const p=pt(q.x,q.z);if(inside(p,5))dot(p,'#e22',q.boss?4.5:3)}
 for(const q of pickups)if(!q.got){const p=pt(q.x,q.z);if(inside(p,5))dot(p,'#4c4',3.5)}
 for(const m of S.marks){const q=clampEdge(pt(m.x,m.z));g.save();g.translate(q[0],q[1]);
  if(q[2]){g.rotate(Math.atan2(q[1]-cy,q[0]-cx)+Math.PI/2);g.beginPath();g.moveTo(0,-8);g.lineTo(7,6);g.lineTo(-7,6);g.closePath();g.fillStyle='#ffd23a';g.fill();g.lineWidth=2;g.strokeStyle='#0a1118';g.stroke()}
  else{g.beginPath();g.arc(0,0,6.5,0,TAU);g.fillStyle='#ffd23a';g.fill();g.lineWidth=2;g.strokeStyle='#0a1118';g.stroke()}g.restore()}
 g.save();g.translate(cx,cy);g.rotate(S.cy-v.h);g.beginPath();g.moveTo(0,-9);g.lineTo(6.5,7);g.lineTo(0,3.5);g.lineTo(-6.5,7);g.closePath();g.fillStyle='#fff';g.fill();g.lineWidth=2;g.strokeStyle='#0a1118';g.stroke();g.restore();
 const nx=-sn,ny=-cs,pn=clampEdge([cx+nx*500,cy-ny*500]);g.fillStyle='#fff';g.font='bold 11px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('N',pn[0]*.94+cx*.06,pn[1]*.94+cy*.06);
 const gr=g.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,w*.62);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.restore();
 g.lineWidth=4;rrPath(g,2,2,w-4,h-4,15);g.strokeStyle=S.wanted?(fl?'#d22':'#25d'):'#0d141b';g.stroke()}
// ---------- Elementos DOM ----------
let banT=0,toastT=0;
const Hud={
 toast(who,text){const t=$('toast');t.innerHTML='<b style="color:'+(CCOL[who]||'#fff')+'">'+who+'</b><br>'+text.slice(0,70);t.hidden=false;toastT=4.5},
 chapter(n,title){const b=$('ban');b.innerHTML='<div class="bs" style="letter-spacing:6px">'+n.toUpperCase()+'</div><div class="bt" style="font-size:46px">'+title+'</div>';b.hidden=false;banT=4.5},
 banner(t,sub,col,extra){const b=$('ban');b.innerHTML='<div class="bt" style="color:'+(col||'#e0a526')+'">'+t+'</div>'+(sub?'<div class="bs">'+sub+'</div>':'')+(extra?'<div class="bx">'+extra+'</div>':'');b.hidden=false;banT=3.2},
 update(dt){
  if(banT>0){banT-=dt;if(banT<=0)$('ban').hidden=true}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').hidden=true}
  const un=Phone.total(),pb=$('pbadge');pb.hidden=false;pb.textContent='T · Celular'+(un?' ('+un+')':'');pb.classList.toggle('new',un>0&&(performance.now()/400|0)%2===0);
  $('hpb').style.width=clamp(pl.hp,0,100)+'%';
  const vb=$('vhb');vb.style.display=cur?'block':'none';$('hpt').style.flex=cur?'1':'2';if(cur)vb.firstChild.style.width=clamp(cur.hp/(cur.mhp||100)*100,0,100)+'%';
  $('spd').textContent=cur?(Math.abs(cur.sp)*3.6|0)+' km/h':'';
  $('cash').textContent='$ '+S.cash;
  const fl=S.wanted&&!POL.seen&&(performance.now()/350|0)%2;
  $('stars').innerHTML=[1,2,3,4,5].map(i=>'<span class="'+(i<=S.wanted?'on':'')+'" style="'+(fl&&i<=S.wanted?'opacity:.25':'')+'">★</span>').join('');
  $('wep').textContent=['','Pistola ∞','Puños','Cuchillo'][S.weapon];
  const o=Story.objective(),m=S.marks[0],d=m?Math.hypot((cur||pl).x-m.x,(cur||pl).z-m.z)|0:0;
  $('obj').textContent=o+(m&&d>10?' — '+d+' m':'');$('mtimer').textContent=Story.info();
  $('hurt').style.opacity=clamp(S.hurt*1.8,0,.8)+(pl.hp<30?.15:0);
  const cr=$('cross'),zm=S.zoom||S.aim;cr.style.transform=zm&&S.weapon===1?'scale(.72)':'scale(1)';cr.classList.toggle('lk',!!S.lock);cr.classList.toggle('hit',S.hitT>0);
  cr.style.display=S.weapon===1?'block':'none';
  drawMini(dt)},
 lock(){const l=$('lock');if(!S.lock||!S.vp){l.hidden=true;return}const m=S.vp,x=S.lock.x,y=S.lock.y+(S.lock.kind==='car'?.8:.6),z=S.lock.z,
  cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<=.01){l.hidden=true;return}
  const px=(((m[0]*x+m[4]*y+m[8]*z+m[12])/cw)*.5+.5)*innerWidth,py=(1-(((m[1]*x+m[5]*y+m[9]*z+m[13])/cw)*.5+.5))*innerHeight;
  l.hidden=false;l.style.left=px+'px';l.style.top=py+'px'}};
