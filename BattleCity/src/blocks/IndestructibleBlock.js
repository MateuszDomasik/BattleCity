export class IndestructibleBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = 'purple';
  }
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
} 