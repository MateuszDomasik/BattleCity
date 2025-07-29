export const GRID_COLS = 30;
export const GRID_ROWS = 15;

export const state = {
  player: {
    x: 0,
    y: 0,
    size: 48,
    color: 'yellow',
    angle: 0,
    health: 10,
    maxHealth: 10,
    bullets: 10,
    wood: 5,
    speed: 96, // 2 cells per second (48*2)
    shoot: false,
    moving: false,
    moveTarget: null, // {x, y}
    moveDir: null, // {dx, dy}
  },
  blocks: [],
  bullets: [],
  backpack: [null, null, null, null, null],
  gameMode: 'play', // or 'edit', 'shop', etc.
  placingBlockIndex: null,
  keysPressed: {},
  lastMoveTime: performance.now(),
};

function isAlignedToGrid(val, size) {
  return Math.abs(val / size - Math.round(val / size)) < 0.01;
}

export function updateState(state) {
  const now = performance.now();
  const dt = (now - state.lastMoveTime) / 1000;
  state.lastMoveTime = now;
  const p = state.player;
  const size = p.size;

  // Movement: classic grid-based
  if (state.gameMode === 'play') {
    // If not moving, check for new move
    if (!p.moving && isAlignedToGrid(p.x, size) && isAlignedToGrid(p.y, size)) {
      let dir = null;
      if (state.keysPressed['ArrowUp'])    { dir = {dx: 0, dy: -1}; p.angle = 0; }
      else if (state.keysPressed['ArrowDown'])  { dir = {dx: 0, dy: 1}; p.angle = Math.PI; }
      else if (state.keysPressed['ArrowLeft'])  { dir = {dx: -1, dy: 0}; p.angle = -Math.PI/2; }
      else if (state.keysPressed['ArrowRight']) { dir = {dx: 1, dy: 0}; p.angle = Math.PI/2; }
      if (dir) {
        // Calculate target cell
        const tx = Math.round(p.x / size) * size + dir.dx * size;
        const ty = Math.round(p.y / size) * size + dir.dy * size;
        // Check collision with blocks
        const collision = state.blocks.some(b =>
          tx < b.x + b.size && tx + size > b.x &&
          ty < b.y + b.size && ty + size > b.y
        );
        if (!collision && tx >= 0 && ty >= 0 && tx < GRID_COLS * size && ty < GRID_ROWS * size) {
          p.moving = true;
          p.moveTarget = {x: tx, y: ty};
          p.moveDir = dir;
        }
      }
    }
    // If moving, interpolate toward target
    if (p.moving && p.moveTarget) {
      const dx = p.moveTarget.x - p.x;
      const dy = p.moveTarget.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const moveDist = p.speed * dt;
      if (dist <= moveDist) {
        p.x = p.moveTarget.x;
        p.y = p.moveTarget.y;
        p.moving = false;
        p.moveTarget = null;
        p.moveDir = null;
      } else {
        p.x += (dx/dist) * moveDist;
        p.y += (dy/dist) * moveDist;
      }
    }
  }

  // Shooting
  if (p.shoot && p.bullets > 0 && state.gameMode === 'play') {
    if (!p._shotThisFrame) {
      // Bullet direction based on angle
      const angle = p.angle;
      const speed = 12;
      state.bullets.push({
        x: p.x + p.size / 2,
        y: p.y + p.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
      });
      p.bullets--;
      p._shotThisFrame = true;
    }
  } else {
    p._shotThisFrame = false;
  }
  // Update bullets
  for (const bullet of state.bullets) {
    bullet.x += bullet.dx;
    bullet.y += bullet.dy;
  }
  // Remove bullets out of bounds
  state.bullets = state.bullets.filter(b =>
    b.x >= 0 && b.x <= GRID_COLS * size && b.y >= 0 && b.y <= GRID_ROWS * size
  );
  // Block placement (edit mode)
  if (state.gameMode === 'placingBlock' && state.placingBlockIndex !== null && state._placeBlockPos) {
    const { x, y } = state._placeBlockPos;
    const occupied = state.blocks.some(b => b.x === x && b.y === y);
    if (!occupied) {
      state.blocks.push({ x, y, size: size, color: 'gray', hp: 3, maxHp: 3 });
      state.backpack[state.placingBlockIndex] = null;
      state.placingBlockIndex = null;
      state.gameMode = 'play';
      state._placeBlockPos = null;
    }
  }
} 