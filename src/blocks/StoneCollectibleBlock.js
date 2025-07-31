export class StoneCollectibleBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#404040'; // Dark gray color
    this.type = 'stoneCollectible';
    this.collectible = true;
    this.image = new Image();
    this.image.src = '../../assets/stone.png';
  }

  draw(ctx) {
    // Draw stone block
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw stone image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
  }
} 