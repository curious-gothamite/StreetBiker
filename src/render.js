// Street Biker: Post-processing, environment lighting, night lamps, torches, per-frame polish.
'use strict';
const postTarget=new THREE.WebGLRenderTarget(W,H,{depthBuffer:true});
postTarget.texture.encoding=THREE.sRGBEncoding;
const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const postMaterial=new THREE.ShaderMaterial({uniforms:{frame:{value:postTarget.texture},pixel:{value:new THREE.Vector2(1/W,1/H)},night:{value:0},speed:{value:0},boost:{value:0},time:{value:0}},depthTest:false,depthWrite:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform sampler2D frame;uniform vec2 pixel;uniform float night;uniform float speed;uniform float boost;uniform float time;varying vec2 vUv;
 float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec2 uv=vUv;vec2 toC=uv-vec2(.5,.47);float r=length(toC);
 // radial motion blur, only away from the centre and only at speed
 float mb=(smoothstep(.35,1.,speed)*.55+boost*.8)*smoothstep(.12,.7,r);vec3 c=vec3(0.);const int N=6;for(int i=0;i<N;i++){float t=float(i)/float(N-1);vec2 o=toC*(-mb*.06*t);c+=texture2D(frame,uv+o).rgb;}c/=float(N);
 // slight chromatic split at the edges
 float ca=(.0025+boost*.003)*smoothstep(.3,.9,r);c.r=texture2D(frame,uv+toC*ca).r;c.b=texture2D(frame,uv-toC*ca).b;
 vec3 bloom=vec3(0.);for(int i=0;i<8;i++){float a=float(i)*0.785398;vec2 d=vec2(cos(a),sin(a))*pixel*6.;vec3 s1=texture2D(frame,uv+d).rgb;bloom+=max(s1-vec3(.7),0.);bloom+=max(texture2D(frame,uv+d*3.2).rgb-vec3(.76),0.);bloom+=max(texture2D(frame,uv+d*7.).rgb-vec3(.85),0.)*.6;}
 c+=bloom*(.075+night*.1);vec3 tint=mix(vec3(1.03,1.,.94),vec3(.95,1.01,1.07),night);c*=tint;
 // gentle contrast curve
 c=mix(c,c*c*(3.-2.*c),.25);
 float edge=smoothstep(.25,.8,length((uv-.5)*vec2(1.,.8)));c*=1.-edge*(.16+speed*.06);
 c+=(hash(uv*vec2(1920.,1080.)+time)-.5)*(.012+night*.014);
 gl_FragColor=vec4(c,1.);}`});
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMaterial));
function renderPolished(){const pr=renderer.getPixelRatio(),rw=Math.round(W*pr),rh=Math.round(H*pr);if(postTarget.width!==rw||postTarget.height!==rh){postTarget.setSize(rw,rh);postMaterial.uniforms.pixel.value.set(1/rw,1/rh);}postMaterial.uniforms.night.value=game.T.night?1:0;postMaterial.uniforms.speed.value=Math.min(1,Math.abs(game.p.fs)/33);postMaterial.uniforms.boost.value=game.p.boost>0?Math.min(1,game.p.boost*1.5):0;postMaterial.uniforms.time.value=(performance.now()%10000)/1000;renderer.setRenderTarget(postTarget);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}
function environment(night){const images=[];for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,night?'#10203e':'#7d9fa5');g.addColorStop(.5,night?'#536072':'#ffe1ad');g.addColorStop(1,night?'#080b16':'#4b5940');x.fillStyle=g;x.fillRect(0,0,128,128);if(night){x.fillStyle='#ffcf7d';for(let j=0;j<14;j++)x.fillRect((j*29+i*13)%128,35+(j*7)%45,3,30);}images.push(c);}const cube=new THREE.CubeTexture(images);cube.encoding=THREE.sRGBEncoding;cube.needsUpdate=true;return cube;}
function enhanceWorld(g){const night=g.T.night;renderer.toneMappingExposure=night?.88:.90;scene.environment=environment(night);
 // Soft contact beneath the rider, not a second realtime shadow map.
 const contact=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.25),new THREE.MeshBasicMaterial({map:TEX.glare,color:0x000000,transparent:true,opacity:.55,depthWrite:false}));contact.rotation.x=-Math.PI/2;g.world.add(contact);g.contact=contact;
 const mats=new Set();g.world.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));});mats.forEach(m=>{if(m.color)m.color.convertSRGBToLinear();if(m.emissive)m.emissive.convertSRGBToLinear();});g.cull=[];g.world.children.forEach(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry){o.geometry.computeBoundingSphere();if(o.geometry.boundingSphere.radius<190)g.cull.push(o);}});
 if(night){g.fill=new THREE.PointLight(0xb9dfff,1.5,24,2);scene.add(g.fill);
  const reflect=new THREE.MeshBasicMaterial({map:TEX.glow,color:0xe84935,transparent:true,opacity:.19,depthWrite:false,blending:THREE.AdditiveBlending});
  g.traffic.forEach(c=>{if(!['cab','sedan','suv','bus'].includes(c.kind))return;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.7,7),reflect);m.rotation.x=-Math.PI/2;g.world.add(m);c.reflection=m;});
  for(let z=18;z<g.cfg.length;z+=g.cfg.block){[-1,1].forEach(sd=>{const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glare,color:0xc9e7ff,transparent:true,opacity:.56,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.set(sd*(g.cfg.width/2+4.5),6.9,z);halo.scale.set(3,3,1);g.world.add(halo);});}

 }
}
function lampTick(g){const T=g.T,p=g.p;if(!T.night)return;if(!T.lampLights){T.lampLights=[];for(let k=0;k<4;k++){const l=new THREE.PointLight(0xffd9a0,1.6,26,2);scene.add(l);T.lampLights.push(l);}}const B=g.cfg.block,w=g.cfg.width;const k0=Math.round((p.z-18)/B);const spots=[];for(let k=k0-1;k<=k0+1;k++){const z=18+k*B;spots.push([w/2+4.5,z],[-w/2-4.5,z]);}spots.sort((a,b)=>Math.hypot(a[0]-p.x,a[1]-p.z)-Math.hypot(b[0]-p.x,b[1]-p.z));T.lampLights.forEach((l,i)=>{const sp=spots[i];if(sp)l.position.set(sp[0],6.6,sp[1]);});}
function torchTick(g,dt,rdt){lampTick(g);const T=g.T,p=g.p;if(g.torches===undefined)g.torches=0;for(const t of T.torches){t.t+=rdt;if(t.taken){t.resp-=rdt;if(t.resp<=0){t.taken=false;t.mesh.visible=true;}continue;}t.mesh.rotation.y+=rdt*1.6;t.mesh.position.y=0.1+Math.sin(t.t*2.2)*0.12;const f=0.85+Math.sin(t.t*17)*0.1+Math.sin(t.t*31)*0.06;t.fl.scale.set(0.9*f,1.8*f,1);t.ring.material.opacity=0.6+0.4*Math.sin(t.t*4);t.ring.material.transparent=true;
  if(g.state==='race'&&Math.hypot(p.x-t.x,p.z-t.z)<2.3){t.taken=true;t.resp=25;t.mesh.visible=false;g.torches=Math.min(3,g.torches+1);flash('Torch +1',600);sfxDing(false);}}
 $('torch').textContent='🔥'.repeat(g.torches)+'·'.repeat(3-g.torches);}
function polishTick(g,dt){const p=g.p;g.contact.position.set(p.x,.19,p.z);g.contact.rotation.z=p.a;
 if(g.frame%10===0)g.cull.forEach(o=>{o.visible=Math.hypot(o.position.x-p.x,o.position.z-p.z)<(g.T.night?440:620)+o.geometry.boundingSphere.radius;});
 if(g.fill)g.fill.position.set(p.x,4,p.z+3);
 g.traffic.forEach(c=>{if(c.reflection){c.reflection.position.set(c.x,.155,c.z-3.5);c.reflection.visible=Math.hypot(c.x-p.x,c.z-p.z)<160;}});
 if(g.frame%15===0&&g.T.night){const block=Math.max(51,96-Math.floor(p.z/g.cfg.block));$('location').textContent='FIFTH AVENUE / E '+block+' ST';}
}
