// Street Biker: NPC kinds, outfits, and traffic spawning.
'use strict';
const KIND={
 runner:{r:0.7,sp:[3,4.5],lane:'edge',mesh:runnerMesh,say:'park'},
 bike:{r:1.1,sp:[8,12],lane:'mid',mesh:()=>{if(Math.random()<0.45)return bikeMesh({style:'hybrid',frame:0x141414,fork:0x141414,rimR:0x1a1a1a,rimF:0x1a1a1a,tape:0x111,shirt:0x1a1a1c,pants:0x1d1d22,skin:pick(SKIN),hair:0x111111,curly:false,lean:-0.3});const c=pick(PALETTE);return bikeMesh({style:pick(['road','road','fixie','citi']),frame:c,fork:c,rimR:pick([0x1a1a1a,0x1a1a1a,0x39ff14,0xff6a1a]),rimF:0x1a1a1a,saddle:0x111,tape:pick([0x111,0xffffff,0xff6a1a]),shirt:pick(PALETTE),pants:pick(LEGS),skin:pick(SKIN),hair:pick([0x2b1d12,0x111,0xc9a05a,0x6b3a2a]),lean:-0.2-Math.random()*0.4});},say:'biker'},
 pedicab:{r:1.6,sp:[5,6.5],lane:'mid',mesh:pedicabMesh,say:'park'},horse:{r:2.4,sp:[3.5,4.2],lane:'mid',mesh:horseMesh,say:'park'},
 cab:{r:2.5,sp:[11,15],lane:'avenue',mesh:()=>carMesh('cab'),say:'driver'},sedan:{r:2.5,sp:[10,14],lane:'avenue',mesh:()=>carMesh('sedan'),say:'fifth'},suv:{r:2.8,sp:[11,15],lane:'avenue',mesh:()=>carMesh('suv'),say:'fifth'},
 bus:{r:5.6,sp:[8,10],lane:'right',mesh:()=>carMesh('bus'),say:'bus'},foodtruck:{r:3.6,sp:[0,0],lane:'curb',mesh:()=>carMesh('foodtruck'),say:'fifth',parked:true}};
function dress(avenue){if(avenue&&Math.random()<0.7)return{coat:true,col:pick(COATS),legs:pick([0x3f5f96,0x222,0x1d2a44]),skin:pick(SKIN),bag:Math.random()<0.6?pick(BAGS):null,hair:pick([0x6b3a2a,0x2b1d12,0xc9a05a,0x111111,0x8a4a1a])};return{col:pick(PALETTE),legs:pick(LEGS),skin:pick(SKIN),bag:Math.random()<0.25?pick(BAGS):null,hair:Math.random()<0.5?pick([0x6b3a2a,0x2b1d12,0xc9a05a,0x111111]):null};}
function makeTraffic(T,cfg,world){const list=[];const w=cfg.width;let n=0;cfg.traffic.forEach(([k,c])=>n+=c);let idx=0;
 cfg.traffic.forEach(([kind,count])=>{for(let k=0;k<count;k++){const K=KIND[kind];const m=K.mesh();world.add(m);
  const lane=K.lane==='edge'?(idx%2?1:-1)*(w/2-1.1):K.lane==='avenue'?[-w/3,0,w/3][idx%3]:K.lane==='right'?w/3:K.lane==='curb'?w/2-1.4:(idx%3-1)*(w/3.4);
  const sp=K.sp[0]+Math.random()*(K.sp[1]-K.sp[0]);const t=K.parked?20+k*(T.N-40)/count+Math.random()*20:6+(idx+0.5)/n*(T.N-14);
  list.push({kind,t,off:lane,sp,v:sp,r:K.r,mesh:m,x:0,z:0,say:K.say,said:-99,parked:!!K.parked});idx++;}});return list;}
