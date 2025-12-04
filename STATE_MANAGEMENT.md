# Enhanced Game State Management System

## Overview
Comprehensive state management system with main menu, gameplay states, pause functionality, game over screen, persistent storage, and real-time scoring for Flappy Gator.

## Game States

### Available States
1. **MENU** (`'menu'`) - Main menu with high score display and statistics
2. **PLAYING** (`'playing'`) - Active gameplay with real-time scoring
3. **PAUSED** (`'paused'`) - Game paused with resume option
4. **GAME_OVER** (`'gameOver'`) - Game over screen with statistics and restart

### State Transitions
```
MENU → PLAYING (Start button clicked)
PLAYING → PAUSED (Escape/P key pressed)
PAUSED → PLAYING (Resume button or Escape/P key)
PAUSED → MENU (Main Menu button)
PLAYING → GAME_OVER (Collision detected)
GAME_OVER → PLAYING (Restart button)
GAME_OVER → MENU (Back to Menu button)
```

## GameStateManager Class

### Core Features
- State validation and transition management
- State history tracking (last 10 transitions)
- Persistent data storage (localStorage)
- Statistics tracking and calculation

### Methods

**State Management:**
```javascript
stateManager.transitionTo(newState, data)  // Transition to new state
stateManager.isState(state)                // Check current state
stateManager.getState()                    // Get current state
stateManager.getHistory()                  // Get transition history
```

**Score Management:**
```javascript
stateManager.updateHighScore(score)        // Update high score if higher
stateManager.recordGameCompletion(score)   // Record game stats
stateManager.getStats()                    // Get all statistics
```

**Persistent Data:**
```javascript
stateManager.savePersistentData()          // Save to localStorage
stateManager.loadPersistentData()          // Load from localStorage
stateManager.resetPersistentData()         // Reset all data
```

## Main Menu (Start Screen)

### Features
- High score display
- Game statistics (if games played > 0)
  - Total games played
  - Average score
- Start game button
- Instructions

### UI Elements
```html
<div id="start-screen">
    <h1>Flappy Gator</h1>
    <div id="instructions">...</div>
    <div id="start-high-score">High Score: <span>0</span></div>
    <div id="menu-stats">
        <div class="stat-item">Games Played: 10</div>
        <div class="stat-item">Average Score: 15</div>
    </div>
    <button id="start-button">Start Game</button>
</div>
```

### Statistics Displayed
- **High Score**: Best score ever achieved
- **Games Played**: Total number of games completed
- **Average Score**: Mean score across all games

## Gameplay State

### Real-Time Scoring System

**Base Scoring:**
- 1 point per pipe passed
- Score multiplier system (1x to 3x)
- Combo counter for consecutive pipes

**Multiplier System:**
```javascript
// Multiplier increases every 5 pipes
if (comboCounter > 5) {
    multiplier = 1 + floor(comboCounter / 5) * 0.5
    // Max multiplier: 3x
}

// Multiplier resets after 3 seconds of no scoring
if (timeSinceLastScore > 3000) {
    comboCounter = 0
    multiplier = 1
}
```

**Score Calculation:**
```javascript
earnedPoints = basePoints * multiplier
totalScore += earnedPoints
```

### Score Display
- Current score shown at top of screen
- Multiplier indicator (when active): "x2.0", "x2.5", "x3.0"
- Real-time updates as pipes are passed

### UI Elements
```html
<div id="score-display">
    Score: <span id="current-score">0</span>
    <span id="score-multiplier" class="score-multiplier">x2.0</span>
</div>
```

## Pause Functionality

### Activation
- **Keyboard**: Press `Escape` or `P` key
- **Programmatic**: Call `game.pause()`

### Pause Screen Features
- Current score display
- High score display
- Resume button
- Restart button
- Main Menu button

### UI Elements
```html
<div id="pause-overlay" class="screen">
    <h2>Paused</h2>
    <div class="pause-stats">
        <p>Current Score: <span id="pause-score">0</span></p>
        <p>High Score: <span id="pause-high-score">0</span></p>
    </div>
    <button id="resume-button">Resume</button>
    <button id="pause-restart-button">Restart</button>
    <button id="pause-menu-button">Main Menu</button>
</div>
```

### Resume
- **Keyboard**: Press `Escape` or `P` key again
- **Button**: Click Resume button
- **Programmatic**: Call `game.resume()`

### Behavior
- Game loop stops (no physics updates)
- Canvas remains visible
- All game state preserved
- Can resume exactly where left off

## Game Over Screen

### Features
- Final score display
- High score display
- New high score indicator (if applicable)
- Game statistics:
  - Pipes passed
  - Difficulty percentage
  - Total games played
- Restart button
- Back to Menu button

### UI Elements
```html
<div id="game-over-screen" class="screen">
    <h2>Game Over!</h2>
    <div id="new-high-score-indicator" class="new-high-score">
        🎉 NEW HIGH SCORE! 🎉
    </div>
    <div id="final-score">Score: <span>25</span></div>
    <div id="game-over-high-score">High Score: <span>30</span></div>
    <div id="game-over-stats" class="game-over-stats">
        <div class="stat-row">
            <span>Pipes Passed:</span>
            <span>25</span>
        </div>
        <div class="stat-row">
            <span>Difficulty:</span>
            <span>75%</span>
        </div>
        <div class="stat-row">
            <span>Total Games:</span>
            <span>15</span>
        </div>
    </div>
    <button id="restart-button">Restart</button>
    <button id="back-to-menu-button">Back to Menu</button>
</div>
```

### New High Score Animation
- Displays for 3 seconds
- Pulsing animation
- Golden color (#fbbf24)
- Automatically hides after animation

## Persistent Score Storage

### Storage Method
- **Technology**: localStorage
- **Key**: `flappyGator_persistentData`
- **Format**: JSON

### Stored Data
```javascript
{
    highScore: 50,              // Best score ever
    totalGamesPlayed: 25,       // Total games completed
    totalScore: 625,            // Sum of all scores
    bestStreak: 50,             // Best single-game score
    lastPlayedDate: "2024-01-15T10:30:00.000Z"
}
```

### Persistence Features
- **Auto-save**: Saves after every game completion
- **Auto-load**: Loads on game initialization
- **Error handling**: Graceful fallback if localStorage unavailable
- **Reset option**: Can clear all persistent data

### API Methods
```javascript
// Save current data
stateManager.savePersistentData()

// Load saved data
stateManager.loadPersistentData()

// Reset all data
stateManager.resetPersistentData()

// Get statistics
const stats = stateManager.getStats()
// Returns: { highScore, totalGamesPlayed, totalScore, 
//           bestStreak, lastPlayedDate, averageScore }
```

## State Transition History

### Tracking
- Records last 10 state transitions
- Includes timestamp and transition data
- Useful for debugging and analytics

### History Entry Format
```javascript
{
    from: 'playing',
    to: 'gameOver',
    timestamp: 1705315800000,
    data: {
        finalScore: 25,
        pipesPassed: 25
    }
}
```

### Access History
```javascript
const history = stateManager.getHistory()
// Returns array of transition objects
```

## Keyboard Controls

### Gameplay
- **Space**: Flap/Jump
- **Escape** or **P**: Pause/Resume

### State-Specific
- **Menu**: Space to start
- **Playing**: Space to flap, Escape/P to pause
- **Paused**: Escape/P to resume
- **Game Over**: N/A (use buttons)

## Statistics Calculation

### Average Score
```javascript
averageScore = totalScore / totalGamesPlayed
```

### Difficulty Percentage
```javascript
difficultyPercent = min(100, (pipesPassed / 20) * 100)
```

### Best Streak
- Tracks highest single-game score
- Updated on each game completion

## UI Update Flow

### On State Change
1. Hide all screens
2. Show appropriate screen for new state
3. Update screen-specific data
4. Apply visual effects (if applicable)

### Real-Time Updates (During Gameplay)
1. Update score display on pipe passage
2. Update multiplier indicator
3. Update combo counter
4. Check for combo timeout

### On Game Over
1. Stop game loop
2. Record game completion
3. Check for new high score
4. Update persistent storage
5. Submit score to API
6. Display game over screen with stats
7. Show new high score indicator (if applicable)

## API Integration

### Score Submission
```javascript
async submitScore() {
    try {
        await apiClient.submitScore('flappy-gator', 'Player', score)
        await loadHighScore()
        updateUI()
    } catch (error) {
        console.error('Error submitting score:', error)
        // Still update UI even if API fails
        updateUI()
    }
}
```

### High Score Loading
```javascript
async loadHighScore() {
    try {
        const scores = await apiClient.getHighScores('flappy-gator')
        if (scores && scores.length > 0) {
            highScore = max(...scores.map(s => s.score))
        }
    } catch (error) {
        console.error('Error loading high score:', error)
        highScore = 0
    }
}
```

## Visual Feedback

### Score Multiplier
- Appears next to score when active (>1x)
- Golden color (#fbbf24)
- Bounce animation on appearance
- Hides when multiplier resets to 1x

### New High Score
- Pulsing animation
- Golden glow effect
- Auto-hides after 3 seconds
- Only shows on game over screen

### Pause Overlay
- Semi-transparent dark background (98% opacity)
- Smooth fade-in transition
- Preserves game canvas visibility

## Error Handling

### localStorage Unavailable
- Catches errors on save/load
- Falls back to in-memory storage
- Logs errors to console
- Game continues normally

### API Failures
- Catches network errors
- Still updates UI
- Uses local high score
- Logs errors for debugging

## Performance Considerations

### State Transitions
- Minimal overhead (<1ms)
- No memory leaks
- Efficient history management (max 10 entries)

### Persistent Storage
- Async operations don't block gameplay
- Small data footprint (~200 bytes)
- Efficient JSON serialization

### UI Updates
- Only updates changed elements
- Minimal DOM manipulation
- Efficient CSS animations

## Testing

All 58 property-based tests pass, including:
- State transition validation
- Score tracking accuracy
- High score updates
- UI synchronization
- Restart functionality
- Pause/resume behavior

## Future Enhancements

Potential additions:
- Player name input for high scores
- Multiple save slots
- Cloud save synchronization
- Achievements system
- Leaderboard integration
- Game replay system
- Statistics graphs and charts
- Social sharing features
