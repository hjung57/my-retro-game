/**
 * Flappy Gator Game Configuration
 * Centralized place to adjust all game parameters
 */

const FLAPPY_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,

  // Physics
  GRAVITY: 0.6,
  FLAP_STRENGTH: -10,
  MAX_FALL_SPEED: 12,
  TERMINAL_VELOCITY: 15,

  // Gator properties
  GATOR_SIZE: 40,
  GATOR_START_X: 100,
  GATOR_START_Y: 300,
  GATOR_ROTATION_SPEED: 3,
  MAX_ROTATION_UP: -30,
  MAX_ROTATION_DOWN: 90,

  // Collision detection
  GATOR_HITBOX_RADIUS: 18,
  HITBOX_TOLERANCE: 2, // Makes gameplay more forgiving
  INVINCIBILITY_DURATION: 60, // frames after collision
  DEBUG_HITBOXES: false, // Set to true to visualize hitboxes

  // Pipe properties
  PIPE_WIDTH: 60,
  PIPE_GAP: 180,
  PIPE_SPEED: 2,
  PIPE_SPAWN_INTERVAL: 120, // frames (2 seconds at 60fps)
  PIPE_MIN_HEIGHT: 100,
  PIPE_MAX_HEIGHT: 400,
  PIPE_COLOR: '#5CB54D',

  // Scoring
  POINTS_PER_PIPE: 1,
  COMBO_THRESHOLD: 3,
  COMBO_MULTIPLIER: 1.5,

  // Difficulty progression
  DIFFICULTY_INCREASE_INTERVAL: 10, // every 10 pipes
  SPEED_INCREASE_PER_LEVEL: 0.2,
  GAP_DECREASE_PER_LEVEL: 5,
  MIN_PIPE_GAP: 140,
  MAX_PIPE_SPEED: 4,

  // Visual effects
  PARTICLE_COUNT: 15,
  PARTICLE_LIFETIME: 60, // frames
  SCREEN_SHAKE_DURATION: 10, // frames
  SCREEN_SHAKE_INTENSITY: 5, // pixels

  // Audio
  SOUND_ENABLED: true,
  MUSIC_ENABLED: false,

  // Performance optimization
  TARGET_FPS: 60,
  ENABLE_OBJECT_POOLING: true,
  PIPE_POOL_SIZE: 20,
  PARTICLE_POOL_SIZE: 100,
  SHOW_FPS: false, // Set to true to display FPS counter
  SHOW_DETAILED_STATS: false, // Set to true for detailed performance stats
  GC_INTERVAL: 5000, // Garbage collection suggestion interval (ms)

  // Colors (nCino brand)
  PRIMARY_COLOR: '#5CB54D',
  BACKGROUND_COLOR: '#87CEEB',
  GROUND_COLOR: '#DEB887',
  TEXT_COLOR: '#FFFFFF',
  SHADOW_COLOR: 'rgba(0, 0, 0, 0.5)'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FLAPPY_CONFIG;
}
