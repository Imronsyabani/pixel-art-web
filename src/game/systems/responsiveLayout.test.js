import test from 'node:test';
import assert from 'node:assert/strict';
import{getInitialSoundEnabled,getResponsiveCameraZoom,getResponsiveHudLayout,getResponsiveJoystickLayout}from'./responsiveLayout.js';
test('camera zoom fits portrait and landscape sizes within safe limits',()=>{
 assert.equal(getResponsiveCameraZoom(960,540),1);
 assert.ok(getResponsiveCameraZoom(390,844)>=0.35);
 assert.ok(getResponsiveCameraZoom(1920,1080)<=1.25);
});
test('joystick stays within viewport for small and large screens',()=>{
 for(const[w,h]of[[360,740],[390,844],[1920,1080]]){
  const p=getResponsiveJoystickLayout(w,h);
  assert.ok(p.x-p.radius>=0);
  assert.ok(p.y+p.radius<=h);
 }
});
test('HUD uses compact typography on narrow screens',()=>{
 const mobile=getResponsiveHudLayout(390,844),desktop=getResponsiveHudLayout(1366,768);
 assert.equal(mobile.compact,true);assert.equal(desktop.compact,false);
 assert.ok(mobile.titleSize<desktop.titleSize);
});
test('sound URL setting overrides saved preference',()=>{
 assert.equal(getInitialSoundEnabled('?sound=false','on'),false);
 assert.equal(getInitialSoundEnabled('?sound=true','off'),true);
 assert.equal(getInitialSoundEnabled('','off'),false);
 assert.equal(getInitialSoundEnabled('',null),true);
});
