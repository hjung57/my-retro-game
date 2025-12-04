/**
 * Particle System for Flappy Gator
 * Manages particle effects for trails, explosions, and visual feedback
 */

class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.age = 0;
        this.gravity = 0.2;
        this.friction = 0.98;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.age++;
    }

    isAlive() {
        return this.age < this.lifetime;
    }

    getAlpha() {
        return 1 - (this.age / this.lifetime);
    }
}

class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
        this.maxParticles = 500;
    }

    /**
     * Create particle trail for gator
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} velocity - Gator velocity (affects trail)
     */
    createTrail(x, y, velocity) {
        // Only create trail when moving
        if (Math.abs(velocity) < 0.5) return;

        // Create 1-2 particles per frame
        const particleCount = Math.random() > 0.5 ? 1 : 2;

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.5 + 0.5;
            const vx = Math.cos(angle) * speed - 1; // Drift left
            const vy = Math.sin(angle) * speed;

            // Green trail particles
            const color = `rgba(92, 181, 77, ${Math.random() * 0.5 + 0.5})`;
            const size = Math.random() * 3 + 2;
            const lifetime = Math.random() * 20 + 10;

            this.addParticle(x - 15, y, vx, vy, color, size, lifetime);
        }
    }

    /**
     * Create explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {number} count - Number of particles
     */
    createExplosion(x, y, color = '#ff0000', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const size = Math.random() * 4 + 2;
            const lifetime = Math.random() * 30 + 20;

            this.addParticle(x, y, vx, vy, color, size, lifetime);
        }
    }

    /**
     * Create score popup particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} points - Points earned
     */
    createScorePopup(x, y, points) {
        // Create upward-floating particles
        for (let i = 0; i < 5; i++) {
            const vx = (Math.random() - 0.5) * 2;
            const vy = -Math.random() * 2 - 1;

            const color = '#fbbf24'; // Golden color
            const size = Math.random() * 3 + 2;
            const lifetime = 30;

            this.addParticle(x, y, vx, vy, color, size, lifetime);
        }
    }

    /**
     * Create sparkle effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createSparkle(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = Math.random() * 2 + 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const color = '#ffffff';
            const size = Math.random() * 2 + 1;
            const lifetime = 15;

            this.addParticle(x, y, vx, vy, color, size, lifetime);
        }
    }

    /**
     * Add a particle to the system
     */
    addParticle(x, y, vx, vy, color, size, lifetime) {
        // Limit total particles
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }

        this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
    }

    /**
     * Update all particles
     */
    update() {
        // Update and remove dead particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.isAlive();
        });
    }

    /**
     * Render all particles
     */
    render() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.getAlpha();
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Get particle count
     */
    getCount() {
        return this.particles.length;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
