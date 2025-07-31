export class WaterBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'water';
    this.destructible = false;
    this.color = '#4A90E2';
    this.image = new Image();
    this.image.src = '../../assets/water.png';
  }

  draw(ctx) {
    // Draw background color first
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw the water image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
  }
} 