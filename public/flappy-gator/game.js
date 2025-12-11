/**
 * Pipe Generator
 * Manages pipe creation, movement, and removal with progressive difficulty
 */
class PipeGenerator {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Wall pair configuration
        this.pipeWidth = 60;                    // Width of each pipe/wall
        
        // Gap size configuration (using config values)
        this.initialGapHeight = FLAPPY_CONFIG.INITIAL_PIPE_GAP;
        this.minGapHeight = FLAPPY_CONFIG.MIN_PIPE_GAP;
        this.currentGapHeight = this.initialGapHeight;
        this.gapReductionRate = FLAPPY_CONFIG.GAP_REDUCTION_RATE;
        
        // Gap positioning boundaries
        this.minGapY = 100;                     // Minimum Y position for gap center
        this.maxGapY = canvasHeight - 250;      // Maximum Y position for gap center
        this.gapVariation = 0.7;                // How much gap position can vary (0-1)
        
        // Wall pair spacing
        this.initialSpawnInterval = 120;        // Starting frames between pipes (easier)
        this.minSpawnInterval = 80;             // Minimum frames between pipes (harder)
        this.currentSpawnInterval = this.initialSpawnInterval;
        this.spacingDecreaseRate = 1;           // Frames to decrease per pipe passed
        
        // Wall movement speed (using config values)
        this.initialScrollSpeed = FLAPPY_CONFIG.INITIAL_PIPE_SPEED;
        this.maxScrollSpeed = FLAPPY_CONFIG.MAX_PIPE_SPEED;
        this.currentScrollSpeed = this.initialScrollSpeed;
        this.speedIncreaseRate = FLAPPY_CONFIG.SPEED_INCREASE_RATE;
        
        // Progressive difficulty tracking
        this.pipesPassed = 0;                   // Total pipes passed (for difficulty scaling)
        this.difficultyEnabled = true;          // Enable/disable progressive difficulty
        
        // Pipe tracking
        this.pipes = [];
        this.framesSinceLastSpawn = 0;
        
        // Random gap positioning strategy
        this.lastGapY = (this.minGapY + this.maxGapY) / 2;  // Start in middle
    }

    /**
     * Generate a new pipe with random gap position
     * Uses smooth variation to avoid extreme jumps
     */
    generatePipe() {
        // Calculate gap position with smooth variation
        const gapY = this.calculateGapPosition();
        
        const pipe = {
            x: this.canvasWidth,
            width: this.pipeWidth,
            gapY: gapY,
            gapHeight: this.currentGapHeight,
            scored: false,
            topHeight: gapY - this.currentGapHeight / 2,
            bottomY: gapY + this.currentGapHeight / 2,
            speed: this.currentScrollSpeed  // Store speed for this pipe
        };
        
        this.pipes.push(pipe);
        return pipe;
    }

    /**
     * Calculate gap position with smooth random variation
     * Prevents extreme jumps between consecutive pipes
     */
    calculateGapPosition() {
        // Calculate available range
        const range = this.maxGapY - this.minGapY;
        
        // Maximum variation from last position (based on gapVariation setting)
        const maxVariation = range * this.gapVariation * 0.3;
        
        // Generate new position near last position
        const variation = (Math.random() - 0.5) * 2 * maxVariation;
        let newGapY = this.lastGapY + variation;
        
        // Clamp to boundaries
        newGapY = Math.max(this.minGapY, Math.min(this.maxGapY, newGapY));
        
        // Store for next calculation
        this.lastGapY = newGapY;
        
        return newGapY;
    }

    /**
     * Update all pipes - move them left and handle spawning/removal
     * Applies current scroll speed to all pipes
     */
    updatePipes(customScrollSpeed = null) {
        // Use custom speed if provided, otherwise use current speed
        const speed = customScrollSpeed !== null ? customScrollSpeed : this.currentScrollSpeed;
        
        // Move all pipes left at their respective speeds
        this.pipes.forEach(pipe => {
            pipe.x -= speed;
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => {
            if (pipe.x + pipe.width < 0) {
                // Pipe is off-screen, remove it
                return false;
            }
            return true;
        });
        
        // Check if we should spawn a new pipe
        this.framesSinceLastSpawn++;
        if (this.framesSinceLastSpawn >= this.currentSpawnInterval) {
            this.generatePipe();
            this.framesSinceLastSpawn = 0;
        }
    }

    /**
     * Update difficulty based on current score
     * Called when player's score changes
     */
    updateDifficulty(currentScore) {
        if (!this.difficultyEnabled) return;
        
        const oldSpeed = this.currentScrollSpeed;
        const oldGap = this.currentGapHeight;
        const oldInterval = this.currentSpawnInterval;
        
        // Calculate new gap height based on score
        const gapReduction = currentScore * this.gapReductionRate;
        this.currentGapHeight = Math.max(
            this.minGapHeight,
            this.initialGapHeight - gapReduction
        );
        
        // Calculate new speed based on score
        const speedIncrease = currentScore * this.speedIncreaseRate;
        this.currentScrollSpeed = Math.min(
            this.maxScrollSpeed,
            this.initialScrollSpeed + speedIncrease
        );
        
        // Keep spawn interval constant (don't change horizontal spacing)
        this.currentSpawnInterval = this.initialSpawnInterval;
        
        // Debug logging for difficulty changes
        if (Math.abs(oldSpeed - this.currentScrollSpeed) > 0.01 || Math.abs(oldGap - this.currentGapHeight) > 0.5) {
            console.log(`Difficulty Update - Score: ${currentScore}, Speed: ${oldSpeed.toFixed(2)} → ${this.currentScrollSpeed.toFixed(2)}, Gap: ${Math.round(oldGap)} → ${Math.round(this.currentGapHeight)}, Interval: ${this.currentSpawnInterval}`);
        }
    }

    /**
     * Legacy method for backward compatibility
     * Now calls updateDifficulty with pipes passed as score approximation
     */
    increaseDifficulty() {
        if (!this.difficultyEnabled) return;
        this.pipesPassed++;
        // Use pipes passed as a rough score approximation for legacy calls
        this.updateDifficulty(this.pipesPassed);
    }

    /**
     * Get current difficulty stats
     * @returns {Object} Current difficulty parameters
     */
    getDifficultyStats() {
        // Calculate difficulty percentage based on gap reduction
        const gapReduction = this.initialGapHeight - this.currentGapHeight;
        const maxGapReduction = this.initialGapHeight - this.minGapHeight;
        const difficultyPercent = Math.min(100, (gapReduction / maxGapReduction) * 100);
        
        return {
            pipesPassed: this.pipesPassed,
            gapHeight: this.currentGapHeight,
            spawnInterval: this.currentSpawnInterval,
            scrollSpeed: this.currentScrollSpeed,
            difficultyPercent: difficultyPercent,
            gapReduction: gapReduction,
            maxGapReduction: maxGapReduction
        };
    }

    /**
     * Remove a specific pipe
     */
    removePipe(pipe) {
        const index = this.pipes.indexOf(pipe);
        if (index > -1) {
            this.pipes.splice(index, 1);
        }
    }

    /**
     * Set difficulty configuration
     * @param {Object} config - Difficulty configuration object
     */
    setDifficultyConfig(config) {
        if (config.gapShrinkRate !== undefined) this.gapShrinkRate = config.gapShrinkRate;
        if (config.spacingDecreaseRate !== undefined) this.spacingDecreaseRate = config.spacingDecreaseRate;
        if (config.speedIncreaseRate !== undefined) this.speedIncreaseRate = config.speedIncreaseRate;
        if (config.minGapHeight !== undefined) this.minGapHeight = config.minGapHeight;
        if (config.minSpawnInterval !== undefined) this.minSpawnInterval = config.minSpawnInterval;
        if (config.maxScrollSpeed !== undefined) this.maxScrollSpeed = config.maxScrollSpeed;
        if (config.difficultyEnabled !== undefined) this.difficultyEnabled = config.difficultyEnabled;
    }

    /**
     * Get all pipes
     */
    getPipes() {
        return this.pipes;
    }

    /**
     * Reset pipe generator
     */
    reset() {
        this.pipes = [];
        this.framesSinceLastSpawn = 0;
        
        // Reset difficulty to initial values
        this.currentGapHeight = this.initialGapHeight;
        this.currentScrollSpeed = this.initialScrollSpeed;
        this.currentSpawnInterval = this.initialSpawnInterval;
        this.pipesPassed = 0;
    }
}

/**
 * Collision Detector
 * Enhanced collision detection with precise hitboxes, boundaries, and collision response
 */
class CollisionDetector {
    constructor(canvasHeight, canvasWidth = 480) {
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        
        // Precise hitbox definitions
        this.gatorHitboxRadius = 15;        // Circular hitbox radius for gator
        this.gatorHitboxOffsetX = 0;        // X offset from center
        this.gatorHitboxOffsetY = 0;        // Y offset from center
        
        // Boundary definitions
        this.ceilingBoundary = 0;           // Top boundary (ceiling)
        this.groundBoundary = canvasHeight; // Bottom boundary (ground)
        this.leftBoundary = -50;            // Left boundary (off-screen)
        this.rightBoundary = canvasWidth;   // Right boundary
        
        // Collision tolerance (for more forgiving gameplay)
        this.hitboxTolerance = 2;           // Pixels to shrink hitbox by
        
        // Invincibility frames system
        this.invincibilityEnabled = false;  // Enable/disable invincibility
        this.invincibilityFrames = 0;       // Current invincibility frame count
        this.invincibilityDuration = 60;    // Frames of invincibility (1 second at 60fps)
        
        // Collision response tracking
        this.lastCollisionType = null;      // 'pipe', 'ceiling', 'ground', null
        this.lastCollisionTime = 0;         // Frame when last collision occurred
        this.collisionFlashFrames = 0;      // Frames remaining for flash animation
        this.collisionFlashDuration = 10;   // Flash duration in frames
    }

    /**
     * Get gator hitbox with precise dimensions and tolerance
     * @param {number} gatorX - Gator X position
     * @param {number} gatorY - Gator Y position
     * @param {number} gatorRotation - Gator rotation angle (for advanced hitbox)
     * @returns {Object} Hitbox with x, y, and radius
     */
    getGatorHitbox(gatorX, gatorY, gatorRotation = 0) {
        // Apply tolerance to make gameplay more forgiving
        const effectiveRadius = this.gatorHitboxRadius - this.hitboxTolerance;
        
        return {
            x: gatorX + this.gatorHitboxOffsetX,
            y: gatorY + this.gatorHitboxOffsetY,
            radius: effectiveRadius,
            rotation: gatorRotation
        };
    }

    /**
     * Check collision between gator and pipes with detailed detection
     * @param {number} gatorX - Gator X position
     * @param {number} gatorY - Gator Y position
     * @param {Array} pipes - Array of pipe objects
     * @param {number} gatorRotation - Gator rotation angle
     * @returns {Object} Collision result with type and details
     */
    checkPipeCollision(gatorX, gatorY, pipes, gatorRotation = 0) {
        // Skip if invincible
        if (this.isInvincible()) {
            return { collision: false, type: null };
        }
        
        const hitbox = this.getGatorHitbox(gatorX, gatorY, gatorRotation);
        
        for (const pipe of pipes) {
            // Check if gator is horizontally aligned with pipe
            if (gatorX + hitbox.radius > pipe.x && gatorX - hitbox.radius < pipe.x + pipe.width) {
                // Calculate top and bottom pipe boundaries
                const topPipeBottom = pipe.gapY - pipe.gapHeight / 2;
                const bottomPipeTop = pipe.gapY + pipe.gapHeight / 2;
                
                // Check if gator collides with top pipe
                if (gatorY - hitbox.radius < topPipeBottom) {
                    this.registerCollision('pipe-top', pipe);
                    return { 
                        collision: true, 
                        type: 'pipe-top',
                        pipe: pipe,
                        impactPoint: { x: gatorX, y: topPipeBottom }
                    };
                }
                
                // Check if gator collides with bottom pipe
                if (gatorY + hitbox.radius > bottomPipeTop) {
                    this.registerCollision('pipe-bottom', pipe);
                    return { 
                        collision: true, 
                        type: 'pipe-bottom',
                        pipe: pipe,
                        impactPoint: { x: gatorX, y: bottomPipeTop }
                    };
                }
            }
        }
        
        return { collision: false, type: null };
    }

    /**
     * Check collision with ceiling (top boundary)
     * @param {number} gatorY - Gator Y position
     * @param {number} gatorRotation - Gator rotation angle
     * @returns {Object} Collision result
     */
    checkCeilingCollision(gatorY, gatorRotation = 0) {
        // Skip if invincible
        if (this.isInvincible()) {
            return { collision: false, type: null };
        }
        
        const hitbox = this.getGatorHitbox(0, gatorY, gatorRotation);
        
        // Check top boundary (ceiling)
        if (gatorY - hitbox.radius < this.ceilingBoundary) {
            this.registerCollision('ceiling');
            return { 
                collision: true, 
                type: 'ceiling',
                impactPoint: { x: 0, y: this.ceilingBoundary }
            };
        }
        
        return { collision: false, type: null };
    }

    /**
     * Check collision with ground (bottom boundary)
     * @param {number} gatorY - Gator Y position
     * @param {number} gatorRotation - Gator rotation angle
     * @returns {Object} Collision result
     */
    checkGroundCollision(gatorY, gatorRotation = 0) {
        // Skip if invincible
        if (this.isInvincible()) {
            return { collision: false, type: null };
        }
        
        const hitbox = this.getGatorHitbox(0, gatorY, gatorRotation);
        
        // Check bottom boundary (ground)
        if (gatorY + hitbox.radius > this.groundBoundary) {
            this.registerCollision('ground');
            return { 
                collision: true, 
                type: 'ground',
                impactPoint: { x: 0, y: this.groundBoundary }
            };
        }
        
        return { collision: false, type: null };
    }

    /**
     * Check collision with top and bottom boundaries (combined)
     * @param {number} gatorY - Gator Y position
     * @param {number} gatorRotation - Gator rotation angle
     * @returns {boolean} True if collision detected
     */
    checkBoundaryCollision(gatorY, gatorRotation = 0) {
        const ceilingResult = this.checkCeilingCollision(gatorY, gatorRotation);
        if (ceilingResult.collision) return true;
        
        const groundResult = this.checkGroundCollision(gatorY, gatorRotation);
        if (groundResult.collision) return true;
        
        return false;
    }

    /**
     * Register a collision and trigger response animations
     * @param {string} type - Type of collision
     * @param {Object} data - Additional collision data
     */
    registerCollision(type, data = null) {
        this.lastCollisionType = type;
        this.lastCollisionTime = Date.now();
        this.collisionFlashFrames = this.collisionFlashDuration;
    }

    /**
     * Update collision detector state (call each frame)
     */
    update() {
        // Update invincibility frames
        if (this.invincibilityFrames > 0) {
            this.invincibilityFrames--;
        }
        
        // Update collision flash animation
        if (this.collisionFlashFrames > 0) {
            this.collisionFlashFrames--;
        }
    }

    /**
     * Activate invincibility frames
     * @param {number} duration - Duration in frames (default: 60)
     */
    activateInvincibility(duration = null) {
        this.invincibilityEnabled = true;
        this.invincibilityFrames = duration !== null ? duration : this.invincibilityDuration;
    }

    /**
     * Check if currently invincible
     * @returns {boolean} True if invincible
     */
    isInvincible() {
        return this.invincibilityEnabled && this.invincibilityFrames > 0;
    }

    /**
     * Check if collision flash animation is active
     * @returns {boolean} True if flashing
     */
    isFlashing() {
        return this.collisionFlashFrames > 0;
    }

    /**
     * Get flash opacity for animation (0-1)
     * @returns {number} Opacity value
     */
    getFlashOpacity() {
        if (!this.isFlashing()) return 0;
        
        // Oscillate between 0 and 1 for flash effect
        const progress = this.collisionFlashFrames / this.collisionFlashDuration;
        return Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
    }

    /**
     * Get invincibility flash state (for visual feedback)
     * @returns {boolean} True if should render invincibility flash
     */
    shouldRenderInvincibilityFlash() {
        if (!this.isInvincible()) return false;
        
        // Flash every 5 frames
        return Math.floor(this.invincibilityFrames / 5) % 2 === 0;
    }

    /**
     * Reset collision detector state
     */
    reset() {
        this.invincibilityFrames = 0;
        this.lastCollisionType = null;
        this.lastCollisionTime = 0;
        this.collisionFlashFrames = 0;
    }

    /**
     * Set hitbox tolerance (for difficulty adjustment)
     * @param {number} tolerance - Pixels to shrink hitbox by
     */
    setHitboxTolerance(tolerance) {
        this.hitboxTolerance = Math.max(0, tolerance);
    }

    /**
     * Get collision statistics
     * @returns {Object} Collision stats
     */
    getCollisionStats() {
        return {
            lastCollisionType: this.lastCollisionType,
            isInvincible: this.isInvincible(),
            invincibilityFramesRemaining: this.invincibilityFrames,
            isFlashing: this.isFlashing(),
            hitboxRadius: this.gatorHitboxRadius - this.hitboxTolerance
        };
    }
}

/**
 * Game State Manager
 * Manages game states, transitions, and persistent data
 */
class GameStateManager {
    constructor(apiClient) {
        // Available game states
        this.STATES = {
            MENU: 'menu',           // Main menu with high scores
            PLAYING: 'playing',     // Active gameplay
            PAUSED: 'paused',       // Game paused
            GAME_OVER: 'gameOver'   // Game over screen
        };
        
        // Current state
        this.currentState = this.STATES.MENU;
        this.previousState = null;
        
        // State transition history
        this.stateHistory = [];
        this.maxHistoryLength = 10;
        
        // API client for database operations
        this.apiClient = apiClient;
        
        // Current session data (no longer persistent)
        this.sessionData = {
            currentStreak: 0,
            sessionStartTime: Date.now()
        };
    }

    /**
     * Transition to a new state
     * @param {string} newState - Target state
     * @param {Object} data - Optional transition data
     */
    transitionTo(newState, data = {}) {
        // Validate state
        if (!Object.values(this.STATES).includes(newState)) {
            console.error(`Invalid state: ${newState}`);
            return false;
        }
        
        // Store previous state
        this.previousState = this.currentState;
        
        // Add to history
        this.stateHistory.push({
            from: this.currentState,
            to: newState,
            timestamp: Date.now(),
            data: data
        });
        
        // Trim history if needed
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
        
        // Update current state
        this.currentState = newState;
        
        return true;
    }

    /**
     * Check if in a specific state
     * @param {string} state - State to check
     * @returns {boolean}
     */
    isState(state) {
        return this.currentState === state;
    }

    /**
     * Get current state
     * @returns {string}
     */
    getState() {
        return this.currentState;
    }

    /**
     * Update session streak
     * @param {number} score - Current score
     */
    updateSessionStreak(score) {
        if (score > this.sessionData.currentStreak) {
            this.sessionData.currentStreak = score;
        }
    }

    /**
     * Get statistics from database
     * @returns {Promise<Object>} Statistics from database
     */
    async getStats() {
        try {
            // Get stats from dedicated stats endpoint (includes ALL scores)
            console.log('Fetching stats from /api/stats?game_type=flappy-gator');
            const response = await fetch('/api/stats?game_type=flappy-gator');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const stats = await response.json();
            console.log('Received stats:', stats);
            return stats;
        } catch (error) {
            console.error('Error getting stats from database:', error);
            return {
                highScore: 0,
                totalGamesPlayed: 0,
                totalScore: 0,
                averageScore: 0
            };
        }
    }

    /**
     * Check if score is a new high score
     * @param {number} score - Current score
     * @returns {Promise<boolean>} True if new high score
     */
    async checkNewHighScore(score) {
        try {
            const stats = await this.getStats();
            return score > stats.highScore;
        } catch (error) {
            console.error('Error checking high score:', error);
            return false;
        }
    }

    /**
     * Get state transition history
     * @returns {Array} History of state transitions
     */
    getHistory() {
        return [...this.stateHistory];
    }
}

/**
 * Flappy Gator Game Engine
 * Core game loop, state management, and coordination
 */

class FlappyGatorGame {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        // Base canvas dimensions (logical size)
        this.baseWidth = 480;
        this.baseHeight = 640;
        this.aspectRatio = this.baseWidth / this.baseHeight;
        
        // Set initial canvas size
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;
        
        // Scale factor for responsive rendering
        this.scale = 1;
        
        // Enhanced state management
        this.stateManager = new GameStateManager(this.apiClient);
        
        // Legacy state property (for backward compatibility)
        this.state = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.highScore = 0;
        this.frameCount = 0;
        
        // Real-time scoring
        this.scoreMultiplier = 1;
        this.comboCounter = 0;
        this.lastScoreTime = 0;
        
        // Gator entity
        this.gator = {
            x: 100,
            y: this.canvas.height / 2,
            velocity: 0,
            rotation: 0,
            width: 40,
            height: 30,
            isFlapping: false
        };
        
        // Pipes array
        this.pipes = [];
        
        // Animation frame ID
        this.animationFrameId = null;
        
        // Physics engine
        this.physicsEngine = new PhysicsEngine();
        
        // Pipe generator
        this.pipeGenerator = new PipeGenerator(this.canvas.width, this.canvas.height);
        
        // Collision detector with enhanced features
        this.collisionDetector = new CollisionDetector(this.canvas.height, this.canvas.width);
        
        // Screen shake state
        this.screenShakeFrames = 0;
        this.screenShakeIntensity = 5;
        
        // API client and audio manager
        this.apiClient = new APIClient();
        this.audioManager = new AudioManager();
        
        // Particle system for visual effects
        this.particleSystem = new ParticleSystem(this.ctx);
        
        // Score indicator system
        this.scoreIndicatorSystem = new ScoreIndicatorSystem(this.ctx);
        
        // Load sounds
        this.loadSounds();
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Set up resize handling
        this.setupResponsive();
    }
    
    /**
     * Set up responsive canvas scaling
     */
    setupResponsive() {
        // Initial resize
        this.handleResize();
        
        // Add resize event listener
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
    }
    
    /**
     * Handle window resize and orientation changes
     */
    handleResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate scale to fit viewport while maintaining aspect ratio
        const scaleX = containerWidth / this.baseWidth;
        const scaleY = containerHeight / this.baseHeight;
        
        // Use the smaller scale to ensure canvas fits in viewport
        this.scale = Math.min(scaleX, scaleY, 1); // Cap at 1 to avoid upscaling on large screens
        
        // Apply CSS transform to scale canvas visually
        const displayWidth = this.baseWidth * this.scale;
        const displayHeight = this.baseHeight * this.scale;
        
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
        
        // Keep logical canvas size constant for game logic
        // This ensures all game calculations remain the same
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;
    }

    /**
     * Load sound effects with enhanced audio feedback
     */
    async loadSounds() {
        try {
            await this.audioManager.loadSound('collision', '/assets/game_over.wav');
            await this.audioManager.loadSound('flap', '/assets/jump.wav');
            await this.audioManager.loadSound('score', '/assets/jump.wav'); // Reuse jump sound for scoring
            
            // Store volume levels for each sound (used when playing)
            this.soundVolumes = {
                collision: 0.7,
                flap: 0.5,
                score: 0.4
            };
        } catch (error) {
            console.error('Error loading sounds:', error);
        }
    }

    /**
     * Initialize game state
     */
    async init() {
        // Clean up any dynamically created elements first
        this.cleanupDynamicElements();
        
        // Reset game state
        this.state = 'start';
        this.score = 0;
        this.frameCount = 0;
        
        // Reset scoring system
        this.scoreMultiplier = 1;
        this.comboCounter = 0;
        this.lastScoreTime = 0;
        
        // Reset gator
        this.gator.x = 100;
        this.gator.y = this.canvas.height / 2;
        this.gator.velocity = 0;
        this.gator.rotation = 0;
        this.gator.isFlapping = false;
        
        // Reset physics engine state
        this.physicsEngine.resetAll();
        
        // Clear pipes
        this.pipes = [];
        this.pipeGenerator.reset();
        
        // Clear particles and score indicators
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        if (this.scoreIndicatorSystem) {
            this.scoreIndicatorSystem.clear();
        }
        
        // Reset collision detector
        if (this.collisionDetector) {
            this.collisionDetector.reset();
        }
        

        
        // Set up UI
        await this.updateUI();
        
        // Start the game loop for rendering (even in start state)
        if (!this.animationFrameId) {
            this.gameLoop();
        }
    }

    /**
     * Start the game (transition from start to playing)
     */
    async start() {
        if (this.state === 'start') {
            this.state = 'playing';
            await this.updateUI();
            
            // Start game loop if not already running
            if (!this.animationFrameId) {
                this.gameLoop();
            }
        }
    }

    /**
     * Restart the game (reset and start playing)
     */
    async restart() {
        // Clean up dynamically created elements
        this.cleanupDynamicElements();
        
        // Reset game state
        this.score = 0;
        this.frameCount = 0;
        
        // Reset scoring system
        this.scoreMultiplier = 1;
        this.comboCounter = 0;
        this.lastScoreTime = 0;
        
        // Reset gator position and velocity
        this.gator.x = 100;
        this.gator.y = this.canvas.height / 2;
        this.gator.velocity = 0;
        this.gator.rotation = 0;
        this.gator.isFlapping = false;
        
        // Reset physics engine state for gator
        this.physicsEngine.resetEntity('gator');
        
        // Clear pipes and reset generator
        this.pipes = [];
        this.pipeGenerator.reset();
        
        // Clear particles and score indicators
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        if (this.scoreIndicatorSystem) {
            this.scoreIndicatorSystem.clear();
        }
        
        // Reset collision detector
        if (this.collisionDetector) {
            this.collisionDetector.reset();
        }
        
        // Transition to playing state
        this.state = 'playing';
        await this.updateUI();
        
        // Update score display to show 0
        this.updateScoreDisplay();
        
        // Start game loop if not already running
        if (!this.animationFrameId) {
            this.gameLoop();
        }
    }

    /**
     * Main game loop with enhanced visual effects
     */
    gameLoop() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB'; // Sky blue background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update game state
        if (this.state === 'playing') {
            this.frameCount++;
            
            // Update physics
            this.updatePhysics();
            
            // Update pipes
            this.pipeGenerator.updatePipes();
            this.pipes = this.pipeGenerator.getPipes();
            
            // Update score
            this.updateScore();
            
            // Check collisions
            this.checkCollisions();
            
            // Update particle system
            this.particleSystem.update();
            
            // Update score indicators
            this.scoreIndicatorSystem.update();
            
            // Create particle trail for gator
            this.particleSystem.createTrail(this.gator.x, this.gator.y, this.gator.velocity);
        }
        
        // Render game objects (always render, even in start state)
        this.render();
        
        // Continue loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * Render all game objects with collision effects and particles
     */
    render() {
        // Apply screen shake if active
        const isShaking = this.applyScreenShake();
        
        // Only render game objects when playing or in start state (for preview)
        if (this.state === 'playing' || this.state === 'start') {
            // Render pipes (only when playing)
            if (this.state === 'playing') {
                this.renderPipes();
                
                // Render particles behind gator
                this.particleSystem.render();
            }
            
            // Render gator with rotation and effects
            if (!this.gatorRenderer) {
                this.gatorRenderer = new GatorRenderer(this.ctx);
            }
            
            // Apply invincibility visual effect
            if (this.collisionDetector.shouldRenderInvincibilityFlash()) {
                this.ctx.globalAlpha = 0.5;
            }
            
            this.gatorRenderer.drawGator(
                this.gator.x,
                this.gator.y,
                this.gator.rotation,
                this.gator.isFlapping
            );
            
            // Reset alpha
            this.ctx.globalAlpha = 1.0;
            
            // Render score indicators on top
            if (this.state === 'playing') {
                this.scoreIndicatorSystem.render();
            }
            
            // Render collision flash effect
            if (this.collisionDetector.isFlashing()) {
                this.renderCollisionFlash();
            }
            
            // Render invincibility indicator
            if (this.collisionDetector.isInvincible()) {
                this.renderInvincibilityIndicator();
            }
        }
        
        // Restore canvas after screen shake
        if (isShaking) {
            this.restoreScreenShake();
        }
    }

    /**
     * Render collision flash effect
     */
    renderCollisionFlash() {
        const opacity = this.collisionDetector.getFlashOpacity();
        
        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 0, 0, ${opacity * 0.3})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Render invincibility indicator around gator
     */
    renderInvincibilityIndicator() {
        const stats = this.collisionDetector.getCollisionStats();
        
        this.ctx.save();
        this.ctx.strokeStyle = '#5CB54D';
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.6;
        
        // Draw pulsing circle around gator
        const pulseScale = 1 + Math.sin(Date.now() / 100) * 0.2;
        const radius = (this.collisionDetector.gatorHitboxRadius + 5) * pulseScale;
        
        this.ctx.beginPath();
        this.ctx.arc(this.gator.x, this.gator.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    /**
     * Render pipes with caps for visual polish
     */
    renderPipes() {
        const pipeColor = '#5CB54D'; // Kiro brand green
        const capHeight = 25;
        const capWidth = this.pipeGenerator.pipeWidth + 8;
        
        this.pipes.forEach(pipe => {
            this.ctx.fillStyle = pipeColor;
            
            // Calculate pipe sections
            const topPipeHeight = pipe.gapY - pipe.gapHeight / 2;
            const bottomPipeY = pipe.gapY + pipe.gapHeight / 2;
            const bottomPipeHeight = this.canvas.height - bottomPipeY;
            
            // Draw top pipe body
            this.ctx.fillRect(pipe.x, 0, pipe.width, topPipeHeight);
            
            // Draw top pipe cap
            this.ctx.fillRect(
                pipe.x - (capWidth - pipe.width) / 2,
                topPipeHeight - capHeight,
                capWidth,
                capHeight
            );
            
            // Draw bottom pipe body
            this.ctx.fillRect(
                pipe.x,
                bottomPipeY,
                pipe.width,
                bottomPipeHeight
            );
            
            // Draw bottom pipe cap
            this.ctx.fillRect(
                pipe.x - (capWidth - pipe.width) / 2,
                bottomPipeY,
                capWidth,
                capHeight
            );
        });
    }

    /**
     * Update physics for gator
     */
    updatePhysics() {
        // Apply gravity with air resistance
        this.physicsEngine.applyGravity(this.gator);
        
        // Update position with smooth interpolation
        this.physicsEngine.updatePosition(this.gator, 'gator');
        
        // Update rotation based on velocity
        // Calculate rotation angle: velocity * 3 degrees
        let rotation = this.gator.velocity * 3;
        
        // Handle NaN or invalid values
        if (isNaN(rotation)) {
            rotation = 0;
        }
        
        // Clamp rotation to ±45 degrees
        rotation = Math.max(-45, Math.min(45, rotation));
        
        this.gator.rotation = rotation;
    }

    /**
     * Check for collisions with pipes and boundaries
     * Enhanced with detailed collision detection and response
     */
    checkCollisions() {
        // Update collision detector state
        this.collisionDetector.update();
        
        // Check pipe collisions with detailed response
        const pipeCollision = this.collisionDetector.checkPipeCollision(
            this.gator.x, 
            this.gator.y, 
            this.pipes,
            this.gator.rotation
        );
        
        if (pipeCollision.collision) {
            this.handleCollision(pipeCollision);
            return;
        }
        
        // Check ceiling collision
        const ceilingCollision = this.collisionDetector.checkCeilingCollision(
            this.gator.y,
            this.gator.rotation
        );
        
        if (ceilingCollision.collision) {
            this.handleCollision(ceilingCollision);
            return;
        }
        
        // Check ground collision
        const groundCollision = this.collisionDetector.checkGroundCollision(
            this.gator.y,
            this.gator.rotation
        );
        
        if (groundCollision.collision) {
            this.handleCollision(groundCollision);
            return;
        }
    }

    /**
     * Handle collision with enhanced animation and response
     * @param {Object} collisionData - Collision details
     */
    handleCollision(collisionData) {
        // Create explosion particle effect at collision point
        const explosionX = collisionData.impactPoint ? collisionData.impactPoint.x : this.gator.x;
        const explosionY = collisionData.impactPoint ? collisionData.impactPoint.y : this.gator.y;
        
        this.particleSystem.createExplosion(explosionX, explosionY, '#ff0000', 30);
        
        // Trigger screen shake effect
        this.triggerScreenShake();
        
        // End game
        this.gameOver();
    }

    /**
     * Trigger screen shake effect for collision feedback
     */
    triggerScreenShake() {
        // Store original canvas position
        if (!this.screenShakeFrames) {
            this.screenShakeFrames = 0;
            this.screenShakeIntensity = 5;
        }
        
        // Activate shake for 10 frames
        this.screenShakeFrames = 10;
    }

    /**
     * Apply screen shake effect to canvas
     */
    applyScreenShake() {
        if (this.screenShakeFrames > 0) {
            const intensity = this.screenShakeIntensity * (this.screenShakeFrames / 10);
            const offsetX = (Math.random() - 0.5) * intensity * 2;
            const offsetY = (Math.random() - 0.5) * intensity * 2;
            
            this.ctx.save();
            this.ctx.translate(offsetX, offsetY);
            
            this.screenShakeFrames--;
            
            return true; // Shake is active
        }
        
        return false; // No shake
    }

    /**
     * Restore canvas after screen shake
     */
    restoreScreenShake() {
        if (this.screenShakeFrames >= 0) {
            this.ctx.restore();
        }
    }

    /**
     * Update score by checking for pipe passages with enhanced scoring
     */
    updateScore() {
        // Update combo system
        this.updateComboSystem();
        
        // Check each pipe to see if gator has passed through it
        this.pipes.forEach(pipe => {
            // Detect pipe passage: gator X > pipe X + width
            if (!pipe.scored && this.gator.x > pipe.x + pipe.width) {
                // Add score with multiplier system
                this.addScore(1);
                
                // Mark pipe as scored to prevent double-counting
                pipe.scored = true;
                
                // Increase difficulty progressively
                this.pipeGenerator.increaseDifficulty();
            }
        });
    }

    /**
     * Handle input events
     */
    handleInput(inputType) {
        // Only accept input during playing state
        if (this.state === 'playing') {
            // Apply flap using physics engine with momentum conservation
            this.physicsEngine.applyFlap(this.gator, 'gator');
            this.gator.isFlapping = true;
            
            // Play flap sound effect with custom volume
            this.audioManager.playSound('flap', this.soundVolumes?.flap || 0.5);
            
            // Reset flapping state after a few frames
            setTimeout(() => {
                this.gator.isFlapping = false;
            }, 100);
        }
    }

    /**
     * Update UI elements with enhanced state management
     * @param {boolean} isNewHighScore - Whether a new high score was achieved
     */
    async updateUI(isNewHighScore = false) {
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over-screen');
        const scoreDisplay = document.getElementById('score-display');
        
        // Show/hide screens based on state
        if (this.state === 'start') {
            startScreen.classList.remove('hidden');
            gameOverScreen.classList.add('hidden');
            scoreDisplay.style.display = 'none';
            this.canvas.style.display = 'none';
            
            // Get statistics from database and update UI
            try {
                const stats = await this.stateManager.getStats();
                document.getElementById('start-high-score-value').textContent = stats.highScore;
                this.updateMenuStats(stats);
            } catch (error) {
                console.error('Error loading stats for menu:', error);
                // Show default values on error
                document.getElementById('start-high-score-value').textContent = '0';
            }
        } else if (this.state === 'playing') {
            startScreen.classList.add('hidden');
            gameOverScreen.classList.add('hidden');
            scoreDisplay.style.display = 'block';
            this.canvas.style.display = 'block';
        } else if (this.state === 'gameOver') {
            startScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            scoreDisplay.style.display = 'none';
            
            // Update game over screen scores
            const finalScoreElement = document.getElementById('final-score-value');
            if (finalScoreElement) {
                finalScoreElement.textContent = this.score;
            }
            
            // Show new high score indicator
            if (isNewHighScore) {
                this.showNewHighScoreIndicator();
            }
            
            // Update game over statistics from database
            try {
                const stats = await this.stateManager.getStats();
                this.updateGameOverStats(stats);
            } catch (error) {
                console.error('Error loading stats for game over screen:', error);
            }
        }
    }

    /**
     * Update menu statistics display
     * @param {Object} stats - Statistics object
     */
    updateMenuStats(stats) {
        // Only show stats if games have been played
        if (stats.totalGamesPlayed === 0) return;
        
        // Find or create the stats container in the start-stats div
        const startStatsContainer = document.querySelector('.start-stats');
        if (!startStatsContainer) return;
        
        let statsDisplay = document.getElementById('menu-stats');
        if (!statsDisplay) {
            statsDisplay = document.createElement('div');
            statsDisplay.id = 'menu-stats';
            statsDisplay.className = 'stat-item';
            startStatsContainer.appendChild(statsDisplay);
        }
        
        statsDisplay.innerHTML = `
            <div class="stat-item">Games Played: ${stats.totalGamesPlayed}</div>
            <div class="stat-item">Average Score: ${stats.averageScore}</div>
        `;
    }

    /**
     * Update game over statistics display
     * @param {Object} stats - Statistics object
     */
    updateGameOverStats(stats) {
        let gameOverStats = document.getElementById('game-over-stats');
        
        if (!gameOverStats) {
            gameOverStats = document.createElement('div');
            gameOverStats.id = 'game-over-stats';
            gameOverStats.className = 'game-over-stats';
            
            // Find the modal content and insert before the first button
            const modalContent = document.querySelector('#game-over-screen .modal-content');
            const restartButton = document.getElementById('restart-button');
            
            if (modalContent && restartButton) {
                modalContent.insertBefore(gameOverStats, restartButton);
            }
        }
        
        const difficulty = this.pipeGenerator.getDifficultyStats();
        
        gameOverStats.innerHTML = `
            <div class="stat-row">
                <span>Pipes Passed:</span>
                <span>${difficulty.pipesPassed}</span>
            </div>
            <div class="stat-row">
                <span>Difficulty:</span>
                <span>${Math.floor(difficulty.difficultyPercent)}%</span>
            </div>
            <div class="stat-row">
                <span>Total Games:</span>
                <span>${stats.totalGamesPlayed}</span>
            </div>
        `;
    }

    /**
     * Show new high score indicator
     */
    showNewHighScoreIndicator() {
        let indicator = document.getElementById('new-high-score-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'new-high-score-indicator';
            indicator.className = 'new-high-score';
            indicator.textContent = '🎉 NEW HIGH SCORE! 🎉';
            
            const gameOverScreen = document.getElementById('game-over-screen');
            const title = gameOverScreen.querySelector('h2');
            title.after(indicator);
        }
        
        indicator.classList.remove('hidden');
        
        // Hide after animation
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    }

    /**
     * Update score display during gameplay with multiplier
     */
    updateScoreDisplay() {
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            // Display score with 1 decimal place if it has decimals, otherwise as integer
            scoreElement.textContent = this.score % 1 === 0 ? this.score : this.score.toFixed(1);
        }
        
        // Show multiplier if active
        if (this.scoreMultiplier > 1) {
            let multiplierElement = document.getElementById('score-multiplier');
            
            if (!multiplierElement) {
                multiplierElement = document.createElement('span');
                multiplierElement.id = 'score-multiplier';
                multiplierElement.className = 'score-multiplier';
                scoreElement.parentElement.appendChild(multiplierElement);
            }
            
            multiplierElement.textContent = ` x${this.scoreMultiplier.toFixed(1)}`;
            multiplierElement.style.display = 'inline';
        } else {
            const multiplierElement = document.getElementById('score-multiplier');
            if (multiplierElement) {
                multiplierElement.style.display = 'none';
            }
        }
        
        // Show difficulty info (for debugging/feedback)
        const difficultyStats = this.pipeGenerator.getDifficultyStats();
        let difficultyElement = document.getElementById('difficulty-display');
        
        if (!difficultyElement) {
            difficultyElement = document.createElement('div');
            difficultyElement.id = 'difficulty-display';
            difficultyElement.style.cssText = `
                position: absolute;
                top: 80px;
                left: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                font-family: 'Press Start 2P', monospace;
                line-height: 1.4;
                pointer-events: none;
            `;
            document.getElementById('game-container').appendChild(difficultyElement);
        }
        
        difficultyElement.innerHTML = `
            Speed: ${difficultyStats.scrollSpeed.toFixed(1)}px/f<br>
            Gap: ${Math.round(difficultyStats.gapHeight)}px<br>
            Spacing: ${difficultyStats.spawnInterval}f<br>
            Difficulty: ${Math.round(difficultyStats.difficultyPercent)}%
        `;
    }



    /**
     * Pause the game
     */
    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.stateManager.transitionTo(this.stateManager.STATES.PAUSED);
            
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            
            // Show pause menu
            this.showPauseMenu();
        }
    }

    /**
     * Resume the game from pause
     */
    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.stateManager.transitionTo(this.stateManager.STATES.PLAYING);
            
            // Hide pause menu
            this.hidePauseMenu();
            
            // Restart game loop
            if (!this.animationFrameId) {
                this.gameLoop();
            }
        }
    }

    /**
     * Show pause menu
     */
    showPauseMenu() {
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            // Update pause screen stats
            const pauseScore = document.getElementById('pause-score');
            const pauseHighScore = document.getElementById('pause-high-score');
            
            if (pauseScore) pauseScore.textContent = this.score;
            if (pauseHighScore) pauseHighScore.textContent = this.highScore;
            
            pauseMenu.classList.remove('hidden');
        }
        
        // Show mobile pause button
        const mobilePauseBtn = document.getElementById('mobile-pause-btn');
        if (mobilePauseBtn) {
            mobilePauseBtn.classList.add('hidden');
        }
    }

    /**
     * Hide pause menu
     */
    hidePauseMenu() {
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
        }
        
        // Show mobile pause button again
        const mobilePauseBtn = document.getElementById('mobile-pause-btn');
        if (mobilePauseBtn && this.state === 'playing') {
            mobilePauseBtn.classList.remove('hidden');
        }
    }

    /**
     * Return to main menu
     */
    async returnToMenu() {
        // Clean up dynamically created elements
        this.cleanupDynamicElements();
        
        // Hide pause menu
        this.hidePauseMenu();
        
        // Reset game state
        this.state = 'start';
        this.stateManager.transitionTo(this.stateManager.STATES.MENU);
        
        // Stop game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Reset game and refresh stats
        await this.init();
    }

    /**
     * Clean up dynamically created UI elements
     */
    cleanupDynamicElements() {
        // Remove menu stats
        const menuStats = document.getElementById('menu-stats');
        if (menuStats) {
            menuStats.remove();
        }
        
        // Remove game over stats
        const gameOverStats = document.getElementById('game-over-stats');
        if (gameOverStats) {
            gameOverStats.remove();
        }
        
        // Remove new high score indicator
        const highScoreIndicator = document.getElementById('new-high-score-indicator');
        if (highScoreIndicator) {
            highScoreIndicator.remove();
        }
        
        // Remove score multiplier
        const scoreMultiplier = document.getElementById('score-multiplier');
        if (scoreMultiplier) {
            scoreMultiplier.remove();
        }
    }

    /**
     * Game over handler with enhanced state management
     */
    gameOver() {
        // Transition to gameOver state (stops game loop updates)
        this.state = 'gameOver';
        this.stateManager.transitionTo(this.stateManager.STATES.GAME_OVER, {
            finalScore: this.score,
            pipesPassed: this.pipeGenerator.pipesPassed
        });
        
        // Update session streak
        this.stateManager.updateSessionStreak(this.score);
        
        // Play collision sound effect with custom volume
        this.audioManager.playSound('collision', this.soundVolumes?.collision || 0.7);
        
        // Save session first, then show game over screen with updated leaderboard
        this.saveGameSession().then(async (saveResult) => {
            const isNewHighScore = saveResult && saveResult.isNewHighScore;
            await this.updateUI(isNewHighScore);
            loadLeaderboard('game-over-leaderboard-list');
        });
    }

    /**
     * Save game session (copied from pac-gator pattern)
     */
    async saveGameSession() {
        // Always save game session on game over
        const data = await this.apiClient.submitScore('flappy-gator', 'Player', this.score);
        if (data && data.success) {
            // Store the score ID for potential updates
            this.currentScoreId = data.id;
            
            if (data.isNewHighScore) {
                this.highScore = this.score;
            }
        }
        return data;
    }

    /**
     * Update score with real-time multiplier, combo system, and feedback
     * @param {number} points - Base points to add
     */
    addScore(points = 1) {
        // Calculate score with multiplier (keep decimal precision)
        const earnedPoints = Math.round(points * this.scoreMultiplier * 10) / 10; // Round to 1 decimal
        this.score += earnedPoints;
        
        // Update difficulty based on new score
        this.pipeGenerator.updateDifficulty(this.score);
        
        // Update combo counter
        this.comboCounter++;
        this.lastScoreTime = Date.now();
        
        // Increase multiplier for combos (max 10x)
        // Multiplier increases every 3 consecutive pipes: 1x -> 1.5x -> 2x -> 2.5x ... -> 10x
        if (this.comboCounter >= 3) {
            const multiplierLevel = Math.min(Math.floor(this.comboCounter / 3), 18); // Max 18 levels (10x)
            this.scoreMultiplier = Math.min(10, 1 + (multiplierLevel * 0.5));
        }
        
        // Audio feedback - higher pitch for multipliers
        this.playScoreSound();
        
        // Visual feedback - score indicator
        this.scoreIndicatorSystem.createIndicator(
            this.gator.x + 30,
            this.gator.y - 20,
            earnedPoints,
            this.scoreMultiplier
        );
        
        // Particle effects
        this.particleSystem.createScorePopup(this.gator.x + 30, this.gator.y, earnedPoints);
        
        // Extra sparkle for multipliers
        if (this.scoreMultiplier > 1) {
            this.particleSystem.createSparkle(this.gator.x, this.gator.y);
        }
        
        // Update display
        this.updateScoreDisplay();
    }

    /**
     * Play score sound with pitch variation based on multiplier
     */
    playScoreSound() {
        // Play score sound with custom volume
        this.audioManager.playSound('score', this.soundVolumes?.score || 0.4);
        

    }

    /**
     * Reset combo if too much time has passed
     */
    updateComboSystem() {
        const timeSinceLastScore = Date.now() - this.lastScoreTime;
        
        // Reset combo after 3 seconds of no scoring
        if (timeSinceLastScore > 3000 && this.comboCounter > 0) {
            this.comboCounter = 0;
            this.scoreMultiplier = 1;
        }
    }

    /**
     * Destroy game instance and clean up all resources
     * Call this before navigating away or creating a new instance
     */
    destroy() {
        // Stop game loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Clean up dynamically created elements
        this.cleanupDynamicElements();
        
        // Clear particle system
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        
        // Clear score indicators
        if (this.scoreIndicatorSystem) {
            this.scoreIndicatorSystem.clear();
        }
        
        // Reset collision detector
        if (this.collisionDetector) {
            this.collisionDetector.reset();
        }
        
        // Clear pipes
        this.pipes = [];
        if (this.pipeGenerator) {
            this.pipeGenerator.reset();
        }
        
        // Note: Event listeners are handled by the browser when navigating away
        // If we need to remove them manually, we'd need to store references
        

    }
}

// Global game instance to prevent duplicates
let gameInstance = null;

// Global API client for leaderboard functions
const apiClient = new APIClient();

// Leaderboard helper function
async function loadLeaderboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    try {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Loading...</p>';
        const scores = await apiClient.getHighScores('flappy-gator');
        
        if (scores.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #888;">No scores yet. Be the first!</p>';
            return;
        }
        
        container.innerHTML = scores.map((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            
            return `
                <div class="leaderboard-entry ${isTop3 ? 'top-3' : ''}">
                    <span class="leaderboard-rank">${medal} #${rank}</span>
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-score">${entry.score}</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: #ff6b6b;">Failed to load leaderboard</p>';
    }
}

// Clean up before page unload
window.addEventListener('beforeunload', () => {
    if (gameInstance) {
        gameInstance.destroy();
        gameInstance = null;
    }
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Prevent multiple game instances
    if (gameInstance) {
        console.warn('Game instance already exists, cleaning up...');
        gameInstance.destroy();
        gameInstance = null;
    }
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Game canvas not found');
        return;
    }
    
    gameInstance = new FlappyGatorGame(canvas);
    const game = gameInstance;
    
    // Initialize game
    await game.init();
    
    // Render gator preview on start screen
    const previewCanvas = document.getElementById('gatorPreviewCanvas');
    if (previewCanvas) {
        const previewCtx = previewCanvas.getContext('2d');
        const previewRenderer = new GatorRenderer(previewCtx);
        
        // Center the gator in the preview canvas
        const centerX = previewCanvas.width / 2;
        const centerY = previewCanvas.height / 2;
        
        // Render animated gator preview
        function animatePreview() {
            // Clear canvas
            previewCtx.fillStyle = 'rgba(10, 10, 10, 0.5)';
            previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
            
            // Animate the gator (gentle bobbing motion)
            const time = Date.now() / 1000;
            const bobY = Math.sin(time * 2) * 5;
            const isFlapping = Math.floor(time * 2) % 2 === 0;
            
            // Draw gator at 1.5x scale for preview
            previewCtx.save();
            previewCtx.scale(1.5, 1.5);
            previewRenderer.drawGator(centerX / 1.5, (centerY + bobY) / 1.5, 0, isFlapping);
            previewCtx.restore();
            
            requestAnimationFrame(animatePreview);
        }
        
        animatePreview();
    }
    
    // Set up event listeners with once option where appropriate
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const howToPlayButton = document.getElementById('how-to-play-button');
    const closeHowToPlayButton = document.getElementById('close-how-to-play-button');
    const mobilePauseButton = document.getElementById('mobile-pause-btn');
    const resumeButton = document.getElementById('resume-button');
    const pauseRestartButton = document.getElementById('pause-restart-button');
    const pauseMenuButton = document.getElementById('pause-menu-button');
    
    if (startButton) {
        startButton.addEventListener('click', async () => {
            await game.start();
        });
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', async () => {
            await game.restart();
        });
    }
    
    if (backToMenuButton) {
        backToMenuButton.addEventListener('click', async () => {
            // Return to game's start screen
            if (gameInstance) {
                await gameInstance.returnToMenu();
            }
        });
    }
    
    // How to Play screen
    if (howToPlayButton) {
        howToPlayButton.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('how-to-play-screen').classList.remove('hidden');
        });
    }
    
    if (closeHowToPlayButton) {
        closeHowToPlayButton.addEventListener('click', () => {
            document.getElementById('how-to-play-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
    }
    
    // Settings screen
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsButton = document.getElementById('close-settings-button');
    const soundToggle = document.getElementById('sound-toggle');
    
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('settings-screen').classList.remove('hidden');
        });
    }
    
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => {
            document.getElementById('settings-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
    }
    
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundToggle.classList.toggle('active');
            const isActive = soundToggle.classList.contains('active');
            soundToggle.textContent = isActive ? 'ON' : 'OFF';
            
            // Toggle sound in game instance
            if (gameInstance && gameInstance.audioManager) {
                gameInstance.audioManager.setMuted(!isActive);
            }
        });
    }
    
    // Main menu button (on start screen)
    const mainMenuButton = document.getElementById('main-menu-button');
    if (mainMenuButton) {
        mainMenuButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    // Leaderboard screen
    const leaderboardButton = document.getElementById('leaderboard-button');
    const closeLeaderboardButton = document.getElementById('close-leaderboard-button');
    
    if (leaderboardButton) {
        leaderboardButton.addEventListener('click', async () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('leaderboard-screen').classList.remove('hidden');
            await loadLeaderboard('leaderboard-list');
        });
    }
    
    if (closeLeaderboardButton) {
        closeLeaderboardButton.addEventListener('click', () => {
            document.getElementById('leaderboard-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
    }
    
    // Save name button
    const saveNameButton = document.getElementById('save-name-button');
    const playerNameInput = document.getElementById('player-name-input');
    

    
    if (saveNameButton && playerNameInput) {
        saveNameButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const playerName = playerNameInput.value.trim() || 'Player';
            
            if (!gameInstance || !gameInstance.currentScoreId) {
                console.warn('No score ID available');
                return;
            }
            
            saveNameButton.disabled = true;
            saveNameButton.textContent = 'Saving...';
            
            try {
                // Update the existing score's name (copied from pac-gator pattern)
                await apiClient.updateScoreName(gameInstance.currentScoreId, playerName);
                
                // Reload leaderboard to show updated name
                await loadLeaderboard('game-over-leaderboard-list');
                playerNameInput.value = '';
                saveNameButton.textContent = 'Saved!';
                setTimeout(() => {
                    saveNameButton.textContent = 'Save to Leaderboard';
                    saveNameButton.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Error updating score name:', error);
                saveNameButton.textContent = 'Error - Try Again';
                saveNameButton.disabled = false;
            }
        });
        
        // Allow Enter key to save
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !saveNameButton.disabled) {
                saveNameButton.click();
            }
        });
    } else {
        console.error('Save button or input not found:', { saveNameButton, playerNameInput });
    }
    
    // Mobile pause button
    if (mobilePauseButton) {
        mobilePauseButton.addEventListener('click', () => {
            if (gameInstance && gameInstance.state === 'playing') {
                gameInstance.pause();
            }
        });
    }
    
    // Pause menu buttons
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            if (gameInstance) {
                gameInstance.resume();
            }
        });
    }
    
    if (pauseRestartButton) {
        pauseRestartButton.addEventListener('click', () => {
            if (gameInstance) {
                gameInstance.resume(); // Resume first to hide pause menu
                setTimeout(async () => await gameInstance.restart(), 100);
            }
        });
    }
    
    if (pauseMenuButton) {
        pauseMenuButton.addEventListener('click', async () => {
            if (gameInstance) {
                await gameInstance.returnToMenu();
            }
        });
    }
    
    // Input handlers
    canvas.addEventListener('click', () => {
        if (gameInstance) {
            gameInstance.handleInput('click');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (!gameInstance) return;
        
        if (e.code === 'Space') {
            e.preventDefault();
            gameInstance.handleInput('spacebar');
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
            e.preventDefault();
            // Toggle pause
            if (gameInstance.state === 'playing') {
                gameInstance.pause();
            } else if (gameInstance.state === 'paused') {
                gameInstance.resume();
            }
        }
    });
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameInstance) {
            gameInstance.handleInput('touch');
        }
    });
});
