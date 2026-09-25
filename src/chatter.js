// Street Biker: Speech bubbles that follow NPCs on screen.
'use strict';
const bubbles=[];let lastSpeak=0;
function speak(g,who,pool,x,z,y){if(bubbles.length||g.time-lastSpeak<0.8||g.time-who.said<12)return;if(window.speechSynthesis&&AU.voiceOn&&speechSynthesis.speaking)return;who.said=g.time;lastSpeak=g.time;const el=document.createElement('div');el.className='bub';const text=pick(LINES[pool]||LINES.park);el.textContent=text;bubblesEl.appendChild(el);const b={el,who,x,z,y:y||2.1,t:0,life:1.6+text.split(' ').length*0.38};bubbles.push(b);say(text,who,Math.hypot(x-g.p.x,z-g.p.z),b);}
function updateBubbles(dt){const v=new THREE.Vector3();for(let k=bubbles.length-1;k>=0;k--){const b=bubbles[k];b.t+=dt;if(b.t>b.life){b.el.remove();bubbles.splice(k,1);continue;}
 const x=b.who.x!==undefined?b.who.x:b.x,z=b.who.z!==undefined?b.who.z:b.z;v.set(x,b.y,z).project(camera);if(v.z>1||Math.abs(v.x)>1.2||Math.abs(v.y)>1.2){b.el.style.opacity=0;continue;}
 b.el.style.left=((v.x+1)/2*W)+'px';b.el.style.top=((1-v.y)/2*H)+'px';b.el.style.opacity=b.t<0.15?b.t/0.15:b.t>b.life-0.4?(b.life-b.t)/0.4:1;}}
function clearBubbles(){bubbles.forEach(b=>b.el.remove());bubbles.length=0;}
