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
    this.image = new Image();
    this.image.src = '../../assets/tower.png';
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
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw tower image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
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