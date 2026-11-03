import { normalizeMovementVector } from './movementMath.js';
export function getFacingDirection(vector,fallback='down'){
 const n=normalizeMovementVector(vector);
 if(n.x===0&&n.y===0)return fallback;
 if(Math.abs(n.x)>Math.abs(n.y))return n.x>0?'right':'left';
 return n.y>0?'down':'up';
}
function within(x,y,r,b){return !b||(x-r>=b.left&&x+r<=b.right&&y-r>=b.top&&y+r<=b.bottom);}
function valid(x,y,r,b,can){return within(x,y,r,b)&&(!can||can(x,y,r));}
/** Swept short substeps prevent tunneling; axis fallback slides along walls. */
export function updateCharacterMovement(sprite,input,deltaMs,options={}){
 const {speed=100,bounds=null,maxDeltaMs=50,canOccupy=null,radius=10,maxSubstep=4}=options;
 const vector=normalizeMovementVector(input);
 const delta=Math.max(0,Math.min(Number(deltaMs)||0,maxDeltaMs));
 const direction=getFacingDirection(vector,sprite.getData?.('direction')??'down');
 if((vector.x===0&&vector.y===0)||delta===0)return {moved:false,blocked:false,direction,vector,x:sprite.x,y:sprite.y};
 const distance=speed*delta/1000,dx=vector.x*distance,dy=vector.y*distance;
 const steps=Math.max(1,Math.ceil(distance/Math.max(1,maxSubstep))),sx=dx/steps,sy=dy/steps;
 let x=sprite.x,y=sprite.y,blocked=false;
 for(let i=0;i<steps;i++){
  const nx=x+sx,ny=y+sy;
  if(valid(nx,ny,radius,bounds,canOccupy)){x=nx;y=ny;continue;}
  blocked=true;
  if(valid(nx,y,radius,bounds,canOccupy))x=nx;
  if(valid(x,ny,radius,bounds,canOccupy))y=ny;
 }
 const moved=Math.hypot(x-sprite.x,y-sprite.y)>0.001;
 if(moved){if(typeof sprite.setPosition==='function')sprite.setPosition(x,y);else{sprite.x=x;sprite.y=y;}}
 return {moved,blocked,direction,vector,x,y};
}
