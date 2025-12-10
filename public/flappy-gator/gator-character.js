/**
 * Gator Character Class
 * Manages player character physics, animation states, and collision detection
 */

class GatorCharacter {
  constructor(x, y, config = FLAPPY_CONFIG) {
    // Position
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    
    // Physics properties
    this.velocity = 0;
    this.gravity = config.GRAVITY || 0.6;
    this.flapStrength = config.FLAP_STRENGTH || -10;
    this.maxFallSpeed = config.MAX_FALL_SPEED || 12;
    this.terminalVelocity = config.TERMINAL_VELOCITY || 15;
    
    // Size and collision
    this.size = config.GATOR_SIZE || 40;
    this.hitboxRadius = config.GATOR_HITBOX_RADIUS || 18;
    
    // Rotation
    this.rotation = 0;
    this.rotationSpeed = config.GATOR_ROTATION_SPEED || 3;
    this.maxRotationUp = config.MAX_ROTATION_UP || -30;
    this.maxRotationDown = config.MAX_ROTATION_DOWN || 90;
    
    // Animation states
    this.state = 'idle'; // idle, flapping, falling, dead
    this.isFlapping = false;
    this.flapCooldown = 0;
    this.flapCooldownDuration = 10; // frames
    
    // Visual effects
    this.invincible = false;
    this.invincibilityFrames = 0;
    this.flashTimer = 0;
    
    // Stats
    this.alive = true;
    this.score = 0;
  }

  /**
   * Apply flap force (jump)
   */
  flap() {
    if (this.flapCooldown > 0 || !this.alive) return;
    
    this.velocity = this.flapStrength;
    this.isFlapping = true;
    this.flapCooldown = this.flapCooldownDuration;
    this.state = 'flapping';
  }

  /**
   * Update physics and animation
   * @param {number} deltaTime - Time since last frame (optional)
   */
  update(deltaTime = 1) {
    if (!this.alive) {
      this.state = 'dead';
      return;
    }

    // Apply gravity
    this.velocity += this.gravity * deltaTime;
    
    // Clamp velocity
    this.velocity = Math.min(this.velocity, this.terminalVelocity);
    this.velocity = Math.max(this.velocity, this.flapStrength * 1.5);
    
    // Update position
    this.y += this.velocity * deltaTime;
    
    // Update rotation based on velocity
    this.updateRotation();
    
    // Update animation state
    this.updateAnimationState();
    
    // Update cooldowns
    if (this.flapCooldown > 0) {
      this.flapCooldown--;
    }
    
    if (this.invincibilityFrames > 0) {
      this.invincibilityFrames--;
      this.flashTimer++;
      if (this.invincibilityFrames === 0) {
        this.invincible = false;
      }
    }
    
    // Reset flapping flag
    if (this.isFlapping && this.flapCooldown === 0) {
      this.isFlapping = false;
    }
  }

  /**
   * Update rotation based on velocity
   */
  updateRotation() {
    // Rotate up when flapping, down when falling
    if (this.velocity < 0) {
      // Going up - rotate upward
      this.rotation = Math.max(
        this.maxRotationUp,
        this.rotation - this.rotationSpeed
      );
    } else {
      // Falling - rotate downward
      this.rotation = Math.min(
        this.maxRotationDown,
        this.rotation + this.rotationSpeed
      );
    }
  }

  /**
   * Update animation state based on physics
   */
  updateAnimationState() {
    if (!this.alive) {
      this.state = 'dead';
    } else if (this.isFlapping) {
      this.state = 'flapping';
    } else if (this.velocity > 3) {
      this.state = 'falling';
    } else {
      this.state = 'idle';
    }
  }

  /**
   * Get circular hitbox for collision detection
   * @returns {Object} Hitbox {x, y, radius}
   */
  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      radius: this.hitboxRadius,
      top: this.y - this.hitboxRadius,
      bottom: this.y + this.hitboxRadius,
      left: this.x - this.hitboxRadius,
      right: this.x + this.hitboxRadius
    };
  }

  /**
   * Check collision with rectangular bounds
   * @param {Object} rect - Rectangle {x, y, width, height}
   * @returns {boolean} True if collision detected
   */
  checkCollisionWithRect(rect) {
    const hitbox = this.getHitbox();
    
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(hitbox.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(hitbox.y, rect.y + rect.height));
    
    // Calculate distance
    const distanceX = hitbox.x - closestX;
    const distanceY = hitbox.y - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    
    return distanceSquared < (hitbox.radius * hitbox.radius);
  }

  /**
   * Check collision with ceiling
   * @param {number} ceilingY - Y position of ceiling
   * @returns {boolean} True if collision detected
   */
  checkCeilingCollision(ceilingY = 0) {
    return this.getHitbox().top <= ceilingY;
  }

  /**
   * Check collision with ground
   * @param {number} groundY - Y position of ground
   * @returns {boolean} True if collision detected
   */
  checkGroundCollision(groundY) {
    return this.getHitbox().bottom >= groundY;
  }

  /**
   * Handle collision event
   * @param {string} type - Collision type (pipe, ceiling, ground)
   */
  onCollision(type) {
    if (this.invincible) return;
    
    this.alive = false;
    this.state = 'dead';
    this.velocity = 0;
  }

  /**
   * Make gator invincible for a duration
   * @param {number} frames - Number of frames
   */
  makeInvincible(frames = 60) {
    this.invincible = true;
    this.invincibilityFrames = frames;
    this.flashTimer = 0;
  }

  /**
   * Check if gator should be visible (for flashing effect)
   * @returns {boolean} True if visible
   */
  isVisible() {
    if (!this.invincible) return true;
    return Math.floor(this.flashTimer / 5) % 2 === 0;
  }

  /**
   * Reset gator to starting position
   */
  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.velocity = 0;
    this.rotation = 0;
    this.alive = true;
    this.state = 'idle';
    this.isFlapping = false;
    this.flapCooldown = 0;
    this.invincible = false;
    this.invincibilityFrames = 0;
    this.flashTimer = 0;
  }

  /**
   * Render the gator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {GatorRenderer} renderer - Gator renderer instance
   */
  render(ctx, renderer) {
    if (!this.isVisible()) return;
    
    renderer.drawGator(
      this.x,
      this.y,
      this.rotation,
      this.isFlapping
    );
  }

  /**
   * Debug: Draw hitbox
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  debugDrawHitbox(ctx) {
    const hitbox = this.getHitbox();
    
    ctx.save();
    ctx.strokeStyle = this.alive ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hitbox.x, hitbox.y, hitbox.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Get current state info
   * @returns {Object} State data
   */
  getState() {
    return {
      x: this.x,
      y: this.y,
      velocity: this.velocity,
      rotation: this.rotation,
      state: this.state,
      alive: this.alive,
      invincible: this.invincible,
      score: this.score
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GatorCharacter;
}
