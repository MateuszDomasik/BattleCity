import { DestructibleBlock } from './blocks/DestructibleBlock.js';
import { IndestructibleBlock } from './blocks/IndestructibleBlock.js';
import { TreeBlock } from './blocks/TreeBlock.js';
import { SteelBlock } from './blocks/SteelBlock.js';
import { GrayBlock } from './blocks/GrayBlock.js';
import { StoneBlock } from './blocks/StoneBlock.js';

export class Enemy {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = 'red';
    this.health = 5;
    this.maxHealth = 5;
    this.speed = 48; // 1 cell per second
    this.angle = 0;
    this.shootCooldown = 0;
    this.shootInterval = 2000; // Shoot every 2 seconds
    this.lastShootTime = 0;
    this.bullets = [];
    this.targetPosition = null;
    this.pathfindingTimer = 0;
    this.pathfindingInterval = 1000; // Recalculate path every second
    this.moving = false;
    this.moveTarget = null;
    this.moveDir = null;
  }

  update(dt, player, blocks, enemies, towers) {
    const now = performance.now();
    
    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt * 1000;
    }
    
    // Update pathfinding timer
    this.pathfindingTimer += dt * 1000;
    
    // Recalculate path to player
    if (this.pathfindingTimer >= this.pathfindingInterval) {
      this.calculatePathToPlayer(player, blocks);
      this.pathfindingTimer = 0;
    }
    
    // Move towards player using grid-based movement
    this.moveTowardsPlayer(dt, blocks, enemies, towers);
    
    // Shoot at player
    this.shootAtPlayer(player, now);
    
    // Update enemy bullets
    this.updateBullets(dt);
  }

  calculatePathToPlayer(player, blocks) {
    // Simple pathfinding: move directly towards player if possible
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.targetPosition = {
        x: player.x,
        y: player.y
      };
    }
  }

  canMoveToPosition(x, y, blocks) {
    // Check if position is within bounds
    if (x < 0 || x >= 30 * this.size || y < 0 || y >= 15 * this.size) {
      return false;
    }
    
    // Check collision with blocks (only blocks that block movement)
    return !blocks.some(block => 
      (block instanceof DestructibleBlock || 
       block instanceof IndestructibleBlock || 
       block instanceof TreeBlock ||
       block instanceof SteelBlock ||
       block instanceof StoneBlock) &&
      x < block.x + block.size &&
      x + this.size > block.x &&
      y < block.y + block.size &&
      y + this.size > block.y
    );
  }

  // Check collision with shooting towers
  checkTowerCollision(x, y, towers) {
    return towers.some(tower => 
      x < tower.x + tower.size &&
      x + this.size > tower.x &&
      y < tower.y + tower.size &&
      y + this.size > tower.y
    );
  }

  // Check collision with other enemies
  checkEnemyCollision(x, y, enemies) {
    return enemies.some(enemy => 
      enemy !== this && // Don't check collision with self
      x < enemy.x + enemy.size &&
      x + this.size > enemy.x &&
      y < enemy.y + enemy.size &&
      y + this.size > enemy.y
    );
  }

  findAlternativePath(player, blocks) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    
    // Try horizontal movement first if horizontal distance is greater
    if (Math.abs(dx) > Math.abs(dy)) {
      // Try moving horizontally towards player
      if (dx > 0 && this.canMoveToPosition(this.x + this.size, this.y, blocks)) {
        return { dx: 1, dy: 0, angle: 0 }; // Right
      } else if (dx < 0 && this.canMoveToPosition(this.x - this.size, this.y, blocks)) {
        return { dx: -1, dy: 0, angle: Math.PI }; // Left
      }
      
      // If horizontal movement blocked, try vertical
      if (dy > 0 && this.canMoveToPosition(this.x, this.y + this.size, blocks)) {
        return { dx: 0, dy: 1, angle: Math.PI / 2 }; // Down
      } else if (dy < 0 && this.canMoveToPosition(this.x, this.y - this.size, blocks)) {
        return { dx: 0, dy: -1, angle: -Math.PI / 2 }; // Up
      }
    } else {
      // Try vertical movement first if vertical distance is greater
      if (dy > 0 && this.canMoveToPosition(this.x, this.y + this.size, blocks)) {
        return { dx: 0, dy: 1, angle: Math.PI / 2 }; // Down
      } else if (dy < 0 && this.canMoveToPosition(this.x, this.y - this.size, blocks)) {
        return { dx: 0, dy: -1, angle: -Math.PI / 2 }; // Up
      }
      
      // If vertical movement blocked, try horizontal
      if (dx > 0 && this.canMoveToPosition(this.x + this.size, this.y, blocks)) {
        return { dx: 1, dy: 0, angle: 0 }; // Right
      } else if (dx < 0 && this.canMoveToPosition(this.x - this.size, this.y, blocks)) {
        return { dx: -1, dy: 0, angle: Math.PI }; // Left
      }
    }
    
    // If all direct paths blocked, try random direction
    const directions = [
      { dx: 1, dy: 0, angle: 0 }, // Right
      { dx: -1, dy: 0, angle: Math.PI }, // Left
      { dx: 0, dy: 1, angle: Math.PI / 2 }, // Down
      { dx: 0, dy: -1, angle: -Math.PI / 2 } // Up
    ];
    
    for (const dir of directions) {
      if (this.canMoveToPosition(this.x + dir.dx * this.size, this.y + dir.dy * this.size, blocks)) {
        return dir;
      }
    }
    
    return null; // No path available
  }

  moveTowardsPlayer(dt, blocks, enemies, towers) {
    if (!this.targetPosition) return;
    
    // If not moving and aligned to grid, check for new move
    if (!this.moving && this.isAlignedToGrid(this.x, this.size) && this.isAlignedToGrid(this.y, this.size)) {
      const dx = this.targetPosition.x - this.x;
      const dy = this.targetPosition.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        // Try to find a path to the player
        const path = this.findAlternativePath(this.targetPosition, blocks);
        
        if (path) {
          // Calculate target cell
          const tx = Math.round(this.x / this.size) * this.size + path.dx * this.size;
          const ty = Math.round(this.y / this.size) * this.size + path.dy * this.size;
          
          // Check collision with blocks, other enemies, and towers
          const blockCollision = blocks.some(block => 
            (block instanceof DestructibleBlock || 
             block instanceof IndestructibleBlock || 
             block instanceof TreeBlock ||
             block instanceof SteelBlock ||
             block instanceof StoneBlock) &&
            tx < block.x + block.size &&
            tx + this.size > block.x &&
            ty < block.y + block.size &&
            ty + this.size > block.y
          );
          
          const enemyCollision = this.checkEnemyCollision(tx, ty, enemies);
          const towerCollision = this.checkTowerCollision(tx, ty, towers);
          
          if (!blockCollision && !enemyCollision && !towerCollision && tx >= 0 && ty >= 0 && tx < 30 * this.size && ty < 15 * this.size) {
            this.moving = true;
            this.moveTarget = { x: tx, y: ty };
            this.moveDir = path;
            this.angle = path.angle;
          }
        }
      }
    }
    
    // If moving, interpolate toward target
    if (this.moving && this.moveTarget) {
      const dx = this.moveTarget.x - this.x;
      const dy = this.moveTarget.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moveDist = this.speed * dt;
      
      if (dist <= moveDist) {
        this.x = this.moveTarget.x;
        this.y = this.moveTarget.y;
        this.moving = false;
        this.moveTarget = null;
        this.moveDir = null;
      } else {
        this.x += (dx / dist) * moveDist;
        this.y += (dy / dist) * moveDist;
      }
    }
  }

  isAlignedToGrid(val, size) {
    return Math.abs(val / size - Math.round(val / size)) < 0.01;
  }

  shootAtPlayer(player, now) {
    if (this.shootCooldown <= 0) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Shoot if player is within range (10 cells)
      if (distance < 480) {
        // Use the same grid-based angle as movement
        const bulletSpeed = 8;
        
        this.bullets.push({
          x: this.x + this.size / 2,
          y: this.y + this.size / 2,
          dx: Math.cos(this.angle) * bulletSpeed,
          dy: Math.sin(this.angle) * bulletSpeed,
          size: 4
        });
        
        this.shootCooldown = this.shootInterval;
        this.lastShootTime = now;
      }
    }
  }

  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;
      
      // Remove bullets that are off screen
      if (bullet.x < 0 || bullet.x > 1440 || bullet.y < 0 || bullet.y > 720) {
        this.bullets.splice(i, 1);
      }
    }
  }

  takeDamage() {
    this.health = Math.max(0, this.health - 1);
    return this.health <= 0;
  }

  render(ctx) {
    // Draw enemy tank
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.angle);
    
    // Draw red tank
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    
    // Draw tank details
    ctx.fillStyle = 'darkred';
    ctx.fillRect(-this.size / 4, -this.size / 2, this.size / 2, this.size / 4);
    
    ctx.restore();
    
    // Draw health bar
    const barWidth = this.size * 0.8;
    const barHeight = 6;
    const barX = this.x + (this.size - barWidth) / 2;
    const barY = this.y - barHeight - 5;
    const healthPercent = this.health / this.maxHealth;
    
    // Health bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health bar fill
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Draw enemy bullets
    for (const bullet of this.bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(Math.atan2(bullet.dy, bullet.dx));
      ctx.fillStyle = 'red';
      ctx.fillRect(-3, -1, 6, 2);
      ctx.restore();
    }
  }
} 