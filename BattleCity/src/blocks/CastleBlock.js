export class CastleBlock {
    constructor(x, y, size = 96) { // 2x2 size = 48 * 2 = 96
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = 'castle';
        this.destructible = true;
        this.color = '#8B4513';
        this.health = 30;
        this.maxHealth = 30;
        this.image = new Image();
        this.image.src = '../../assets/castle.png';
    }

    draw(ctx) {
        // Draw background color first
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw the castle image if loaded
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    }

    render(ctx) {
        this.draw(ctx);
        
        // Draw health bar above the castle
        const barWidth = this.size * 0.8;
        const barHeight = 12;
        const barX = this.x + (this.size - barWidth) / 2;
        const barY = this.y - barHeight - 4;
        const healthPercent = this.health / this.maxHealth;
        
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Fill
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // HP number on health bar
        ctx.fillStyle = 'white';
        ctx.font = `${Math.floor(this.size/8)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.health}/${this.maxHealth}`, this.x + this.size/2, barY + barHeight/2);
    }

    takeDamage(damage = 1) {
        this.health -= damage;
        return this.health <= 0;
    }
} 