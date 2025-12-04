# Implementation Plan

- [x] 1. Reorganize project structure for multi-game system
  - Create directory structure: `public/shared/`, `public/pac-gator/`, `public/flappy-gator/`
  - Move existing Pac-Gator files from `public/` to `public/pac-gator/`
  - Create `public/shared/` directory for common utilities
  - Update file paths and imports in moved files
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 2. Extract shared API client
  - Create `public/shared/api-client.js` with APIClient class
  - Implement `getHighScores(gameType)` method
  - Implement `submitScore(gameType, playerName, score)` method
  - Implement `getHistory(gameType)` method
  - Update Pac-Gator to use shared API client
  - _Requirements: 1.4, 5.4, 5.5_

- [x] 2.1 Write property test for API client
  - **Property 2: High score data isolation**
  - **Validates: Requirements 1.4**

- [x] 3. Create shared audio manager
  - Create `public/shared/audio-manager.js` with AudioManager class
  - Implement `loadSound(name, url)` method
  - Implement `playSound(name, volume)` method
  - Implement `setMuted(isMuted)` method
  - Update Pac-Gator to use shared audio manager
  - _Requirements: 4.5_

- [x] 4. Build game selector UI
  - Update `public/index.html` to include game selector interface
  - Create `public/shared/game-selector.js` with GameSelector class
  - Implement `showSelector()` to display game menu with both game options
  - Implement `loadGame(gameName)` to dynamically load game-specific files
  - Implement `hideSelector()` to hide menu when game is active
  - Add back-to-menu button functionality
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4.1 Write unit test for game selector UI
  - Verify game selector displays both game options on load
  - Verify back button exists when game is active
  - _Requirements: 1.1, 1.3_

- [x] 4.2 Write property test for game selection
  - **Property 1: Game selection loads correct game**
  - **Validates: Requirements 1.2**

- [x] 4.3 Write property test for dynamic game loading
  - **Property 26: Dynamic game loading**
  - **Validates: Requirements 10.4**

- [x] 5. Create Flappy Gator HTML structure
  - Create `public/flappy-gator/flappy-gator.html` with canvas element
  - Add score display UI elements
  - Add start screen with title, instructions, and start button
  - Add game over screen with final score, restart button, and high score display
  - Add mobile-responsive meta tags
  - _Requirements: 8.1, 8.2, 7.1_

- [x] 5.1 Write unit tests for start screen UI
  - Verify start screen displays game title
  - Verify start screen shows start button
  - Verify start screen displays high score
  - Verify start screen shows gator preview
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 5.2 Write unit tests for game over screen UI
  - Verify restart button is present on game over screen
  - _Requirements: 7.1_

- [x] 6. Implement Flappy Gator game engine core
  - Create `public/flappy-gator/game.js` with FlappyGatorGame class
  - Implement game state management (start, playing, paused, gameOver)
  - Implement `init()` to initialize game state
  - Implement `start()` to transition from start to playing
  - Implement `restart()` to reset game state
  - Implement `gameLoop()` with requestAnimationFrame
  - Set up canvas context and basic rendering loop
  - _Requirements: 8.3, 7.5_

- [x] 6.1 Write property test for start button transition
  - **Property 21: Start button transitions to playing**
  - **Validates: Requirements 8.3**

- [x] 7. Implement physics engine
  - Create `public/flappy-gator/physics-engine.js` with PhysicsEngine class
  - Implement `applyGravity(entity)` with gravity constant 0.6
  - Implement `applyFlap(entity)` with flap strength -10
  - Implement `updatePosition(entity, deltaTime)` to update Y position based on velocity
  - Implement velocity getters and setters
  - Add terminal velocity clamping at 12 pixels/frame
  - _Requirements: 2.2, 2.1_

- [x] 7.1 Write property test for gravity
  - **Property 4: Gravity continuously applied**
  - **Validates: Requirements 2.2**

- [x] 7.2 Write property test for flap input
  - **Property 3: Input applies upward velocity**
  - **Validates: Requirements 2.1, 2.4**

- [x] 8. Implement input handling
  - Add click event listener to canvas for flap input
  - Add spacebar keydown event listener for flap input
  - Add touch event listener for mobile tap input
  - Implement input validation to only accept input during playing state
  - Call physics engine's `applyFlap()` on valid input
  - _Requirements: 2.1, 2.4, 9.2_

- [x] 8.1 Write property test for non-playing state input
  - **Property 5: Non-playing states ignore input**
  - **Validates: Requirements 2.3**

- [x] 8.2 Write property test for touch input
  - **Property 23: Touch input registers as flap**
  - **Validates: Requirements 9.2**

- [x] 9. Create winged gator character renderer
  - Create `public/flappy-gator/flappy-gator-renderer.js` with GatorRenderer class
  - Implement `drawGator(x, y, rotation, isFlapping)` main render method
  - Implement `drawBody(x, y, rotation)` to draw green gator body using Kiro brand color
  - Implement `drawWings(x, y, wingAngle)` to draw triangular wings
  - Implement `animateWings(frameCount)` to calculate wing angle based on flapping state
  - Implement `drawEyes(x, y)` to draw white eyes with black pupils
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 9.1 Write property test for wing rendering
  - **Property 27: Gator renders with wings**
  - **Validates: Requirements 11.1**

- [x] 9.2 Write property test for wing animation
  - **Property 28: Wing animation reflects state**
  - **Validates: Requirements 11.2, 11.3**

- [x] 9.3 Write property test for character colors
  - **Property 29: Character uses brand colors**
  - **Validates: Requirements 11.4**

- [x] 10. Implement pipe generator
  - Create `public/flappy-gator/game.js` PipeGenerator class (or separate file)
  - Implement `generatePipe()` to create pipe with random gap position
  - Implement gap position randomization within safe boundaries (100px to canvasHeight - 250px)
  - Implement `updatePipes(scrollSpeed)` to move pipes left by 2 pixels/frame
  - Implement `removePipe(pipe)` to remove off-screen pipes
  - Implement spawn interval logic (120 frames)
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 10.1 Write property test for pipe generation interval
  - **Property 6: Pipes generated at intervals**
  - **Validates: Requirements 3.1**

- [x] 10.2 Write property test for pipe removal and regeneration
  - **Property 7: Off-screen pipes removed and regenerated**
  - **Validates: Requirements 3.2**

- [x] 10.3 Write property test for pipe gap boundaries
  - **Property 8: Pipe gaps within safe boundaries**
  - **Validates: Requirements 3.3**

- [x] 10.4 Write property test for pipe scrolling
  - **Property 10: Pipes scroll at constant speed**
  - **Validates: Requirements 3.5**

- [x] 11. Implement pipe rendering
  - Add pipe rendering to game loop
  - Draw top pipe section as rectangle from top to gap start
  - Draw bottom pipe section as rectangle from gap end to bottom
  - Use Kiro brand green color (#5CB54D) for all pipes
  - Add pipe cap rectangles for visual polish
  - _Requirements: 3.4, 6.3_

- [x] 11.1 Write property test for pipe color
  - **Property 9: Pipes use brand color**
  - **Validates: Requirements 3.4**

- [x] 11.2 Write unit test for background color
  - Verify canvas background is rendered with #87CEEB
  - _Requirements: 6.1_

- [x] 12. Implement collision detection
  - Create collision detector in game.js or separate file
  - Implement `checkPipeCollision(gatorX, gatorY, pipes)` using circular hitbox
  - Implement `checkBoundaryCollision(gatorY)` for top and bottom boundaries
  - Implement `getGatorHitbox(gatorX, gatorY)` with 15px radius
  - Call collision checks every frame during playing state
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 12.1 Write property test for pipe collision
  - **Property 11: Pipe collision triggers game over**
  - **Validates: Requirements 4.1**

- [x] 12.2 Write property test for boundary collision
  - **Property 12: Boundary collision triggers game over**
  - **Validates: Requirements 4.2, 4.3**

- [x] 13. Implement game over logic
  - Implement `gameOver()` method to transition to gameOver state
  - Stop game loop updates when collision detected
  - Display game over screen with final score
  - Play collision sound effect using audio manager
  - _Requirements: 4.4, 4.5_

- [x] 13.1 Write property test for collision stopping updates
  - **Property 13: Collision stops game updates**
  - **Validates: Requirements 4.4**

- [x] 14. Implement scoring system
  - Add score tracking variable initialized to 0
  - Implement pipe passage detection (gator X > pipe X + width)
  - Increment score by 1 when passing through pipe gap
  - Mark pipes as scored to prevent double-counting
  - Update score display in UI immediately on score change
  - _Requirements: 5.1, 5.2_

- [x] 14.1 Write property test for score increment
  - **Property 14: Passing pipe increments score**
  - **Validates: Requirements 5.1**

- [x] 14.2 Write property test for score display sync
  - **Property 15: Score display synchronization**
  - **Validates: Requirements 5.2**

- [x] 15. Integrate scoring with API
  - Display final score on game over screen
  - Submit score to API using shared API client with game type "flappy-gator"
  - Fetch and display high score from API on game over screen
  - Fetch and display high score on start screen
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 15.1 Write property test for game over score display
  - **Property 16: Game over displays final score**
  - **Validates: Requirements 5.3**

- [x] 15.2 Write property test for score API submission
  - **Property 17: Game over submits score to API**
  - **Validates: Requirements 5.4**

- [x] 15.3 Write property test for high score display
  - **Property 18: Game over displays high score**
  - **Validates: Requirements 5.5**

- [x] 16. Implement gator rotation animation
  - Calculate rotation angle based on velocity (velocity * 3 degrees)
  - Clamp rotation to ±45 degrees
  - Apply rotation to gator rendering
  - Update rotation every frame based on current velocity
  - _Requirements: 6.4_

- [x] 16.1 Write property test for flap rotation
  - **Property 19: Flap animates rotation**
  - **Validates: Requirements 6.4**

- [x] 17. Implement restart functionality
  - Wire up restart button click handler
  - Reset score to 0 on restart
  - Reset gator position to starting coordinates (100, canvasHeight/2)
  - Reset gator velocity to 0
  - Clear all pipes array
  - Generate initial pipes
  - Transition game state to playing
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 17.1 Write property test for restart
  - **Property 20: Restart resets game state**
  - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

- [x] 18. Implement mobile responsiveness
  - Add viewport meta tag for mobile scaling
  - Implement canvas scaling based on window width
  - Maintain aspect ratio when scaling
  - Add resize event listener to handle orientation changes
  - Scale all game elements proportionally
  - Ensure touch targets are appropriately sized
  - _Requirements: 9.1, 9.3, 9.4, 9.5_

- [x] 18.1 Write property test for canvas scaling
  - **Property 22: Canvas scales to mobile viewport**
  - **Validates: Requirements 9.1**

- [x] 18.2 Write property test for proportional scaling
  - **Property 24: Viewport changes scale proportionally**
  - **Validates: Requirements 9.3**

- [x] 18.3 Write property test for aspect ratio maintenance
  - **Property 25: Mobile rendering maintains aspect ratio**
  - **Validates: Requirements 9.4**

- [x] 19. Create Flappy Gator styles
  - Create `public/flappy-gator/style.css`
  - Style start screen with Kiro brand colors
  - Style game over screen
  - Style score display
  - Add mobile-responsive styles
  - Use dark theme with Green-500 (#5CB54D) for primary elements
  - _Requirements: 6.1, 6.2_

- [x] 20. Add sound effects
  - Create or source flap sound effect
  - Add flap.wav to `assets/flappy-gator/`
  - Load flap sound using audio manager
  - Play flap sound on each flap input
  - Load collision sound using audio manager
  - Play collision sound on game over
  - _Requirements: 4.5_

- [x] 21. Final integration and testing
  - Test game selector switching between Pac-Gator and Flappy Gator
  - Verify high scores are tracked independently for each game
  - Test mobile touch controls on actual device or emulator
  - Test responsive scaling at various viewport sizes
  - Verify all sounds play correctly
  - Test complete game flow from start to game over to restart
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: All_
