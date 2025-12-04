# Project Structure

## Root Files
- `app.rb` - Sinatra server with API endpoints for high scores
- `Gemfile` / `Gemfile.lock` - Ruby dependency management
- `README.md` - Project documentation and setup instructions
- `kiro-logo.png` - Player character sprite

## Public Directory (`/public`)
Static assets served by Sinatra:
- `index.html` - Game HTML structure and UI elements
- `game.js` - Core game logic, rendering, and state management
- `style.css` - Visual styling and layout
- `kiro-logo.png` - Copy of player sprite for web serving

## Game Architecture (`game.js`)

### Constants
- Canvas dimensions: 28 cols × 31 rows, 20px tiles
- Movement speeds: Kiro (8 frames), Ghosts (12-18 frames)
- Power pellet duration: 300 frames

### Core Systems
- **Maze System**: 2D array with tile types (wall=1, dot=2, power pellet=3, empty=0)
- **Movement**: Grid-based with direction queuing and collision detection
- **AI**: Simple pathfinding for ghost chase/flee behavior
- **State Management**: start → playing → levelComplete/gameOver
- **Rendering**: Canvas 2D context with sprite/shape drawing

### Key Functions
- `init()` - Reset game state
- `moveKiro()` / `moveGhosts()` - Frame-based movement logic
- `checkCollisions()` - Ghost/player interaction
- `draw()` - Render all game elements
- `gameLoop()` - Main update/render loop (requestAnimationFrame)

## Conventions
- Tile-based coordinates (not pixels)
- Frame counters for timing instead of delta time
- Original maze template preserved, working copy modified during play
