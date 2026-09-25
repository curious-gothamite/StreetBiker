// Street Biker: Track spline: buildTrack(), nearest(), posOnTrack().
'use strict';
function buildTrack(cfg){
 let raw;
 if(cfg.theme==='avenue')raw=[{x:0,z:0},{x:0,z:cfg.length}];
 else if(cfg.theme==='random'){seedV=Math.floor(Math.random()*2e9)+1;raw=[];const n=11+Math.floor(rnd()*4);for(let k=0;k<n;k++){const th=k/n*Math.PI*2+(rnd()-0.5)*0.35,r=200+rnd()*200;raw.push({x:Math.cos(th)*r,z:Math.sin(th)*r*0.85});}}
 else raw=cfg.pts.map(p=>({x:p[0],z:p[1]}));
 const n=raw.length,dense=[];const closed=cfg.closed;const segs=closed?n:n-1;
 for(let i=0;i<segs;i++){const p0=raw[closed?(i-1+n)%n:Math.max(0,i-1)],p1=raw[i],p2=raw[(i+1)%n],p3=raw[closed?(i+2)%n:Math.min(n-1,i+2)];
  for(let j=0;j<24;j++){const s=j/24,s2=s*s,s3=s2*s;dense.push({x:.5*(2*p1.x+(-p0.x+p2.x)*s+(2*p0.x-5*p1.x+4*p2.x-p3.x)*s2+(-p0.x+3*p1.x-3*p2.x+p3.x)*s3),z:.5*(2*p1.z+(-p0.z+p2.z)*s+(2*p0.z-5*p1.z+4*p2.z-p3.z)*s2+(-p0.z+3*p1.z-3*p2.z+p3.z)*s3)});}}
 if(!closed)dense.push(raw[n-1]);
 const L=dense.length,cum=[0];const segN=closed?L:L-1;
 for(let i=1;i<=segN;i++){const a=dense[i-1],b=dense[i%L];cum[i]=cum[i-1]+Math.hypot(b.x-a.x,b.z-a.z);}
 const total=cum[segN],step=4,S=[];let seg=0;
 for(let d=0;d<total-(closed?step/2:0.01);d+=step){while(seg<segN-1&&cum[seg+1]<d)seg++;const a=dense[seg],b=dense[(seg+1)%L];const f=(d-cum[seg])/((cum[seg+1]-cum[seg])||1);S.push({x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f});}
 if(!closed)S.push({x:raw[n-1].x,z:raw[n-1].z});
 const N=S.length;
 for(let i=0;i<N;i++){const a=S[closed?(i-1+N)%N:Math.max(0,i-1)],b=S[closed?(i+1)%N:Math.min(N-1,i+1)];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;S[i].tx=dx/l;S[i].tz=dz/l;S[i].h=Math.atan2(dz,dx);}
 const bbox={minX:Infinity,minZ:Infinity,maxX:-Infinity,maxZ:-Infinity};S.forEach(q=>{bbox.minX=Math.min(bbox.minX,q.x);bbox.minZ=Math.min(bbox.minZ,q.z);bbox.maxX=Math.max(bbox.maxX,q.x);bbox.maxZ=Math.max(bbox.maxZ,q.z);});
 const T={S,N,step,bbox,cfg,closed,total};
 const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
 const k=new Float32Array(N);for(let i=0;i<N;i++){const j=closed?(i+1)%N:Math.min(N-1,i+1);k[i]=wrap(S[j].h-S[i].h);}
 const sm=(arr,r)=>{const o=new Float32Array(N);for(let i=0;i<N;i++){let s=0,c=0;for(let d=-r;d<=r;d++){let j=i+d;if(closed)j=(j+N)%N;else if(j<0||j>=N)continue;s+=arr[j];c++;}o[i]=s/c;}return o;};
 const kn=sm(k,6),kw=sm(k,30);const w=cfg.width,K=4*w;let off=new Float32Array(N);
 for(let i=0;i<N;i++)off[i]=Math.max(-w*0.32,Math.min(w*0.32,K*(kn[i]-0.5*kw[i])));
 T.guideOff=sm(off,5);T.guideCol=[];const ks=sm(k,2);
 for(let i=0;i<N;i++){let mk=0;for(let d=3;d<22;d++){let j=i+d;if(closed)j%=N;else if(j>=N)break;mk=Math.max(mk,Math.abs(ks[j]));}T.guideCol.push(mk<0.028?[0.13,0.77,0.37]:mk<0.06?[0.98,0.8,0.08]:[0.94,0.27,0.27]);}
 T.crossings=[];
 if(cfg.theme==='avenue'){for(let zz=cfg.block;zz<cfg.length-20;zz+=cfg.block)T.crossings.push({i:zz/step,k:T.crossings.length});}
 else{for(let i=Math.floor(cfg.crossEvery/2);i<N-(closed?0:10);i+=cfg.crossEvery)T.crossings.push({i,k:T.crossings.length});}
 T.crossings.forEach(c=>{const s=S[c.i];c.x=s.x;c.z=s.z;c.a=s.h;c.tx=s.tx;c.tz=s.tz;c.peds=[];c.flow=0.3+rnd()*0.9;c.busy=false;});
 return T;
}
function nearest(T,x,z){const S=T.S,N=T.N;const segs=T.closed?N:N-1;let best=1e18,bi=0,bx=0,bz=0;
 for(let i=0;i<segs;i++){const a=S[i],b=S[(i+1)%N];const dx=b.x-a.x,dz=b.z-a.z;const l2=dx*dx+dz*dz||1;let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=t<0?0:t>1?1:t;const px=a.x+dx*t,pz=a.z+dz*t;const d=(x-px)*(x-px)+(z-pz)*(z-pz);if(d<best){best=d;bi=i+t;bx=px;bz=pz;}}
 return{d:Math.sqrt(best),i:bi,px:bx,pz:bz};}
function posOnTrack(T,t,off){const S=T.S,N=T.N;const i=Math.max(0,Math.min(N-1,Math.floor(t)));const s=S[i];const rx=-s.tz,rz=s.tx;return{x:s.x+rx*off,z:s.z+rz*off,a:s.h,tx:s.tx,tz:s.tz};}
