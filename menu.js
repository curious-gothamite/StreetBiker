// Street Biker: Garage menu, records, HUD buttons, pause buttons.
'use strict';
let bikeId='red',riderId='joe',trackId='park',guideOn=true,camMode='close';
function record(id,v){try{const k='sb14_rec_'+id;const cur=parseFloat(localStorage.getItem(k));if(v!=null&&(isNaN(cur)||v<cur)){localStorage.setItem(k,v);return{v,fresh:true};}return{v:isNaN(cur)?null:cur,fresh:false};}catch(e){return{v:null,fresh:false};}}
function fmt(s){if(s==null)return'—';const m=Math.floor(s/60),ss=Math.floor(s%60),hh=Math.floor((s*100)%100);return`${m}:${String(ss).padStart(2,'0')}.${String(hh).padStart(2,'0')}`;}
const rl=$('riderList');
Object.entries(RIDERS).forEach(([id,r])=>{const el=document.createElement('button');el.className='bike rider'+(id===riderId?' sel':'');el.innerHTML=`<img src="${RIDER_IMG[id]}" alt=""><b>${r.name}</b><small>${r.desc}</small>`;el.onclick=()=>{riderId=id;document.querySelectorAll('.rider').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');};rl.appendChild(el);});
const bl=$('bikeList');
Object.entries(BIKES).forEach(([id,b])=>{const el=document.createElement('button');el.className='bike'+(id===bikeId?' sel':'');el.innerHTML=`<img src="${BIKE_IMG[id]}" alt=""><b>${b.name}</b><small>${b.desc}</small>`;
 el.onclick=()=>{bikeId=id;document.querySelectorAll('#bikeList .bike').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');refreshMenu();};bl.appendChild(el);});
const tl=$('trackList');
function refreshMenu(){tl.innerHTML='';Object.entries(TRACKS).forEach(([id,t])=>{const b=document.createElement('button');b.className='track route-'+id;const r=id==='random'?null:record(id+'_'+bikeId).v;b.innerHTML=`<span><b>${t.name}</b><small>${t.desc}</small></span><span class="rec">${r?'Record<br>'+fmt(r):''}</span>`;b.onclick=()=>{trackId=id;start();};b.onmouseenter=()=>{$('menu').dataset.preview=id;};b.onfocus=()=>{$('menu').dataset.preview=id;};tl.appendChild(b);});}
refreshMenu();
$('guideChk').onchange=e=>setGuide(e.target.checked);$('gbtn').onclick=()=>setGuide(!guideOn);
function setGuide(v){guideOn=v;$('guideChk').checked=v;$('gbtn').textContent='Guide: '+(v?'on':'off');if(game)game.T.guide.visible=v;}
$('again').onclick=()=>start();$('toMenu').onclick=toMenu;$('sbtn').onclick=()=>setSound(!AU.on);$('vbtn').onclick=()=>setVoice(!AU.voiceOn);$('sfxChk').onchange=e=>setSound(e.target.checked);$('voiceChk').onchange=e=>setVoice(e.target.checked);$('cbtn').onclick=cycleCam;function cycleCam(){camMode={close:'far',far:'cine',cine:'close'}[camMode];$('cbtn').textContent='Camera: '+{close:'rider',far:'wide',cine:'cinematic'}[camMode];}

$('pauseBtn').onclick=togglePause;$('resumeBtn').onclick=togglePause;$('garageBtn').onclick=toMenu;$('pauseGarage').onclick=toMenu;
