export class SteelCollectibleBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'steel-collectible';
    this.destructible = false;
    this.color = '#c0c0c0';
    this.image = new Image();
    this.image.src = '../../assets/steel.png';
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw steel image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
  }
} 