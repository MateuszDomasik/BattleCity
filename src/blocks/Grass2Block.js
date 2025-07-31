export class Grass2Block {
    constructor(x, y, size = 48) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = 'grass2';
        this.destructible = false;
        this.color = '#7CFC00';
        this.image = new Image();
        this.image.src = '../../assets/grass2.png';
    }

    draw(ctx) {
        // Draw background color first
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw the grass2 image if loaded
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    }

    render(ctx) {
        this.draw(ctx);
    }
} 