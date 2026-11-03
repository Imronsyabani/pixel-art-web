import test from 'node:test';
import assert from 'node:assert/strict';
import {buildGardenLayout,GARDEN_TILE,TILE_SIZE} from './gardenLayout.js';
import {canOccupyPosition,getGardenObstacleRects,isWalkableTile} from './GardenCollision.js';
const layout=buildGardenLayout();
test('grass, path and dry sand are walkable; sea, wet sand and cliff are blocked',()=>{
 for(const t of [GARDEN_TILE.grass,GARDEN_TILE.path,GARDEN_TILE.sand])assert.equal(isWalkableTile(t,0),true);
 for(const t of [GARDEN_TILE.water,GARDEN_TILE.waterWave,GARDEN_TILE.wetSand,GARDEN_TILE.cliffTop])assert.equal(isWalkableTile(t,0),false);
});
test('shrub, rock and fence decorations block while flower decorations remain walkable',()=>{
 for(const t of [GARDEN_TILE.shrub,GARDEN_TILE.rock,GARDEN_TILE.fenceHorizontal,GARDEN_TILE.fenceVertical])assert.equal(isWalkableTile(GARDEN_TILE.grass,t),false);
 assert.equal(isWalkableTile(GARDEN_TILE.grass,GARDEN_TILE.flowerBlue),true);
});
test('character radius keeps its footprint inside land',()=>{
 assert.equal(canOccupyPosition(layout,16,16),false);
 assert.equal(canOccupyPosition(layout,1,1),false);
 assert.equal(canOccupyPosition(layout,layout.spawn.x*TILE_SIZE+16,layout.spawn.y*TILE_SIZE+16),true);
});
test('tree trunk, bench and lookout rocks expose obstacle rectangles',()=>{
 const obstacles=getGardenObstacleRects(layout.tree);
 assert.ok(obstacles.some(r=>r.id==='central-tree-trunk'));
 assert.ok(obstacles.some(r=>r.id==='north-garden-bench'));
 assert.equal(canOccupyPosition(layout,layout.tree.x*TILE_SIZE+20,layout.tree.y*TILE_SIZE+10),false);
 assert.equal(canOccupyPosition(layout,416,392),false);
});
test('decorative obstacle tiles reject a character footprint',()=>{
 let found=false;
 for(let y=0;y<layout.rows&&!found;y++)for(let x=0;x<layout.columns&&!found;x++){
  if([GARDEN_TILE.shrub,GARDEN_TILE.rock,GARDEN_TILE.fenceHorizontal,GARDEN_TILE.fenceVertical].includes(layout.decor[y][x])){
   assert.equal(canOccupyPosition(layout,x*TILE_SIZE+16,y*TILE_SIZE+16,{radius:4}),false);found=true;
  }
 }
 assert.equal(found,true);
});
