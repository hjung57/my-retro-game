/**
 * Pac-Gator Game Configuration
 * Centralized place to adjust all game parameters
 */

const PAC_CONFIG = {
  // Canvas dimensions
  TILE_SIZE: 25,
  COLS: 28,
  ROWS: 31,

  // Movement speeds (frames between moves)
  GATOR_SPEED: 8,
  GHOST_SPEED_NORMAL: 12,
  GHOST_SPEED_FRIGHTENED: 18,
  GHOST_SPEED_TUNNEL: 16,

  // Game mechanics
  STARTING_LIVES: 3,
  POWER_PELLET_DURATION: 300, // frames (5 seconds at 60fps)
  RESPAWN_DELAY: 120, // frames (2 seconds)
  LEVEL_START_DELAY: 180, // frames (3 seconds)

  // Scoring
  DOT_POINTS: 10,
  POWER_PELLET_POINTS: 50,
  GHOST_BASE_POINTS: 200,
  GHOST_MULTIPLIER: 2, // doubles for each ghost eaten in succession

  // Ghost AI
  SCATTER_DURATION: 420, // frames (7 seconds)
  CHASE_DURATION: 1200, // frames (20 seconds)
  GHOST_HOUSE_EXIT_DELAY: 180, // frames

  // Difficulty progression
  SPEED_INCREASE_PER_LEVEL: 1, // frames decrease
  MIN_GATOR_SPEED: 4,
  MIN_GHOST_SPEED: 8,

  // Visual effects
  POWER_PULSE_SPEED: 0.1,
  GHOST_FLASH_INTERVAL: 10, // frames
  PARTICLE_COUNT: 20,
  CONFETTI_COUNT: 50,

  // Audio
  SOUND_ENABLED: true,
  MUSIC_ENABLED: true,
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.5,

  // Colors (nCino brand)
  PRIMARY_COLOR: '#5CB54D',
  WALL_COLOR: '#2a4a3a',
  DOT_COLOR: '#FFD700',
  POWER_PELLET_COLOR: '#FFD700',
  BACKGROUND_COLOR: '#000000',
  
  // Ghost colors
  GHOST_COLORS: {
    red: '#FF0000',
    pink: '#FFB8FF',
    cyan: '#00FFFF',
    orange: '#FFB852'
  },
  FRIGHTENED_COLOR: '#0000FF',
  FRIGHTENED_FLASH_COLOR: '#FFFFFF'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PAC_CONFIG;
}
