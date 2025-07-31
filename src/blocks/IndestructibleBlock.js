export class IndestructibleBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'indestructible';
    this.destructible = false;
    this.color = 'purple';
    this.image = new Image();
    this.image.src = '../../assets/wall.png';
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }
  render(ctx) {
    this.draw(ctx);
  }
} 