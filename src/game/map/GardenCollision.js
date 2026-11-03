import { GARDEN_TILE, TILE_SIZE } from './gardenLayout.js';
const BLOCKED_GROUND = new Set([GARDEN_TILE.water,GARDEN_TILE.waterWave,GARDEN_TILE.wetSand,GARDEN_TILE.cliffTop]);
const BLOCKED_DECOR = new Set([GARDEN_TILE.shrub,GARDEN_TILE.rock,GARDEN_TILE.fenceHorizontal,GARDEN_TILE.fenceVertical]);
export function isWalkableTile(groundTile,decorTile=0){return !BLOCKED_GROUND.has(groundTile)&&!BLOCKED_DECOR.has(decorTile);}
export function getGardenObstacleRects(tree){
 const x=tree.x*TILE_SIZE,y=tree.y*TILE_SIZE;
 return [
  {id:'central-tree-trunk',left:x+5,right:x+34,top:y-30,bottom:y+42},
  {id:'north-garden-bench',left:365,right:467,top:372,bottom:416},
  {id:'east-lookout-rock',left:1758,right:1826,top:924,bottom:962},
  {id:'southwest-lookout-rock',left:542,right:610,top:1084,bottom:1122}
 ];
}
function circleIntersectsRect(x,y,r,rect){
 const nx=Math.max(rect.left,Math.min(rect.right,x)),ny=Math.max(rect.top,Math.min(rect.bottom,y));
 return (x-nx)**2+(y-ny)**2<r*r;
}
function samplePoints(x,y,r){
 const points=[{x,y}];
 for(let i=0;i<8;i++){const a=Math.PI*2*i/8;points.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r});}
 return points;
}
export function canOccupyPosition(layout,x,y,options={}){
 const {radius=10,obstacles=getGardenObstacleRects(layout.tree)}=options;
 if(!Number.isFinite(x)||!Number.isFinite(y)||radius<0)return false;
 const width=layout.columns*TILE_SIZE,height=layout.rows*TILE_SIZE;
 if(x-radius<0||y-radius<0||x+radius>=width||y+radius>=height)return false;
 for(const p of samplePoints(x,y,radius)){
  const col=Math.floor(p.x/TILE_SIZE),row=Math.floor(p.y/TILE_SIZE);
  if(!isWalkableTile(layout.ground[row]?.[col],layout.decor[row]?.[col]??0))return false;
 }
 return !obstacles.some(rect=>circleIntersectsRect(x,y,radius,rect));
}
