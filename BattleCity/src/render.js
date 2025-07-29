export function renderGame(state) {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  for (const block of state.blocks) {
    ctx.fillStyle = block.color || 'gray';
    ctx.fillRect(block.x, block.y, block.size, block.size);
    // Optionally draw HP, etc.
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
  // Optionally draw UI, backpack, etc.
} 