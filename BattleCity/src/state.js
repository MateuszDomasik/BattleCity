import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { BulletBlock } from './blocks/BulletBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { WaterBlock } from './blocks/WaterBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { WoodBlock } from './blocks/WoodBlock.js';
import { LightBrownBlock } from './blocks/LightBrownBlock.js';

export const GRID_COLS = 30;
export const GRID_ROWS = 15;

function getRandomGridPosition(exclude = []) {
  let x, y, tries = 0;
  do {
    x = Math.floor(Math.random() * GRID_COLS) * 48;
    y = Math.floor(Math.random() * GRID_ROWS) * 48;
    tries++;
  } while (exclude.some(pos => pos.x === x && pos.y === y) && tries < 100);
  return { x, y };
}

const playerStart = { x: Math.floor(GRID_COLS / 2) * 48, y: Math.floor(GRID_ROWS / 2) * 48 };
const blockPositions = [playerStart];
const blocks = [];
for (let i = 0; i < 15; i++) {
  const pos = getRandomGridPosition(blockPositions);
  blockPositions.push(pos);
  blocks.push(new DestructibleBlock(pos.x, pos.y));
}
// Add 5 BulletBlocks
for (let i = 0; i < 5; i++) {
  const pos = getRandomGridPosition(blockPositions);
  blockPositions.push(pos);
  blocks.push(new BulletBlock(pos.x, pos.y));
}
// After adding BulletBlocks
for (let i = 0; i < 10; i++) {
  const pos = getRandomGridPosition(blockPositions);
  blockPositions.push(pos);
  blocks.push(new IndestructibleBlock(pos.x, pos.y));
}
// After adding IndestructibleBlocks
// Add 15 connected water blocks in a lake pattern
const waterPositions = [
  {x: 5 * 48, y: 3 * 48}, {x: 6 * 48, y: 3 * 48}, {x: 7 * 48, y: 3 * 48},
  {x: 5 * 48, y: 4 * 48}, {x: 6 * 48, y: 4 * 48}, {x: 7 * 48, y: 4 * 48}, {x: 8 * 48, y: 4 * 48},
  {x: 5 * 48, y: 5 * 48}, {x: 6 * 48, y: 5 * 48}, {x: 7 * 48, y: 5 * 48}, {x: 8 * 48, y: 5 * 48},
  {x: 6 * 48, y: 6 * 48}, {x: 7 * 48, y: 6 * 48}, {x: 8 * 48, y: 6 * 48},
  {x: 7 * 48, y: 7 * 48}
];
for (const pos of waterPositions) {
  blockPositions.push(pos);
  blocks.push(new WaterBlock(pos.x, pos.y));
}

// Add TreeBlocks
for (let i = 0; i < 8; i++) {
  const pos = getRandomGridPosition(blockPositions);
  blockPositions.push(pos);
  blocks.push(new TreeBlock(pos.x, pos.y));
}

export const state = {
  player: {
    x: playerStart.x,
    y: playerStart.y,
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
    _waterDamageCooldown: false, // New property for water damage cooldown
    _lastSafePosition: { x: playerStart.x, y: playerStart.y }, // Store last safe position
    _flickering: false, // Track flickering animation
    _flickerStartTime: 0, // Track when flickering started
  },
  blocks,
  bullets: [],
  backpack: [null, null, null, null, null],
  gameMode: 'play', // or 'edit', 'shop', etc.
  placingBlockIndex: null,
  keysPressed: {},
  lastMoveTime: performance.now(),
  shopOpen: false, // Track if shop is open
  cursorPosition: { x: 0, y: 0 }, // Track cursor position for preview
  previewBlock: null, // Preview block for edit mode
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
        // Check collision with blocks (DestructibleBlock, IndestructibleBlock, and TreeBlock block movement)
        const collision = state.blocks.some(b =>
          (b instanceof DestructibleBlock || b instanceof IndestructibleBlock || b instanceof TreeBlock) &&
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
      // Bullet direction based on angle, adjusted for tank image rotation
      const angle = p.angle - Math.PI / 2;
      const speed = 12;
      state.bullets.push({
        x: p.x + p.size / 2,
        y: p.y + p.size / 2,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size: 4, // Add size property for collision detection
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
    // Ensure all bullets have size property
    if (!bullet.size) {
      bullet.size = 4;
    }
  }

  // Bullet-block collision
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    let bulletHit = false;

    for (let j = state.blocks.length - 1; j >= 0; j--) {
      const block = state.blocks[j];
      
      // Check collision with DestructibleBlock
      if (block instanceof DestructibleBlock) {
        if (
          bullet.x < block.x + block.size &&
          bullet.x + bullet.size > block.x &&
          bullet.y < block.y + block.size &&
          bullet.y + bullet.size > block.y
        ) {
          const destroyed = block.takeDamage ? block.takeDamage() : false;
          if (destroyed) {
            state.blocks.splice(j, 1);
          }
          state.bullets.splice(i, 1);
          bulletHit = true;
          break;
        }
      }
      
      // Check collision with TreeBlock
      if (block instanceof TreeBlock) {
        if (
          bullet.x < block.x + block.size &&
          bullet.x + bullet.size > block.x &&
          bullet.y < block.y + block.size &&
          bullet.y + bullet.size > block.y
        ) {
          const destroyed = block.takeDamage ? block.takeDamage() : false;
          if (destroyed) {
            // Replace tree with wood block
            state.blocks.splice(j, 1);
            state.blocks.push(new WoodBlock(block.x, block.y));
          }
          state.bullets.splice(i, 1);
          bulletHit = true;
          break;
        }
      }
      
      // Check collision with IndestructibleBlock
      if (block instanceof IndestructibleBlock) {
        if (
          bullet.x < block.x + block.size &&
          bullet.x + bullet.size > block.x &&
          bullet.y < block.y + block.size &&
          bullet.y + bullet.size > block.y
        ) {
          state.bullets.splice(i, 1);
          bulletHit = true;
          break;
        }
      }
    }
    
    if (!bulletHit) {
      // Remove bullets that go off screen
      if (bullet.x < 0 || bullet.x > GRID_COLS * size || bullet.y < 0 || bullet.y > GRID_ROWS * size) {
        state.bullets.splice(i, 1);
      }
    }
  }

  // After player movement, check for BulletBlock collision (require full overlap)
  for (let i = state.blocks.length - 1; i >= 0; i--) {
    const block = state.blocks[i];
    if (block instanceof BulletBlock) {
      // Require tank to be fully covering the block
      if (
        p.x >= block.x &&
        p.x + p.size <= block.x + block.size &&
        p.y >= block.y &&
        p.y + p.size <= block.y + block.size
      ) {
        p.bullets += 5;
        state.blocks.splice(i, 1);
      }
    }
  }

  // After BulletBlock collision, add WoodBlock collision
  for (let i = state.blocks.length - 1; i >= 0; i--) {
    const block = state.blocks[i];
    if (block instanceof WoodBlock) {
      if (
        p.x < block.x + block.size &&
        p.x + p.size > block.x &&
        p.y < block.y + block.size &&
        p.y + p.size > block.y
      ) {
        p.wood += 1;
        state.blocks.splice(i, 1);
      }
    }
  }

  // After BulletBlock collision, add water collision
  for (let i = state.blocks.length - 1; i >= 0; i--) {
    const block = state.blocks[i];
    if (block instanceof WaterBlock) {
      if (
        p.x < block.x + block.size &&
        p.x + p.size > block.x &&
        p.y < block.y + block.size &&
        p.y + p.size > block.y
      ) {
        // Damage player when touching water
        if (!p._waterDamageCooldown) {
          p.health = Math.max(0, p.health - 1);
          p._waterDamageCooldown = true;
          p._flickering = true;
          p._flickerStartTime = performance.now();
          setTimeout(() => { p._waterDamageCooldown = false; }, 1000); // 1 second cooldown
          setTimeout(() => { p._flickering = false; }, 1000); // 1 second flickering
        }
        // Teleport back to last safe position
        p.x = p._lastSafePosition.x;
        p.y = p._lastSafePosition.y;
        p.moving = false;
        p.moveTarget = null;
        p.moveDir = null;
      }
    }
  }
  // Update last safe position when not touching water
  let touchingWater = false;
  for (const block of state.blocks) {
    if (block instanceof WaterBlock) {
      if (
        p.x < block.x + block.size &&
        p.x + p.size > block.x &&
        p.y < block.y + block.size &&
        p.y + p.size > block.y
      ) {
        touchingWater = true;
        break;
      }
    }
  }
  if (!touchingWater) {
    p._lastSafePosition = { x: p.x, y: p.y };
  }

  // Block placement (edit mode)
  if (state.gameMode === 'placingBlock' && state.placingBlockIndex !== null && state._placeBlockPos) {
    const { x, y } = state._placeBlockPos;
    const occupied = state.blocks.some(b => b.x === x && b.y === y);
    if (!occupied) {
      state.blocks.push(new DestructibleBlock(x, y));
      state.backpack[state.placingBlockIndex] = null;
      state.placingBlockIndex = null;
      state.gameMode = 'play';
      state._placeBlockPos = null;
    }
  }
} 