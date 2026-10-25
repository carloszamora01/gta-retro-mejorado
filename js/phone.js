'use strict';
// ================= CELULAR: conversaciones que llegan durante la historia =================
const CCOL={'Mónica':'#ff8fd0','Don Lucho':'#ffb46b','Doña Chela':'#a8f0c0',Tuerca:'#9ad0ff',Lalo:'#c8ff8a','Cap. Salazar':'#9aa8ff',Desconocido:'#cccccc','El Tiburón':'#7fe0ff'};
const Phone={open:false,sel:0,th:{},order:[],unr:{},q:[],opts:null,tq:0,toastT:0,
 reset(){this.open=false;this.sel=0;this.th={};this.order=[];this.unr={};this.q=[];this.opts=null;this.tq=0;this.draw()},
 // mensaje entrante (con retraso opcional, segundos)
 msg(who,text,delay){this.q.push({who,text,delay:delay===undefined?1.8:delay})},
 // el jugador elige una respuesta; replies[i] = texto (o lista) con que contesta el contacto
 ask(who,options,replies){this.q.push({ask:1,who,options,replies,delay:.6})},
 deliver(who,text,dir){if(!this.th[who]){this.th[who]=[];}this.th[who].push({d:dir,text});
  this.order=this.order.filter(w=>w!==who);this.order.unshift(who);
  const viewing=this.open&&this.order[this.sel]===who;
  if(dir==='in'){if(viewing){this.sel=0}else this.unr[who]=(this.unr[who]||0)+1;
   this.chime();Hud.toast(who,text);}
  this.draw()},
 chime(){tone(880,0,.12,'sine',.12);tone(1175,.13,.18,'sine',.12)},
 update(dt){if(this.tq>0){this.tq-=dt;return}
  if(!this.q.length)return;const m=this.q.shift();this.tq=m.delay;
  if(m.ask){this.opts=m;this.order=this.order.filter(w=>w!==m.who);this.order.unshift(m.who);this.sel=this.open?0:this.sel;this.unr[m.who]=(this.unr[m.who]||0)+1;this.chime();Hud.toast(m.who,'Te escribió: pulsa T para responder');this.draw()}
  else this.deliver(m.who,m.text,'in')},
 pick(i){const o=this.opts;if(!o||i>=o.options.length)return;this.opts=null;this.deliver(o.who,o.options[i],'out');
  const r=o.replies&&o.replies[i];if(r)[].concat(r).forEach(t=>this.msg(o.who,t,1.5));this.draw()},
 toggle(){this.open=!this.open;if(this.open){this.sel=0;if(this.opts){const k=this.order.indexOf(this.opts.who);if(k>=0)this.sel=k}}
  const w=this.order[this.sel];if(w)this.unr[w]=0;this.draw()},
 nav(d){if(!this.order.length)return;this.sel=(this.sel+d+this.order.length)%this.order.length;this.unr[this.order[this.sel]]=0;this.draw()},
 total(){let n=0;for(const k in this.unr)n+=this.unr[k]||0;return n},
 draw(){const el=$('phone');if(!el)return;el.hidden=!this.open;if(!this.open)return;
  const w=this.order[this.sel];
  $('phn').innerHTML=w?'<b style="color:'+(CCOL[w]||'#fff')+'">'+w+'</b> <small>('+(this.sel+1)+'/'+this.order.length+')</small>':'Celular';
  $('phm').innerHTML=w?this.th[w].map(m=>'<div class="bub '+m.d+'">'+m.text+'</div>').join(''):'<div class="bub in">Aún no tienes mensajes.</div>';
  const o=this.opts&&this.opts.who===w?this.opts:null;
  $('pho').innerHTML=o?o.options.map((t,i)=>'<div class="opt"><b>'+(i+1)+'</b> '+t+'</div>').join(''):(this.opts?'<div class="opt dim">Tienes una respuesta pendiente en el chat de '+this.opts.who+'</div>':'');
  const mm=$('phm');mm.scrollTop=mm.scrollHeight}};
