/**
 * Property-Based Tests for Gator Renderer
 * Tests the winged gator character rendering
 */

const fc = require('fast-check');
const GatorRenderer = require('../flappy-gator-renderer.js');

// Mock canvas context
const createMockContext = () => {
    const calls = {
        fillStyle: [],
        fillRect: [],
        beginPath: [],
        arc: [],
        ellipse: [],
        fill: [],
        stroke: [],
        save: [],
        restore: [],
        translate: [],
        rotate: [],
        moveTo: [],
        lineTo: [],
        closePath: []
    };

    return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        
        fillRect: function(...args) { calls.fillRect.push(args); },
        strokeRect: function(...args) {},
        clearRect: function(...args) {},
        
        beginPath: function() { calls.beginPath.push([]); },
        closePath: function() { calls.closePath.push([]); },
        
        moveTo: function(...args) { calls.moveTo.push(args); },
        lineTo: function(...args) { calls.lineTo.push(args); },
        
        arc: function(...args) { calls.arc.push(args); },
        ellipse: function(...args) { calls.ellipse.push(args); },
        
        fill: function() { calls.fill.push([]); },
        stroke: function() { calls.stroke.push([]); },
        
        save: function() { calls.save.push([]); },
        restore: function() { calls.restore.push([]); },
        
        translate: function(...args) { calls.translate.push(args); },
        rotate: function(...args) { calls.rotate.push(args); },
        scale: function(...args) {},
        
        setTransform: function(...args) {},
        resetTransform: function() {},
        
        _calls: calls
    };
};

describe('GatorRenderer Property-Based Tests', () => {

    /**
     * Feature: flappy-gator-game, Property 27: Gator renders with wings
     * Validates: Requirements 11.1
     * 
     * Property 27: Gator renders with wings
     * For any gator render call, the rendered output should include wing elements
     */
    test('Property 27: Gator renders with wings', () => {
        fc.assert(
            fc.property(
                // Generate random render parameters
                fc.record({
                    x: fc.float({ min: 0, max: 480 }),
                    y: fc.float({ min: 0, max: 640 }),
                    rotation: fc.float({ min: -45, max: 45 }),
                    isFlapping: fc.boolean()
                }),
                (config) => {
                    // Create mock context
                    const ctx = createMockContext();
                    
                    // Create renderer
                    const renderer = new GatorRenderer(ctx);
                    
                    // Draw gator
                    renderer.drawGator(config.x, config.y, config.rotation, config.isFlapping);
                    
                    // Property: Wings should be drawn (indicated by save/restore pairs and transforms)
                    // Wings use save/restore for each wing transformation
                    const saveCount = ctx._calls.save.length;
                    const restoreCount = ctx._calls.restore.length;
                    
                    // We expect at least 3 save/restore pairs:
                    // 1 for main gator transform, 2 for wings (left and right)
                    const hasWingTransforms = saveCount >= 3 && restoreCount >= 3;
                    
                    // Wings should also result in fill calls (triangular shapes)
                    const fillCount = ctx._calls.fill.length;
                    const hasWingFills = fillCount >= 2; // At least 2 wings
                    
                    return hasWingTransforms && hasWingFills;
                }
            ),
            { numRuns: 100 }
        );
    });

    test('Property 27 (variant): Wings are drawn before body', () => {
        fc.assert(
            fc.property(
                // Generate random render parameters
                fc.record({
                    x: fc.float({ min: 0, max: 480 }),
                    y: fc.float({ min: 0, max: 640 }),
                    rotation: fc.float({ min: -45, max: 45 }),
                    isFlapping: fc.boolean()
                }),
                (config) => {
                    // Create mock context with ordered tracking
                    const ctx = createMockContext();
                    const drawOrder = [];
                    
                    // Override methods to track order
                    const originalEllipse = ctx.ellipse;
                    const originalMoveTo = ctx.moveTo;
                    
                    ctx.ellipse = function(...args) {
                        drawOrder.push('body');
                        originalEllipse.call(this, ...args);
                    };
                    
                    ctx.moveTo = function(...args) {
                        drawOrder.push('wing');
                        originalMoveTo.call(this, ...args);
                    };
                    
                    // Create renderer
                    const renderer = new GatorRenderer(ctx);
                    
                    // Draw gator
                    renderer.drawGator(config.x, config.y, config.rotation, config.isFlapping);
                    
                    // Property: First wing should be drawn before first body element
                    const firstWingIndex = drawOrder.indexOf('wing');
                    const firstBodyIndex = drawOrder.indexOf('body');
                    
                    return firstWingIndex >= 0 && firstBodyIndex >= 0 && firstWingIndex < firstBodyIndex;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: flappy-gator-game, Property 28: Wing animation reflects state
     * Validates: Requirements 11.2, 11.3
     * 
     * Property 28: Wing animation reflects state
     * For any gator render, if flapping is true, wings should be in up position; if flapping is false, wings should be in resting position
     */
    test('Property 28: Wing animation reflects state', () => {
        fc.assert(
            fc.property(
                // Generate random positions with both flapping states
                fc.record({
                    x: fc.float({ min: 0, max: 480 }),
                    y: fc.float({ min: 0, max: 640 }),
                    rotation: fc.float({ min: -45, max: 45 }),
                    isFlapping: fc.boolean()
                }),
                (config) => {
                    // Create renderer
                    const ctx = createMockContext();
                    const renderer = new GatorRenderer(ctx);
                    
                    // Get wing angle for the flapping state
                    const wingAngle = renderer.animateWings(config.isFlapping);
                    
                    // Property: Wing angle should be negative (up) when flapping, positive (resting) when not
                    if (config.isFlapping) {
                        return wingAngle < 0; // Wings up
                    } else {
                        return wingAngle > 0; // Wings resting
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    test('Property 28 (variant): Wing angle is consistent for same state', () => {
        fc.assert(
            fc.property(
                // Generate flapping state
                fc.boolean(),
                (isFlapping) => {
                    // Create renderer
                    const ctx = createMockContext();
                    const renderer = new GatorRenderer(ctx);
                    
                    // Get wing angle multiple times for same state
                    const angle1 = renderer.animateWings(isFlapping);
                    const angle2 = renderer.animateWings(isFlapping);
                    const angle3 = renderer.animateWings(isFlapping);
                    
                    // Property: Wing angle should be consistent for the same flapping state
                    return angle1 === angle2 && angle2 === angle3;
                }
            ),
            { numRuns: 100 }
        );
    });

    test('Property 28 (variant): Flapping and resting angles are different', () => {
        fc.assert(
            fc.property(
                // No input needed - testing constant behavior
                fc.constant(null),
                () => {
                    // Create renderer
                    const ctx = createMockContext();
                    const renderer = new GatorRenderer(ctx);
                    
                    // Get wing angles for both states
                    const flappingAngle = renderer.animateWings(true);
                    const restingAngle = renderer.animateWings(false);
                    
                    // Property: Flapping and resting angles should be different
                    return flappingAngle !== restingAngle;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Feature: flappy-gator-game, Property 29: Character uses brand colors
     * Validates: Requirements 11.4
     * 
     * Property 29: Character uses brand colors
     * For any gator render, the body and wing colors should use values from the Kiro brand color palette
     */
    test('Property 29: Character uses brand colors', () => {
        fc.assert(
            fc.property(
                // Generate random render parameters
                fc.record({
                    x: fc.float({ min: 0, max: 480 }),
                    y: fc.float({ min: 0, max: 640 }),
                    rotation: fc.float({ min: -45, max: 45 }),
                    isFlapping: fc.boolean()
                }),
                (config) => {
                    // Create mock context that tracks fillStyle changes
                    const ctx = createMockContext();
                    const fillStyles = [];
                    
                    Object.defineProperty(ctx, 'fillStyle', {
                        get: function() { return this._fillStyle; },
                        set: function(value) {
                            this._fillStyle = value;
                            fillStyles.push(value);
                        }
                    });
                    
                    // Create renderer
                    const renderer = new GatorRenderer(ctx);
                    
                    // Draw gator
                    renderer.drawGator(config.x, config.y, config.rotation, config.isFlapping);
                    
                    // Property: Kiro brand green (#5CB54D) should be used for body and wings
                    const brandGreen = '#5CB54D';
                    const usesGreen = fillStyles.includes(brandGreen);
                    
                    // Also check that white and black are used for eyes
                    const usesWhite = fillStyles.includes('#FFFFFF');
                    const usesBlack = fillStyles.includes('#000000');
                    
                    return usesGreen && usesWhite && usesBlack;
                }
            ),
            { numRuns: 100 }
        );
    });

    test('Property 29 (variant): Renderer stores brand colors correctly', () => {
        fc.assert(
            fc.property(
                // No input needed - testing initialization
                fc.constant(null),
                () => {
                    // Create renderer
                    const ctx = createMockContext();
                    const renderer = new GatorRenderer(ctx);
                    
                    // Property: Renderer should store Kiro brand colors
                    const brandGreen = '#5CB54D';
                    const hasCorrectGatorColor = renderer.gatorColor === brandGreen;
                    const hasCorrectWingColor = renderer.wingColor === brandGreen;
                    const hasCorrectEyeWhite = renderer.eyeWhite === '#FFFFFF';
                    const hasCorrectEyePupil = renderer.eyePupil === '#000000';
                    
                    return hasCorrectGatorColor && hasCorrectWingColor && 
                           hasCorrectEyeWhite && hasCorrectEyePupil;
                }
            ),
            { numRuns: 100 }
        );
    });

    test('Property 29 (variant): Body and wings use same green color', () => {
        fc.assert(
            fc.property(
                // Generate random render parameters
                fc.record({
                    x: fc.float({ min: 0, max: 480 }),
                    y: fc.float({ min: 0, max: 640 }),
                    rotation: fc.float({ min: -45, max: 45 }),
                    isFlapping: fc.boolean()
                }),
                (config) => {
                    // Create mock context
                    const ctx = createMockContext();
                    const renderer = new GatorRenderer(ctx);
                    
                    // Draw gator
                    renderer.drawGator(config.x, config.y, config.rotation, config.isFlapping);
                    
                    // Property: Body and wings should use the same color
                    return renderer.gatorColor === renderer.wingColor;
                }
            ),
            { numRuns: 100 }
        );
    });
});
