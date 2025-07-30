import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { BulletBlock } from './blocks/BulletBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { WaterBlock } from './blocks/WaterBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { WoodBlock } from './blocks/WoodBlock.js';
import { LightBrownBlock } from './blocks/LightBrownBlock.js';
import { SteelBlock } from './blocks/SteelBlock.js';
import { GrayBlock } from './blocks/GrayBlock.js';
import { ShootingTower } from './blocks/ShootingTower.js';
import { Enemy } from './enemy.js';

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

// Add SteelBlocks
for (let i = 0; i < 6; i++) {
  const pos = getRandomGridPosition(blockPositions);
  blockPositions.push(pos);
  blocks.push(new SteelBlock(pos.x, pos.y));
}

// Add enemies
const enemies = [];
for (let i = 0; i < 2; i++) {
  const pos = getRandomGridPosition(blockPositions);
  // Ensure enemy doesn't spawn too close to player
  const distanceToPlayer = Math.sqrt((pos.x - playerStart.x) ** 2 + (pos.y - playerStart.y) ** 2);
  if (distanceToPlayer > 200) { // At least 4 cells away from player
    blockPositions.push(pos);
    enemies.push(new Enemy(pos.x, pos.y));
  }
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
    steel: 0, // Add steel resource
    gold: 15, // Start with 15 gold to buy shooting tower
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
  enemies,
  bullets: [],
  shootingTowers: [], // Add shooting towers array
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
        // Check collision with blocks (DestructibleBlock, IndestructibleBlock, TreeBlock, and SteelBlock block movement)
        const blockCollision = state.blocks.some(b =>
          (b instanceof DestructibleBlock || b instanceof IndestructibleBlock || b instanceof TreeBlock || b instanceof SteelBlock) &&
          tx < b.x + b.size && tx + size > b.x &&
          ty < b.y + b.size && ty + size > b.y
        );
        
        // Check collision with shooting towers
        const towerCollision = state.shootingTowers.some(tower =>
          tx < tower.x + tower.size && tx + size > tower.x &&
          ty < tower.y + tower.size && ty + size > tower.y
        );
        
        const collision = blockCollision || towerCollision;
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

  // Update enemies
  for (const enemy of state.enemies) {
    enemy.update(dt, state.player, state.blocks, state.enemies, state.shootingTowers);
  }

  // Update shooting towers
  for (const tower of state.shootingTowers) {
    tower.update(dt, state.enemies);
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
      
      // Check collision with SteelBlock
      if (block instanceof SteelBlock) {
        if (
          bullet.x < block.x + block.size &&
          bullet.x + bullet.size > block.x &&
          bullet.y < block.y + block.size &&
          bullet.y + bullet.size > block.y
        ) {
          const destroyed = block.takeDamage ? block.takeDamage() : false;
          if (destroyed) {
            // Replace steel with gray block
            state.blocks.splice(j, 1);
            state.blocks.push(new GrayBlock(block.x, block.y));
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

  // Player bullet collision with enemies
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    let bulletHit = false;

    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const enemy = state.enemies[j];
      if (
        bullet.x < enemy.x + enemy.size &&
        bullet.x + bullet.size > enemy.x &&
        bullet.y < enemy.y + enemy.size &&
        bullet.y + bullet.size > enemy.y
      ) {
        const destroyed = enemy.takeDamage();
        if (destroyed) {
          state.enemies.splice(j, 1);
          // Reward player with gold for destroying enemy
          p.gold += 5;
        }
        state.bullets.splice(i, 1);
        bulletHit = true;
        break;
      }
    }
  }

  // Tower bullet collision with enemies
  for (const tower of state.shootingTowers) {
    for (let i = tower.bullets.length - 1; i >= 0; i--) {
      const bullet = tower.bullets[i];
      let bulletHit = false;

      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (
          bullet.x < enemy.x + enemy.size &&
          bullet.x + bullet.size > enemy.x &&
          bullet.y < enemy.y + enemy.size &&
          bullet.y + bullet.size > enemy.y
        ) {
          const destroyed = enemy.takeDamage();
          if (destroyed) {
            state.enemies.splice(j, 1);
            // Reward player with gold for destroying enemy
            p.gold += 5;
          }
          tower.bullets.splice(i, 1);
          bulletHit = true;
          break;
        }
      }
    }
  }

  // Enemy bullet collision with player
  for (const enemy of state.enemies) {
    for (let i = enemy.bullets.length - 1; i >= 0; i--) {
      const bullet = enemy.bullets[i];
      if (
        bullet.x < p.x + p.size &&
        bullet.x + bullet.size > p.x &&
        bullet.y < p.y + p.size &&
        bullet.y + bullet.size > p.y
      ) {
        // Damage player
        p.health = Math.max(0, p.health - 1);
        p._flickering = true;
        p._flickerStartTime = performance.now();
        setTimeout(() => { p._flickering = false; }, 1000); // 1 second flickering
        
        // Remove enemy bullet
        enemy.bullets.splice(i, 1);
      }
    }
  }

  // Enemy-player collision detection
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    if (
      enemy.x < p.x + p.size &&
      enemy.x + enemy.size > p.x &&
      enemy.y < p.y + p.size &&
      enemy.y + enemy.size > p.y
    ) {
      // Damage player on collision
      p.health = Math.max(0, p.health - 2);
      p._flickering = true;
      p._flickerStartTime = performance.now();
      setTimeout(() => { p._flickering = false; }, 1000); // 1 second flickering
      
      // Push enemy away from player to prevent continuous collision
      const dx = enemy.x - p.x;
      const dy = enemy.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const pushDistance = 48; // Push by one cell
        const pushX = (dx / distance) * pushDistance;
        const pushY = (dy / distance) * pushDistance;
        
        // Ensure enemy stays within bounds
        const newX = Math.max(0, Math.min(GRID_COLS * p.size - enemy.size, enemy.x + pushX));
        const newY = Math.max(0, Math.min(GRID_ROWS * p.size - enemy.size, enemy.y + pushY));
        
        enemy.x = newX;
        enemy.y = newY;
      }
    }
  }

  // Enemy bullet collision with blocks
  for (const enemy of state.enemies) {
    for (let i = enemy.bullets.length - 1; i >= 0; i--) {
      const bullet = enemy.bullets[i];
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
            enemy.bullets.splice(i, 1);
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
            enemy.bullets.splice(i, 1);
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
            enemy.bullets.splice(i, 1);
            bulletHit = true;
            break;
          }
        }
        
        // Check collision with SteelBlock
        if (block instanceof SteelBlock) {
          if (
            bullet.x < block.x + block.size &&
            bullet.x + bullet.size > block.x &&
            bullet.y < block.y + block.size &&
            bullet.y + bullet.size > block.y
          ) {
            const destroyed = block.takeDamage ? block.takeDamage() : false;
            if (destroyed) {
              // Replace steel with gray block
              state.blocks.splice(j, 1);
              state.blocks.push(new GrayBlock(block.x, block.y));
            }
            enemy.bullets.splice(i, 1);
            bulletHit = true;
            break;
          }
        }
      }
      
      if (!bulletHit) {
        // Remove enemy bullets that go off screen
        if (bullet.x < 0 || bullet.x > GRID_COLS * size || bullet.y < 0 || bullet.y > GRID_ROWS * size) {
          enemy.bullets.splice(i, 1);
        }
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

  // After WoodBlock collision, add GrayBlock collision
  for (let i = state.blocks.length - 1; i >= 0; i--) {
    const block = state.blocks[i];
    if (block instanceof GrayBlock) {
      if (
        p.x < block.x + block.size &&
        p.x + p.size > block.x &&
        p.y < block.y + block.size &&
        p.y + p.size > block.y
      ) {
        p.steel += 1; // Add steel resource
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