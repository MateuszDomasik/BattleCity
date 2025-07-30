export class PortalBlock {
    constructor(x, y, size = 48) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = 'portal';
        this.destructible = false;
        this.color = '#8A2BE2';
        this.image = new Image();
        this.image.src = '../../assets/portal.png';
        this.animationTime = 0;
    }

    draw(ctx) {
        // Draw background color first
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw the portal image if loaded
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    }

    render(ctx) {
        this.draw(ctx);
        
        // Add pulsing animation effect
        this.animationTime += 0.1;
        const pulse = Math.sin(this.animationTime) * 0.2 + 0.8;
        
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - 2, this.y - 2, this.size + 4, this.size + 4);
        ctx.restore();
    }
} 