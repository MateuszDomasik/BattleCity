export class StoneCollectibleBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#404040'; // Dark gray color
    this.type = 'stoneCollectible';
    this.collectible = true;
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

    // Add collection indicator
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('STONE', this.x + this.size / 2, this.y + this.size / 2);
  }

  render(ctx) {
    this.draw(ctx);
  }
} 