import { vectorToTarget } from './movementMath.js';
import { updateCharacterMovement,getFacingDirection } from './CharacterMovementSystem.js';
const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
export class CharacterTrail{
 constructor({sampleSpacing=4,maxLength=1400}={}){this.sampleSpacing=sampleSpacing;this.maxLength=maxLength;this.points=[];this.length=0;}
 record(x,y){const p={x,y},last=this.points.at(-1);if(last){const gap=distance(last,p);if(gap<this.sampleSpacing)return false;this.length+=gap;}this.points.push(p);this.trim();return true;}
 seed(points){for(const p of points)this.record(p.x,p.y);return this;}
 trim(){while(this.points.length>2&&this.length>this.maxLength){const old=this.points.shift();this.length-=distance(old,this.points[0]);}}
 getPointBehind(d){return this.getPointAtDistanceFromStart(Math.max(0,this.length-Math.max(0,d)));}
 getPointAtDistanceFromStart(d){
  if(!this.points.length)return null;let remaining=Math.max(0,Math.min(d,this.length));
  for(let i=1;i<this.points.length;i++){const a=this.points[i-1],b=this.points[i],len=distance(a,b);if(len>=remaining&&len>0){const t=remaining/len;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}remaining-=len;}
  return {...this.points.at(-1)};
 }
 getNearestProgress(pos){
  if(this.points.length<2)return 0;let best=Infinity,bestProgress=0,progress=0;
  for(let i=1;i<this.points.length;i++){
   const a=this.points[i-1],b=this.points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),sq=len*len;
   const t=sq>0?Math.max(0,Math.min(1,((pos.x-a.x)*dx+(pos.y-a.y)*dy)/sq)):0;
   const nx=a.x+dx*t,ny=a.y+dy*t,distSq=(pos.x-nx)**2+(pos.y-ny)**2;
   if(distSq<best){best=distSq;bestProgress=progress+len*t;}progress+=len;
  }return bestProgress;
 }
}
/** Follower advances on sampled leader path, not on a direct shortcut chord. */
export function updateFollowerMovement(follower,trail,deltaMs,options={}){
 const {followDistance=86,stopDistance=5,speed=112,bounds=null,canOccupy=null,radius=10}=options;
 const targetProgress=Math.max(0,trail.length-followDistance),followerProgress=trail.getNearestProgress(follower);
 const remaining=targetProgress-followerProgress,currentDirection=follower.getData?.('direction')??'down';
 const target=trail.getPointAtDistanceFromStart(targetProgress);
 if(remaining<=stopDistance)return{moved:false,blocked:false,direction:currentDirection,target,x:follower.x,y:follower.y};
 const safeDelta=Math.max(0,Math.min(Number(deltaMs)||0,50)),step=Math.min(remaining,speed*safeDelta/1000);
 if(step<=0)return{moved:false,blocked:false,direction:currentDirection,target,x:follower.x,y:follower.y};
 const routeTarget=trail.getPointAtDistanceFromStart(followerProgress+step),vector=vectorToTarget(follower,routeTarget);
 const direction=getFacingDirection(vector,currentDirection);
 const result=updateCharacterMovement(follower,vector,safeDelta,{speed,bounds,canOccupy,radius});
 return{...result,target:routeTarget};
}
