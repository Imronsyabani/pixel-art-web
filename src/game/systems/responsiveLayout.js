export const DESIGN_WIDTH=960;
export const DESIGN_HEIGHT=540;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function getResponsiveCameraZoom(width,height){
 if(!(width>0)||!(height>0))return 1;
 return clamp(Math.min(width/DESIGN_WIDTH,height/DESIGN_HEIGHT),0.35,1.25);
}
export function getResponsiveJoystickLayout(width,height){
 const radius=clamp(Math.min(width*0.14,height*0.14),38,56);
 const margin=clamp(Math.min(width,height)*0.04,14,28);
 return{x:Math.round(margin+radius),y:Math.round(height-margin-radius),radius:Math.round(radius)};
}
export function getResponsiveHudLayout(width,height){
 const shortSide=Math.min(width,height),margin=clamp(shortSide*0.035,12,26);
 return{margin:Math.round(margin),titleSize:Math.round(clamp(shortSide*0.06,20,32)),bodySize:Math.round(clamp(shortSide*0.032,11,17)),compact:width<580};
}
export function getInitialSoundEnabled(search='',storedValue=null){
 const value=new URLSearchParams(search).get('sound');
 if(value==='true')return true;
 if(value==='false')return false;
 return storedValue!=='off';
}
