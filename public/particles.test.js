const { ParticleSystem } = require('./particles.js');
const fc = require('fast-check');

describe('Particle System Property Tests', () => {
    
    // Feature: game-enhancements, Property 5: Explosion creation on collision
    // Validates: Requirements 2.1
    test('Property 5: For any ghost collision while Kiro is not powered, an explosion should be created at the collision coordinates', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 27 }), // x coordinate
                fc.integer({ min: 0, max: 30 }), // y coordinate
                fc.integer({ min: 1, max: 50 }),  // particle count
                (x, y, particleCount) => {
                    const ps = new ParticleSystem();
                    const initialCount = ps.getParticles().length;
                    
                    // Create explosion at collision point
                    ps.createExplosion(x, y, particleCount);
                    
                    // Verify particles were created
                    const particles = ps.getParticles();
                    const newParticles = particles.length - initialCount;
                    
                    // Should create the requested number of particles
                    return newParticles === particleCount;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 6: Explosion particles radiate outward
    // Validates: Requirements 2.2
    test('Property 6: For any explosion created, all particles should have velocities pointing away from the explosion center', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 27 }), // x coordinate
                fc.integer({ min: 0, max: 30 }), // y coordinate
                fc.integer({ min: 5, max: 50 }),  // particle count
                (x, y, particleCount) => {
                    const ps = new ParticleSystem();
                    const tileSize = 25;
                    const centerX = x * tileSize + tileSize / 2;
                    const centerY = y * tileSize + tileSize / 2;
                    
                    // Create explosion
                    const explosionParticles = ps.createExplosion(x, y, particleCount, tileSize);
                    
                    // Check that all particles are radiating outward
                    return explosionParticles.every(p => {
                        // Calculate direction from center to particle
                        const dx = p.x - centerX;
                        const dy = p.y - centerY;
                        
                        // Velocity should point in the same direction
                        // (dot product of position and velocity should be positive or zero)
                        const dotProduct = dx * p.vx + dy * p.vy;
                        
                        // For particles starting at center, velocity should be non-zero
                        const hasVelocity = p.vx !== 0 || p.vy !== 0;
                        
                        return hasVelocity && dotProduct >= 0;
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 7: Particle lifecycle management
    // Validates: Requirements 2.3, 4.4
    test('Property 7: For any particle, when its lifetime reaches zero, it should be removed from the particle array', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 27 }), // x coordinate
                fc.integer({ min: 0, max: 30 }), // y coordinate
                fc.integer({ min: 5, max: 20 }),  // particle count
                (x, y, particleCount) => {
                    const ps = new ParticleSystem();
                    
                    // Create explosion with particles
                    ps.createExplosion(x, y, particleCount);
                    
                    // Set all particles to have life = 1
                    ps.getParticles().forEach(p => {
                        p.life = 1;
                    });
                    
                    const countBefore = ps.getParticles().length;
                    
                    // Update particles once (should decrement life to 0 and remove)
                    ps.updateParticles();
                    
                    const countAfter = ps.getParticles().length;
                    
                    // All particles should be removed
                    return countBefore === particleCount && countAfter === 0;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 8: Explosion color contrast
    // Validates: Requirements 2.4
    test('Property 8: For any explosion particle, its color should not match the game background color (#1a1a1a)', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 27 }), // x coordinate
                fc.integer({ min: 0, max: 30 }), // y coordinate
                fc.integer({ min: 5, max: 50 }),  // particle count
                (x, y, particleCount) => {
                    const ps = new ParticleSystem();
                    const backgroundColor = '#1a1a1a';
                    
                    // Create explosion
                    const explosionParticles = ps.createExplosion(x, y, particleCount);
                    
                    // Check that no particle has the background color
                    return explosionParticles.every(p => {
                        return p.color.toLowerCase() !== backgroundColor.toLowerCase();
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 11: Confetti has gravity and drift
    // Validates: Requirements 4.3
    test('Property 11: For any confetti particle, it should have positive y-velocity (downward) and non-zero x-velocity (horizontal drift)', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 10, max: 100 }),  // particle count
                fc.integer({ min: 400, max: 1000 }), // canvas width
                (particleCount, canvasWidth) => {
                    const ps = new ParticleSystem();
                    
                    // Create confetti
                    const confettiParticles = ps.createConfetti(particleCount, canvasWidth);
                    
                    // Check that all confetti particles have:
                    // 1. Positive y-velocity (downward, gravity)
                    // 2. Non-zero x-velocity (horizontal drift)
                    return confettiParticles.every(p => {
                        return p.vy > 0 && p.vx !== 0;
                    });
                }
            ),
            { numRuns: 100 }
        );
    });
});
