export class ShootingTower {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#8B4513'; // Brown color for tower
    this.type = 'shootingTower';
    this.destructible = false;
    this.shootCooldown = 0;
    this.shootInterval = 1500; // Shoot every 1.5 seconds
    this.lastShootTime = 0;
    this.bullets = [];
    this.range = 240; // 5 cells range
  }

  update(dt, enemies) {
    const now = performance.now();
    
    // Update shoot cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt * 1000;
    }
    
    // Find nearest enemy in range
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    for (const enemy of enemies) {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= this.range && distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    }
    
    // Shoot at nearest enemy
    if (nearestEnemy && this.shootCooldown <= 0) {
      const dx = nearestEnemy.x - this.x;
      const dy = nearestEnemy.y - this.y;
      const angle = Math.atan2(dy, dx);
      
      const bulletSpeed = 6;
      this.bullets.push({
        x: this.x + this.size / 2,
        y: this.y + this.size / 2,
        dx: Math.cos(angle) * bulletSpeed,
        dy: Math.sin(angle) * bulletSpeed,
        size: 4,
        isTowerBullet: true // Mark as tower bullet
      });
      
      this.shootCooldown = this.shootInterval;
      this.lastShootTime = now;
    }
    
    // Update tower bullets
    this.updateBullets(dt);
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

  draw(ctx) {
    // Draw tower base
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + 8, this.y + 8, this.size - 16, this.size - 16);
    
    // Draw tower top (gun barrel)
    ctx.fillStyle = '#654321';
    ctx.fillRect(this.x + 20, this.y + 4, 8, 40);
    
    // Draw tower details
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(this.x + 12, this.y + 12, 24, 24);
    
    // Draw range indicator (for debugging, can be removed)
    // ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.range, 0, Math.PI * 2);
    // ctx.stroke();
  }

  render(ctx) {
    this.draw(ctx);
    
    // Draw tower bullets
    for (const bullet of this.bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(Math.atan2(bullet.dy, bullet.dx));
      ctx.fillStyle = '#FFD700'; // Gold color for tower bullets
      ctx.fillRect(-3, -1, 6, 2);
      ctx.restore();
    }
  }
} 