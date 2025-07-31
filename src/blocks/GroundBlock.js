export class GroundBlock {
    constructor(x, y, size = 48) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = 'ground';
        this.destructible = false;
        this.color = '#8B4513';
        this.image = new Image();
        this.image.src = '../../assets/ground.png';
    }

    draw(ctx) {
        // Draw background color first
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw the ground image if loaded
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    }

    render(ctx) {
        this.draw(ctx);
    }
} 