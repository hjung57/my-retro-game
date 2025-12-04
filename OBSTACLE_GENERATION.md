# Enhanced Obstacle Generation System

## Overview
Comprehensive obstacle (pipe/wall) generation system with progressive difficulty scaling for Flappy Gator.

## Wall Pair Configuration

### Basic Dimensions
- **Pipe Width**: 60 pixels
- **Initial Gap Height**: 150 pixels (easier at start)
- **Minimum Gap Height**: 120 pixels (harder as game progresses)

### Gap Size Progression
- **Gap Shrink Rate**: 0.5 pixels per pipe passed
- Gradually makes the game harder by reducing the gap size
- Stops shrinking when minimum gap height is reached

## Gap Positioning

### Boundaries
- **Minimum Gap Y**: 100 pixels from top
- **Maximum Gap Y**: Canvas height - 250 pixels
- Ensures gaps are always within playable area

### Random Positioning Strategy
- **Gap Variation**: 70% (0.7 factor)
- Uses smooth variation algorithm to prevent extreme jumps
- Each new gap position is calculated relative to the previous one
- Maximum variation is 30% of the available range
- Creates a natural, flowing difficulty curve

### Algorithm
```javascript
// Smooth random variation prevents frustrating jumps
const maxVariation = range * gapVariation * 0.3;
const variation = (Math.random() - 0.5) * 2 * maxVariation;
newGapY = lastGapY + variation;
```

## Wall Pair Spacing

### Spawn Intervals (in frames at 60 FPS)
- **Initial Spawn Interval**: 120 frames (~2 seconds)
- **Minimum Spawn Interval**: 80 frames (~1.33 seconds)
- **Spacing Decrease Rate**: 1 frame per pipe passed

### Progressive Spacing
- Pipes spawn more frequently as player progresses
- Creates increasing challenge without overwhelming the player
- Stops decreasing when minimum interval is reached

## Wall Movement Speed

### Speed Configuration
- **Initial Scroll Speed**: 2 pixels/frame
- **Maximum Scroll Speed**: 4 pixels/frame (2x initial speed)
- **Speed Increase Rate**: 0.02 pixels/frame per pipe passed

### Speed Progression
- Gradual acceleration makes game progressively harder
- Doubles the speed over approximately 100 pipes passed
- Caps at maximum speed to maintain playability

## Progressive Difficulty System

### Difficulty Tracking
- **Pipes Passed Counter**: Tracks total pipes successfully navigated
- **Difficulty Enabled**: Toggle to enable/disable progressive difficulty
- **Difficulty Percentage**: Calculated as (pipes_passed / 20) * 100

### Difficulty Scaling
Each time a pipe is passed:
1. Gap height decreases (harder to fit through)
2. Spawn interval decreases (pipes appear more frequently)
3. Scroll speed increases (pipes move faster)

### Difficulty Stats API
```javascript
pipeGenerator.getDifficultyStats()
// Returns:
{
    pipesPassed: 15,
    gapHeight: 142.5,
    spawnInterval: 105,
    scrollSpeed: 2.3,
    difficultyPercent: 75
}
```

## Configuration API

### Runtime Tuning
```javascript
pipeGenerator.setDifficultyConfig({
    gapShrinkRate: 0.5,           // How fast gaps shrink
    spacingDecreaseRate: 1,       // How fast spacing decreases
    speedIncreaseRate: 0.02,      // How fast speed increases
    minGapHeight: 120,            // Minimum gap size
    minSpawnInterval: 80,         // Minimum spawn interval
    maxScrollSpeed: 4,            // Maximum scroll speed
    difficultyEnabled: true       // Enable/disable progression
});
```

### Disable Progressive Difficulty
```javascript
// For practice mode or easier gameplay
pipeGenerator.setDifficultyConfig({ difficultyEnabled: false });
```

## Implementation Details

### PipeGenerator Class Methods

**Core Methods:**
- `generatePipe()` - Creates new pipe with current difficulty settings
- `calculateGapPosition()` - Smooth random gap positioning
- `updatePipes(customScrollSpeed)` - Moves pipes and handles spawning
- `increaseDifficulty()` - Called when pipe is passed, scales difficulty
- `getDifficultyStats()` - Returns current difficulty parameters
- `setDifficultyConfig(config)` - Updates difficulty settings

### Pipe Object Structure
```javascript
{
    x: 480,                    // X position
    width: 60,                 // Pipe width
    gapY: 320,                 // Gap center Y position
    gapHeight: 150,            // Current gap height
    scored: false,             // Whether player has passed it
    topHeight: 245,            // Top pipe height
    bottomY: 395,              // Bottom pipe Y position
    speed: 2                   // Current scroll speed
}
```

## Difficulty Curve Examples

### Easy Start (First 5 pipes)
- Gap Height: 150px
- Spawn Interval: 120 frames
- Scroll Speed: 2 px/frame

### Medium Difficulty (After 20 pipes)
- Gap Height: 140px
- Spawn Interval: 100 frames
- Scroll Speed: 2.4 px/frame

### Hard Difficulty (After 50 pipes)
- Gap Height: 125px
- Spawn Interval: 80 frames
- Scroll Speed: 3.0 px/frame

### Maximum Difficulty (After 100+ pipes)
- Gap Height: 120px (minimum)
- Spawn Interval: 80 frames (minimum)
- Scroll Speed: 4.0 px/frame (maximum)

## Benefits

1. **Smooth Learning Curve**: Players start easy and gradually face harder challenges
2. **Endless Gameplay**: Difficulty caps prevent impossible situations
3. **Configurable**: All parameters can be tuned for different gameplay styles
4. **Fair Progression**: Smooth gap positioning prevents frustrating random spikes
5. **Replayability**: Progressive difficulty keeps experienced players engaged

## Testing

All 58 property-based tests pass, including:
- Pipe generation at correct intervals
- Gap positioning within safe boundaries
- Pipe scrolling at constant speed
- Off-screen pipe removal and regeneration
- Score tracking when pipes are passed

## Future Enhancements

Potential additions:
- Different difficulty presets (Easy, Normal, Hard)
- Power-ups that temporarily slow pipes or widen gaps
- Visual indicators showing current difficulty level
- Achievements for reaching difficulty milestones
- Difficulty reset after game over vs. continuous progression
