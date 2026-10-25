'use strict';
// ================= PERSONAJES Y VEHÍCULOS (dibujo) =================
const Tm=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
const Rxm=a=>{const c=Math.cos(a),s=Math.sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]};
const Rym=a=>{const c=Math.cos(a),s=Math.sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]};
const Sm=(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
const mm=(a,b)=>E.mul(a,b);
const bx=(B,x,y,z,sx,sy,sz,c,k)=>{k=k||1;E.draw(mm(B,mm(Tm(x,y,z),Sm(sx,sy,sz))),c[0]*k,c[1]*k,c[2]*k)};
const pv=(B,x,y,z,rx,ry)=>{let m=mm(B,Tm(x,y,z));if(ry)m=mm(m,Rym(ry));if(rx)m=mm(m,Rxm(rx));return m};
// Damián Quiñones: conjunto Nike negro (chaqueta y pants con franja blanca), taper fade, zapatillas negras de suela blanca
const DAMIAN={jk:[.05,.05,.06],pn:[.06,.06,.07],sk:[.74,.54,.4],hr:[.04,.03,.03],fade:true,kind:'hero'};
const COPLOOK={jk:[.1,.15,.4],pn:[.07,.1,.25],sk:[.85,.65,.5],hr:[.1,.08,.06],hat:true,kind:'cop'};
const WHITE=[.95,.95,.95];
// o: x,z,h (rumbo), y (altura), air (en el aire), sc (escala), ph (fase de paso), mv (0..1 velocidad), t (tiempo), look, lying,
// wep (0 nada,1 pistola,2 puños,3 cuchillo), aim (0..1), pitch, atk (0..1), hand, flash, tag
function human(o){const L=o.look,t=o.t||0,sc=o.sc||1;
 if(o.lying){const B=mm(mm(Tm(o.x,.18,o.z),Rym(o.h)),Sm(sc,sc,sc));
  bx(B,0,.15,-.65,.45,.28,.9,L.pn);bx(B,0,.2,.2,.62,.34,.7,L.jk);bx(B,0,.2,.78,.34,.34,.34,L.sk);bx(B,0,.38,.8,.36,.1,.36,L.hr);return}
 const mv=Math.min(1,o.mv||0),sw=Math.sin(o.ph||0)*(.3+.65*mv)*Math.min(1,mv*3),bob=o.air?0:Math.abs(Math.cos(o.ph||0))*.07*Math.min(1,mv*3),
  br=Math.sin(t*2.2)*.012*(1-Math.min(1,mv*3)),B=mm(mm(Tm(o.x,(o.y||0)+bob+br,o.z),Rym(o.h)),Sm(sc,sc,sc)),hero=L.kind==='hero';
 // piernas, franja lateral y zapatillas
 for(const sd of[1,-1]){const m=pv(B,sd*.14,.86,0,o.air?(sd>0?-.8:.5):-sd*sw);bx(m,0,-.41,0,.25,.82,.29,L.pn);
  if(hero){bx(m,sd*.13,-.4,0,.03,.78,.12,WHITE);bx(m,0,-.78,.08,.27,.16,.45,[.08,.08,.09]);bx(m,0,-.87,.08,.28,.05,.47,WHITE)}
  else bx(m,0,-.78,.08,.27,.16,.45,L.kind==='cop'?[.05,.05,.07]:[.12,.1,.1])}
 // torso
 bx(B,0,1.22,0,.64,.72,.34,L.jk);bx(B,0,.9,0,.66,.1,.36,hero?[.08,.08,.09]:[.1,.08,.08]);
 if(hero){bx(B,0,1.2,.175,.03,.7,.02,[.45,.45,.48]);bx(B,.19,1.43,.18,.1,.04,.03,WHITE);bx(B,.25,1.46,.18,.12,.04,.03,WHITE);bx(B,0,1.57,0,.66,.06,.36,[.12,.12,.13]);bx(B,0,1.5,.2,.18,.05,.03,[1,.82,.2])}
 else if(L.kind==='cop'){bx(B,.18,1.4,.18,.1,.1,.03,[1,.85,.2])}
 // brazos
 let rR=-sw*.8,rL=sw*.8,rRy=0,rLy=0;
 const aimed=o.wep===1&&o.aim>0;
 if(o.wep===1){rR=aimed?-Math.PI/2+(o.pitch||0):-.45;if(aimed){rL=-Math.PI/2+(o.pitch||0)+.15;rLy=-.4}}
 else if(o.air){rR=-2.3;rL=-2.1}
 if(o.atk>0){const p=1-o.atk;
  if(o.wep===2){const pu=Math.sin(p*Math.PI)*1.55;if(o.hand)rR=-pu;else rL=-pu}
  else if(o.wep===3)rR=-2.1+2.7*p}
 rR+=br*8;rL-=br*8;
 const aR=pv(B,-.4,1.55,0,rR,rRy),aL=pv(B,.4,1.55,0,rL,rLy);
 for(const [m,right] of[[aR,1],[aL,0]]){bx(m,0,-.35,0,.2,.7,.22,L.jk);if(hero)bx(m,.0,-.35,.115,.04,.66,.02,WHITE);bx(m,0,-.77,0,.18,.18,.18,L.sk);
  if(right&&o.wep===1){bx(m,0,-.92,0,.09,.34,.11,[.12,.12,.14]);bx(m,0,-.8,-.07,.08,.16,.08,[.2,.15,.1]);if(o.flash>0)bx(m,0,-1.2,0,.2,.2,.2,[1,.9,.3],2)}
  if(right&&o.wep===3){bx(m,0,-.85,0,.06,.12,.06,[.2,.1,.05]);bx(m,0,-1.1,0,.04,.42,.11,[.85,.88,.92],1.2)}}
 // cabeza
 bx(B,0,1.78,0,.36,.38,.36,L.sk);
 if(L.fade){// taper fade: arriba más largo, costados y nuca degradados hasta la piel, línea de contorno nítida
  const mid=[L.sk[0]*.45+L.hr[0]*.55,L.sk[1]*.45+L.hr[1]*.55,L.sk[2]*.45+L.hr[2]*.55],low=[L.sk[0]*.75+L.hr[0]*.25,L.sk[1]*.75+L.hr[1]*.25,L.sk[2]*.75+L.hr[2]*.25];
  bx(B,0,2.03,-.01,.34,.13,.38,L.hr);bx(B,0,1.96,.185,.32,.03,.03,L.hr);
  for(const sd of[-1,1]){bx(B,sd*.185,1.93,-.02,.03,.12,.34,mid);bx(B,sd*.185,1.82,-.03,.025,.1,.28,low)}
  bx(B,0,1.92,-.185,.34,.14,.03,mid);bx(B,0,1.8,-.185,.3,.1,.02,low);bx(B,0,1.7,.19,.12,.035,.03,[.25,.17,.12])}
 else if(L.hat){bx(B,0,2.0,0,.42,.14,.42,L.kind==='cop'?[.08,.12,.3]:[.7,.2,.2]);bx(B,0,1.96,.26,.4,.05,.2,[.05,.05,.1])}
 else bx(B,0,2.0,-.02,.4,.14,.4,L.hr);
 if(L.sh)bx(B,0,1.82,.19,.4,.09,.04,[.02,.02,.03]);
 if(o.tag==='debt')bx(mm(Tm(o.x,2.7+Math.sin(t*4)*.15,o.z),Rym(t*3)),0,0,0,.45,.45,.45,[1,.15,.15],1.5)}
function drawCar(c){const t=c.t,mh=c.mhp||100,k=c.boom?.25:.4+.6*clamp(c.hp/mh,0,1),col=c.col||t.c;
 const D=(lx,ly,lz,sx,sy,sz,cc,kk)=>{const s=Math.sin(c.h),co=Math.cos(c.h),q=kk||k;
  E.draw([co*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,co*sz,0,c.x+lx*co+lz*s,ly,c.z-lx*s+lz*co,1],cc[0]*q,cc[1]*q,cc[2]*q)};
 D(0,.45+t.h/2,0,t.w,t.h,t.l,col);
 D(0,.45+t.h+t.ch/2,-t.l*.08,t.w*.9,t.ch,t.l*.5,[.25,.35,.45]);
 for(const sx of[-1,1])for(const sz of[-1,1])D(sx*t.w/2,.4,sz*t.l*.33,.35,.8,.8,[.08,.08,.08],.8);
 for(const sx of[-1,1])D(sx*t.w*.35,.6,t.l/2,.3,.2,.1,[1,1,.7],1);
 if(c.police&&!c.boom){const fl=(performance.now()/180|0)%2;
  if(t.liv===1)for(const sx of[-1,1])D(sx*(t.w/2+.02),.45+t.h*.5,0,.05,t.h*.55,t.l*.45,[.95,.95,.95],.9);
  const top=.45+t.h+t.ch+.1;D(-.35,top,-t.l*.08,.5,.18,.4,fl?[1,.05,.05]:[.1,.1,.4],1.6);D(.35,top,-t.l*.08,.5,.18,.4,fl?[.1,.1,1]:[1,.05,.05],1.6)}}
// Baliza amarilla de misión
function beacon(m,t){const y=2+Math.sin(t*3)*.4;
 E.draw([.7,0,0,0,0,60,0,0,0,0,.7,0,m.x,30,m.z,1],1.4,1.2,.15);
 const c=Math.cos(t*2),s=Math.sin(t*2);E.draw([c*1.4,0,-s*1.4,0,0,1.4,0,0,s*1.4,0,c*1.4,0,m.x,y+2,m.z,1],1.6,1.4,.3)}

// Bolso de dinero (misión "Dinero sucio")
function bag(p,t){const y=.5+Math.sin(t*3+p.x)*.15,c=Math.cos(t*2),sn=Math.sin(t*2);
 E.draw([c*.9,0,-sn*.9,0,0,.7,0,0,sn*.9,0,c*.9,0,p.x,y,p.z,1],.2,.7,.25);E.draw([c*.4,0,-sn*.4,0,0,.1,0,0,sn*.4,0,c*.4,0,p.x,y+.4,p.z,1],.9,.95,.8);
 E.draw([.4,0,0,0,0,14,0,0,0,0,.4,0,p.x,7,p.z,1],.5,1.2,.4)}
