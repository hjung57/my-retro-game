# Implementation Plan

- [x] 1. Implement particle system for visual effects
  - Create particle data structure and management system
  - Implement particle creation functions (explosion, confetti, power effect)
  - Add particle update logic with physics (gravity, velocity, lifetime)
  - Integrate particle rendering into main draw loop
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 1.1 Write property test for explosion particle creation
  - **Property 5: Explosion creation on collision**
  - **Validates: Requirements 2.1**

- [x] 1.2 Write property test for explosion particle radiation
  - **Property 6: Explosion particles radiate outward**
  - **Validates: Requirements 2.2**

- [x] 1.3 Write property test for particle lifecycle
  - **Property 7: Particle lifecycle management**
  - **Validates: Requirements 2.3, 4.4**

- [x] 1.4 Write property test for explosion color contrast
  - **Property 8: Explosion color contrast**
  - **Validates: Requirements 2.4**

- [x] 1.5 Write property test for confetti gravity and drift
  - **Property 11: Confetti has gravity and drift**
  - **Validates: Requirements 4.3**

- [x] 2. Add power-up visual effect on Kiro
  - Implement visual enhancement rendering (pulsing border or size increase)
  - Hook visual effect to power pellet state changes
  - Ensure effect activates when power pellet consumed
  - Ensure effect deactivates when power timer expires
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.1 Write property test for power state visual round-trip
  - **Property 9: Power state visual round-trip**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 3. Integrate visual effects into gameplay events
  - Trigger explosion effect on ghost collision (non-powered)
  - Trigger confetti effect when new high score achieved
  - Add power effect particles around Kiro during power state
  - Test all visual effects during actual gameplay
  - _Requirements: 2.1, 4.1_

- [x] 3.1 Write property test for high score confetti trigger
  - **Property 10: High score triggers confetti**
  - **Validates: Requirements 4.1**

- [x] 4. Implement audio system with classic Pac-Man sounds
  - Create audio manager with sound loading and playback
  - Add sound files to project (dot, power pellet, eat ghost, death, game start)
  - Hook sound effects to game events (dot collection, power pellet, ghost eating, death, game start)
  - Ensure multiple sounds can play simultaneously without blocking
  - Handle audio loading errors gracefully
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

- [x] 4.1 Write property test for dot collection sound
  - **Property 12: Sound plays on dot collection**
  - **Validates: Requirements 5.1**

- [x] 4.2 Write property test for power pellet sound
  - **Property 13: Sound plays on power pellet collection**
  - **Validates: Requirements 5.2**

- [x] 4.3 Write property test for ghost eating sound
  - **Property 14: Sound plays on ghost eating**
  - **Validates: Requirements 5.3**

- [x] 4.4 Write property test for death sound
  - **Property 15: Sound plays on death**
  - **Validates: Requirements 5.4**

- [x] 4.5 Write property test for audio overlap handling
  - **Property 16: Audio overlap handling**
  - **Validates: Requirements 5.7**

- [x] 5. Extend score persistence with game history
  - Enhance backend API to store full game sessions (name, score, timestamp)
  - Add game history endpoint to retrieve past sessions
  - Implement score validation on backend (non-negative integers only)
  - Update frontend to save game session on game over
  - Add UI to display game history
  - Implement high score detection and update logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 5.1 Write property test for score persistence
  - **Property 1: Score persistence on game end**
  - **Validates: Requirements 1.1**

- [x] 5.2 Write property test for high score update
  - **Property 2: High score update on new record**
  - **Validates: Requirements 1.2**

- [x] 5.3 Write property test for game history sorting
  - **Property 3: Game history sorting**
  - **Validates: Requirements 1.3**

- [x] 5.4 Write property test for score validation
  - **Property 4: Score validation rejects invalid inputs**
  - **Validates: Requirements 1.4**
