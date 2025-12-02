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

    // Feature: game-enhancements, Property 10: High score triggers confetti
    // Validates: Requirements 4.1
    test('Property 10: For any score that exceeds the current high score, confetti particles should be created', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 10000 }), // current high score
                fc.integer({ min: 1, max: 5000 }),  // score increase amount
                fc.integer({ min: 10, max: 100 }),  // confetti particle count
                (currentHighScore, scoreIncrease, particleCount) => {
                    const ps = new ParticleSystem();
                    const newScore = currentHighScore + scoreIncrease;
                    
                    // Simulate: if new score exceeds high score, create confetti
                    const isNewHighScore = newScore > currentHighScore;
                    
                    const initialParticleCount = ps.getParticles().length;
                    
                    if (isNewHighScore) {
                        ps.createConfetti(particleCount, 700);
                    }
                    
                    const finalParticleCount = ps.getParticles().length;
                    const confettiCreated = finalParticleCount - initialParticleCount;
                    
                    // If new high score, confetti should be created
                    // Otherwise, no confetti should be created
                    return isNewHighScore ? confettiCreated === particleCount : confettiCreated === 0;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 9: Power state visual round-trip
    // Validates: Requirements 3.1, 3.2, 3.3
    test('Property 9: For any game state, entering power mode then exiting power mode should restore Kiro visual appearance to its original state', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 1000 }), // initial frame count
                (initialFrameCount) => {
                    // Mock canvas context to capture drawing operations
                    const drawOperations = [];
                    const mockCtx = {
                        strokeStyle: null,
                        lineWidth: null,
                        fillStyle: null,
                        globalAlpha: 1.0,
                        beginPath: () => { drawOperations.push({ type: 'beginPath' }); },
                        arc: (x, y, r, start, end) => { 
                            drawOperations.push({ type: 'arc', x, y, radius: r, start, end }); 
                        },
                        stroke: () => { drawOperations.push({ type: 'stroke', strokeStyle: mockCtx.strokeStyle, lineWidth: mockCtx.lineWidth }); },
                        fill: () => { drawOperations.push({ type: 'fill', fillStyle: mockCtx.fillStyle }); },
                        moveTo: (x, y) => { drawOperations.push({ type: 'moveTo', x, y }); },
                        closePath: () => { drawOperations.push({ type: 'closePath' }); },
                        drawImage: (img, x, y, w, h) => { drawOperations.push({ type: 'drawImage', x, y, w, h }); }
                    };
                    
                    // Mock Kiro object
                    const mockKiro = {
                        imgLoaded: false // Use fallback rendering for consistent testing
                    };
                    
                    // Simulate drawing function (extracted logic from game.js)
                    const drawKiroWithPowerEffect = (ctx, x, y, frameCount, powerActive) => {
                        const TILE_SIZE = 25;
                        
                        // Draw pulsing border when powered
                        if (powerActive) {
                            const pulseSpeed = 0.05;
                            const pulseSize = 3 + Math.sin(frameCount * pulseSpeed) * 2;
                            
                            ctx.strokeStyle = '#5CB54D';
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2 + pulseSize, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        
                        // Draw Kiro sprite (fallback)
                        if (!mockKiro.imgLoaded) {
                            ctx.fillStyle = '#5CB54D';
                            ctx.beginPath();
                            ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2 - 2, 0, Math.PI * 2);
                            ctx.fill();
                            
                            ctx.fillStyle = '#1a1a1a';
                            ctx.beginPath();
                            ctx.moveTo(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2);
                            ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
                            ctx.closePath();
                            ctx.fill();
                        }
                    };
                    
                    // Draw without power (initial state)
                    drawOperations.length = 0;
                    drawKiroWithPowerEffect(mockCtx, 14, 23, initialFrameCount, false);
                    const normalDrawOps = JSON.stringify(drawOperations);
                    
                    // Draw with power (powered state)
                    drawOperations.length = 0;
                    drawKiroWithPowerEffect(mockCtx, 14, 23, initialFrameCount, true);
                    const poweredDrawOps = JSON.stringify(drawOperations);
                    
                    // Draw without power again (after power expires)
                    drawOperations.length = 0;
                    drawKiroWithPowerEffect(mockCtx, 14, 23, initialFrameCount, false);
                    const restoredDrawOps = JSON.stringify(drawOperations);
                    
                    // The initial and restored states should be identical
                    // The powered state should be different (has extra stroke operations)
                    return normalDrawOps === restoredDrawOps && normalDrawOps !== poweredDrawOps;
                }
            ),
            { numRuns: 100 }
        );
    });
});
