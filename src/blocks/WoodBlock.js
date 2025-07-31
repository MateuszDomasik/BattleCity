export class WoodBlock {
    constructor(x, y, size = 48) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = 'wood';
        this.destructible = true;
        this.color = '#DEB887';
        this.health = 2;
        this.maxHealth = 2;
        this.image = new Image();
        this.image.src = '../../assets/wood.png';
    }

    draw(ctx) {
        // Draw background color first
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw the wood image if loaded
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    }

    render(ctx) {
        this.draw(ctx);
        
        // Draw health bar
        const barWidth = this.size * 0.8;
        const barHeight = 8;
        const barX = this.x + (this.size - barWidth) / 2;
        const barY = this.y + this.size / 2 - barHeight / 2;
        const healthPercent = this.health / this.maxHealth;
        
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Fill
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // HP number below health bar
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(this.size/3)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.health, this.x + this.size/2, barY + barHeight + 2);
    }

    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
} 