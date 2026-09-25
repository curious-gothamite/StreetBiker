// Street Biker: Game state, start/finish/pause, physics + traffic update, main loop.
'use strict';
let game=null,last=0,msgTimer=0;
function flash(t,ms){$('msg').textContent=t;clearTimeout(msgTimer);if(ms)msgTimer=setTimeout(()=>{$('msg').textContent='';},ms);}
function start(){paused=false;Object.keys(keys).forEach(k=>keys[k]=0);if(AU.ctx)AU.master.gain.setTargetAtTime(AU.on?.9:0,AU.ctx.currentTime,.05);$('pauseLayer').classList.add('hidden');disposeWorld();if(!TEX.grass)makeTextures();audioInit();clearBubbles();const cfg=TRACKS[trackId],spec=Object.assign({},BIKES[bikeId],RIDERS[riderId]);const T=buildTrack(cfg);const world=buildWorld(T);
 const startIndex=T.closed?0:cfg.theme==='park'?20:3;const s=T.S[startIndex];const bike=bikeMesh(spec);world.add(bike);const rec=trackId==='random'?null:record(trackId+'_'+bikeId).v;
 game={id:trackId,T,cfg,spec,world,bike,rec,p:{x:s.x,z:s.z,a:s.h,vx:0,vz:0,drift:0,boost:0,revHold:0,shake:0,fs:0,steer:0,prog:startIndex},
  traffic:makeTraffic(T,cfg,world),cross:[],pool:[],expected:1,time:0,count:3.6,state:'count',cam:{x:s.x-s.tx*9,y:3.5,z:s.z-s.tz*9},frame:0,ambient:0};
 enhanceWorld(game);$('routeName').textContent=cfg.name;$('location').textContent=cfg.theme==='avenue'?'MANHATTAN / AFTER HOURS':'MANHATTAN / GOLDEN HOUR';T.guide.visible=guideOn;camera.position.set(game.cam.x,game.cam.y,game.cam.z);
 $('recl').textContent='Record '+fmt(rec);$('split').textContent='';$('menu').classList.add('hidden');$('results').classList.add('hidden');['hud','mini','meter','gbtn','sbtn','vbtn','cbtn'].forEach(i=>$(i).classList.remove('hidden'));$('rideTools').classList.remove('hidden');touch(true);flash('');startAmb(cfg.theme);}
function toMenu(){paused=false;$('pauseLayer').classList.add('hidden');disposeWorld();game=null;clearBubbles();stopAmb();refreshMenu();$('menu').classList.remove('hidden');$('results').classList.add('hidden');['hud','mini','meter','gbtn','sbtn','vbtn','cbtn'].forEach(i=>$(i).classList.add('hidden'));$('rideTools').classList.add('hidden');touch(false);flash('');}
function finish(){const g=game;g.state='done';touch(false);sfxDing(true);if(AU.roll){AU.roll.g.gain.setTargetAtTime(0,AU.ctx.currentTime,0.3);AU.roll=null;}const rec=g.id==='random'?{v:null,fresh:false}:record(g.id+'_'+bikeId,g.time);flash(rec.fresh?'New record':'Finish',1400);
 setTimeout(()=>{if(game!==g)return;$('rTitle').textContent=g.cfg.name;$('rSub').textContent=(rec.fresh?'New record on the ':(g.rec&&g.time>g.rec?`${fmt(g.time-g.rec)} off the record on the `:'Done on the '))+g.spec.name+'.';$('rTotal').textContent=fmt(g.time);$('rRec').textContent=fmt(rec.v);$('results').classList.remove('hidden');},1500);}

const tmpM=new THREE.Matrix4(),tmpQ=new THREE.Quaternion(),tmpV=new THREE.Vector3(),tmpS=new THREE.Vector3(1,1,1),tmpC=new THREE.Color();
function lightRed(g,c){return ((g.time+c.k*0.9)%11)<3.6;}
function putPed(T,i,x,z,h,bob,col,legs,skin,face,pd){tmpS.set(h,h,h);tmpQ.setFromEuler(new THREE.Euler(0,face||0,0));
 tmpV.set(x,0.43*h+bob,z);tmpM.compose(tmpV,tmpQ,tmpS);T.pedLegs.setMatrixAt(i,tmpM);tmpC.setHex(legs);T.pedLegs.setColorAt(i,tmpC);
 const coat=pd&&pd.coat;tmpS.set(h*(coat?1.08:1),h*(coat?1.75:1),h*(coat?1.15:1));tmpV.set(x,(coat?0.85:1.16)*h+bob,z);tmpM.compose(tmpV,tmpQ,tmpS);T.pedBody.setMatrixAt(i,tmpM);tmpC.setHex(col);T.pedBody.setColorAt(i,tmpC);tmpS.set(h,h,h);
 if(pd&&pd.bag&&T.bagI<T.pedMax){const c=Math.cos(face||0),sn=Math.sin(face||0);tmpV.set(x+sn*0.3*h,1.0*h+bob,z+c*0.3*h);tmpM.compose(tmpV,tmpQ,tmpS);T.pedBag.setMatrixAt(T.bagI,tmpM);tmpC.setHex(pd.bag);T.pedBag.setColorAt(T.bagI,tmpC);T.bagI++;}
 if(pd&&pd.hair&&T.bagI<=T.pedMax){tmpV.set(x-Math.cos(face||0)*0.03,1.66*h+bob,z);tmpM.compose(tmpV,tmpQ,tmpS);T.pedHair.setMatrixAt(i,tmpM);tmpC.setHex(pd.hair);T.pedHair.setColorAt(i,tmpC);}else{tmpS.set(0.001,0.001,0.001);tmpM.compose(tmpV,tmpQ,tmpS);T.pedHair.setMatrixAt(i,tmpM);tmpS.set(h,h,h);}
 tmpV.set(x,1.63*h+bob,z);tmpM.compose(tmpV,tmpQ,tmpS);T.pedHead.setMatrixAt(i,tmpM);tmpC.setHex(skin);T.pedHead.setColorAt(i,tmpC);}
function update(dt,rdt){const g=game,p=g.p,T=g.T,w=g.cfg.width,spec=g.spec;g.frame++;const avenue=g.cfg.theme==='avenue';const pool=avenue?'fifth':'park';
 if(g.state==='count'){g.count-=dt;if(g.count>0.6)flash(String(Math.ceil(g.count-0.6)));else{g.state='race';flash('Go',700);}}
 const racing=g.state==='race';if(racing)g.time+=dt;
 const up=racing&&keys.up,down=racing&&keys.down,steerT=racing?(keys.right-keys.left):0;p.steer+=(steerT-p.steer)*Math.min(1,(steerT!==0?3.2:4.5)*dt);
 let fx=Math.cos(p.a),fz=Math.sin(p.a);let fs=p.vx*fx+p.vz*fz,ls=-p.vx*fz+p.vz*fx;
 const nr=nearest(T,p.x,p.z);const off=nr.d>w/2;const drifting=!!(up&&down&&Math.abs(p.steer)>0.3&&Math.abs(fs)>8);
 let draft=false;for(const c of g.traffic){const rx=c.x-p.x,rz=c.z-p.z;const al=rx*fx+rz*fz,lat=-rx*fz+rz*fx;if(al>c.r+1&&al<c.r+14&&Math.abs(lat)<2.4&&c.v>4){draft=true;break;}}p.draft=draft&&fs>6;
 const tm=avenue?1:1.22;let max=27*tm*spec.top*(p.boost>0?1.4:1)*(off?0.5:1)+(p.draft?4:0);let acc=13*tm*spec.acc*(p.boost>0?2:1)*(p.draft?1.3:1);
 if(drifting){p.drift=Math.min(2.6,p.drift+dt*spec.drift);fs+=acc*0.55*dt;}
 else{if(p.drift>0){if(p.drift>0.5){const tier=p.drift>2.1?3:p.drift>1.2?2:1;p.boost=Math.max(p.boost,[0,0.6,1.1,1.7][tier]);flash(['','Mini boost','Super boost','Turbo boost'][tier],800);sfxBoost();}p.drift=0;}
  if(up)fs+=acc*dt;if(down){if(fs>0.5)fs-=24*dt;else{p.revHold+=dt;if(p.revHold>0.45)fs-=5*dt;}}else p.revHold=0;}
 if(p.boost>0){p.boost-=dt;fs+=acc*0.35*dt;}
 fs-=fs*(off?2.2:(up?0.45:0.12))*dt;if(fs>max)fs-=(fs-max)*Math.min(1,6*dt);if(fs<-6)fs=-6;
 p.fs=fs;p.drifting=drifting;p.vx=fx*fs-fz*ls;p.vz=fz*fs+fx*ls;
 const grip=Math.min(1,Math.abs(fs)/6);{const st=Math.sign(p.steer)*Math.pow(Math.abs(p.steer),1.5);const hs=1-0.3*Math.min(1,Math.abs(fs)/27);p.a+=st*1.5*hs*spec.turn*(drifting?1.9:1)*grip*(fs<0?-1:1)*dt;}
 fx=Math.cos(p.a);fz=Math.sin(p.a);fs=p.vx*fx+p.vz*fz;ls=-p.vx*fz+p.vz*fx;ls*=Math.exp(-(drifting?1.6:11)*dt);p.vx=fx*fs-fz*ls;p.vz=fz*fs+fx*ls;
 p.x+=p.vx*dt;p.z+=p.vz*dt;
 const lim=w/2+(avenue?2.5:4.4);const n2=nearest(T,p.x,p.z);
 if(n2.d>lim){const dx=p.x-n2.px,dz=p.z-n2.pz,d=n2.d||1;p.x=n2.px+dx/d*lim;p.z=n2.pz+dz/d*lim;p.vx*=0.45;p.vz*=0.45;if(p.shake<0.05)sfxHit();p.shake=0.25;}
 const si=T.S[Math.min(T.N-1,Math.floor(n2.i))];p.wrong=racing&&(p.vx*si.tx+p.vz*si.tz)<-3;
 if(drifting&&g.frame%3===0){const i=T.skidN%400;T.skidN++;T.skids.count=Math.min(400,T.skidN);tmpQ.setFromEuler(new THREE.Euler(-Math.PI/2,0,-p.a,'YXZ'));tmpV.set(p.x-fx*0.5,0.12,p.z-fz*0.5);tmpS.set(1,1,1);tmpM.compose(tmpV,tmpQ,tmpS);T.skids.setMatrixAt(i,tmpM);T.skids.instanceMatrix.needsUpdate=true;}
 // pedestrians: crossings
 let pedI=0;T.bagI=0;const prev=p.prog;const cur=n2.i;p.prog=cur;
 for(const c of T.crossings){const red=avenue?lightRed(g,c):false;const rate=avenue?(red?1.7:0.15):c.flow*0.45;
  if(avenue&&!red&&c.peds.filter(q=>q.wait).length<5&&Math.random()<0.5*dt){const side=Math.random()<0.5?1:-1;c.peds.push(Object.assign({s:side*(w/2+2.6),dir:-side,wait:true,sp:1.1+Math.random()*1.1,lo:(Math.random()-0.5)*3,h:0.85+Math.random()*0.3,ph:Math.random()*6,said:-99,x:0,z:0},dress(avenue)));}
  if(c.peds.length<12&&Math.random()<rate*dt){const side=Math.random()<0.5?1:-1;c.peds.push(Object.assign({s:side*(w/2+3.5),dir:-side,sp:1.1+Math.random()*1.1,lo:(Math.random()-0.5)*3,h:0.85+Math.random()*0.3,ph:Math.random()*6,said:-99,x:0,z:0},dress(avenue)));}
  let busy=0;const rx=-c.tz,rz=c.tx;
  for(let k=c.peds.length-1;k>=0;k--){const pd=c.peds[k];if(pd.wait&&red)pd.wait=false;if(!pd.wait)pd.s+=pd.dir*pd.sp*dt;if(Math.abs(pd.s)>w/2+3.6){c.peds.splice(k,1);continue;}if(Math.abs(pd.s)<w/2)busy++;
   pd.x=c.x+rx*pd.s+c.tx*pd.lo;pd.z=c.z+rz*pd.s+c.tz*pd.lo;if(pedI<T.pedMax){putPed(T,pedI++,pd.x,pd.z,pd.h,Math.abs(Math.sin(g.time*8+pd.ph))*0.07,pd.col,pd.legs,pd.skin,Math.atan2(-rz*pd.dir,rx*pd.dir),pd);}
   if(racing&&Math.hypot(p.x-pd.x,p.z-pd.z)<3.2&&fs>4)speak(g,pd,pool,pd.x,pd.z,1.9*pd.h);}
  c.busy=busy>=2;
  if(racing&&prev<c.i&&cur>=c.i&&nr.d<w/2+1){if(c.busy){p.boost=Math.max(p.boost,1.3);flash('Rush hour',700);sfxDing(true);if(!avenue&&g.torches>0){g.torches--;g.slomoT=0.5;}}else{p.boost=Math.max(p.boost,0.55);flash('Crosswalk',500);sfxDing(false);}sfxBoost();}}
 // pedestrians: sidewalk walkers
 for(const wk of T.walkers){wk.t+=wk.dir*wk.sp*dt/T.step;if(T.closed)wk.t=(wk.t+T.N)%T.N;else{if(wk.t>=T.N-2)wk.t=2;if(wk.t<2)wk.t=T.N-3;}
  const q=posOnTrack(T,wk.t,wk.off);wk.x=q.x;wk.z=q.z;if(Math.hypot(q.x-p.x,q.z-p.z)<160&&pedI<T.pedMax)putPed(T,pedI++,q.x,q.z,wk.h,Math.abs(Math.sin(g.time*7+wk.ph))*0.06,wk.col,wk.legs,wk.skin,-q.a+(wk.dir<0?Math.PI:0),wk);
  if(racing&&Math.hypot(p.x-wk.x,p.z-wk.z)<3.4&&fs>4)speak(g,wk,pool,wk.x,wk.z,1.9*wk.h);}
 for(const st of T.statics){if(racing&&Math.hypot(p.x-st.x,p.z-st.z)<7&&fs>4)speak(g,st,'fifth',st.x,st.z,2.2);}
 T.pedLegs.count=T.pedBody.count=T.pedHead.count=T.pedHair.count=pedI;T.pedBag.count=T.bagI;[T.pedLegs,T.pedBody,T.pedHead,T.pedBag,T.pedHair].forEach(x=>{x.instanceMatrix.needsUpdate=true;if(x.instanceColor)x.instanceColor.needsUpdate=true;});
 // ambient chatter from someone up ahead
 g.ambient-=dt;if(racing&&g.ambient<0){g.ambient=2.2+Math.random()*2.5;const cands=[];const test=(o,pl,y)=>{const rx=o.x-p.x,rz=o.z-p.z;const al=rx*fx+rz*fz;if(al>6&&al<40&&Math.abs(-rx*fz+rz*fx)<14&&g.time-o.said>12)cands.push([o,pl,y]);};
  T.walkers.forEach(o=>test(o,pool,1.9*o.h));T.statics.forEach(o=>test(o,'fifth',2.2));T.crossings.forEach(c=>c.peds.forEach(o=>test(o,pool,1.9*o.h)));g.traffic.forEach(o=>test(o,o.say,o.kind==='bus'?3.6:2.4));if(cands.length){const [o,pl,y]=pick(cands);lastSpeak=-9;speak(g,o,pl,o.x,o.z,y);}}
 // lights, cross traffic, dynamic guide
 if(avenue){const gc=T.guide.geometry.attributes.color;
  T.lights.forEach(L=>{const red=lightRed(g,L.c);L.lamp.material.color.setHex(red?0xff2222:0x22ff66);L.lamp.material.emissive.setHex(red?0x881111:0x11772f);
   if(red&&!L.wasRed){L.queue=1+Math.floor(Math.random()*3);L.next=0.4+Math.random()*0.8;}L.wasRed=red;if(red&&L.queue>0){L.next-=dt;const dir=L.c.k%2?1:-1;const sx=-dir*46;const clear=!g.cross.some(c=>Math.abs(c.z-L.c.z)<6&&Math.abs(c.x-sx)<14);if(L.next<=0&&clear){L.queue--;L.next=2.4+Math.random()*1.4;let m=g.pool.pop();if(!m)m=carMesh(pick(['cab','sedan','suv','sedan']));g.world.add(m);g.cross.push({x:sx,z:L.c.z+(Math.random()<0.5?-3.5:3.5),dir,sp:9.5+Math.random()*3.5,mesh:m,k:L.c.k});}}});
  for(const c of T.crossings){const dz=c.z-p.z;if(dz>-4&&dz<14&&!c.slo&&fs>10&&g.cross.some(x=>x.k===c.k&&Math.abs(x.x-p.x)<26)){c.slo=true;if(g.torches>0){g.torches--;g.slomoT=0.6;g.swivelC=c;g.swivelUntil=g.time+1.8;flash('Torch sight',600);}}if(Math.abs(dz)>40)c.slo=false;}
  // torch sweep: as a red light approaches, the camera swivels toward the side the cross traffic comes from
  {let sw=0,side=0;for(const c of T.crossings){const dz=c.z-p.z;if(g.swivelC===c&&g.time<g.swivelUntil&&dz>-2&&dz<44){const u=1-dz/44;sw=Math.sin(u*Math.PI)*Math.min(1,u*2.5);side=c.k%2?1:-1;break;}}g.swivelT=sw*side*0.42;}
  g.swivel=(g.swivel||0)+((g.swivelT||0)-(g.swivel||0))*Math.min(1,3.5*rdt);
  for(let k=g.cross.length-1;k>=0;k--){const c=g.cross[k];c.x+=c.dir*c.sp*dt;c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.dir>0?0:Math.PI;if(Math.abs(c.x)>48){g.world.remove(c.mesh);g.pool.push(c.mesh);g.cross.splice(k,1);continue;}
   const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz);if(d<2.6&&racing){const sp=Math.hypot(p.vx,p.vz);p.vx=p.vx*0.2+dx/(d||1)*Math.max(3,sp*0.4);p.vz=p.vz*0.2+dz/(d||1)*Math.max(3,sp*0.4);p.shake=0.4;flash('Cross traffic!',600);sfxHit();honk(g,c,false);}}
  for(let i=0;i<T.N;i++){let col=[0.13,0.77,0.37];for(const c of T.crossings){const d=(c.i-i)*T.step;if(d>-2&&d<75&&lightRed(g,c)){col=d<34?[0.94,0.27,0.27]:[0.98,0.8,0.08];break;}}gc.setXYZ(i*2,col[0],col[1],col[2]);gc.setXYZ(i*2+1,col[0],col[1],col[2]);}gc.needsUpdate=true;}
 // traffic
 for(const c of g.traffic){let target=c.sp;
  if(!c.parked){if(avenue){const nextK=Math.ceil((c.t*T.step+1)/g.cfg.block);const cz=nextK*g.cfg.block;const cr=T.crossings[nextK-1];if(cr&&lightRed(g,cr)){const dist=cz-c.t*T.step;if(dist>0&&dist<10)target=0;}
    for(const o of g.traffic){if(o===c||Math.abs(o.off-c.off)>2.2)continue;const gap=(o.t-c.t)*T.step;if(gap>0&&gap<o.r+c.r+2.5)target=Math.min(target,o.parked?0:o.v*0.9);}}
   else{for(const o of g.traffic){if(o===c||Math.abs(o.off-c.off)>1.5)continue;let gap=(o.t-c.t)*T.step;if(T.closed&&gap<-T.total/2)gap+=T.total;if(gap>0&&gap<o.r+c.r+2)target=Math.min(target,o.v*0.95);}}
   c.v+=(target-c.v)*Math.min(1,3*dt);c.t+=c.v*dt/T.step;if(T.closed)c.t=(c.t+T.N)%T.N;else if(c.t>=T.N-3)c.t=2;}
  const q=posOnTrack(T,c.t,c.off);c.x=q.x;c.z=q.z;c.mesh.position.set(c.x,c.kind==='runner'?Math.abs(Math.sin(g.time*9+c.mesh.userData.bob))*0.08:0,c.z);c.mesh.rotation.y=-q.a;if(c.kind==='runner'&&Math.hypot(c.x-p.x,c.z-p.z)<120)c.mesh.userData.run(g.time+c.mesh.userData.bob);if(c.mesh.userData.anim&&Math.hypot(c.x-p.x,c.z-p.z)<120){c.mesh.userData.anim(c.v,dt);c.mesh.userData.wl.rotation.z-=c.v*dt/0.36;c.mesh.userData.wr.rotation.z-=c.v*dt/0.36;}
  const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz);
  if(d<c.r+0.6&&racing){const sp=Math.hypot(p.vx,p.vz);p.vx=p.vx*0.3+dx/(d||1)*Math.max(3,sp*0.4);p.vz=p.vz*0.3+dz/(d||1)*Math.max(3,sp*0.4);p.shake=0.35;flash({runner:'Runner!',bike:'On your left!',pedicab:'Pedicab!',horse:'Whoa!',cab:'Cab!',sedan:'Car!',suv:'SUV!',bus:'Bus!',foodtruck:'Halal cart!'}[c.kind],500);sfxHit();if(avenue&&!c.parked)honk(g,c,c.kind==='bus');}
  else if(d<c.r+3.5&&racing&&fs>6)speak(g,c,c.say,c.x,c.z,c.kind==='bus'?3.6:c.kind==='foodtruck'?3.3:2.4);}
 p.shake=Math.max(0,p.shake-dt);
 if(racing){if(T.closed){const cp=Math.floor(n2.i/(T.N/4))%4;if(cp===g.expected){if(cp===0)finish();g.expected=(cp+1)%4;}}else if(n2.i>=T.N-3)finish();}
 g.bike.position.set(p.x,0,p.z);g.bike.rotation.y=-p.a;const lean=p.steer*0.42*grip+(drifting?p.steer*0.25:0);g.bike.rotation.x+=(lean-g.bike.rotation.x)*Math.min(1,4*dt);
 g.bike.userData.wl.rotation.z-=fs*dt/0.36;g.bike.userData.wr.rotation.z-=fs*dt/0.36;g.bike.userData.anim(fs,dt);
 const cam=g.cam;const spd=Math.abs(fs);const shx=p.shake?(Math.random()-0.5)*0.5*p.shake:0;const fish=(1-(g.tScale||1))/0.72*7+Math.abs(g.swivel||0)*6;let fovT;const sv=g.swivel||0,lx=fx*Math.cos(sv)-(-fz)*Math.sin(sv)*0+(-fz)*Math.sin(sv),lz=fz*Math.cos(sv)+fx*Math.sin(sv);
 if(camMode==='cine'){const cn=g.cine||(g.cine={t:0,shot:2});cn.t-=rdt;const rx=-fz,rz=fx;
  if(cn.t<=0){cn.shot=(cn.shot+1)%3;cn.t=cn.shot===0?7:4.5;if(cn.shot===0){const q=posOnTrack(T,Math.min(T.N-1,n2.i+9),(Math.random()<0.5?1:-1)*(w/2+3.5));cn.x=q.x;cn.z=q.z;cn.y=1.3+Math.random()*1.5;}cn.side=Math.random()<0.5?1:-1;}
  if(cn.shot===0){if((p.x-cn.x)*fx+(p.z-cn.z)*fz>10)cn.t=0;camera.position.set(cn.x,cn.y,cn.z);camera.lookAt(p.x,1.0,p.z);fovT=34;}
  else if(cn.shot===1){camera.position.set(p.x+rx*cn.side*3.2-fx*0.8+shx,0.55,p.z+rz*cn.side*3.2-fz*0.8);camera.lookAt(p.x,1.3,p.z);fovT=68;}
  else{camera.position.set(p.x+fx*6.5+rx*cn.side*1.2,2.0+Math.sin(g.time*0.7)*0.3,p.z+fz*6.5+rz*cn.side*1.2);camera.lookAt(p.x-fx*2,1.0,p.z-fz*2);fovT=52;}
  cam.x=camera.position.x;cam.y=camera.position.y;cam.z=camera.position.z;}
 else{const close=camMode==='close';const dist=close?3.7+spd*0.024:5.2+spd*0.03,hgt=close?1.72+spd*0.005:2.35+spd*0.01;const tx=p.x-fx*dist-fz*0.48,tz=p.z-fz*dist+fx*0.48;const k=1-Math.exp(-6*dt);
  cam.x+=(tx-cam.x)*k;cam.z+=(tz-cam.z)*k;cam.y+=(hgt-cam.y)*k;
  camera.position.set(cam.x+shx,cam.y,cam.z+shx);const la=close?5+spd*0.15:5+spd*0.15;camera.lookAt(p.x+lx*la,close?1.05:1.2,p.z+lz*la);fovT=(close?53:58)+spd*0.24+(p.boost>0?12:0);}
 camera.fov+=((fovT+fish)-camera.fov)*Math.min(1,(fish>1?14:4)*rdt);camera.updateProjectionMatrix();T.sky.position.copy(camera.position);
 if(g.cfg.theme==='park'){T.sun.position.set(p.x-150+fx*30,52,p.z+40+fz*30);}else T.sun.position.set(p.x-40+fx*30,110,p.z+60+fz*30);T.sun.target.position.set(p.x+fx*30,0,p.z+fz*30);T.sun.target.updateMatrixWorld();
 polishTick(g,rdt);torchTick(g,dt,rdt);updateBubbles(rdt);audioTick(g,dt,fs,drifting);
 $('time').textContent=fmt(g.time);if(racing){const frac=n2.i/T.N;$('split').textContent=frac>0.05?`${Math.round(frac*100)}% of the way`:'';}
 $('kmh').innerHTML=Math.round(Math.abs(fs)*2.4)+' <small>km/h</small>';$('vig').style.opacity=Math.min(1,Math.max(0,(spd-12)/22))*(p.boost>0?1:0.7);$('drift').firstElementChild.style.width=(p.drift/2.6*100)+'%';
 const st=$('state');st.style.color='';
 if(g.state!=='race')st.textContent='';else if(p.wrong){st.textContent='Wrong way';st.style.color='#ff6b6b';}else if(p.boost>0){st.textContent='Boost';st.style.color='#ff8a3d';}else if(drifting){st.textContent='Drift';st.style.color='#ffcc33';}else if(p.draft){st.textContent='Draft';st.style.color='#8ee0b0';}else if(off){st.textContent=avenue?'Sidewalk':'Path';st.style.color='#9aa1ab';}else st.textContent='';
 const b=T.bbox,pad=10,sc=Math.min(120/(b.maxX-b.minX||1),120/(b.maxZ-b.minZ||1));const mx=x=>pad+(x-b.minX)*sc,my=z=>pad+(z-b.minZ)*sc;
 mctx.clearRect(0,0,140,140);mctx.fillStyle='rgba(10,12,16,.6)';mctx.fillRect(0,0,140,140);mctx.beginPath();for(let i=0;i<T.N;i+=3){i?mctx.lineTo(mx(T.S[i].x),my(T.S[i].z)):mctx.moveTo(mx(T.S[i].x),my(T.S[i].z));}if(T.closed)mctx.closePath();mctx.strokeStyle='#aaa';mctx.lineWidth=3;mctx.stroke();
 mctx.fillStyle='#f5c518';for(const c of g.traffic)mctx.fillRect(mx(c.x)-1.5,my(c.z)-1.5,3,3);mctx.fillStyle='#fff';mctx.beginPath();mctx.arc(mx(p.x),my(p.z),4,0,7);mctx.fill();
}
function loop(ts){const rdt=Math.min(0.05,((ts-last)||16)/1000);last=ts;if(game&&!paused){const g=game;g.slomoT=Math.max(0,(g.slomoT||0)-rdt);const target=g.slomoT>0?0.28:1;g.tScale=(g.tScale||1)+(target-(g.tScale||1))*Math.min(1,(target<1?10:4)*rdt);update(rdt*g.tScale,rdt);renderPolished();}requestAnimationFrame(loop);}
let paused=false;
function togglePause(){if(!game||game.state==='done')return;paused=!paused;Object.keys(keys).forEach(k=>keys[k]=0);$('pauseLayer').classList.toggle('hidden',!paused);if(AU.ctx)AU.master.gain.setTargetAtTime(paused?0:(AU.on?0.9:0),AU.ctx.currentTime,0.08);}
function disposeWorld(){if(!scene)return;const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.userData.transientTextures)o.userData.transientTextures.forEach(t=>t.dispose());if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());if(scene.environment)scene.environment.dispose();if(game&&game.T.sun.shadow.map)game.T.sun.shadow.map.dispose();renderer.renderLists.dispose();}
