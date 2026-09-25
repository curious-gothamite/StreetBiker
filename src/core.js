// Street Biker: Renderer, camera, resize, shared helpers ($, rnd, pick).
'use strict';
const $=id=>document.getElementById(id);
const canvas=$('c');const mini=$('mini'),mctx=mini.getContext('2d');const bubblesEl=$('bubbles');
let W=innerWidth,H=innerHeight;
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const camera=new THREE.PerspectiveCamera(68,W/H,0.3,2600);let scene=null;
function resize(){W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
let seedV=1;const rnd=()=>{seedV=(seedV*16807)%2147483647;return seedV/2147483647;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
