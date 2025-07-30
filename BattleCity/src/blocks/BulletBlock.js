export class BulletBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'bullet';
    this.color = '#FFD700';
    this.image = new Image();
    this.image.src = '../../assets/bullets.png';
  }

  draw(ctx) {
    // Draw background color first
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw the bullets image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
    
    // Draw "+5" text on top
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(this.size/3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+5', this.x + this.size/2, this.y + this.size/2);
  }
} 