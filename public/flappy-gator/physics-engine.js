/**
 * Physics Engine for Flappy Gator
 * Manages gravity-based physics, velocity, and position updates with comprehensive physics simulation
 */

class PhysicsEngine {
    constructor() {
        // Core physics constants
        this.GRAVITY = 0.6;                    // Pixels per frame squared - constant downward acceleration
        this.FLAP_STRENGTH = -10;              // Pixels per frame (negative = upward) - initial ascent velocity
        this.TERMINAL_VELOCITY_DOWN = 12;      // Maximum downward velocity (falling)
        this.TERMINAL_VELOCITY_UP = -12;       // Maximum upward velocity (ascending)
        
        // Advanced physics parameters
        this.AIR_RESISTANCE = 0.98;            // Velocity damping factor (0.98 = 2% resistance per frame)
        this.MOMENTUM_CONSERVATION = 0.95;     // How much momentum is preserved during flaps (0-1)
        this.INTERPOLATION_SMOOTHING = 0.15;   // Smoothing factor for position interpolation (0-1)
        
        // Physics state tracking
        this.previousPositions = new Map();    // Track previous positions for interpolation
        this.velocityHistory = new Map();      // Track velocity history for momentum calculations
    }

    /**
     * Apply gravity to an entity with air resistance
     * @param {Object} entity - Entity with velocity property
     */
    applyGravity(entity) {
        // Apply gravity acceleration
        entity.velocity += this.GRAVITY;
        
        // Apply air resistance (reduces velocity slightly each frame)
        entity.velocity *= this.AIR_RESISTANCE;
        
        // Clamp to terminal velocities (both up and down)
        if (entity.velocity > this.TERMINAL_VELOCITY_DOWN) {
            entity.velocity = this.TERMINAL_VELOCITY_DOWN;
        } else if (entity.velocity < this.TERMINAL_VELOCITY_UP) {
            entity.velocity = this.TERMINAL_VELOCITY_UP;
        }
    }

    /**
     * Apply flap (upward force) to an entity with momentum conservation
     * @param {Object} entity - Entity with velocity property
     * @param {string} entityId - Unique identifier for the entity (for momentum tracking)
     */
    applyFlap(entity, entityId = 'default') {
        // Store current velocity for momentum calculation
        const currentVelocity = entity.velocity;
        
        // Calculate momentum-conserved velocity
        // If falling, preserve some downward momentum
        // If rising, add to existing upward momentum
        let momentumComponent = 0;
        if (currentVelocity > 0) {
            // Falling: reduce the flap strength slightly based on downward momentum
            momentumComponent = currentVelocity * (1 - this.MOMENTUM_CONSERVATION);
        } else {
            // Rising: preserve some upward momentum
            momentumComponent = currentVelocity * this.MOMENTUM_CONSERVATION;
        }
        
        // Apply flap with momentum conservation
        entity.velocity = this.FLAP_STRENGTH + momentumComponent;
        
        // Ensure we don't exceed terminal velocity
        if (entity.velocity < this.TERMINAL_VELOCITY_UP) {
            entity.velocity = this.TERMINAL_VELOCITY_UP;
        }
        
        // Store velocity in history
        this.storeVelocityHistory(entityId, entity.velocity);
    }

    /**
     * Update entity position based on velocity with smooth interpolation
     * @param {Object} entity - Entity with y and velocity properties
     * @param {string} entityId - Unique identifier for the entity (for interpolation tracking)
     * @param {number} deltaTime - Time delta (default 1 for frame-based)
     */
    updatePosition(entity, entityId = 'default', deltaTime = 1) {
        // Store previous position for interpolation
        if (!this.previousPositions.has(entityId)) {
            this.previousPositions.set(entityId, entity.y);
        }
        
        const previousY = this.previousPositions.get(entityId);
        
        // Calculate new position based on velocity
        const targetY = entity.y + (entity.velocity * deltaTime);
        
        // Apply smooth interpolation between previous and target position
        // This reduces jitter and creates smoother movement
        const interpolatedY = previousY + (targetY - previousY) * (1 - this.INTERPOLATION_SMOOTHING);
        
        // Update entity position
        entity.y = interpolatedY;
        
        // Store current position for next frame
        this.previousPositions.set(entityId, entity.y);
    }

    /**
     * Get velocity of an entity
     * @param {Object} entity - Entity with velocity property
     * @returns {number} Current velocity
     */
    getVelocity(entity) {
        return entity.velocity;
    }

    /**
     * Set velocity of an entity
     * @param {Object} entity - Entity with velocity property
     * @param {number} velocity - New velocity value
     */
    setVelocity(entity, velocity) {
        entity.velocity = velocity;
    }

    /**
     * Get average velocity over recent frames
     * @param {string} entityId - Unique identifier for the entity
     * @param {number} frameCount - Number of frames to average (default 5)
     * @returns {number} Average velocity
     */
    getAverageVelocity(entityId, frameCount = 5) {
        const history = this.velocityHistory.get(entityId);
        if (!history || history.length === 0) {
            return 0;
        }
        
        const recentHistory = history.slice(-frameCount);
        const sum = recentHistory.reduce((acc, v) => acc + v, 0);
        return sum / recentHistory.length;
    }

    /**
     * Store velocity in history for momentum calculations
     * @param {string} entityId - Unique identifier for the entity
     * @param {number} velocity - Current velocity
     * @private
     */
    storeVelocityHistory(entityId, velocity) {
        if (!this.velocityHistory.has(entityId)) {
            this.velocityHistory.set(entityId, []);
        }
        
        const history = this.velocityHistory.get(entityId);
        history.push(velocity);
        
        // Keep only last 10 frames of history
        if (history.length > 10) {
            history.shift();
        }
    }

    /**
     * Reset physics state for an entity
     * @param {string} entityId - Unique identifier for the entity
     */
    resetEntity(entityId) {
        this.previousPositions.delete(entityId);
        this.velocityHistory.delete(entityId);
    }

    /**
     * Reset all physics state
     */
    resetAll() {
        this.previousPositions.clear();
        this.velocityHistory.clear();
    }

    /**
     * Get physics constants (for debugging or UI display)
     * @returns {Object} Physics constants
     */
    getConstants() {
        return {
            gravity: this.GRAVITY,
            flapStrength: this.FLAP_STRENGTH,
            terminalVelocityDown: this.TERMINAL_VELOCITY_DOWN,
            terminalVelocityUp: this.TERMINAL_VELOCITY_UP,
            airResistance: this.AIR_RESISTANCE,
            momentumConservation: this.MOMENTUM_CONSERVATION,
            interpolationSmoothing: this.INTERPOLATION_SMOOTHING
        };
    }

    /**
     * Update physics constants (for tuning gameplay)
     * @param {Object} constants - Object with physics constant overrides
     */
    updateConstants(constants) {
        if (constants.gravity !== undefined) this.GRAVITY = constants.gravity;
        if (constants.flapStrength !== undefined) this.FLAP_STRENGTH = constants.flapStrength;
        if (constants.terminalVelocityDown !== undefined) this.TERMINAL_VELOCITY_DOWN = constants.terminalVelocityDown;
        if (constants.terminalVelocityUp !== undefined) this.TERMINAL_VELOCITY_UP = constants.terminalVelocityUp;
        if (constants.airResistance !== undefined) this.AIR_RESISTANCE = constants.airResistance;
        if (constants.momentumConservation !== undefined) this.MOMENTUM_CONSERVATION = constants.momentumConservation;
        if (constants.interpolationSmoothing !== undefined) this.INTERPOLATION_SMOOTHING = constants.interpolationSmoothing;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
