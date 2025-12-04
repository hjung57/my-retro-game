# Physics System Enhancements

## Overview
Added comprehensive physics system to Flappy Gator with advanced features for realistic and smooth gameplay.

## New Physics Features

### 1. Gravity Constant
- **Value**: 0.6 pixels/frame²
- Provides consistent downward acceleration
- Applied every frame during gameplay

### 2. Ascent Velocity on Spacebar/Click
- **Flap Strength**: -10 pixels/frame (negative = upward)
- Instant upward velocity applied on input
- Works with click, touch, and spacebar inputs

### 3. Terminal Velocity Limits
- **Downward Terminal Velocity**: 12 pixels/frame (maximum falling speed)
- **Upward Terminal Velocity**: -12 pixels/frame (maximum rising speed)
- Prevents unrealistic acceleration in either direction

### 4. Momentum Conservation
- **Conservation Factor**: 0.95 (95% momentum preserved)
- When falling and flapping: reduces flap strength slightly based on downward momentum
- When rising and flapping: preserves some upward momentum
- Creates more realistic physics where current motion affects new inputs

### 5. Air Resistance
- **Resistance Factor**: 0.98 (2% velocity reduction per frame)
- Applies subtle drag to all movement
- Prevents infinite acceleration and adds realism

### 6. Smooth Movement Interpolation
- **Smoothing Factor**: 0.15 (15% interpolation)
- Reduces jitter and creates smoother visual movement
- Interpolates between previous and target positions each frame

## Implementation Details

### Physics Engine Class
Located in `public/flappy-gator/physics-engine.js`

**Key Methods:**
- `applyGravity(entity)` - Applies gravity with air resistance and terminal velocity clamping
- `applyFlap(entity, entityId)` - Applies upward force with momentum conservation
- `updatePosition(entity, entityId, deltaTime)` - Updates position with smooth interpolation
- `resetEntity(entityId)` - Resets physics state for a specific entity
- `resetAll()` - Resets all physics state
- `getConstants()` - Returns current physics constants for debugging
- `updateConstants(constants)` - Allows runtime tuning of physics parameters

### State Tracking
- **Position History**: Tracks previous positions for smooth interpolation
- **Velocity History**: Maintains last 10 frames of velocity for momentum calculations
- **Entity IDs**: Uses unique identifiers ('gator') to track multiple entities independently

### Integration with Game
The game engine now:
1. Passes entity ID ('gator') to physics methods for proper state tracking
2. Resets physics state on game init and restart
3. Uses enhanced physics for all movement calculations

## Testing
All 58 property-based tests pass, including:
- Gravity application tests
- Flap velocity tests with momentum conservation
- Terminal velocity boundary tests
- Input handling tests
- Collision detection tests
- Game state management tests

## Tuning Parameters
Physics can be adjusted by calling `physicsEngine.updateConstants()` with any of:
- `gravity` - Downward acceleration
- `flapStrength` - Upward velocity on flap
- `terminalVelocityDown` - Max falling speed
- `terminalVelocityUp` - Max rising speed
- `airResistance` - Velocity damping (0-1)
- `momentumConservation` - Momentum preservation (0-1)
- `interpolationSmoothing` - Position smoothing (0-1)

## Benefits
1. **More Realistic**: Physics behaves like real-world gravity and momentum
2. **Smoother Gameplay**: Interpolation reduces visual jitter
3. **Better Feel**: Momentum conservation makes controls more responsive
4. **Tunable**: All constants can be adjusted for different gameplay styles
5. **Maintainable**: Clean separation of physics logic from game logic
