import { GrayBlock } from './GrayBlock.js';

export class SteelBlock {
  constructor(x, y, size = 48) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = 'steel';
    this.destructible = true;
    this.color = '#c0c0c0'; // Light gray
    this.hp = 2;
    this.maxHp = 2;
    this.image = new Image();
    this.image.src = '../../assets/iron.png';
  }

  draw(ctx) {
    // Draw the steel block
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    
    // Draw iron image if loaded
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
  }

  render(ctx) {
    this.draw(ctx);
  }

  takeDamage() {
    this.hp = Math.max(0, this.hp - 1);
    return this.hp <= 0;
  }
} 