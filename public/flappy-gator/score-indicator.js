/**
 * Score Indicator System
 * Displays floating score indicators when points are earned
 */

class ScoreIndicator {
    constructor(x, y, points, multiplier = 1) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.multiplier = multiplier;
        this.age = 0;
        this.lifetime = 60; // frames
        this.vy = -2; // Float upward
        this.alpha = 1;
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.95; // Slow down
        this.age++;
        
        // Fade out in last 20 frames
        if (this.age > this.lifetime - 20) {
            this.alpha = (this.lifetime - this.age) / 20;
        }
    }

    isAlive() {
        return this.age < this.lifetime;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Draw points
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = this.multiplier > 1 ? '#fbbf24' : '#5CB54D';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        const text = `+${this.points}`;
        const textWidth = ctx.measureText(text).width;
        
        // Outline
        ctx.strokeText(text, this.x - textWidth / 2, this.y);
        // Fill
        ctx.fillText(text, this.x - textWidth / 2, this.y);
        
        // Draw multiplier if > 1
        if (this.multiplier > 1) {
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#fbbf24';
            const multiplierText = `x${this.multiplier.toFixed(1)}`;
            const multiplierWidth = ctx.measureText(multiplierText).width;
            ctx.strokeText(multiplierText, this.x - multiplierWidth / 2, this.y + 20);
            ctx.fillText(multiplierText, this.x - multiplierWidth / 2, this.y + 20);
        }
        
        ctx.restore();
    }
}

class ScoreIndicatorSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.indicators = [];
    }

    /**
     * Create a new score indicator
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} points - Points earned
     * @param {number} multiplier - Score multiplier
     */
    createIndicator(x, y, points, multiplier = 1) {
        this.indicators.push(new ScoreIndicator(x, y, points, multiplier));
    }

    /**
     * Update all indicators
     */
    update() {
        this.indicators = this.indicators.filter(indicator => {
            indicator.update();
            return indicator.isAlive();
        });
    }

    /**
     * Render all indicators
     */
    render() {
        this.indicators.forEach(indicator => {
            indicator.render(this.ctx);
        });
    }

    /**
     * Clear all indicators
     */
    clear() {
        this.indicators = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreIndicatorSystem;
}
