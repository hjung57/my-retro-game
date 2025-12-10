# Performance Optimization Guide

## Overview
The performance optimizer provides object pooling, FPS monitoring, and memory management to maintain 60 FPS gameplay.

## Features

### 1. Object Pooling
Reuses objects instead of creating/destroying them, reducing garbage collection overhead.

**Available Pools:**
- Pipes (default: 20 objects)
- Particles (default: 100 objects)
- Score indicators (default: 10 objects)

**Usage Example:**
```javascript
const optimizer = new PerformanceOptimizer();

// Get a pipe from pool
const pipe = optimizer.getPipe();
pipe.x = 400;
pipe.topHeight = 200;
pipe.active = true;

// Return to pool when done
pipe.active = false;
optimizer.returnPipe(pipe);
```

### 2. FPS Monitoring
Tracks frame rate and performance metrics in real-time.

**Usage:**
```javascript
// In game loop
function gameLoop() {
  const fps = optimizer.updateFPS();
  
  // Check performance
  if (!optimizer.isPerformanceGood()) {
    console.warn('Performance degraded!');
  }
  
  // Draw FPS counter (if enabled)
  if (FLAPPY_CONFIG.SHOW_FPS) {
    optimizer.drawFPS(ctx, 10, 30);
  }
  
  requestAnimationFrame(gameLoop);
}
```

**Metrics Available:**
- Current FPS
- Average frame time
- Min/Max FPS
- Dropped frames count
- Drop rate percentage

### 3. Memory Management
Automatic pool trimming and garbage collection suggestions.

**Usage:**
```javascript
// Call periodically (e.g., every 5 seconds)
optimizer.suggestGC();
```

## Configuration

Edit `public/flappy-gator/config.js`:

```javascript
// Performance optimization
TARGET_FPS: 60,                    // Target frame rate
ENABLE_OBJECT_POOLING: true,       // Enable/disable pooling
PIPE_POOL_SIZE: 20,                // Initial pipe pool size
PARTICLE_POOL_SIZE: 100,           // Initial particle pool size
SHOW_FPS: false,                   // Display FPS counter
SHOW_DETAILED_STATS: false,        // Show detailed performance stats
GC_INTERVAL: 5000,                 // GC suggestion interval (ms)
```

## Integration Steps

### Step 1: Initialize
```javascript
const optimizer = new PerformanceOptimizer();
optimizer.init();
```

### Step 2: Update Game Loop
```javascript
function gameLoop() {
  // Update FPS counter
  optimizer.updateFPS();
  
  // Your game logic here
  updateGame();
  renderGame();
  
  // Periodic cleanup
  optimizer.suggestGC();
  
  requestAnimationFrame(gameLoop);
}
```

### Step 3: Use Object Pooling for Pipes
```javascript
// Instead of: pipes.push({ x: 400, ... })
const pipe = optimizer.getPipe();
pipe.x = 400;
pipe.topHeight = 200;
pipe.gap = 180;
pipe.active = true;
pipes.push(pipe);

// When removing pipes
pipes = pipes.filter(pipe => {
  if (pipe.x < -pipe.width) {
    optimizer.returnPipe(pipe);
    return false;
  }
  return true;
});
```

### Step 4: Use Object Pooling for Particles
```javascript
// Create particle
const particle = optimizer.getParticle();
particle.x = gatorX;
particle.y = gatorY;
particle.vx = Math.random() * 4 - 2;
particle.vy = Math.random() * 4 - 2;
particle.life = 60;
particle.active = true;

// Update particles
particles = particles.filter(p => {
  p.life--;
  if (p.life <= 0) {
    optimizer.returnParticle(p);
    return false;
  }
  return true;
});
```

## Performance Tips

1. **Enable pooling for frequently created/destroyed objects**
   - Pipes, particles, score indicators

2. **Monitor FPS during development**
   - Set `SHOW_FPS: true` to see real-time performance
   - Use `SHOW_DETAILED_STATS: true` for debugging

3. **Batch rendering operations**
   - Group similar draw calls together
   - Minimize context state changes

4. **Limit particle counts**
   - Adjust `PARTICLE_POOL_SIZE` based on device performance
   - Consider reducing particles on low-end devices

5. **Profile regularly**
   - Check `optimizer.getMetrics()` for performance data
   - Look for dropped frames and high frame times

## Debugging

### Display FPS Counter
```javascript
// In config.js
SHOW_FPS: true
```

### Display Detailed Stats
```javascript
// In config.js
SHOW_DETAILED_STATS: true

// In game loop
optimizer.drawDetailedStats(ctx, 10, 30);
```

### Check Pool Statistics
```javascript
const pipeStats = optimizer.pools.pipes.getStats();
console.log('Pipes:', pipeStats);
// Output: { available: 15, active: 5, total: 20 }
```

## Expected Performance

- **Target:** 60 FPS
- **Acceptable:** 48+ FPS (80% of target)
- **Warning:** Below 48 FPS indicates performance issues

## Troubleshooting

**Low FPS?**
1. Check dropped frame rate in metrics
2. Reduce particle count
3. Simplify rendering (fewer draw calls)
4. Enable object pooling if disabled

**High memory usage?**
1. Ensure objects are returned to pools
2. Reduce pool sizes
3. Call `suggestGC()` more frequently
4. Check for memory leaks (objects not being returned)

**Stuttering?**
1. Check for synchronous operations in game loop
2. Verify requestAnimationFrame is used correctly
3. Profile with browser DevTools
