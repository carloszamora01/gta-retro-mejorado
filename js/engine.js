'use strict';
// Motor WebGL mínimo (sin dependencias externas): cajas con sombreado plano y niebla.
const E={};
(function(){
const cv=document.getElementById('c'),gl=cv.getContext('webgl',{antialias:false,powerPreference:'high-performance'});
if(!gl){document.getElementById('ovt').textContent='WebGL no está disponible en este navegador.';return}
const VS=`attribute vec3 p,n,c;uniform mat4 uVP,uM;uniform vec3 uT,uCam;varying vec3 vc;varying float vd;
void main(){vec4 w=uM*vec4(p,1.);gl_Position=uVP*w;vec3 nn=normalize(mat3(uM)*n);
float l=.5+.5*max(dot(nn,normalize(vec3(.4,.8,.3))),0.);vc=c*uT*l;vd=distance(uCam,w.xyz);}`;
const FS=`precision mediump float;varying vec3 vc;varying float vd;uniform vec3 uF;uniform vec2 uFr;
void main(){gl_FragColor=vec4(mix(vc,uF,clamp((vd-uFr.x)/(uFr.y-uFr.x),0.,1.)),1.);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
['p','n','c'].forEach((a,i)=>gl.bindAttribLocation(pr,i,a));gl.linkProgram(pr);gl.useProgram(pr);
const U={};['uVP','uM','uT','uCam','uF','uFr'].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
const F=[[1,0,0,0,1,0,0,0,1],[-1,0,0,0,1,0,0,0,1],[0,1,0,1,0,0,0,0,1],[0,-1,0,1,0,0,0,0,1],[0,0,1,1,0,0,0,1,0],[0,0,-1,1,0,0,0,1,0]];
const Q=[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]];
E.box9=(a,x,y,z,sx,sy,sz,c)=>{for(const f of F)for(const q of Q){
 for(let k=0;k<3;k++){const v=f[k]*.5+f[3+k]*.5*q[0]+f[6+k]*.5*q[1];a.push([x,y,z][k]+v*[sx,sy,sz][k])}
 a.push(f[0],f[1],f[2],c[0],c[1],c[2])}};
function buf(a){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);return{b,n:a.length/9}}
function bind(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.b);for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12)}}
const cube=[];E.box9(cube,0,0,0,1,1,1,[1,1,1]);const CUBE=buf(cube);
const ID=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
E.makeStatic=a=>buf(a);
E.begin=(eye,vp,fog,fc)=>{gl.clearColor(fc[0],fc[1],fc[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
 gl.uniformMatrix4fv(U.uVP,false,vp);gl.uniform3fv(U.uCam,eye);gl.uniform3fv(U.uF,fc);gl.uniform2f(U.uFr,fog*.55,fog)};
E.drawStatic=m=>{bind(m);gl.uniformMatrix4fv(U.uM,false,ID);gl.uniform3f(U.uT,1,1,1);gl.drawArrays(gl.TRIANGLES,0,m.n)};
E.beginDyn=()=>bind(CUBE);
E.draw=(m,r,g,b)=>{gl.uniformMatrix4fv(U.uM,false,m);gl.uniform3f(U.uT,r,g,b);gl.drawArrays(gl.TRIANGLES,0,36)};
E.resize=s=>{cv.width=Math.max(160,innerWidth*s|0);cv.height=Math.max(120,innerHeight*s|0);gl.viewport(0,0,cv.width,cv.height)};
E.aspect=()=>cv.width/cv.height;
E.persp=(fov,a,n,f)=>{const t=1/Math.tan(fov/2);return[t/a,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]};
E.lookAt=(e,c)=>{let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]],l=Math.hypot(...z);z=z.map(v=>v/l);
 let x=[z[2],0,-z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
 return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1]};
E.mul=(a,b)=>{const o=new Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o};
})();
