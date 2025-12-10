---
inclusion: always
---
# Game Coding Standards

## JavaScript Game Patterns

### Class-Based Architecture
Use ES6 classes for game entities and systems:

```javascript
// Good: Clear, reusable class
class GatorCharacter {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
  }
  
  update(deltaTime) {
    this.y += this.velocity * deltaTime;
  }
}

// Avoid: Scattered functions and global state
let gatorX = 100;
let gatorY = 300;
function updateGator() { /* ... */ }
```

### Separation of Concerns
Keep logic, rendering, and data separate:

```javascript
// Physics/Logic
class PhysicsEngine {
  applyGravity(entity, gravity) { }
}

// Rendering
class GatorRenderer {
  drawGator(x, y, rotation) { }
}

// Data/State
class GameStateManager {
  saveHighScore(score) { }
}
```

### Configuration Over Hardcoding
Use config objects for tunable values:

```javascript
// Good: Centralized config
const CONFIG = {
  GRAVITY: 0.6,
  FLAP_STRENGTH: -10
};

class Gator {
  constructor(config = CONFIG) {
    this.gravity = config.GRAVITY;
  }
}

// Avoid: Magic numbers scattered in code
this.velocity += 0.6; // What is 0.6?
```

## Class Naming Conventions

### Entity Classes
Use noun-based names for game objects:
- `GatorCharacter` - Player character
- `PipeObstacle` - Obstacle entity
- `ParticleEffect` - Visual effect

### System Classes
Use descriptive names for game systems:
- `PhysicsEngine` - Handles physics calculations
- `CollisionDetector` - Manages collision detection
- `AudioManager` - Controls sound/music
- `PerformanceOptimizer` - Handles optimization

### Manager/Controller Classes
Use "Manager" or "Controller" suffix:
- `GameStateManager` - Manages game states
- `InputController` - Handles user input
- `ScoreManager` - Tracks scoring

### Renderer Classes
Use "Renderer" suffix for drawing classes:
- `GatorRenderer` - Renders gator sprite
- `BackgroundRenderer` - Renders background
- `UIRenderer` - Renders UI elements

## Performance Optimization Guidelines

### 1. Object Pooling
Reuse objects instead of creating/destroying:

```javascript
// Good: Object pool
const pipePool = new ObjectPool(() => createPipe(), 20);
const pipe = pipePool.get();
// ... use pipe ...
pipePool.return(pipe);

// Avoid: Constant allocation
pipes.push({ x: 400, y: 200 }); // Creates garbage
```

### 2. Minimize Canvas State Changes
Batch similar drawing operations:

```javascript
// Good: Batch by style
ctx.fillStyle = '#5CB54D';
pipes.forEach(pipe => drawPipe(pipe));

ctx.fillStyle = '#FFFFFF';
particles.forEach(p => drawParticle(p));

// Avoid: Constant style changes
pipes.forEach(pipe => {
  ctx.fillStyle = '#5CB54D'; // Repeated state change
  drawPipe(pipe);
});
```

### 3. Use RequestAnimationFrame
Always use RAF for game loops:

```javascript
// Good: Smooth 60 FPS
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Avoid: setInterval (inconsistent timing)
setInterval(gameLoop, 16); // Don't use this
```

### 4. Limit Calculations Per Frame
Cache expensive calculations:

```javascript
// Good: Cache once
const hitbox = gator.getHitbox();
pipes.forEach(pipe => checkCollision(hitbox, pipe));

// Avoid: Recalculate repeatedly
pipes.forEach(pipe => {
  const hitbox = gator.getHitbox(); // Wasteful
  checkCollision(hitbox, pipe);
});
```

### 5. Early Exit Patterns
Skip unnecessary work:

```javascript
// Good: Early exit
checkPipeCollision(gator, pipes) {
  if (this.invincible) return false;
  
  for (const pipe of pipes) {
    if (pipe.x + pipe.width < gator.x - 50) continue; // Skip far pipes
    if (this.collides(gator, pipe)) return true;
  }
  return false;
}
```

### 6. Avoid Memory Leaks
Clean up event listeners and references:

```javascript
// Good: Cleanup
class Game {
  init() {
    this.handleClick = () => this.gator.flap();
    canvas.addEventListener('click', this.handleClick);
  }
  
  destroy() {
    canvas.removeEventListener('click', this.handleClick);
  }
}
```

## Code Organization

### File Structure

**Flappy Gator (Side-scrolling physics game):**
```
public/flappy-gator/
├── config.js                    # Game configuration constants
├── gator-character.js           # Player entity with physics
├── flappy-gator-renderer.js     # Gator sprite rendering
├── physics-engine.js            # Gravity and velocity calculations
├── collision-detector.js        # Circle-rect collision detection
├── performance-optimizer.js     # Object pooling and FPS monitoring
├── particle-system.js           # Visual effects (explosions, trails)
├── score-indicator.js           # Floating score popups
└── game.js                      # Main game loop and systems

**Pac-Gator (Grid-based maze game):**
```
public/pac-gator/
├── config.js                    # Game configuration constants
├── game.js                      # Main game logic, maze, AI
├── particles.js                 # Particle effects system
├── background-music.js          # Music management
└── style.css                    # Game-specific styles

**Shared Systems:**
```
public/shared/
├── api-client.js                # High score API communication
├── audio-manager.js             # Sound effects management
└── game-selector.js             # Game launcher/menu
```

### Module Pattern
Use clear exports:

```javascript
// At end of file
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GatorCharacter;
}
```

## Best Practices

### 1. Document Public APIs
Add JSDoc comments for public methods:

```javascript
/**
 * Apply flap force to make gator jump
 * @param {number} strength - Optional flap strength override
 */
flap(strength = this.flapStrength) {
  this.velocity = strength;
}
```

### 2. Use Meaningful Variable Names
```javascript
// Good
const pipeSpawnInterval = 120;
const gatorHitboxRadius = 18;

// Avoid
const psi = 120;
const r = 18;
```

### 3. Keep Methods Focused
One method, one responsibility:

```javascript
// Good: Focused methods
update() {
  this.applyPhysics();
  this.updateAnimation();
  this.checkBounds();
}

// Avoid: God method
update() {
  // 200 lines of mixed logic
}
```

### 4. Use Constants for Magic Numbers
```javascript
// Good
const FRAMES_PER_SECOND = 60;
const PIPE_SPAWN_INTERVAL = 120;

// Avoid
if (frameCount % 120 === 0) { } // What is 120?
```

### 5. Handle Edge Cases
```javascript
// Good: Defensive programming
checkCollision(entity) {
  if (!entity || !entity.alive) return false;
  if (this.invincible) return false;
  // ... collision logic
}
```

## Performance Targets

### Both Games
- **Target FPS**: 60
- **Acceptable FPS**: 48+ (80% of target)
- **Max Frame Time**: 16.67ms

### Flappy Gator (Object Pooling)
- **Pipes**: 20 objects
- **Particles**: 100 objects
- **Score Indicators**: 10 objects

### Pac-Gator (Frame-Based Timing)
- **Gator Speed**: 8 frames between moves
- **Ghost Speed (Normal)**: 12 frames between moves
- **Ghost Speed (Frightened)**: 18 frames between moves
- **Power Pellet Duration**: 300 frames (5 seconds)

## Testing Guidelines

### Property-Based Tests
Test invariants and properties:

```javascript
// Flappy Gator: Physics invariants
test('gator velocity never exceeds terminal velocity', () => {
  const gator = new GatorCharacter(100, 300);
  for (let i = 0; i < 1000; i++) {
    gator.update();
    expect(gator.velocity).toBeLessThanOrEqual(gator.terminalVelocity);
  }
});

test('pipe gaps are always within valid range', () => {
  const generator = new PipeGenerator(400, 600);
  for (let i = 0; i < 100; i++) {
    const pipe = generator.generatePipe();
    expect(pipe.gapY).toBeGreaterThanOrEqual(generator.minGapY);
    expect(pipe.gapY).toBeLessThanOrEqual(generator.maxGapY);
  }
});

// Pac-Gator: Grid movement invariants
test('gator always stays on valid tiles', () => {
  const maze = createMaze();
  const gator = { tileX: 14, tileY: 23 };
  
  for (let i = 0; i < 1000; i++) {
    const randomDir = getRandomDirection();
    moveGator(gator, randomDir, maze);
    expect(maze[gator.tileY][gator.tileX]).not.toBe(1); // Not a wall
  }
});
```

### Unit Tests
Test individual methods:

```javascript
// Flappy Gator tests
test('flap applies negative velocity', () => {
  const gator = new GatorCharacter(100, 300);
  gator.flap();
  expect(gator.velocity).toBeLessThan(0);
});

test('collision detection works with rectangles', () => {
  const gator = new GatorCharacter(100, 300);
  const pipe = { x: 90, y: 0, width: 60, height: 200 };
  expect(gator.checkCollisionWithRect(pipe)).toBe(true);
});

// Pac-Gator tests
test('collecting dot increases score by 10', () => {
  const initialScore = gameState.score;
  collectDot(14, 23);
  expect(gameState.score).toBe(initialScore + 10);
});

test('power pellet makes ghosts frightened', () => {
  collectPowerPellet();
  ghosts.forEach(ghost => {
    expect(ghost.mode).toBe('frightened');
  });
});
```

### Integration Tests
Test game systems working together:

```javascript
// Flappy Gator: Full game cycle
test('game over occurs on collision', () => {
  const game = new FlappyGatorGame(canvas);
  game.start();
  
  // Simulate collision
  game.gator.y = 0; // Hit ceiling
  game.update();
  
  expect(game.state).toBe('gameOver');
  expect(game.gator.alive).toBe(false);
});

// Pac-Gator: Level completion
test('level completes when all dots collected', () => {
  initGame();
  const totalDots = countDots(maze);
  
  // Collect all dots
  for (let i = 0; i < totalDots; i++) {
    collectDot();
  }
  
  expect(gameState.current).toBe('levelComplete');
});
```

## Common Patterns

### State Machine
Used in both games for managing game states:

```javascript
// Flappy Gator example
class GameStateManager {
  constructor() {
    this.state = 'start'; // start, playing, paused, gameOver
  }
  
  setState(newState) {
    this.onExit(this.state);
    this.state = newState;
    this.onEnter(newState);
  }
  
  onEnter(state) {
    if (state === 'playing') this.startGameTimer();
    if (state === 'gameOver') this.showGameOverScreen();
  }
}

// Pac-Gator example
const gameState = {
  current: 'start', // start, playing, paused, gameOver, levelComplete
  lives: 3,
  score: 0,
  level: 1
};
```

### Observer Pattern
```javascript
class EventEmitter {
  on(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    this.listeners[event]?.forEach(cb => cb(data));
  }
}

// Usage in games
game.on('scoreChanged', (score) => updateScoreDisplay(score));
game.on('collision', (type) => playCollisionSound(type));
```

### Factory Pattern
```javascript
// Flappy Gator: Pipe generation
class PipeGenerator {
  generatePipe() {
    return {
      x: this.canvasWidth,
      width: this.pipeWidth,
      gapY: this.calculateGapPosition(),
      gapHeight: this.currentGapHeight,
      scored: false
    };
  }
}

// Pac-Gator: Ghost creation
function createGhost(color, startX, startY) {
  return {
    x: startX,
    y: startY,
    color: color,
    mode: 'scatter', // scatter, chase, frightened
    direction: { x: 0, y: 0 }
  };
}
```

### Grid-Based Movement (Pac-Gator)
```javascript
// Tile-based positioning
const TILE_SIZE = 25;
const COLS = 28;
const ROWS = 31;

function moveEntity(entity, direction) {
  const nextTile = {
    x: entity.tileX + direction.x,
    y: entity.tileY + direction.y
  };
  
  if (isWalkable(nextTile)) {
    entity.tileX = nextTile.x;
    entity.tileY = nextTile.y;
    entity.x = nextTile.x * TILE_SIZE;
    entity.y = nextTile.y * TILE_SIZE;
  }
}
```

### Physics-Based Movement (Flappy Gator)
```javascript
// Continuous physics simulation
class PhysicsEngine {
  applyGravity(entity, gravity = 0.6) {
    entity.velocity += gravity;
    entity.velocity = Math.min(entity.velocity, entity.terminalVelocity);
  }
  
  applyVelocity(entity, deltaTime = 1) {
    entity.y += entity.velocity * deltaTime;
  }
}
```

## Game-Specific Patterns

### Flappy Gator (Physics-Based Side-Scroller)
**Key Characteristics:**
- Continuous physics simulation (gravity, velocity)
- Circular collision detection for player
- Rectangle collision for obstacles
- Object pooling for performance
- Progressive difficulty (speed/gap changes)

**Example Structure:**
```javascript
class FlappyGatorGame {
  constructor(canvas) {
    this.gator = new GatorCharacter(100, 300, FLAPPY_CONFIG);
    this.pipeGenerator = new PipeGenerator(canvas.width, canvas.height);
    this.physicsEngine = new PhysicsEngine();
    this.collisionDetector = new CollisionDetector(canvas.height);
    this.optimizer = new PerformanceOptimizer();
  }
  
  update() {
    this.physicsEngine.applyGravity(this.gator);
    this.gator.update();
    this.pipeGenerator.updatePipes();
    this.checkCollisions();
  }
}
```

### Pac-Gator (Grid-Based Maze Game)
**Key Characteristics:**
- Tile-based movement (discrete positions)
- Frame-based timing (not continuous)
- AI pathfinding for ghosts
- State-based ghost behavior (scatter/chase/frightened)
- Maze collision detection

**Example Structure:**
```javascript
// Grid-based game state
const gameState = {
  gator: { tileX: 14, tileY: 23, direction: { x: 0, y: -1 } },
  ghosts: [
    { tileX: 13, tileY: 11, color: 'red', mode: 'chase' },
    { tileX: 14, tileY: 11, color: 'pink', mode: 'scatter' }
  ],
  maze: [...], // 2D array
  frameCounter: 0,
  gatorMoveInterval: 8,
  ghostMoveInterval: 12
};

function gameLoop() {
  frameCounter++;
  
  // Frame-based movement
  if (frameCounter % gameState.gatorMoveInterval === 0) {
    moveGator();
  }
  
  if (frameCounter % gameState.ghostMoveInterval === 0) {
    moveGhosts();
  }
  
  checkCollisions();
  render();
  requestAnimationFrame(gameLoop);
}
```

### Collision Detection Approaches

**Flappy Gator (Circle-Rectangle):**
```javascript
// Continuous space collision
function circleRectCollision(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  
  const distX = circle.x - closestX;
  const distY = circle.y - closestY;
  const distSquared = (distX * distX) + (distY * distY);
  
  return distSquared < (circle.radius * circle.radius);
}
```

**Pac-Gator (Tile-Based):**
```javascript
// Discrete tile collision
function checkTileCollision(tileX, tileY, maze) {
  if (tileX < 0 || tileX >= COLS || tileY < 0 || tileY >= ROWS) {
    return true; // Out of bounds
  }
  return maze[tileY][tileX] === 1; // Wall tile
}

function checkGhostCollision(gator, ghosts) {
  return ghosts.some(ghost => 
    ghost.tileX === gator.tileX && ghost.tileY === gator.tileY
  );
}
```

## Anti-Patterns to Avoid

❌ Global variables
❌ Tight coupling between classes
❌ God objects (classes that do everything)
❌ Magic numbers without constants
❌ Synchronous operations in game loop
❌ Memory leaks from event listeners
❌ Excessive object creation in loops
❌ Deep nesting (> 3 levels)
❌ Mixing physics and grid-based movement patterns
❌ Hardcoding game-specific values (use config files)

## Entity-Component Patterns

### Simple Entity Pattern (Current Approach)
For small games, use class-based entities with composition:

```javascript
// Entity with components as properties
class GatorCharacter {
  constructor(x, y, config) {
    // Transform component
    this.x = x;
    this.y = y;
    this.rotation = 0;
    
    // Physics component
    this.velocity = 0;
    this.gravity = config.GRAVITY;
    
    // Collision component
    this.hitboxRadius = config.GATOR_HITBOX_RADIUS;
    
    // State component
    this.alive = true;
    this.state = 'idle';
  }
  
  update() {
    this.updatePhysics();
    this.updateAnimation();
  }
}
```

### Component-Based Pattern (For Larger Games)
For complex games, separate concerns into reusable components:

```javascript
// Components
class TransformComponent {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.rotation = 0;
  }
}

class PhysicsComponent {
  constructor(gravity, velocity = 0) {
    this.velocity = velocity;
    this.gravity = gravity;
  }
  
  update(transform) {
    this.velocity += this.gravity;
    transform.y += this.velocity;
  }
}

class CollisionComponent {
  constructor(radius) {
    this.radius = radius;
  }
  
  getHitbox(transform) {
    return {
      x: transform.x,
      y: transform.y,
      radius: this.radius
    };
  }
}

// Entity composed of components
class Entity {
  constructor() {
    this.components = new Map();
  }
  
  addComponent(name, component) {
    this.components.set(name, component);
    return this;
  }
  
  getComponent(name) {
    return this.components.get(name);
  }
  
  hasComponent(name) {
    return this.components.has(name);
  }
}

// Usage
const gator = new Entity()
  .addComponent('transform', new TransformComponent(100, 300))
  .addComponent('physics', new PhysicsComponent(0.6))
  .addComponent('collision', new CollisionComponent(18));
```

### System Pattern
Systems operate on entities with specific components:

```javascript
class PhysicsSystem {
  update(entities) {
    entities.forEach(entity => {
      if (entity.hasComponent('physics') && entity.hasComponent('transform')) {
        const physics = entity.getComponent('physics');
        const transform = entity.getComponent('transform');
        physics.update(transform);
      }
    });
  }
}

class CollisionSystem {
  update(entities) {
    const collidables = entities.filter(e => 
      e.hasComponent('collision') && e.hasComponent('transform')
    );
    
    // Check collisions between all collidable entities
    for (let i = 0; i < collidables.length; i++) {
      for (let j = i + 1; j < collidables.length; j++) {
        this.checkCollision(collidables[i], collidables[j]);
      }
    }
  }
}
```

## Game Loop Structure

### Fixed Timestep Loop (Recommended)
Ensures consistent physics regardless of frame rate:

```javascript
class GameLoop {
  constructor(updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    
    this.fps = 60;
    this.frameTime = 1000 / this.fps;
    this.lastTime = 0;
    this.accumulator = 0;
    this.running = false;
  }
  
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  loop = () => {
    if (!this.running) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Accumulate time
    this.accumulator += deltaTime;
    
    // Fixed timestep updates
    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime / 1000); // Convert to seconds
      this.accumulator -= this.frameTime;
    }
    
    // Render with interpolation factor
    const alpha = this.accumulator / this.frameTime;
    this.render(alpha);
    
    requestAnimationFrame(this.loop);
  }
  
  stop() {
    this.running = false;
  }
}

// Usage
const gameLoop = new GameLoop(
  (deltaTime) => game.update(deltaTime),
  (alpha) => game.render(alpha)
);
gameLoop.start();
```

### Variable Timestep Loop (Simpler)
Good for simple games where physics precision isn't critical:

```javascript
class SimpleGameLoop {
  constructor(game) {
    this.game = game;
    this.lastTime = 0;
    this.running = false;
  }
  
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  loop = () => {
    if (!this.running) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // seconds
    this.lastTime = currentTime;
    
    // Cap delta time to prevent spiral of death
    const cappedDelta = Math.min(deltaTime, 0.1);
    
    this.game.update(cappedDelta);
    this.game.render();
    
    requestAnimationFrame(this.loop);
  }
  
  stop() {
    this.running = false;
  }
}
```

### Frame-Based Loop (Pac-Gator Style)
For grid-based games with discrete movement:

```javascript
class FrameBasedLoop {
  constructor(game) {
    this.game = game;
    this.frameCount = 0;
    this.running = false;
  }
  
  start() {
    this.running = true;
    this.loop();
  }
  
  loop = () => {
    if (!this.running) return;
    
    this.frameCount++;
    
    // Frame-based logic
    if (this.frameCount % this.game.gatorMoveInterval === 0) {
      this.game.moveGator();
    }
    
    if (this.frameCount % this.game.ghostMoveInterval === 0) {
      this.game.moveGhosts();
    }
    
    this.game.update();
    this.game.render();
    
    requestAnimationFrame(this.loop);
  }
  
  stop() {
    this.running = false;
  }
}
```

### Game Loop Best Practices

1. **Always use requestAnimationFrame** - Never use setInterval
2. **Cap delta time** - Prevent "spiral of death" on lag spikes
3. **Separate update and render** - Keep logic and drawing independent
4. **Use fixed timestep for physics** - Ensures deterministic behavior
5. **Pause/resume support** - Allow stopping and restarting the loop

```javascript
// Example: Pausable game loop
class PausableGameLoop {
  constructor(game) {
    this.game = game;
    this.paused = false;
    this.running = false;
  }
  
  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
    this.lastTime = performance.now(); // Reset time
  }
  
  loop = () => {
    if (!this.running) return;
    
    if (!this.paused) {
      const currentTime = performance.now();
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      
      this.game.update(Math.min(deltaTime, 0.1));
    }
    
    this.game.render(); // Always render, even when paused
    requestAnimationFrame(this.loop);
  }
}
```

## Memory Management

### Object Pooling
Reuse objects to minimize garbage collection:

```javascript
class ObjectPool {
  constructor(createFn, initialSize = 10) {
    this.createFn = createFn;
    this.available = [];
    this.inUse = [];
    
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }
  
  get() {
    let obj;
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.createFn();
    }
    this.inUse.push(obj);
    obj.active = true;
    return obj;
  }
  
  return(obj) {
    obj.active = false;
    const index = this.inUse.indexOf(obj);
    if (index > -1) {
      this.inUse.splice(index, 1);
      this.available.push(obj);
    }
  }
  
  returnAll() {
    this.inUse.forEach(obj => obj.active = false);
    this.available.push(...this.inUse);
    this.inUse = [];
  }
  
  clear() {
    this.available = [];
    this.inUse = [];
  }
}

// Usage
const particlePool = new ObjectPool(() => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false
}), 100);

// Get particle
const particle = particlePool.get();
particle.x = 100;
particle.y = 200;

// Return when done
particlePool.return(particle);
```

### Array Management
Avoid creating new arrays in hot paths:

```javascript
// Bad: Creates garbage
function update() {
  const activePipes = pipes.filter(p => p.active); // New array every frame
  activePipes.forEach(p => p.update());
}

// Good: Reuse array
function update() {
  for (let i = 0; i < pipes.length; i++) {
    if (pipes[i].active) {
      pipes[i].update();
    }
  }
}

// Good: Remove in-place
function removePipes() {
  for (let i = pipes.length - 1; i >= 0; i--) {
    if (pipes[i].x < -pipes[i].width) {
      pipePool.return(pipes[i]);
      pipes.splice(i, 1);
    }
  }
}
```

### Event Listener Cleanup
Always remove event listeners to prevent memory leaks:

```javascript
class InputController {
  constructor(canvas) {
    this.canvas = canvas;
    this.handlers = {};
  }
  
  init() {
    // Store bound functions for cleanup
    this.handlers.click = this.handleClick.bind(this);
    this.handlers.keydown = this.handleKeyDown.bind(this);
    
    this.canvas.addEventListener('click', this.handlers.click);
    document.addEventListener('keydown', this.handlers.keydown);
  }
  
  destroy() {
    this.canvas.removeEventListener('click', this.handlers.click);
    document.removeEventListener('keydown', this.handlers.keydown);
    this.handlers = {};
  }
  
  handleClick(e) { /* ... */ }
  handleKeyDown(e) { /* ... */ }
}
```

### Canvas Memory Management
Reuse canvas contexts and avoid creating temporary canvases:

```javascript
// Bad: Creates new canvas every frame
function drawScaledSprite(sprite, x, y, scale) {
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  // ... draw scaled sprite
}

// Good: Reuse offscreen canvas
class SpriteRenderer {
  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  }
  
  drawScaledSprite(sprite, x, y, scale) {
    // Reuse offscreen canvas
    this.offscreenCanvas.width = sprite.width * scale;
    this.offscreenCanvas.height = sprite.height * scale;
    // ... draw scaled sprite
  }
}
```

### Garbage Collection Tips

1. **Minimize object creation in game loop**
2. **Reuse objects via pooling**
3. **Avoid closures in hot paths**
4. **Use typed arrays for large datasets**
5. **Clear references when done**

```javascript
// Good: Minimize allocations
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.pool = new ObjectPool(() => this.createParticle(), 100);
  }
  
  emit(x, y, count) {
    for (let i = 0; i < count; i++) {
      const particle = this.pool.get();
      particle.x = x;
      particle.y = y;
      particle.vx = Math.random() * 4 - 2;
      particle.vy = Math.random() * 4 - 2;
      particle.life = 60;
      this.particles.push(particle);
    }
  }
  
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      
      if (p.life <= 0) {
        this.pool.return(p);
        this.particles.splice(i, 1);
      }
    }
  }
  
  clear() {
    this.particles.forEach(p => this.pool.return(p));
    this.particles = [];
  }
}
```

## Code Review Checklist

- [ ] Classes follow single responsibility principle
- [ ] Magic numbers replaced with named constants
- [ ] Performance-critical code uses object pooling
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Public methods have JSDoc comments
- [ ] Early exit patterns used where appropriate
- [ ] Canvas state changes minimized
- [ ] RequestAnimationFrame used for game loop
- [ ] Config values used instead of hardcoded numbers
- [ ] Meaningful variable and method names
- [ ] Game loop uses fixed timestep or properly handles variable timestep
- [ ] Arrays managed efficiently (no unnecessary allocations)
- [ ] Event listeners properly cleaned up on destroy
- [ ] Object pools used for frequently created/destroyed objects
- [ ] Components properly separated (if using ECS pattern)
