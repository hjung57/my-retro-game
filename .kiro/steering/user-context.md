# User Context - Pac-Kiro Game

## Technology Stack
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Backend**: Ruby with Sinatra framework
- **Database**: For high score tracking

## Game Specifications

### Gameplay
- **Style**: Classic Pac-Man (top-down, no gravity)
- **Maze**: Classic Pac-Man style layout
- **Character**: Kiro (using kiro-logo.png)
- **Movement**: Grid-based, arrow key controls
  - Kiro speed: 8 frames between moves
  - Ghost speed: 12 frames between moves

### Scoring System
- **Points per dot**: 10 points
- **Power Pellets**: Yes (allows Kiro to eat ghosts)
- **High Score Tracking**: Yes (stored via backend)

### Enemies
- **Ghost Count**: 4 ghosts
- **Ghost Behavior**: Chase Kiro, can be eaten when power pellet is active

### Game States
- Start screen with instructions
- Playing
- Game Over
- Level Complete

### Lives System
- Player starts with lives
- Loses life when caught by ghost (unless power pellet active)
- Game over when all lives lost

### Visual Style
- Use Kiro brand colors (Green-500: #5CB54D for primary elements)
- Dark theme (Black-900 background)
- Smooth animations and visual feedback
