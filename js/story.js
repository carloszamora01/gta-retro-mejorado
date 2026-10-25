'use strict';
// ================= HISTORIA: Damián Quiñones y Los Pulpos =================
// Capítulo 1 (misiones 1-5): el regreso · Capítulo 2 (misiones 6-15): la guerra contra Los Tiburones
const VOICE={'Damián':{f:190,c:'#ffcf5a'},'Mónica':{f:330,c:'#ff8fd0'},'Don Lucho':{f:125,c:'#ffb46b'},'Doña Chela':{f:270,c:'#a8f0c0'},Tuerca:{f:160,c:'#9ad0ff'},Lalo:{f:380,c:'#c8ff8a'},
 'El Tiburón':{f:105,c:'#7fe0ff'},'Cap. Salazar':{f:140,c:'#9aa8ff'},Radio:{f:520,c:'#8fd0ff'}};
const BARKS={
 car:['A ver qué tal anda este fierro.','Con permisito... ¡y sin permiso también!','Agárrense, que manejo como los dioses. O casi.','Este asiento es más cómodo que mi cama.'],
 fast:['¡Esta belleza ahora es mía!','Uy, qué rico suena este motor.'],
 crash:['¡Auch! Eso me va a doler mañana.','Ese seguro no cubre esto...','¡Fue la pared, yo no hice nada!','Mi espalda... mi pobre espalda.'],
 w1:['Ay, ya vienen los tombos...','Mejor me hago el desentendido.'],
 w3:['¡Esto se está saliendo de control!','Tanto tombo junto, ¿hay feria?'],
 w5:['¡Hasta el SWAT viene por mí! Qué honor.','Mamita... esto ya es guerra.'],
 lost:['Chau, tombos. ¡Que les vaya bonito!','Ni se dieron cuenta. Soy un fantasma.'],
 low:['Estoy hecho una sopa... necesito un ceviche.','Me duele hasta el cabello.'],
 head:['¡Qué puntería, causa!','Tiro perfecto, como en los sueños.'],
 idle:['¿Y si me pido un cevichito?','Quieto, quieto... algo va a pasar.','Los Pulpos nunca duermen, pero yo sí quisiera.'],
 ceviche:['Uff, qué rico huele ese ceviche.'],
 drift:['¡Mira cómo derrapo!','¡Esto es más divertido que el cine!'],
 kill:['Eh... eso no estaba en el plan.'],
 busted:['Esto me pasa por andar de bacán.'],
 boom:['¡Sal del auto, que explota!','¡Esto va a explotar!'],
 jump:['¡Hop!','Ágil como pulpo en tierra.']};
const DLG={q:[],cur:null,t:0,cd:3};
const subHTML=l=>{const v=VOICE[l.who]||VOICE['Damián'];return'<b style="color:'+v.c+'">'+l.who+':</b> '+l.text};
function say(who,text){DLG.q.push({who,text,dur:Math.max(2.6,text.length*.058)})}
function bark(key,p){if(DLG.cur||DLG.q.length||DLG.cd>0||(p!==undefined&&Math.random()>p))return;DLG.cd=8;say('Damián',pick(BARKS[key]))}
function talk(who,text){if(!audio)return;const v=VOICE[who]||VOICE['Damián'],n=Math.min(16,text.length/2.2|0);
 for(let i=0;i<n;i++)tone(v.f*rr(.85,1.3),i*.07,.05,'square',.05)}
function dlgUpdate(dt){DLG.cd-=dt;
 if(DLG.cur){DLG.t-=dt;if(DLG.t<=0){DLG.cur=null;$('sub').innerHTML=''}}
 if(!DLG.cur&&DLG.q.length){const l=DLG.q.shift();DLG.cur=l;DLG.t=l.dur;$('sub').innerHTML=subHTML(l);talk(l.who,l.text)}}
// ---------- Estado y utilidades ----------
const M={i:0,s:0,n:0,w:0,q:100,timer:0,t:0,hint:false,next:0,retry:0,failTxt:null,tmShow:false,qOn:false,tcar:null,lalo:null,onPick:null,far:0,t2:0,bossPos:null,tip:0};
const SEEN={};
const near=(p,r)=>Math.hypot((cur||pl).x-p[0],(cur||pl).z-p[1])<r;
const mk=p=>({x:p[0],z:p[1]});
const DEBT=[[55,78],[153,130],[130,211]];
const BAGS=[[156,52],[312,156],[208,312],[52,364],[364,260]];
const TGT1={n:'Coche de los Tiburones',c:[.1,.35,.75],w:2,l:4.4,h:.7,ch:.6,m:44,a:22};
const TGT2={n:'Camioneta blindada',c:[.1,.12,.14],w:2.2,l:5,h:1.2,ch:.8,m:46,a:20};
function freeAround(c,r0,r1,n){const out=[];for(let k=0;k<n;k++)for(let a=0;a<40;a++){const an=rr(0,TAU),r=rr(r0,r1),x=clamp(c[0]+Math.cos(an)*r,2,CITY-2),z=clamp(c[1]+Math.sin(an)*r,2,CITY-2);if(hAt(x,z)===0){out.push([x,z]);break}}return out}
function spawnGang(list,o){for(const p of list){const g=mkGang(p[0],p[1],o);gang.push(g)}}
function spawnDebtors(){npcs=npcs.filter(n=>n.tag!=='debt');
 DEBT.forEach(p=>{const n=mkNpc();n.x=p[0];n.z=p[1];n.tag='debt';n.hp=40;n.look.jk=[.55,.1,.7];n.look.hat=true;n.look.sh=false;npcs.push(n)})}
function spawnTarget(ty,hp){const dir=Math.random()<.5?1:-1,line=clamp(Math.round((pl.x+(pl.x<CITY/2?130:-130))/P),1,N-1),
 c=mkCar(ty,0,0,0,{axis:'z',dir,line,last:-1,keep:true,fast:true});placeAI(c,clamp(pl.z,20,CITY-20));c.hp=c.mhp=hp;cars.push(c);return c}
function cleanup(){gang=[];pickups=[];if(M.tcar){cars=cars.filter(c=>c!==M.tcar);M.tcar=null}M.lalo=null;M.tmShow=false;M.qOn=false;M.onPick=null}
// ---------- Pasos reutilizables ----------
const pos=p=>typeof p==='function'?p():p,txtOf=t=>typeof t==='function'?t():t;
function go(p,r,txt,o){o=o||{};return{obj:()=>txtOf(txt),marks:()=>[mk(pos(p))],enter:o.enter,done:o.done,
 upd(){if(near(pos(p),r)&&(!o.stop||!cur||Math.abs(cur.sp)<8))return 1}}}
function fight(txt,waves,c,r0,r1,gopts,intro){const tot=waves.reduce((a,b)=>a+b,0),sp=k=>spawnGang(freeAround(c,r0,r1,k),gopts);
 return{obj:()=>txt+' ('+M.n+'/'+tot+')',
  marks:()=>{const l=gang.filter(g=>g.st!=='down').sort((a,b)=>Math.hypot(a.x-pl.x,a.z-pl.z)-Math.hypot(b.x-pl.x,b.z-pl.z)).slice(0,3).map(g=>mk([g.x,g.z]));return l.length?l:[mk(c)]},
  enter(){M.n=0;M.w=1;sp(waves[0]);intro&&intro()},
  upd(){if(gang.every(g=>g.st==='down')){if(M.w<waves.length){sp(waves[M.w]);M.w++;msg('¡Llegan más!')}else return 1}}}}
function chase(txt,txt2,ty,hp,intro){return{obj:()=>cur?txt:txt2,marks:()=>M.tcar?[mk([M.tcar.x,M.tcar.z])]:[],
 enter(){M.tcar=spawnTarget(ty,hp);M.far=0;M.t2=0;intro&&intro()},
 upd(dt){const c=M.tcar;if(!c)return;
  if(c.hp<=0||c.boom){M.t2+=dt;if(c.boom||M.t2>1.5){M.bossPos=[c.x,c.z];return 1}}
  const d=Math.hypot(c.x-(cur||pl).x,c.z-(cur||pl).z);if(d>230){M.far+=dt;if(M.far>8){M.failTxt='Se les escapó el coche';return -1}}else M.far=0}}}
function bossStep(txt,intro){return{obj:()=>txt,marks:()=>gang.filter(g=>g.st!=='down').map(g=>mk([g.x,g.z])),
 enter(){spawnGang([M.bossPos||LOC.puerto.c],{look:BOSS,hp:180,sc:1.15,dmg:8,acc:.6,boss:true});intro&&intro()},
 upd(){if(gang.length&&gang.every(g=>g.st==='down'))return 1}}}
function grab(txt,list,secs,onPick){return{obj:()=>txt+' ('+M.n+'/'+list.length+')',marks:()=>pickups.filter(p=>!p.got).map(p=>mk([p.x,p.z])),
 enter(){M.n=0;M.timer=secs;M.tmShow=true;M.onPick=onPick;pickups=list.map(p=>({x:p[0],z:p[1],got:false}))},
 upd(dt){M.timer-=dt;if(M.timer<=0){M.failTxt='Se acabó el tiempo';return -1}if(M.n>=list.length){M.tmShow=false;return 1}}}}
function esc(level,txt,hint){return{obj:()=>S.wanted?txt+' ('+'★'.repeat(S.wanted)+')':'Casi libre...',marks:()=>[],
 enter(){M.hint=false;if(level)setWanted(level)},
 upd(dt){M.t+=dt;if(hint&&!M.hint&&M.t>14){M.hint=true;say(hint[0],hint[1])}if(S.wanted===0&&M.t>(level?3:0))return 1}}}
function Mission(id,t,rw,o){const enter=()=>{M.t=0;M.tmShow=false;const st=o.steps[M.s];st.enter&&st.enter()};
 return{t,rw,onFail:o.onFail,win:o.win,
  init(){cleanup();M.s=0;M.n=0;M.w=0;M.t=0;M.failTxt=null;if(!SEEN[id]){SEEN[id]=1;o.start&&o.start()}else say('Damián','Otra vez... ahora sí sale bien.');enter()},
  obj(){return o.steps[M.s].obj()},marks(){return o.steps[M.s].marks()},
  upd(dt){const f=o.fail&&o.fail();if(f){M.failTxt=f;return -1}
   const st=o.steps[M.s],r=st.upd(dt);
   if(r===1){st.done&&st.done();M.s++;if(M.s>=o.steps.length)return 1;enter()}else if(r<0)return r}}}
const P_=Phone;
// ---------- Las 15 misiones ----------
const MIS=[
 // ===== CAPÍTULO 1: LOS PULPOS =====
 Mission('m1','Primer día',150,{
  start(){say('Damián','Dos años fuera y esta ciudad sigue igual de loca. Los Pulpos me necesitan... y yo necesito la plata.');
   P_.msg('Mónica','Damián!! Ya llegó el hijo pródigo. Pásate por el Club Neón, Don Lucho quiere verte.',3.5);
   P_.ask('Mónica',['Voy volando, Moni.','¿Don Lucho está de buen humor?','No te emociones, ya voy.'],[['Así me gusta, puntual.'],['Nunca. Pero hoy anda con ganas de hablar de negocios.'],['Jaja, siempre tan serio. Te espero con un trago.']])},
  steps:[go(LOC.club.m,9,'Ve al Club Neón')],
  win(){say('Mónica','¡Llegaste! Mira, afuera hay un superdeportivo cian. Es del sobrino del Tiburón, el jefe de los Tiburones.');
   say('Damián','Los Tiburones... la banda que quiere comerse a los Pulpos. Ya me cae gordo ese carro.');
   P_.msg('Don Lucho','Bienvenido, Damián. Quiero ese carro en el garaje de los Pulpos. Hazlo bien y sin que te pillen.',4)}}),
 Mission('m2','Auto de lujo',300,{
  start(){P_.msg('Mónica','Ahí está el cian. Apenas lo muevas, el sobrino llamará a los tombos. Llévalo a la cevichería de Don Lucho.',2)},
  steps:[{obj:()=>'Roba el superdeportivo cian',marks:()=>[mk([fastCar.x,fastCar.z])],
    upd(){if(cur===fastCar){addHeat(1);say('Damián','¡Qué bestia de carro! Perdón, sobrino del Tiburón...');say('Mónica','¡Ya salieron los tombos! Piérdelos antes de llegar donde Don Lucho.');return 1}}},
   {obj:()=>cur===fastCar?(S.wanted?'Pierde a la policía y llega a la cevichería':'Llévalo a la Cevichería Don Lucho'):'Vuelve al superdeportivo',
    marks:()=>cur===fastCar?[mk(LOC.ceviche.m)]:[mk([fastCar.x,fastCar.z])],
    upd(){if(cur===fastCar&&near(LOC.ceviche.m,8)&&Math.abs(cur.sp)<8&&!S.wanted)return 1}}],
  fail:()=>fastCar.hp<=0?'El superdeportivo quedó destruido':null,onFail:()=>spawnFast(),
  win(){say('Don Lucho','¡Pero qué bestia! Ese pituco va a llorar. Eres un Pulpo de verdad, Damián.');
   P_.msg('Don Lucho','Tengo otro trabajito: unos morosos me deben plata y andan corriendo por la ciudad.',5);
   P_.ask('Don Lucho',['Con gusto, jefe.','¿Y si se resisten?','¿Cuánto me toca?'],[['Así se habla.'],['Les recuerdas quién manda. Con los puños, sin balas: la policía es un fastidio.'],['Tu parte te la doy al terminar. No seas ambicioso.']])}}),
 Mission('m3','Cobranza',400,{
  start(){say('Don Lucho','Tres morosos andan corriendo por la ciudad. Noquéalos, pero sin balas si puedes.')},
  steps:[{obj:()=>'Noquea a los morosos ('+M.n+'/3)',marks:()=>npcs.filter(n=>n.tag==='debt'&&n.st!=='down').map(n=>mk([n.x,n.z])),
    enter(){M.n=0;spawnDebtors()},upd(){if(M.n>=3)return 1}}],
  win(){say('Don Lucho','Bacán. Ahora a lo importante: tengo un pedido para mi hermana Chela.')}}),
 Mission('m4','Ceviche express',450,{
  start(){P_.msg('Don Lucho','Recoge el pedido en la cevichería y llévalo a casa de mi hermana Chela. Dentro del ceviche va la mercadería: si se aplasta, se arruina.',2)},
  steps:[go(LOC.ceviche.m,6,'Recoge el pedido en la cevichería',{done:()=>say('Don Lucho','¡Ahí va! Tienes 80 segundos. ¡Cuida ese pescado!')}),
   {obj:()=>'Entrega el ceviche a Doña Chela',marks:()=>[mk(LOC.casa.m)],enter(){M.timer=80;M.q=100;M.qOn=true;M.tmShow=true},
    upd(dt){M.timer-=dt;if(M.timer<=0){M.failTxt='¡Se enfrió el ceviche!';return -1}if(M.q<=0){M.failTxt='¡El ceviche quedó hecho puré!';return -1}
     if(near(LOC.casa.m,7)){M.tip=Math.round(M.q*2);return 1}}}],
  win(){S.cash+=M.tip;say('Doña Chela','¡Qué rico se ve! Toma, mijo, una propina de $'+M.tip+'.');P_.msg('Doña Chela','Cuídate mucho, Damián. Los Tiburones no perdonan.',4)}}),
 Mission('m5','Se armó la grande',800,{
  start(){say('Mónica','¡Damián! Alguien chismeó y el capitán Salazar te busca por toda la ciudad. ¡Pierde a la policía!');
   P_.msg('Mónica','Cap. Salazar está comprado por los Tiburones. ¡Corre!',1)},
  steps:[esc(3,'Escapa de la policía',['Mónica','Rómpeles la vista entre cuadras, escóndete... o pasa por Pintura Express para repintar el auto.'])],
  win(){say('Damián','Chau, tombos. Una ciudad menos por conquistar.');say('Don Lucho','Eres de los míos. Fin de la primera parte, muchacho. Pero la guerra recién empieza.');
   P_.msg('Don Lucho','Descansa. Mañana los Tiburones vendrán con todo.',3)}}),
 // ===== CAPÍTULO 2: LA GUERRA DE LOS TIBURONES =====
 Mission('m6','Mensajes sin leer',500,{
  start(){P_.msg('Desconocido','Sabemos que volviste, Pulpito. Tienes 24 horas para largarte de la ciudad.',4);
   P_.ask('Desconocido',['¿Quién eres?','Ven a buscarme, tiburón.','*Bloquear número*'],[['Alguien que no quiere verte por aquí. Tic, tac.'],['Con gusto. Llevaré a mis amigos... y mis cuchillos.'],['Bloqueado... aunque ya leíste el mensaje.']]);
   P_.msg('Tuerca','Pata, ven al taller (Pintura Express). Tengo info de esos tiburones. Ojo que te siguen.',6)},
  steps:[go(LOC.paint.m,9,'Ve a Pintura Express a ver a Tuerca',{done:()=>{say('Tuerca','Pata, los Tiburones mueven armas por el Almacén del Puerto y tienen su guarida en la Discoteca Marea.');say('Damián','Entonces ahí les caemos. Gracias, Tuerca.')}})],
  win(){P_.msg('Don Lucho','Tuerca me contó. Pásate por el club: tengo mercadería que mover, y sin llamar la atención.',4)}}),
 Mission('m7','Sin llamar la atención',600,{
  start(){say('Don Lucho','Recoge la mercadería en el club y llévala a mi casa. Sin estrellas, Damián: el capitán Salazar nos vigila.')},
  steps:[esc(0,'Pierde a la policía primero'),
   go(LOC.club.m,9,'Recoge la mercadería en el Club Neón',{done:()=>say('Mónica','Aquí va la maleta. No te enganches con nadie.')}),
   go(LOC.mansion.m,9,'Lleva la mercadería a la Mansión (¡sin estrellas!)',{stop:1})],
  fail:()=>M.s>=1&&S.wanted>0?'Te vieron los tombos':null,
  win(){say('Don Lucho','Limpio y rápido. Así trabajan los Pulpos.')}}),
 Mission('m8','Fuego cruzado',700,{
  start(){say('Don Lucho','¡Los Tiburones atacan la cevichería! ¡Ve ya!');P_.msg('Lalo','Causa!! Tiburones con fierros frente a la cevichería!! Doña Chela está adentro!',1)},
  steps:[go(LOC.ceviche.m,45,'Ve a la cevichería (¡la atacan!)'),
   fight('Defiende la cevichería',[3,3],LOC.ceviche.c,24,36,null,()=>say('Doña Chela','¡Ay, Dios mío, balazos! ¡Sálvame, mijo!'))],
  win(){say('Doña Chela','Gracias, mijo. Te preparo un ceviche especial.');P_.msg('Lalo','Pata, vi el carro de los Tiburones cargando maletas por la avenida. Síguelo!',5)}}),
 Mission('m9','Persecución en la avenida',800,{
  start(){say('Lalo','¡Ese carro azul, Damián! ¡Lleva la plata de los Tiburones!')},
  steps:[chase('Destruye el coche de los Tiburones','Roba un coche (E) y persigue a los Tiburones',TGT1,130)],
  win(){say('Damián','Ese carro ya no corre más.');P_.msg('Lalo','...pata me cachar... me llevar... Marea... AYUDA',3);
   P_.msg('Desconocido','Tu amiguito está con nosotros. Ven solo, Pulpo.',6)}}),
 Mission('m10','Rescata a Lalo',900,{
  start(){say('Damián','Lalo es un chiquillo. No lo voy a dejar solo.')},
  steps:[go(LOC.marea.m,45,'Ve a la Discoteca Marea'),
   fight('Elimina a los guardias de los Tiburones',[3,2],LOC.marea.c,12,22,null,()=>{M.lalo={x:LOC.marea.c[0],z:LOC.marea.c[1]+10}}),
   go(()=>[LOC.marea.c[0],LOC.marea.c[1]+10],4,'Libera a Lalo',{done:()=>{M.lalo=null;say('Lalo','¡Gracias, Damián! ¡Pensé que me hacían ceviche!');say('Radio','Alarma en la Discoteca Marea. Todas las unidades.')}}),
   esc(2,'Huye con Lalo',['Tuerca','Pata, pasa por Pintura Express y te repinto el carro.'])],
  win(){P_.msg('Lalo','Gracias por salvarme, pata. Ahora sí conozco a los Pulpos de verdad.',3)}}),
 Mission('m11','Dinero sucio',1000,{
  start(){P_.msg('Don Lucho','Hay cinco bolsos con plata escondidos por la ciudad. Los Tiburones los buscan. Tráelos a mi casa en 150 segundos.',2)},
  steps:[grab('Recoge los bolsos de dinero',BAGS,150,()=>{if(M.n===3){setWanted(2);say('Radio','Reportan un sospechoso con bolsos de dinero.')}}),
   go(LOC.mansion.m,9,'Lleva el dinero a la Mansión',{stop:1})],
  win(){S.cash+=300;say('Don Lucho','Hasta el último sol. Aquí tienes tu parte, Damián.')}}),
 Mission('m12','Traición',1100,{
  start(){P_.msg('Mónica','Damián... perdóname. Fui yo quien le habló a Salazar. Me amenazaron por mi hermana. Estoy en el mirador, ven y te cuento todo.',2);
   P_.ask('Mónica',['¿Qué hiciste, Mónica?','Voy para allá. Más te vale explicar.','*No contestar*'],[['Me obligaron... ven, por favor.'],['Lo haré. No me dejes ahí tirada, Damián.'],['Damián... por favor, contesta.']])},
  steps:[go(LOC.mirador.m,10,'Ve al Mirador',{done:()=>{say('Mónica','¡Es una trampa, huye, Damián! ¡Salazar viene con sus hombres!');say('Cap. Salazar','Mátenlo, que no quede testigo.')}}),
   fight('Elimina a los escoltas de Salazar',[3,2],LOC.mirador.c,10,20,{look:CORR,hp:60}),
   esc(3,'Escapa de la policía de Salazar',['Damián','Rápido, antes de que lleguen más.'])],
  win(){P_.msg('Mónica','Estoy bien. Me voy de la ciudad. Cuídate, Damián. Lo siento mucho.',3)}}),
 Mission('m13','Asalto al puerto',1500,{
  start(){P_.msg('Tuerca','Pata, ya tengo el plan. Entras al Almacén del Puerto, revientas a los tiburones y volamos el contenedor de armas.',2);
   P_.msg('Don Lucho','Que no quede ni uno. Es por los Pulpos.',3)},
  steps:[go(LOC.puerto.m,40,'Ve al Almacén del Puerto'),
   fight('Elimina a los Tiburones del almacén',[4,4],LOC.puerto.c,6,24),
   go(LOC.puerto.in,5,'Planta la carga en el contenedor de armas',{done:()=>{const c=mkCar(1,LOC.puerto.in[0],LOC.puerto.in[1]+2,0,null);c.hp=0;cars.push(c);say('Damián','Bum. Eso es por la plata de Don Lucho.')}}),
   esc(3,'Huye del puerto',['Tuerca','¡Pata, escápate! Llegan todas las patrullas.'])],
  win(){say('Tuerca','¡Pura candela, pata! Los Tiburones ya no tienen armas.')}}),
 Mission('m14','Cabeza de tiburón',1800,{
  start(){P_.msg('El Tiburón','Quemaste mi almacén, Pulpito. Esto se arregla en la avenida.',2);P_.msg('Lalo','Pata, ¡el Tiburón se escapa en una camioneta blindada!',4)},
  steps:[chase('Destruye la camioneta blindada de El Tiburón','Roba un coche (E) y persigue a El Tiburón',TGT2,260),
   bossStep('Elimina a El Tiburón',()=>say('El Tiburón','¡Te voy a enterrar, Pulpo!'))],
  win(){say('Damián','Se acabó, Tiburón.');P_.msg('Don Lucho','Ven a mi casa, hijo. Tengo algo para ti.',4)}}),
 Mission('m15','Rey de la ciudad',3000,{
  start(){say('Don Lucho','Ven a la mansión, Damián. Es hora de hablar del futuro de Los Pulpos.')},
  steps:[go(LOC.mansion.m,12,'Ve a la Mansión de Don Lucho'),
   fight('Defiende la mansión de los últimos enemigos',[3,3,2],LOC.mansion.c,24,36,{look:CORR,hp:60},()=>say('Cap. Salazar','Los últimos Pulpos... ¡acábenlos!')),
   go(LOC.mansion.m,6,'Habla con Don Lucho',{done:()=>{
     say('Don Lucho','Mis hijos... esta ciudad necesita un Pulpo Mayor joven. Desde hoy, tú eres el jefe, Damián.');
     say('Damián','No te voy a fallar, Don Lucho. Los Pulpos serán leyenda.');say('Doña Chela','¡Y yo hago el ceviche de la celebración!')}})],
  win(){Hud.banner('FIN DEL CAPÍTULO 2','Damián Quiñones, el nuevo Pulpo Mayor','#e0a526');P_.msg('Lalo','Jefe, ¿y ahora qué hacemos? Jaja.',3);say('Damián','La ciudad es mía... pero eso ya es otra historia.')}})];
const CHAPTERS={0:['Capítulo 1','Los Pulpos'],5:['Capítulo 2','La guerra de los Tiburones']};
function begin(i){const c=CHAPTERS[i];if(c)Hud.chapter(c[0],c[1]);const m=MIS[i];
 if(m)m.init();else say('Damián','Modo libre: la ciudad es mía.')}
function saveProg(){try{localStorage.setItem('pulpos_m',M.i)}catch(_){}}
const Story={
 reset(){for(const k in SEEN)delete SEEN[k];Story.jump(0)},
 jump(i){DLG.q.length=0;DLG.cur=null;DLG.cd=3;$('sub').innerHTML='';cleanup();
  Object.assign(M,{i,s:0,n:0,w:0,q:100,timer:0,t:0,hint:false,next:0,retry:0,failTxt:null});begin(i)},
 retry(){if(MIS[M.i]){DLG.q.length=0;M.retry=1.5}},
 say,crash(im){if(M.qOn)M.q-=clamp(im*.9,5,30)},
 debtDown(){if(M.i===2){M.n++;msg('Moroso noqueado ('+M.n+'/3)')}},
 gangDown(){M.n++},
 pick(){M.n++;msg('Bolso recogido ('+M.n+'/5)');if(M.onPick)M.onPick()},
 fail(why){Hud.banner('MISIÓN FALLIDA',why,'#d33');jingle(false);say('Damián','Se complicó... a intentarlo de nuevo.');M.retry=2.5},
 update(dt){const m=MIS[M.i];
  if(M.retry>0){M.retry-=dt;if(M.retry<=0&&m)m.init();S.marks=[];return}
  if(M.next>0){if(!DLG.cur&&!DLG.q.length){M.next-=dt;if(M.next<=0){M.i++;saveProg();begin(M.i)}}S.marks=[];return}
  if(!m){S.marks=[];return}
  const r=m.upd(dt);
  if(r===1){S.cash+=m.rw;Hud.banner('MISIÓN COMPLETADA',m.t,'#e0a526','+$'+m.rw);jingle(true);m.win&&m.win();cleanup();M.next=2.5;S.marks=[];return}
  if(r<0){Story.fail(M.failTxt||'Misión fallida');m.onFail&&m.onFail();cleanup();S.marks=[];return}
  S.marks=m.marks()},
 objective(){const m=MIS[M.i];if(M.retry>0)return'Reintentando...';if(M.next>0)return'...';return m?m.obj():'Modo libre: explora la ciudad'},
 info(){return M.tmShow?'⏱ '+Math.max(0,M.timer|0)+'s'+(M.qOn?' · Ceviche '+Math.max(0,M.q|0)+'%':''):''},
 count:()=>MIS.length,title:i=>MIS[i]?MIS[i].t:''};
