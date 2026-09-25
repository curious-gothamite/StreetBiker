// Street Biker: Keyboard and touch controls.
'use strict';
const keys={up:0,down:0,left:0,right:0};
const KM={Space:'down',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{const k=KM[e.code];if(k){keys[k]=1;e.preventDefault();}if(e.code==='Escape')toMenu();if(e.code==='KeyP'&&game)togglePause();if(e.code==='KeyR'&&game)start();if(e.code==='KeyG'&&game)setGuide(!guideOn);if(e.code==='KeyM')setSound(!AU.on);if(e.code==='KeyV')setVoice(!AU.voiceOn);if(e.code==='KeyC'&&game)cycleCam();});
addEventListener('blur',()=>{Object.keys(keys).forEach(k=>keys[k]=0);if(game&&game.state==='race'&&!paused)togglePause();});
addEventListener('keyup',e=>{const k=KM[e.code];if(k)keys[k]=0;});
document.querySelectorAll('.tb').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();keys[k]=1;b.classList.add('held');};const off=e=>{e.preventDefault();keys[k]=0;b.classList.remove('held');};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);b.addEventListener('contextmenu',e=>e.preventDefault());});
const coarse=matchMedia('(pointer:coarse)').matches;
function touch(on){document.querySelectorAll('.touch').forEach(t=>t.classList.toggle('on',on&&coarse));}
