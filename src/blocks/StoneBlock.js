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
    this.image = new Image();
    this.image.src = '../../assets/rock.png';
  }

  draw(ctx) {
    // Draw stone block
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw rock image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
  }

  render(ctx) {
    this.draw(ctx);
  }

  takeDamage(damage = 1) {
    this.health -= damage;
    return this.health <= 0;
  }
} 