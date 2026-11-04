function createNoiseBuffer(context,seconds=2){
 const length=Math.floor(context.sampleRate*seconds),buffer=context.createBuffer(1,length,context.sampleRate),data=buffer.getChannelData(0);
 for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*0.55;
 return buffer;
}
function rampGain(context,gain,value,duration=0.18){
 const now=context.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(gain.gain.value,now);gain.gain.linearRampToValueAtTime(value,now+duration);
}
function safeStorage(){try{return globalThis.localStorage??null;}catch{return null;}}
/** Procedural Web Audio ambience; no external files and no autoplay before a user gesture. */
export class AmbientAudio{
 constructor(scene,options={}){
  this.scene=scene;this.enabled=options.enabled??true;this.context=null;this.master=null;this.noiseBuffer=null;
  this.loops=[];this.unlocked=false;this.available=true;this.stepElapsed=0;this.stepInterval=430;this.storage=safeStorage();
  this.unlockHandler=()=>this.unlock();scene.input.on('pointerdown',this.unlockHandler);scene.input.keyboard?.on('keydown',this.unlockHandler);
  this.visibilityHandler=()=>{if(!this.context||!this.enabled)return;if(globalThis.document?.visibilityState==='hidden')this.context.suspend().catch(()=>{});else this.context.resume().catch(()=>{});};
  globalThis.document?.addEventListener('visibilitychange',this.visibilityHandler);
 }
 unlock(){
  if(!this.enabled||this.unlocked||!this.available)return;
  const Ctx=globalThis.AudioContext??globalThis.webkitAudioContext;
  if(!Ctx){this.available=false;return;}
  try{
   this.context=this.context??new Ctx();this.master=this.master??this.context.createGain();
   this.master.gain.value=0;this.master.connect(this.context.destination);
   this.noiseBuffer=this.noiseBuffer??createNoiseBuffer(this.context);
   this.context.resume().catch(()=>{});this.unlocked=true;this.startAmbientLoops();
  }catch{this.available=false;this.unlocked=false;}
 }
 createNoiseLoop({type,frequency,volume,q=0.7}){
  const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain();
  source.buffer=this.noiseBuffer;source.loop=true;filter.type=type;filter.frequency.value=frequency;filter.Q.value=q;gain.gain.value=volume;
  source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.loops.push({source,filter,gain});
 }
 startAmbientLoops(){
  if(!this.enabled||!this.context||this.loops.length)return;
  this.createNoiseLoop({type:'lowpass',frequency:460,volume:0.24});
  this.createNoiseLoop({type:'bandpass',frequency:920,volume:0.045,q:0.45});
  rampGain(this.context,this.master,0.48,0.6);
 }
 stopAmbientLoops(){
  for(const loop of this.loops){try{loop.source.stop();}catch{}loop.source.disconnect();loop.filter.disconnect();loop.gain.disconnect();}
  this.loops.length=0;
 }
 setEnabled(enabled){
  this.enabled=Boolean(enabled);
  try{this.storage?.setItem('cliff-garden-audio',this.enabled?'on':'off');}catch{}
  if(this.enabled){
   this.unlock();
   if(this.context&&this.master){this.context.resume().catch(()=>{});this.startAmbientLoops();rampGain(this.context,this.master,0.48,0.22);}
  }else{
   if(this.context&&this.master)rampGain(this.context,this.master,0,0.12);
   this.stopAmbientLoops();this.stepElapsed=0;
  }
  return this.enabled;
 }
 playFootstep(){
  if(!this.enabled||!this.unlocked||!this.context||!this.master||this.context.state!=='running')return;
  const now=this.context.currentTime,osc=this.context.createOscillator(),toneGain=this.context.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(118+Math.random()*24,now);osc.frequency.exponentialRampToValueAtTime(62,now+0.075);
  toneGain.gain.setValueAtTime(0.0001,now);toneGain.gain.linearRampToValueAtTime(0.11,now+0.008);toneGain.gain.exponentialRampToValueAtTime(0.0001,now+0.085);
  osc.connect(toneGain);toneGain.connect(this.master);osc.start(now);osc.stop(now+0.09);
  const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),noiseGain=this.context.createGain();
  source.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=1450;
  noiseGain.gain.setValueAtTime(0.0001,now);noiseGain.gain.linearRampToValueAtTime(0.045,now+0.006);noiseGain.gain.exponentialRampToValueAtTime(0.0001,now+0.055);
  source.connect(filter);filter.connect(noiseGain);noiseGain.connect(this.master);source.start(now,Math.random()*1.8,0.06);
 }
 updateMovement(deltaMs,moving){
  if(!moving||!this.enabled){this.stepElapsed=0;return;}
  this.stepElapsed+=Math.max(0,Math.min(Number(deltaMs)||0,50));
  if(this.stepElapsed>=this.stepInterval){this.stepElapsed%=this.stepInterval;this.playFootstep();}
 }
 destroy(){
  this.scene.input.off('pointerdown',this.unlockHandler);this.scene.input.keyboard?.off('keydown',this.unlockHandler);
  globalThis.document?.removeEventListener('visibilitychange',this.visibilityHandler);this.stopAmbientLoops();
  if(this.context&&this.context.state!=='closed')this.context.close().catch(()=>{});
  this.context=null;this.master=null;this.noiseBuffer=null;this.unlocked=false;this.scene=null;
 }
}
