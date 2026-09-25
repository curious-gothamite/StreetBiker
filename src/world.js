// Street Biker: Scenery builders and per-theme world assembly (buildWorld).
'use strict';
function ribbon(T,o){const S=T.S,N=T.N;const pos=[],col=[],nor=[],uv=[],idx=[];const segs=T.closed?N:N-1;
 for(let i=0;i<N;i++){const s=S[i];const rx=-s.tz,rz=s.tx;const of=o.offset(i),w=o.width?o.width(i):0;const cx=s.x+rx*of,cz=s.z+rz*of;const v=i*T.step/(o.tile||16);
  if(o.vertical)pos.push(cx,o.y,cz,cx,o.y+o.vertical,cz);else pos.push(cx-rx*w/2,o.y,cz-rz*w/2,cx+rx*w/2,o.y,cz+rz*w/2);
  nor.push(0,1,0,0,1,0);if(o.vertical)uv.push(v,0,v,1);else uv.push(0,v,1,v);const c=o.color?o.color(i):[1,1,1];col.push(c[0],c[1],c[2],c[0],c[1],c[2]);}
 for(let i=0;i<segs;i++){if(o.dash&&Math.floor(i/o.dash)%2)continue;const a=i*2,b=((i+1)%N)*2;idx.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);
 const mat=o.map?new THREE.MeshStandardMaterial({map:o.map,normalMap:o.normal||null,normalScale:new THREE.Vector2(o.nscale||0.6,o.nscale||0.6),side:THREE.DoubleSide,roughness:o.rough!==undefined?o.rough:0.92,metalness:o.metal||0,transparent:!!o.alphaTest,alphaTest:o.alphaTest||0}):new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:!!o.alpha,opacity:o.alpha||1});
 const m=new THREE.Mesh(g,mat);m.receiveShadow=true;return m;}
let NIGHT=false;
function building(world,x,z,w,d,h,kind){const g=new THREE.BoxGeometry(w,h,d);const uvA=g.attributes.uv;const ps=kind==='glass'?[16,32]:[7.5,7.5];for(let i=0;i<uvA.count;i++)uvA.setXY(i,uvA.getX(i)*Math.max(w,d)/ps[0],uvA.getY(i)*h/ps[1]);
 const tex=kind==='glass'?TEX.glass:kind==='brick'?TEX.brick:TEX.limestone;const em=kind==='glass'?tex:kind==='brick'?TEX.brickE:TEX.limestoneE;const side=NIGHT?new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:em,emissiveIntensity:kind==='glass'?0.2:0.55+Math.random()*0.5,roughness:0.85}):new THREE.MeshStandardMaterial({map:tex,roughness:0.9});const roof=new THREE.MeshLambertMaterial({color:kind==='glass'?0x2f3a48:0x6b645a});
 const m=new THREE.Mesh(g,[side,side,roof,roof,side,side]);m.position.set(x,h/2,z);m.castShadow=true;m.receiveShadow=true;world.add(m);
 if(kind!=='glass'&&h<60&&Math.random()<0.5){const c=new THREE.Mesh(new THREE.BoxGeometry(w+1.2,1,d+1.2),new THREE.MeshLambertMaterial({color:0x9a8c74}));c.position.set(x,h,z);world.add(c);}}
function flat(world,x,z,w,d,mat,y,rot){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);m.rotation.x=-Math.PI/2;if(rot)m.rotation.z=rot;m.position.set(x,y||0.02,z);m.receiveShadow=true;world.add(m);return m;}
function ellipse(world,x,z,rx,rz,mat,y){const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),mat);m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.position.set(x,y||0.03,z);m.receiveShadow=true;world.add(m);return m;}
// Continuous atmospheric gradient avoids stretching a non-panoramic reference around a sphere.
function skyDome(night){return new THREE.Mesh(new THREE.SphereGeometry(1400,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{night:{value:night?1:0}},vertexShader:'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 vPos;uniform float night;void main(){float h=normalize(vPos).y;vec3 day=mix(vec3(.86,.67,.43),vec3(.26,.42,.53),smoothstep(0.,.7,h));day=mix(vec3(.38,.37,.27),day,smoothstep(-.3,.03,h));vec3 dark=mix(vec3(.08,.13,.21),vec3(.012,.025,.055),smoothstep(0.,.7,h));gl_FragColor=vec4(mix(day,dark,night),1.);}`}));}
// Clustered, textured tree geometry replaces visibly circular photo cards.
function makeTrees(world,pts){if(!pts.length)return;
 const leaf=ctex(128,128,(x,w,h)=>{x.fillStyle='#607545';x.fillRect(0,0,w,h);for(let i=0;i<1000;i++){const v=35+Math.random()*70;x.fillStyle=`rgb(${v*.85},${v},${v*.55})`;x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,1+Math.random()*4,1+Math.random()*2,Math.random()*6,0,7);x.fill();}});
 world.userData.transientTextures=[leaf];
 const crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({map:leaf,roughness:1}),pts.length*7);
 const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.23,.48,6.5,7),new THREE.MeshStandardMaterial({map:TEX.bark,roughness:1}),pts.length);
 const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),v=new THREE.Vector3(),c=new THREE.Color();let k=0;
 pts.forEach((p,i)=>{const size=.8+p.s*.65;m.makeScale(1,size,1);m.setPosition(p.x,3.25*size,p.z);trunks.setMatrixAt(i,m);for(let j=0;j<7;j++){const th=j*2.4+i;v.set(p.x+Math.cos(th)*(j?2:0)*size,(6.1+(j%3)*1.05)*size,p.z+Math.sin(th)*(j?2:0)*size);sc.set(2.25*size,2.1*size,2.3*size);q.setFromEuler(new THREE.Euler(j,i*.3,j*.8));m.compose(v,q,sc);crowns.setMatrixAt(k,m);c.setHSL(.24+p.s*.025,.22,.39+p.s*.12);crowns.setColorAt(k++,c);}});
 trunks.castShadow=trunks.receiveShadow=crowns.castShadow=crowns.receiveShadow=true;world.add(trunks,crowns);
}
function buildWorld(T){const cfg=T.cfg,w=cfg.width,b=T.bbox;if(cfg.theme!=='random')seedV=17;
 scene=new THREE.Scene();const world=new THREE.Group();scene.add(world);const theme=cfg.theme;const avenue=theme==='avenue';NIGHT=avenue;
 scene.fog=new THREE.Fog(avenue?0x111d30:0xe2c398,avenue?95:140,avenue?440:660);T.sky=skyDome(avenue);scene.add(T.sky);if(!avenue){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glare,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,fog:false}));sp.scale.set(150,150,1);sp.position.set(-640,230,170);T.sky.add(sp);}
 scene.add(new THREE.HemisphereLight(avenue?0x5a6aa8:0xfff2dc,avenue?0x1a1410:0x4a6a3a,avenue?0.68:0.72));
 const sun=new THREE.DirectionalLight(avenue?0x9fb0ff:0xfff0d0,avenue?0.48:1.65);sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);const sc=sun.shadow.camera;sc.left=-70;sc.right=70;sc.top=70;sc.bottom=-70;sc.near=10;sc.far=400;sun.shadow.bias=-0.0008;sun.shadow.normalBias=0.03;scene.add(sun);scene.add(sun.target);T.sun=sun;
 const grassMat=new THREE.MeshStandardMaterial({map:TEX.grass,roughness:1});const waterMat=new THREE.MeshStandardMaterial({map:TEX.water,roughness:0.25,metalness:0.1});const dirtMat=new THREE.MeshLambertMaterial({color:0xc9985a});const lawnMat=new THREE.MeshLambertMaterial({color:0x7fbb52});
 flat(world,(b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,6000,6000,avenue?new THREE.MeshStandardMaterial({map:TEX.asphaltDark,roughness:0.5,metalness:0.15}):grassMat,0);T.night=avenue;
 const trees=[];const inRoad=(x,z,m)=>nearest(T,x,z).d<w/2+(m||5);
 if(theme==='park'){const s=PS;
  ellipse(world,230*s,-220*s,110*s,175*s,waterMat);
  ellipse(world,210*s,160*s,90*s,110*s,lawnMat);[[170,110],[250,110],[170,210],[250,210],[210,160]].forEach(([x,z])=>ellipse(world,x*s,z*s,18*s,18*s,dirtMat,0.04));
  ellipse(world,150*s,440*s,95*s,70*s,waterMat);ellipse(world,215*s,500*s,60*s,40*s,waterMat);
  ellipse(world,130*s,740*s,70*s,60*s,lawnMat);ellipse(world,290*s,1040*s,45*s,30*s,waterMat);
  flat(world,250*s,660*s,14*s,180*s,new THREE.MeshLambertMaterial({color:0xb8a98a}),0.03);
  const fountain=new THREE.Mesh(new THREE.CylinderGeometry(3,4,1.2,12),new THREE.MeshLambertMaterial({color:0xd9d4c7}));fountain.position.set(250*s,0.6,565*s);fountain.castShadow=true;world.add(fountain);
  building(world,395*s,160*s,45*s,150*s,18,'limestone');
  [[-52,(86-75)*40*s],[-52,(86-74.5)*40*s]].forEach(([x,z],i)=>{building(world,x,z-9,14,14,44,'limestone');const sp=new THREE.Mesh(new THREE.ConeGeometry(4,10,6),new THREE.MeshLambertMaterial({color:0x9aa06a}));sp.position.set(x,49,z-9);world.add(sp);});building(world,-52,(86-74.75)*40*s-9,28,20,26,'limestone');
  const skip=[[230,-220,115,180],[210,160,95,115],[150,440,100,75],[215,500,65,45],[130,740,75,65],[290,1040,50,35]];
  for(let k=0;k<1700;k++){const x=rnd()*420*s,z=(-960+rnd()*2040)*s;let ok=true;for(const [cx,cz,rx,rz] of skip){if(Math.hypot((x-cx*s)/(rx*s),(z-cz*s)/(rz*s))<1){ok=false;break;}}if(!ok||inRoad(x,z,6)||(x>370*s&&z>80*s&&z<240*s))continue;trees.push({x,z,s:rnd()});}
  const G=40;for(let gx=-700;gx<1000;gx+=G)for(let gz=-1250;gz<1400;gz+=G){if(gx>-40&&gx<440*s+20&&gz>-960*s-40&&gz<1080*s+40)continue;if(Math.abs(gx-210*s)>720||Math.abs(gz-60)>1150)continue;
   const south=gz>1080*s+40,west=gx<0;const h=south?30+rnd()*120:west?16+rnd()*40:22+rnd()*70;const kind=south?(rnd()<0.6?'glass':'limestone'):rnd()<0.4?'brick':'limestone';building(world,gx+18,gz+18,30,30,h*(rnd()<0.08?1.8:1),kind);}
  const st=new THREE.MeshStandardMaterial({map:TEX.asphaltDark,roughness:1});flat(world,-30,60,44,2000,st,0.01);flat(world,420*s+30,60,44,2000,st,0.01);flat(world,210*s,1080*s+22,600,40,st,0.01);
  const wallT=TEX.ashlar.clone();wallT.needsUpdate=true;wallT.repeat.set(1000,0.6);const wall=new THREE.Mesh(new THREE.BoxGeometry(2,1.2,2000),new THREE.MeshStandardMaterial({map:wallT,roughness:0.9}));wall.position.set(-6,0.6,60);wall.castShadow=true;world.add(wall);const wall2=wall.clone();wall2.position.x=420*s+6;world.add(wall2);
 }else if(avenue){
  const B=cfg.block,L=cfg.length;const parkEnd=(96-59)*B;
  flat(world,-260,parkEnd/2,480,parkEnd+40,grassMat,0.01);
  for(let k=0;k<800;k++){const x=-w/2-16-rnd()*300,z=-20+rnd()*(parkEnd+30);trees.push({x,z,s:rnd()});}
  const wall=new THREE.Mesh(new THREE.BoxGeometry(2,1.2,parkEnd),new THREE.MeshLambertMaterial({color:0x6a6157}));wall.position.set(-w/2-9,0.6,parkEnd/2);wall.castShadow=true;world.add(wall);
  const st=new THREE.MeshStandardMaterial({map:TEX.asphaltDark,roughness:1});for(let zz=0;zz<L;zz+=B)flat(world,0,zz,700,12,st,0.02);
  for(let zz=0;zz<L;zz+=B){for(let col=0;col<4;col++){const x=w/2+6+col*40+20;const h=(zz>parkEnd?40+rnd()*110:24+rnd()*60)*(rnd()<0.08?1.9:1);building(world,x,zz+B/2,32,B-12,h,zz>parkEnd?(rnd()<0.6?'glass':'limestone'):rnd()<0.5?'limestone':'brick');}}
  for(let zz=parkEnd+B;zz<L;zz+=B){for(let col=0;col<4;col++){const x=-w/2-6-(col*40+20);building(world,x,zz+B/2,32,B-12,(40+rnd()*110)*(rnd()<0.08?1.9:1),rnd()<0.6?'glass':'limestone');}}
  const cm=new THREE.MeshStandardMaterial({map:TEX.concrete,roughness:0.6,metalness:0.1,color:0x9a9a9a});flat(world,-w/2-3.5,L/2,7,L,cm,0.05);flat(world,w/2+3.5,L/2,7,L,cm,0.05);
  // double-head lamps with streaks on the wet road, lit storefronts, barricades, lane text
  const lampM=new THREE.MeshLambertMaterial({color:0x2a2c30}),bulbM=new THREE.MeshBasicMaterial({color:0xfff2cc}),streakM=new THREE.MeshBasicMaterial({map:TEX.glow,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.5,color:0xffe6b0});
  for(let zz=18;zz<L;zz+=B){[1,-1].forEach(sd=>{const x=sd*(w/2+4.5);const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,7,6),lampM);pole.position.set(x,3.5,zz);world.add(pole);[0.9,-0.9].forEach(dx=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.08,0.08),lampM);arm.position.set(x,7,zz);world.add(arm);const b=new THREE.Mesh(new THREE.SphereGeometry(0.28,8,6),bulbM);b.position.set(x+dx,6.9,zz);world.add(b);});const st=new THREE.Mesh(new THREE.PlaneGeometry(2.4,16),streakM);st.rotation.x=-Math.PI/2;st.position.set(x-sd*4.2,0.12,zz);world.add(st);});}
  const shopM=new THREE.MeshBasicMaterial({map:TEX.shop,color:0xd7c6a0});for(let zz=0;zz<L;zz+=B){[1,-1].forEach(sd=>{if(sd<0&&zz<parkEnd)return;const sh=new THREE.Mesh(new THREE.BoxGeometry(0.3,3.2,B-16),shopM);sh.position.set(sd*(w/2+6.2),1.7,zz+B/2);world.add(sh);});}
  const barM=new THREE.MeshStandardMaterial({color:0xa8adb5,roughness:0.4,metalness:0.7});const nb=Math.floor(L/2.6);const bar=new THREE.InstancedMesh(new THREE.BoxGeometry(0.06,1.05,2.3),barM,nb*2);const bm=new THREE.Matrix4();let bi=0;for(let k=0;k<nb;k++){const zz=k*2.6+1.3;if((zz%B)<10||(zz%B)>B-10)continue;[1,-1].forEach(sd=>{bm.identity();bm.setPosition(sd*(w/2+2.2),0.55,zz);bar.setMatrixAt(bi++,bm);});}bar.count=bi;world.add(bar);
  const txM=new THREE.MeshBasicMaterial({map:TEX.laneText,transparent:true,depthWrite:false});for(let zz=B*1.5;zz<L;zz+=B*3){const t=new THREE.Mesh(new THREE.PlaneGeometry(6,1.5),txM);t.rotation.x=-Math.PI/2;t.rotation.z=Math.PI/2;t.position.set(w/3,0.125,zz);world.add(t);}
  T.lights=T.crossings.map(c=>{const g=new THREE.Group();const pm=new THREE.MeshLambertMaterial({color:0x333});const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,6,6),pm);pole.position.y=3;g.add(pole);const arm=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,w/2+2),pm);arm.position.set(0,6,-(w/4+1));g.add(arm);
   const head=new THREE.Mesh(new THREE.BoxGeometry(0.6,1.6,0.6),new THREE.MeshLambertMaterial({color:0x222}));head.position.set(0,5.2,-w/4);g.add(head);const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.28,8,8),new THREE.MeshLambertMaterial({color:0x00ff55,emissive:0x00aa33}));lamp.position.set(0,5.2,-w/4-0.4);g.add(lamp);
   g.position.set(w/2+3,0,c.z-3);world.add(g);const g2=g.clone();g2.position.set(-w/2-3,0,c.z-3);g2.rotation.y=Math.PI;world.add(g2);return{lamp,lamp2:g2.children[3],c};});
 }else{
  for(let k=0;k<3;k++)ellipse(world,(rnd()-0.5)*450,(rnd()-0.5)*380,40+rnd()*60,30+rnd()*50,waterMat);
  for(let k=0;k<1500;k++){const x=b.minX-220+rnd()*(b.maxX-b.minX+440),z=b.minZ-220+rnd()*(b.maxZ-b.minZ+440);if(inRoad(x,z,6))continue;trees.push({x,z,s:rnd()});}
  const G=40;for(let gx=b.minX-800;gx<b.maxX+800;gx+=G)for(let gz=b.minZ-800;gz<b.maxZ+800;gz+=G){if(gx>b.minX-220&&gx<b.maxX+220&&gz>b.minZ-220&&gz<b.maxZ+220)continue;building(world,gx+18,gz+18,30,30,(20+rnd()*70)*(rnd()<0.08?1.8:1),rnd()<0.4?'brick':'limestone');}
 }
 if(!avenue){const cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;const skM=new THREE.MeshBasicMaterial({map:TEX.skyline,transparent:true,alphaTest:0.3,fog:false,side:THREE.DoubleSide,color:0xf0c8a8});for(let k=0;k<8;k++){const a=k/8*Math.PI*2;const m=new THREE.Mesh(new THREE.PlaneGeometry(760,190),skM);m.position.set(cx+Math.cos(a)*1180,95,cz+Math.sin(a)*1180);m.lookAt(cx,95,cz);world.add(m);}}
 makeTrees(world,trees);
 const road=avenue?TEX.asphaltDark:TEX.asphaltLight;
 if(!avenue)world.add(ribbon(T,{offset:()=>0,width:()=>w+9,y:0.06,map:TEX.concrete,normal:TEX.concreteN,nscale:0.35,tile:5.5}));
 world.add(ribbon(T,{offset:()=>0,width:()=>w,y:0.1,map:road,normal:avenue?TEX.asphaltDarkN:TEX.asphaltLightN,nscale:avenue?0.5:0.35,tile:5.5,rough:avenue?0.24:0.94,metal:avenue?0.32:0}));if(avenue)world.add(ribbon(T,{offset:()=>w/3,width:()=>w/3-1,y:0.115,map:TEX.busLane,tile:5.5,rough:0.3,metal:0.25}));
 const lineC=()=>[0.95,0.95,0.9];
 if(avenue){[-w/6,w/6].forEach(o=>world.add(ribbon(T,{offset:()=>o,width:()=>0.25,y:0.13,color:lineC,dash:2})));[-w/2+0.5,w/2-0.5].forEach(o=>world.add(ribbon(T,{offset:()=>o,width:()=>0.25,y:0.13,color:lineC})));}
 else{world.add(ribbon(T,{offset:()=>0,width:()=>0.25,y:0.13,color:lineC,dash:3}));world.add(ribbon(T,{offset:()=>w/2-0.4,width:()=>0.22,y:0.13,color:lineC}));[-1,1].forEach(sd=>world.add(ribbon(T,{offset:()=>sd*(w/2+0.9),width:()=>1.8,y:0.135,map:TEX.concrete,tile:1.8,rough:0.8})));
  [-1,1].forEach(sd=>world.add(ribbon(T,{offset:()=>sd*(w/2+4.6),vertical:0.8,y:0,map:TEX.fence,tile:2.4,alphaTest:0.5,rough:0.8})));
  const nl=Math.floor(T.N/16);const post=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1,0.13,5,6),new THREE.MeshLambertMaterial({color:0x2a2a2a}),nl);const lamp=new THREE.InstancedMesh(new THREE.SphereGeometry(0.35,8,6),new THREE.MeshLambertMaterial({color:0xfff2c0,emissive:0x665522}),nl);const m=new THREE.Matrix4();
  for(let k=0;k<nl;k++){const p=posOnTrack(T,k*16,(k%2?1:-1)*(w/2+4.0));m.identity();m.setPosition(p.x,2.5,p.z);post.setMatrixAt(k,m);m.setPosition(p.x,5.1,p.z);lamp.setMatrixAt(k,m);}post.castShadow=true;world.add(post);world.add(lamp);}
 {const s=T.S[T.closed?0:T.N-2];const g=new THREE.PlaneGeometry(2,w,1,8);const cols=[];const p=g.attributes.position;for(let i=0;i<p.count;i++){const yy=p.getY(i);const k=Math.floor((yy+w/2)/(w/8));const c=(k+Math.round(p.getX(i)+1))%2?0.95:0.08;cols.push(c,c,c);}g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.rotation.x=-Math.PI/2;m.rotation.z=-s.h;m.position.set(s.x,0.15,s.z);world.add(m);}
 const cwMat=new THREE.MeshBasicMaterial({map:TEX.crosswalk,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.9});
 T.crossings.forEach(c=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,w*0.95),cwMat);m.rotation.x=-Math.PI/2;m.rotation.z=-c.a;m.position.set(c.x,0.14,c.z);m.receiveShadow=true;world.add(m);});
 // pedestrians (instanced: legs, torso, head)
 T.pedMax=520;const pm=new THREE.MeshLambertMaterial({color:0xffffff});
 T.pedLegs=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16,0.2,0.85,8),new THREE.MeshLambertMaterial({color:0xffffff,map:TEX.denim}),T.pedMax);T.pedBody=new THREE.InstancedMesh(new THREE.BoxGeometry(0.46,0.62,0.28),new THREE.MeshLambertMaterial({color:0xffffff,map:avenue?TEX.wool:TEX.cotton}),T.pedMax);T.pedHead=new THREE.InstancedMesh(new THREE.SphereGeometry(0.17,12,9),new THREE.MeshLambertMaterial({color:0xffffff,map:TEX.faceI}),T.pedMax);T.pedBag=new THREE.InstancedMesh(new THREE.BoxGeometry(0.1,0.34,0.3),pm,T.pedMax);T.pedHair=new THREE.InstancedMesh(new THREE.SphereGeometry(0.19,7,6,0,Math.PI*2,0,Math.PI*0.6),pm,T.pedMax);
 [T.pedLegs,T.pedBody,T.pedHead,T.pedBag,T.pedHair].forEach(x=>{x.count=0;x.castShadow=true;world.add(x);});T.bagI=0;
 // sidewalk walkers
 T.walkers=[];for(let k=0;k<cfg.walkers;k++){const side=k%2?1:-1;T.walkers.push(Object.assign({t:2+Math.random()*(T.N-6),off:side*(w/2+(avenue?3.6:2.4)+Math.random()*(avenue?3:1.6)),dir:Math.random()<0.5?1:-1,sp:1.0+Math.random()*0.9,h:0.85+Math.random()*0.3,ph:Math.random()*6,said:-99,x:0,z:0},dress(avenue)));}
 // food carts on the corners with a vendor
 T.statics=[];if(avenue){T.crossings.forEach((c,i)=>{if(i%5!==2)return;const side=i%2?1:-1;const m=cartMesh();m.position.set(side*(w/2+5.5),0,c.z-7);m.rotation.y=side>0?Math.PI:0;world.add(m);T.statics.push({x:m.position.x,z:m.position.z,mesh:m,said:-99,say:'fifth'});});}
 T.guide=ribbon(T,{offset:i=>T.guideOff[i],width:()=>0.85,y:0.17,color:i=>T.guideCol[i]});T.guide.material=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.46,blending:THREE.NormalBlending,depthWrite:false,side:THREE.DoubleSide});world.add(T.guide);
 // torches: collect to earn a slow-motion look at the next intersection
 T.torches=[];{const every=cfg.theme==='avenue'?26:22;const handleM=new THREE.MeshStandardMaterial({color:0x2a1f14,roughness:0.6,metalness:0.4}),ringM=new THREE.MeshBasicMaterial({color:0xffb347}),flameM=new THREE.SpriteMaterial({map:TEX.flame,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  for(let i=14;i<T.N-12;i+=every){const q=posOnTrack(T,i,(Math.random()-0.5)*w*0.6);const grp=new THREE.Group();const h=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.09,1.1,8),handleM);h.position.y=0.55;grp.add(h);const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.09,0.25,8),handleM);cup.position.y=1.15;grp.add(cup);const ring=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.03,6,24),ringM);ring.rotation.x=-Math.PI/2;ring.position.y=0.06;grp.add(ring);const fl=new THREE.Sprite(flameM);fl.scale.set(0.9,1.8,1);fl.position.y=1.9;grp.add(fl);const halo=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({map:TEX.glare,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.5,color:0xff9a3c}));halo.rotation.x=-Math.PI/2;halo.position.y=0.05;grp.add(halo);grp.position.set(q.x,0.1,q.z);world.add(grp);T.torches.push({x:q.x,z:q.z,mesh:grp,fl,ring,taken:false,t:Math.random()*6});}}
 T.skids=new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2,0.5),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.45}),400);T.skids.count=0;world.add(T.skids);T.skidN=0;
 return world;
}
const COATS=[0xc59a63,0xc59a63,0x1a1a1c,0x2c2c30,0x55575c,0x1d2a44,0x6b4a2a,0xe8e2d8];const BAGS=[0xe8e2d8,0x111111,0x8a6d4b,0xd9d3c4];
const PALETTE=[0xe63946,0xf4a261,0x2a9d8f,0x264653,0x8ecae6,0xffb703,0xffffff,0x6a4c93,0x1d3557,0xf1faee,0x222222,0x9b2226,0x606c38,0xdda15e];
const LEGS=[0x1d2a44,0x222222,0x5b5b5b,0x8a6d4b,0x3a3a50,0xbdb5a8];const SKIN=[0xf3d3b5,0xe6bd9b,0xc68e63,0x8d5a3b,0x5b3a26,0xf0c9a8];
