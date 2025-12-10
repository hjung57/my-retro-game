/**
 * Performance Optimizer
 * Handles object pooling, FPS monitoring, and memory management
 * Target: 60 FPS with efficient resource usage
 */

class PerformanceOptimizer {
  constructor() {
    // FPS monitoring
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS;
    this.lastFrameTime = performance.now();
    this.fps = 60;
    this.frameCount = 0;
    this.fpsUpdateInterval = 30; // Update FPS display every 30 frames
    
    // Performance metrics
    this.metrics = {
      avgFrameTime: 0,
      minFPS: 60,
      maxFPS: 60,
      droppedFrames: 0,
      totalFrames: 0
    };
    
    // Object pools
    this.pools = {
      pipes: new ObjectPool(() => this.createPipe(), 20),
      particles: new ObjectPool(() => this.createParticle(), 100),
      scoreIndicators: new ObjectPool(() => this.createScoreIndicator(), 10)
    };
    
    // Rendering optimization
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.dirtyRegions = [];
    
    // Memory management
    this.lastGCTime = performance.now();
    this.gcInterval = 5000; // Suggest GC every 5 seconds
  }

  /**
   * Initialize FPS counter and performance monitoring
   */
  init() {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.metrics.totalFrames = 0;
  }

  /**
   * Update FPS counter (call once per frame)
   * @returns {number} Current FPS
   */
  updateFPS() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Calculate instantaneous FPS
    const instantFPS = 1000 / deltaTime;
    
    // Smooth FPS using exponential moving average
    this.fps = this.fps * 0.9 + instantFPS * 0.1;
    
    // Track metrics
    this.metrics.totalFrames++;
    this.metrics.avgFrameTime = this.metrics.avgFrameTime * 0.95 + deltaTime * 0.05;
    this.metrics.minFPS = Math.min(this.metrics.minFPS, instantFPS);
    this.metrics.maxFPS = Math.max(this.metrics.maxFPS, instantFPS);
    
    // Detect dropped frames
    if (deltaTime > this.frameTime * 1.5) {
      this.metrics.droppedFrames++;
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    return Math.round(this.fps);
  }

  /**
   * Check if performance is acceptable
   * @returns {boolean} True if running at acceptable FPS
   */
  isPerformanceGood() {
    return this.fps >= this.targetFPS * 0.8; // 80% of target
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance data
   */
  getMetrics() {
    return {
      fps: Math.round(this.fps),
      avgFrameTime: Math.round(this.metrics.avgFrameTime * 10) / 10,
      minFPS: Math.round(this.metrics.minFPS),
      maxFPS: Math.round(this.metrics.maxFPS),
      droppedFrames: this.metrics.droppedFrames,
      totalFrames: this.metrics.totalFrames,
      dropRate: ((this.metrics.droppedFrames / this.metrics.totalFrames) * 100).toFixed(2) + '%'
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      avgFrameTime: 0,
      minFPS: 60,
      maxFPS: 60,
      droppedFrames: 0,
      totalFrames: 0
    };
    this.fps = 60;
  }

  /**
   * Get a pipe from the pool
   * @returns {Object} Pipe object
   */
  getPipe() {
    return this.pools.pipes.get();
  }

  /**
   * Return a pipe to the pool
   * @param {Object} pipe - Pipe to return
   */
  returnPipe(pipe) {
    this.pools.pipes.return(pipe);
  }

  /**
   * Get a particle from the pool
   * @returns {Object} Particle object
   */
  getParticle() {
    return this.pools.particles.get();
  }

  /**
   * Return a particle to the pool
   * @param {Object} particle - Particle to return
   */
  returnParticle(particle) {
    this.pools.particles.return(particle);
  }

  /**
   * Get a score indicator from the pool
   * @returns {Object} Score indicator object
   */
  getScoreIndicator() {
    return this.pools.scoreIndicators.get();
  }

  /**
   * Return a score indicator to the pool
   * @param {Object} indicator - Score indicator to return
   */
  returnScoreIndicator(indicator) {
    this.pools.scoreIndicators.return(indicator);
  }

  /**
   * Create a new pipe object (for pooling)
   * @returns {Object} Pipe object
   */
  createPipe() {
    return {
      x: 0,
      width: 60,
      topHeight: 0,
      gap: 0,
      speed: 2,
      scored: false,
      active: false
    };
  }

  /**
   * Create a new particle object (for pooling)
   * @returns {Object} Particle object
   */
  createParticle() {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 60,
      size: 3,
      color: '#FFFFFF',
      active: false
    };
  }

  /**
   * Create a new score indicator object (for pooling)
   * @returns {Object} Score indicator object
   */
  createScoreIndicator() {
    return {
      x: 0,
      y: 0,
      text: '',
      life: 0,
      maxLife: 60,
      active: false
    };
  }

  /**
   * Suggest garbage collection if needed
   */
  suggestGC() {
    const now = performance.now();
    if (now - this.lastGCTime > this.gcInterval) {
      // Clear unused pool objects
      this.pools.pipes.trim();
      this.pools.particles.trim();
      this.pools.scoreIndicators.trim();
      this.lastGCTime = now;
    }
  }

  /**
   * Draw FPS counter on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawFPS(ctx, x = 10, y = 30) {
    ctx.save();
    ctx.font = '14px monospace';
    ctx.fillStyle = this.isPerformanceGood() ? '#00FF00' : '#FF0000';
    ctx.fillText(`FPS: ${Math.round(this.fps)}`, x, y);
    ctx.restore();
  }

  /**
   * Draw detailed performance stats
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawDetailedStats(ctx, x = 10, y = 30) {
    const metrics = this.getMetrics();
    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = '#FFFFFF';
    
    const lines = [
      `FPS: ${metrics.fps}`,
      `Avg: ${metrics.avgFrameTime}ms`,
      `Min: ${metrics.minFPS} Max: ${metrics.maxFPS}`,
      `Drops: ${metrics.droppedFrames} (${metrics.dropRate})`
    ];
    
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * 15);
    });
    
    ctx.restore();
  }
}

/**
 * Object Pool
 * Reuses objects to reduce garbage collection overhead
 */
class ObjectPool {
  constructor(createFn, initialSize = 10) {
    this.createFn = createFn;
    this.pool = [];
    this.active = [];
    
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  /**
   * Get an object from the pool
   * @returns {Object} Pooled object
   */
  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    obj.active = true;
    this.active.push(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   * @param {Object} obj - Object to return
   */
  return(obj) {
    obj.active = false;
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(obj);
    }
  }

  /**
   * Return all inactive objects to pool
   */
  returnInactive() {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const obj = this.active[i];
      if (!obj.active) {
        this.active.splice(i, 1);
        this.pool.push(obj);
      }
    }
  }

  /**
   * Trim pool to reduce memory usage
   * Keeps only half of inactive objects
   */
  trim() {
    const keepCount = Math.ceil(this.pool.length / 2);
    this.pool.length = keepCount;
  }

  /**
   * Get pool statistics
   * @returns {Object} Pool stats
   */
  getStats() {
    return {
      available: this.pool.length,
      active: this.active.length,
      total: this.pool.length + this.active.length
    };
  }

  /**
   * Clear all objects from pool
   */
  clear() {
    this.pool = [];
    this.active = [];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceOptimizer, ObjectPool };
}
