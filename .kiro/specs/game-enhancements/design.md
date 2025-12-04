# Design Document

## Overview

This design document outlines the implementation of three major enhancement categories for the Pac-Kiro game:

1. **Persistent Score System**: Extends the existing high score API to include full game history tracking with player names and timestamps
2. **Visual Effects System**: Adds particle-based animations for explosions, power-up indicators, and celebratory confetti
3. **Audio System**: Integrates classic Pac-Man sound effects for all major game events

These enhancements build upon the existing game architecture without requiring major refactoring. The visual effects will use a particle system rendered on the existing canvas, the audio system will use the Web Audio API for sound playback, and the score persistence will extend the current Sinatra backend.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Game Loop (game.js)                   │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Update   │→ │   Particle   │→ │      Draw       │ │
│  │   Logic    │  │    System    │  │    (Canvas)     │ │
│  └────────────┘  └──────────────┘  └─────────────────┘ │
│         ↓               ↓                    ↓           │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Audio    │  │   Score      │  │   Visual FX     │ │
│  │   Manager  │  │   Manager    │  │   Renderer      │ │
│  └────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↓
                  ┌─────────────────┐
                  │  Sinatra API    │
                  │  (app.rb)       │
                  │  - High Scores  │
                  │  - Game History │
                  └─────────────────┘
```

### Component Interactions

- **Particle System**: Manages all visual effects (explosions, confetti, power-up indicators)
- **Audio Manager**: Handles sound effect loading and playback
- **Score Manager**: Interfaces with backend API for persistence
- **Visual FX Renderer**: Draws particle effects on canvas each frame

## Components and Interfaces

### 1. Particle System

**Purpose**: Unified system for managing all particle-based visual effects

**Data Structure**:
```javascript
{
  particles: [
    {
      x: number,           // Position in pixels
      y: number,
      vx: number,          // Velocity
      vy: number,
      life: number,        // Remaining frames
      maxLife: number,     // Total lifetime
      color: string,       // CSS color
      size: number,        // Radius in pixels
      type: string         // 'explosion' | 'confetti' | 'power'
    }
  ]
}
```

**Interface**:
```javascript
// Create explosion at collision point
createExplosion(x, y, particleCount = 20)

// Create confetti effect across screen
createConfetti(particleCount = 50)

// Create power-up indicator around Kiro
createPowerEffect(x, y)

// Update all particles (called each frame)
updateParticles()

// Draw all particles to canvas
drawParticles(ctx)
```

### 2. Audio Manager

**Purpose**: Load and play sound effects with proper timing and overlap handling

**Data Structure**:
```javascript
{
  sounds: {
    'dot': HTMLAudioElement,
    'powerPellet': HTMLAudioElement,
    'eatGhost': HTMLAudioElement,
    'death': HTMLAudioElement,
    'gameStart': HTMLAudioElement
  },
  loaded: boolean
}
```

**Interface**:
```javascript
// Initialize and preload all sounds
initAudio()

// Play a specific sound effect
playSound(soundName)

// Check if audio system is ready
isReady()
```

**Sound File Requirements**:
- Format: MP3 or OGG for browser compatibility
- Files stored in `/public/sounds/` directory
- Naming convention: `dot.mp3`, `power-pellet.mp3`, `eat-ghost.mp3`, `death.mp3`, `game-start.mp3`

### 3. Score Manager

**Purpose**: Handle score persistence and game history tracking

**Interface**:
```javascript
// Save current game session
saveGameSession(playerName, finalScore)

// Retrieve game history
getGameHistory(limit = 10)

// Check if current score is a new high score
isNewHighScore(currentScore)
```

**Backend API Extension**:
```ruby
# New endpoint for game history
GET /api/history
Response: [
  {
    name: string,
    score: number,
    timestamp: number,
    isHighScore: boolean
  }
]

# Enhanced high score endpoint
POST /api/highscores
Request: { name: string, score: number }
Response: { success: boolean, isNewHighScore: boolean }
```

### 4. Visual Effects Renderer

**Purpose**: Render power-up visual on Kiro sprite

**Interface**:
```javascript
// Draw Kiro with power-up effect
drawKiroWithPower(ctx, x, y, frameCount)

// Draw standard Kiro
drawKiro(ctx, x, y)
```

**Power-Up Visual Options**:
- Option A: Pulsing green border (size oscillates with sine wave)
- Option B: Increased sprite size (1.3x scale)
- Option C: Glowing aura effect (semi-transparent circles)

## Data Models

### Particle
```javascript
{
  x: number,              // X position in pixels
  y: number,              // Y position in pixels
  vx: number,             // X velocity (pixels per frame)
  vy: number,             // Y velocity (pixels per frame)
  life: number,           // Remaining lifetime in frames
  maxLife: number,        // Initial lifetime for fade calculation
  color: string,          // CSS color string
  size: number,           // Particle radius in pixels
  type: 'explosion' | 'confetti' | 'power'
}
```

### GameSession
```javascript
{
  name: string,           // Player name
  score: number,          // Final score
  timestamp: number,      // Unix timestamp
  isHighScore: boolean    // Whether this was a new high score
}
```

### Sound
```javascript
{
  name: string,           // Sound identifier
  audio: HTMLAudioElement, // Audio element
  loaded: boolean         // Load status
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Score persistence on game end
*For any* game session with a player name and final score, when the game ends, the backend should contain a record with that player name and score.
**Validates: Requirements 1.1**

### Property 2: High score update on new record
*For any* score that exceeds the current high score, submitting that score should result in the high score being updated to the new value.
**Validates: Requirements 1.2**

### Property 3: Game history sorting
*For any* collection of game sessions, retrieving the game history should return sessions sorted in descending order by score.
**Validates: Requirements 1.3**

### Property 4: Score validation rejects invalid inputs
*For any* input that is not a non-negative integer (negative numbers, floats, non-numeric values), the backend should reject the score submission.
**Validates: Requirements 1.4**

### Property 5: Explosion creation on collision
*For any* ghost collision while Kiro is not powered, an explosion should be created at the collision coordinates.
**Validates: Requirements 2.1**

### Property 6: Explosion particles radiate outward
*For any* explosion created, all particles should have velocities pointing away from the explosion center.
**Validates: Requirements 2.2**

### Property 7: Particle lifecycle management
*For any* particle (explosion or confetti), when its lifetime reaches zero, it should be removed from the particle array.
**Validates: Requirements 2.3, 4.4**

### Property 8: Explosion color contrast
*For any* explosion particle, its color should not match the game background color (#1a1a1a).
**Validates: Requirements 2.4**

### Property 9: Power state visual round-trip
*For any* game state, entering power mode then exiting power mode should restore Kiro's visual appearance to its original state.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 10: High score triggers confetti
*For any* score that exceeds the current high score, confetti particles should be created.
**Validates: Requirements 4.1**

### Property 11: Confetti has gravity and drift
*For any* confetti particle, it should have positive y-velocity (downward) and non-zero x-velocity (horizontal drift).
**Validates: Requirements 4.3**

### Property 12: Sound plays on dot collection
*For any* dot collection event, the dot sound effect should be triggered.
**Validates: Requirements 5.1**

### Property 13: Sound plays on power pellet collection
*For any* power pellet collection event, the power pellet sound effect should be triggered.
**Validates: Requirements 5.2**

### Property 14: Sound plays on ghost eating
*For any* powered ghost collision, the ghost eating sound effect should be triggered.
**Validates: Requirements 5.3**

### Property 15: Sound plays on death
*For any* unpowered ghost collision, the death sound effect should be triggered.
**Validates: Requirements 5.4**

### Property 16: Audio overlap handling
*For any* two sound effects triggered within 100ms of each other, both sounds should play to completion without one stopping the other.
**Validates: Requirements 5.7**

## Error Handling

### Particle System Errors
- **Invalid particle data**: Particles with NaN or undefined positions should be filtered out during update
- **Memory leaks**: Particle arrays should be capped at a maximum size (e.g., 500 particles) to prevent memory issues
- **Canvas errors**: If canvas context is unavailable, particle rendering should fail gracefully without crashing

### Audio System Errors
- **Failed audio loading**: If sound files fail to load, the game should continue without audio rather than blocking
- **Browser audio restrictions**: Handle autoplay policies by only playing sounds after user interaction
- **Missing audio files**: Log warnings for missing files but don't crash the game
- **Audio context errors**: Catch and log Web Audio API errors without disrupting gameplay

### Score Persistence Errors
- **Network failures**: If backend is unreachable, cache scores locally and retry on next game end
- **Invalid responses**: Validate API responses and handle malformed data gracefully
- **Concurrent updates**: Handle race conditions when multiple score updates occur simultaneously
- **Storage limits**: Handle cases where backend storage is full or unavailable

### Visual Effects Errors
- **Performance degradation**: If frame rate drops below 30 FPS, reduce particle count automatically
- **Canvas size issues**: Handle window resizing and canvas dimension changes
- **Color parsing errors**: Validate color strings before using them in canvas operations

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific examples and edge cases:

**Score System Tests**:
- Test saving a game session with valid data
- Test retrieving empty game history
- Test high score update with exact boundary values
- Test score validation with edge cases (0, negative, MAX_INT)

**Particle System Tests**:
- Test explosion creation at specific coordinates
- Test confetti creation with specific particle counts
- Test particle removal when lifetime expires
- Test particle array size limits

**Audio System Tests**:
- Test audio initialization with missing files
- Test sound playback with mocked Audio elements
- Test multiple simultaneous sound triggers

**Visual Effects Tests**:
- Test power-up visual state transitions
- Test color contrast validation
- Test particle velocity calculations

### Property-Based Testing Approach

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property testing library):

**Configuration**: Each property test should run a minimum of 100 iterations to ensure thorough coverage.

**Test Tagging**: Each property-based test must include a comment tag in this exact format:
```javascript
// Feature: game-enhancements, Property {number}: {property_text}
```

**Property Test Coverage**:
- Properties 1-4: Score persistence and validation
- Properties 5-8: Explosion particle behavior
- Property 9: Power state visual transitions
- Properties 10-11: Confetti particle behavior
- Properties 12-16: Audio system behavior

**Generator Strategies**:
- **Scores**: Generate integers in range [0, 1000000]
- **Player names**: Generate strings of length [1, 20] with alphanumeric characters
- **Positions**: Generate coordinates within canvas bounds
- **Particle counts**: Generate integers in range [1, 100]
- **Colors**: Generate valid CSS color strings
- **Game states**: Generate valid game state objects with all required fields

**Property Test Implementation**:
Each correctness property will be implemented as a single property-based test that validates the property across randomly generated inputs. Tests will use fast-check's built-in generators and custom generators for game-specific data types.

### Integration Testing

Integration tests will verify end-to-end workflows:
- Complete game session from start to score persistence
- Visual effects triggering during actual gameplay
- Audio playback during real game events
- High score flow from achievement to confetti to persistence

### Testing Tools

- **Unit Tests**: Jest or Mocha for JavaScript testing
- **Property Tests**: fast-check for property-based testing
- **API Tests**: Supertest for Sinatra endpoint testing
- **Visual Validation**: Manual testing for visual effects and audio

## Implementation Notes

### Performance Considerations

1. **Particle System Optimization**:
   - Use object pooling for particles to reduce garbage collection
   - Limit maximum particle count to 500
   - Remove particles early if they move off-screen

2. **Audio Performance**:
   - Preload all sound files during initialization
   - Use audio sprites if multiple sounds needed
   - Limit concurrent sound instances to prevent audio distortion

3. **Canvas Rendering**:
   - Draw particles in a single batch operation
   - Use requestAnimationFrame for smooth animations
   - Clear only dirty regions if performance issues arise

### Browser Compatibility

- **Audio**: Use MP3 format for broad browser support
- **Canvas**: All effects use standard Canvas 2D API (widely supported)
- **Fetch API**: Already used in existing code, no additional concerns
- **ES6 Features**: Ensure transpilation if supporting older browsers

### Visual Design Guidelines

- **Explosion colors**: Use warm colors (red, orange, yellow) for impact
- **Confetti colors**: Include Kiro brand green (#5CB54D) plus complementary colors
- **Power-up effect**: Use pulsing green border with 1.5-2.5 second cycle
- **Particle sizes**: 2-6 pixels for explosions, 3-8 pixels for confetti

### Sound File Specifications

Classic Pac-Man sound effects should be sourced from:
- Public domain arcade sound libraries
- Creative Commons licensed game audio
- Synthesized recreations of classic sounds

Required sound files:
- `dot.mp3` - Short blip (50-100ms)
- `power-pellet.mp3` - Power-up sound (200-300ms)
- `eat-ghost.mp3` - Ghost eating sound (300-500ms)
- `death.mp3` - Death sound (1-2 seconds)
- `game-start.mp3` - Game start jingle (2-3 seconds)
