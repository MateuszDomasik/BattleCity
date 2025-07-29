export class TreeBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = 'green';
    this.hp = 5;
    this.maxHp = 5;
  }

  render(ctx) {
    // Draw the tree block
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);

    // Draw health bar (classic style - same as DestructibleBlock)
    const barWidth = this.size * 0.8;
    const barHeight = 8;
    const barX = this.x + (this.size - barWidth) / 2;
    const barY = this.y + this.size / 2 - barHeight / 2;
    const healthPercent = this.hp / this.maxHp;
    
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
    ctx.fillText(this.hp, this.x + this.size/2, barY + barHeight + 2);
  }

  takeDamage() {
    this.hp = Math.max(0, this.hp - 1);
    return this.hp <= 0;
  }
} 