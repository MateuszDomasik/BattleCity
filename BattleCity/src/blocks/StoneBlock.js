export class StoneBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'stone';
    this.destructible = true;
    this.color = '#404040'; // Dark gray color
    this.health = 1;
    this.maxHealth = 1;
  }

  draw(ctx) {
    // Draw stone block
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Add stone texture with darker lines
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // Draw some stone texture lines
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(this.x + i * 16, this.y);
      ctx.lineTo(this.x + i * 16, this.y + this.size);
      ctx.stroke();
    }
    
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + i * 16);
      ctx.lineTo(this.x + this.size, this.y + i * 16);
      ctx.stroke();
    }

    // Draw health bar in center of block
    const barWidth = this.size * 0.8;
    const barHeight = 8;
    const barX = this.x + (this.size - barWidth) / 2;
    const barY = this.y + this.size / 2 - barHeight / 2;
    const healthPercent = this.health / this.maxHealth;

    // Border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Fill
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // HP number below health bar
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(this.size/3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(this.health, this.x + this.size/2, barY + barHeight + 2);
  }

  render(ctx) {
    this.draw(ctx);
  }

  takeDamage(damage = 1) {
    this.health -= damage;
    return this.health <= 0;
  }
} 