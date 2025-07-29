export class BulletBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = 'orange';
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    // Draw bullet icon or "+5" text
    ctx.fillStyle = 'white';
    ctx.font = `${Math.floor(this.size/2.5)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+5', this.x + this.size/2, this.y + this.size/2);
  }
} 