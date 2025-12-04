# Audio and Visual Feedback System

## Overview
Comprehensive audio and visual feedback system featuring sound effects, particle effects, score indicators, screen shake, and visual trails for Flappy Gator.

## Audio Feedback

### Sound Effects

**Available Sounds:**
1. **Flap** (`/assets/jump.wav`)
   - Triggered: When player presses space/click/tap
   - Volume: 50%
   - Purpose: Immediate feedback for player input

2. **Score** (`/assets/jump.wav` - reused)
   - Triggered: When passing through a pipe
   - Volume: 40%
   - Purpose: Positive reinforcement for scoring

3. **Collision** (`/assets/game_over.wav`)
   - Triggered: When hitting pipe, ceiling, or ground
   - Volume: 70%
   - Purpose: Clear indication of game over

### Audio Implementation

**Loading Sounds:**
```javascript
await audioManager.loadSound('collision', '/assets/game_over.wav');
await audioManager.loadSound('flap', '/assets/jump.wav');
await audioManager.loadSound('score', '/assets/jump.wav');

// Set volume levels
audioManager.setVolume('collision', 0.7);
audioManager.setVolume('flap', 0.5);
audioManager.setVolume('score', 0.4);
```

**Playing Sounds:**
```javascript
// On flap
audioManager.playSound('flap');

// On score
audioManager.playSound('score');

// On collision
audioManager.playSound('collision');
```

### Audio Features
- **Volume Control**: Each sound has independent volume
- **Non-blocking**: Sounds play asynchronously
- **Error Handling**: Graceful fallback if audio fails to load
- **Browser Compatibility**: Works across modern browsers

## Particle System

### Particle Class
Individual particle with physics simulation:
- Position (x, y)
- Velocity (vx, vy)
- Color (RGBA)
- Size (radius)
- Lifetime (frames)
- Gravity (0.2 pixels/frame²)
- Friction (0.98 damping factor)

### Particle Types

#### 1. Gator Trail Particles
**Purpose**: Visual trail behind gator during movement

**Characteristics:**
- Color: Green (#5CB54D) with random alpha
- Size: 2-5 pixels
- Lifetime: 10-30 frames
- Spawn Rate: 1-2 particles per frame
- Velocity: Drifts left and random spread

**Trigger:**
```javascript
particleSystem.createTrail(gatorX, gatorY, velocity);
```

**Behavior:**
- Only spawns when gator is moving (velocity > 0.5)
- Fades out over lifetime
- Affected by gravity and friction

#### 2. Explosion Particles
**Purpose**: Collision impact effect

**Characteristics:**
- Color: Red (#ff0000) by default
- Count: 20-30 particles
- Size: 2-6 pixels
- Lifetime: 20-50 frames
- Pattern: Radial explosion

**Trigger:**
```javascript
particleSystem.createExplosion(x, y, '#ff0000', 30);
```

**Behavior:**
- Particles shoot out in all directions
- Speed: 2-5 pixels/frame
- Affected by gravity (falls down)
- Fades out over lifetime

#### 3. Score Popup Particles
**Purpose**: Visual feedback when earning points

**Characteristics:**
- Color: Golden (#fbbf24)
- Count: 5 particles
- Size: 2-5 pixels
- Lifetime: 30 frames
- Direction: Upward floating

**Trigger:**
```javascript
particleSystem.createScorePopup(x, y, points);
```

**Behavior:**
- Floats upward (negative Y velocity)
- Slight horizontal spread
- Fades out over lifetime

#### 4. Sparkle Particles
**Purpose**: Extra visual flair for score multipliers

**Characteristics:**
- Color: White (#ffffff)
- Count: 8 particles
- Size: 1-3 pixels
- Lifetime: 15 frames
- Pattern: Star burst (8 directions)

**Trigger:**
```javascript
particleSystem.createSparkle(x, y);
```

**Behavior:**
- Shoots out in 8 directions (45° apart)
- Fast initial speed (1-3 pixels/frame)
- Quick fade (15 frames)

### Particle System Management

**Performance:**
- Max particles: 500
- Automatic cleanup of dead particles
- Efficient rendering with canvas API

**Methods:**
```javascript
particleSystem.update()           // Update all particles
particleSystem.render()           // Render all particles
particleSystem.clear()            // Remove all particles
particleSystem.getCount()         // Get active particle count
```

## Visual Score Indicators

### Score Indicator Class
Floating text that displays earned points.

**Properties:**
- Position (x, y)
- Points earned
- Score multiplier
- Lifetime: 60 frames (1 second)
- Float speed: -2 pixels/frame (upward)
- Fade out: Last 20 frames

### Visual Design

**Base Score (1x multiplier):**
- Font: Bold 24px Arial
- Color: Green (#5CB54D)
- Text: "+1", "+2", etc.
- Outline: Black 3px stroke

**Multiplier Score (>1x):**
- Font: Bold 24px Arial
- Color: Golden (#fbbf24)
- Text: "+2", "+3", etc.
- Multiplier text: "x2.0", "x2.5", "x3.0"
- Multiplier font: Bold 16px Arial
- Position: 20px below main score

### Animation
1. **Spawn**: Appears at gator position + offset
2. **Float**: Moves upward at -2 pixels/frame
3. **Slow**: Velocity decays by 5% per frame
4. **Fade**: Alpha decreases in last 20 frames
5. **Remove**: Deleted after 60 frames

### Usage
```javascript
scoreIndicatorSystem.createIndicator(x, y, points, multiplier);
scoreIndicatorSystem.update();
scoreIndicatorSystem.render();
```

## Screen Shake Effect

### Configuration
- **Duration**: 10 frames (~167ms at 60fps)
- **Intensity**: 5 pixels
- **Decay**: Linear (intensity × frames_remaining / total_frames)

### Implementation
```javascript
// Trigger shake
triggerScreenShake();

// Apply shake (in render loop)
const isShaking = applyScreenShake();
if (isShaking) {
    // Shake is active, canvas is translated
}

// Restore canvas
restoreScreenShake();
```

### Shake Algorithm
```javascript
intensity = baseIntensity * (framesRemaining / totalFrames);
offsetX = (random - 0.5) * intensity * 2;
offsetY = (random - 0.5) * intensity * 2;
ctx.translate(offsetX, offsetY);
```

### Trigger Conditions
- Collision with pipe
- Collision with ceiling
- Collision with ground

## Visual Feedback Integration

### Scoring Feedback Flow
```
Player passes pipe
    ↓
1. Play score sound (audio)
2. Create score indicator (floating text)
3. Create score popup particles (golden particles)
4. If multiplier > 1: Create sparkle effect
5. Update score display
```

### Collision Feedback Flow
```
Collision detected
    ↓
1. Create explosion particles (red burst)
2. Trigger screen shake (10 frames)
3. Play collision sound (audio)
4. Show collision flash (red overlay)
5. Transition to game over
```

### Flap Feedback Flow
```
Player presses input
    ↓
1. Play flap sound (audio)
2. Apply upward velocity
3. Gator rotation changes
4. Trail particles continue
```

## Rendering Order

**Layer Stack (bottom to top):**
1. Background (sky blue)
2. Pipes
3. Particle system (trails, explosions)
4. Gator sprite
5. Score indicators (floating text)
6. Collision flash overlay
7. Invincibility indicator
8. Screen shake effect (affects all layers)

## Performance Optimization

### Particle System
- **Culling**: Dead particles removed immediately
- **Limit**: Max 500 particles prevents memory issues
- **Efficient rendering**: Single pass with canvas API
- **No allocations**: Reuses particle objects when possible

### Score Indicators
- **Automatic cleanup**: Removed after lifetime expires
- **Minimal draw calls**: Text rendered with single fillText
- **Alpha blending**: Hardware-accelerated transparency

### Screen Shake
- **Lightweight**: Only translates canvas context
- **No redraws**: Uses existing frame buffer
- **Short duration**: 10 frames minimizes impact

## Visual Effects Timeline

### During Gameplay (per frame)
```
Frame N:
├─ Update particles (physics)
├─ Update score indicators (float up)
├─ Create trail particles (if moving)
├─ Render particles
├─ Render gator
└─ Render score indicators
```

### On Score Event
```
Score Event:
├─ t=0ms: Play score sound
├─ t=0ms: Create score indicator
├─ t=0ms: Create 5 popup particles
├─ t=0ms: If multiplier: Create 8 sparkles
└─ t=0-1000ms: Indicator floats and fades
```

### On Collision Event
```
Collision Event:
├─ t=0ms: Create 30 explosion particles
├─ t=0ms: Trigger screen shake
├─ t=0ms: Play collision sound
├─ t=0-167ms: Screen shake active (10 frames)
├─ t=0-167ms: Collision flash (10 frames)
└─ t=167ms: Game over screen
```

## Audio-Visual Synchronization

### Flap Action
- **Audio**: Immediate sound playback
- **Visual**: Gator rotation + trail particles
- **Timing**: Synchronized (same frame)

### Score Action
- **Audio**: Score sound plays
- **Visual**: Indicator + particles spawn
- **Timing**: Synchronized (same frame)
- **Duration**: Visual effects last 1 second

### Collision Action
- **Audio**: Collision sound plays
- **Visual**: Explosion + shake + flash
- **Timing**: All start same frame
- **Duration**: Effects last ~167ms

## Customization Options

### Particle Colors
```javascript
// Trail color
createTrail(x, y, velocity, color='#5CB54D')

// Explosion color
createExplosion(x, y, color='#ff0000', count=30)

// Score popup color
createScorePopup(x, y, points, color='#fbbf24')
```

### Audio Volumes
```javascript
audioManager.setVolume('flap', 0.5);    // 0.0 to 1.0
audioManager.setVolume('score', 0.4);
audioManager.setVolume('collision', 0.7);
```

### Screen Shake Intensity
```javascript
this.screenShakeIntensity = 5;  // Pixels (default)
this.screenShakeIntensity = 10; // More intense
this.screenShakeIntensity = 2;  // Subtle
```

## Browser Compatibility

### Audio
- **Supported**: Chrome, Firefox, Safari, Edge
- **Fallback**: Silent gameplay if audio fails
- **Format**: WAV (widely supported)

### Canvas Effects
- **Supported**: All modern browsers
- **Hardware Acceleration**: Automatic in most browsers
- **Performance**: 60fps on most devices

## Accessibility Considerations

### Audio
- Volume controls available
- Can be muted without affecting gameplay
- Visual feedback provides alternative cues

### Visual Effects
- High contrast colors (green, gold, red)
- Clear visual indicators
- Not reliant on color alone (shape + motion)

## Testing

All 58 property-based tests pass, including:
- Audio playback on events
- Particle system updates
- Score indicator creation
- Screen shake activation
- Visual feedback synchronization

## Future Enhancements

Potential additions:
- Background music with volume control
- Pitch variation for score sounds (higher pitch for multipliers)
- More particle types (stars, confetti)
- Combo streak visual effects
- Achievement unlock animations
- Slow-motion on collision
- Camera zoom effects
- Dynamic lighting effects
- Particle trails with color gradients
- Sound effect variations (randomized)
