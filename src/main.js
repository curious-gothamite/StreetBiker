// Street Biker: Entry point: QA hook and first frame. Loaded last.
'use strict';
// Local QA hook: read state and exercise finish/restart without modifying saved records.
if(new URLSearchParams(location.search).has('qa'))window.streetBikerQA={get game(){return game;},step:(dt)=>update(dt,dt),keys,render:renderPolished,get renderer(){return renderer;},get paused(){return paused;},start:(id)=>{trackId=id;start();},finish:()=>finish()};

requestAnimationFrame(loop);
