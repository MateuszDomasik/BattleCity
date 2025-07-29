import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { BulletBlock } from './blocks/BulletBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { WaterBlock } from './blocks/WaterBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { WoodBlock } from './blocks/WoodBlock.js';
import { LightBrownBlock } from './blocks/LightBrownBlock.js';

export function renderGame(state) {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  for (const block of state.blocks) {
    if (block instanceof DestructibleBlock || block instanceof BulletBlock || block instanceof IndestructibleBlock || block instanceof WaterBlock || block instanceof TreeBlock || block instanceof WoodBlock || block instanceof LightBrownBlock) {
      block.render(ctx);
    } else {
      ctx.fillStyle = block.color || 'gray';
      ctx.fillRect(block.x, block.y, block.size, block.size);
    }
  }

  // Draw preview block with transparency
  if (state.gameMode === 'edit' && state.previewBlock) {
    ctx.save();
    ctx.globalAlpha = 0.5; // Make it 50% transparent
    state.previewBlock.render(ctx);
    ctx.restore();
  }

  // Draw bullets (rotated to match direction)
  for (const bullet of state.bullets) {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.rotate(Math.atan2(bullet.dy, bullet.dx));
    ctx.fillStyle = 'white';
    ctx.fillRect(-5, -2, 10, 4);
    ctx.restore();
  }

  // Draw player (tank image)
  const p = state.player;
  const tankImg = document.getElementById('tankSprite');
  
  // Check if tank should be visible (for flickering animation)
  const shouldShowTank = !p._flickering || 
    (p._flickering && Math.floor((performance.now() - p._flickerStartTime) / 100) % 2 === 0);
  
  if (shouldShowTank) {
    if (tankImg && tankImg.complete && tankImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
      ctx.rotate(p.angle); // Restore to just p.angle
      ctx.drawImage(tankImg, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }
  // Optionally draw UI, backpack, etc.
} 