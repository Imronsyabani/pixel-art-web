import test from 'node:test';
import assert from 'node:assert/strict';
import{AmbientAudio}from'./AmbientAudio.js';
class Emitter{constructor(){this.handlers=new Map();}on(n,f){const s=this.handlers.get(n)??new Set();s.add(f);this.handlers.set(n,s);}off(n,f){this.handlers.get(n)?.delete(f);}}
function mockScene(){const input=new Emitter();input.keyboard=new Emitter();return{input};}
test('audio registers gesture unlock handlers and removes them on destroy',()=>{
 const scene=mockScene(),audio=new AmbientAudio(scene);
 assert.equal(scene.input.handlers.get('pointerdown').size,1);assert.equal(scene.input.keyboard.handlers.get('keydown').size,1);
 audio.destroy();assert.equal(scene.input.handlers.get('pointerdown').size,0);assert.equal(scene.input.keyboard.handlers.get('keydown').size,0);
});
test('footstep timer resets when movement stops or sound is disabled',()=>{
 const audio=new AmbientAudio(mockScene(),{enabled:true});audio.updateMovement(300,true);assert.equal(audio.stepElapsed,300);
 audio.updateMovement(16,false);assert.equal(audio.stepElapsed,0);audio.updateMovement(20,true);
 audio.setEnabled(false);assert.equal(audio.stepElapsed,0);audio.destroy();
});
test('disabled audio does not accumulate footstep events',()=>{
 const audio=new AmbientAudio(mockScene(),{enabled:false});audio.updateMovement(50,true);assert.equal(audio.stepElapsed,0);audio.destroy();
});
