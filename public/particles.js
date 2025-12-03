// Particle system module
// This module can be used both in the browser and in tests

const MAX_PARTICLES = 500;

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y, particleCount = 20, tileSize = 25) {
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;
        
        // Explosion colors (warm colors for impact, not background color #1a1a1a)
        const explosionColors = ['#FF0000', '#FF6600', '#FFAA00', '#FFFF00'];
        
        for (let i = 0; i < particleCount; i++) {
            // Random angle for radiation
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 20,
                maxLife: 30 + Math.random() * 20,
                color: explosionColors[Math.floor(Math.random() * explosionColors.length)],
                size: 2 + Math.random() * 4,
                type: 'explosion'
            });
        }
        
        return this.particles.slice(-particleCount);
    }

    createConfetti(particleCount = 50, canvasWidth = 700) {
        // Confetti colors including Kiro brand green
        const confettiColors = ['#5CB54D', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * canvasWidth,
                y: -20 - Math.random() * 100, // Start above screen
                vx: (Math.random() - 0.5) * 2, // Horizontal drift
                vy: 1 + Math.random() * 2, // Downward velocity (gravity)
                life: 180 + Math.random() * 120,
                maxLife: 180 + Math.random() * 120,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                size: 3 + Math.random() * 5,
                type: 'confetti'
            });
        }
        
        return this.particles.slice(-particleCount);
    }

    createPowerEffect(x, y, tileSize = 25) {
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;
        
        // Create a few particles around Kiro
        const newParticles = [];
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = tileSize / 2 + 5;
            
            const particle = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 20,
                maxLife: 20,
                color: '#FFD700',
                size: 2 + Math.random() * 2,
                type: 'power'
            };
            this.particles.push(particle);
            newParticles.push(particle);
        }
        
        return newParticles;
    }

    updateParticles() {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity to confetti
            if (p.type === 'confetti') {
                p.vy += 0.05; // Gravity acceleration
            }
            
            // Decrease lifetime
            p.life--;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Cap particle count to prevent memory issues
        if (this.particles.length > MAX_PARTICLES) {
            this.particles = this.particles.slice(-MAX_PARTICLES);
        }
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            // Calculate alpha based on remaining life
            const alpha = p.life / p.maxLife;
            
            // Parse color and add alpha
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }

    getParticles() {
        return this.particles;
    }

    clear() {
        this.particles = [];
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem };
}
