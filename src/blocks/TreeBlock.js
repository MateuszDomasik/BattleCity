export class TreeBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'tree';
    this.destructible = true;
    this.color = '#228B22';
    this.health = 2;
    this.maxHealth = 2;
    this.image = new Image();
    this.image.src = '../../assets/tree.png';
  }

  draw(ctx) {
    // Draw background color first
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw the tree image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
    
    // Draw health bar above the tree
    const barWidth = this.size * 0.8;
    const barHeight = 8;
    const barX = this.x + (this.size - barWidth) / 2;
    const barY = this.y - barHeight - 2; // Position above the tree with smaller gap
    const healthPercent = this.health / this.maxHealth;
    
    // Border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Fill
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }

  takeDamage(damage = 1) {
    this.health -= damage;
    return this.health <= 0;
  }
} 