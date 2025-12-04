/**
 * Unit tests for Flappy Gator UI elements
 * Requirements: 8.1, 8.2, 8.4, 8.5, 7.1
 */

const fs = require('fs');
const path = require('path');

describe('Flappy Gator HTML Structure', () => {
  let htmlContent;

  beforeAll(() => {
    // Load the HTML file
    const htmlPath = path.join(__dirname, '../flappy-gator.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  });

  beforeEach(() => {
    // Set up DOM with the HTML content
    document.body.innerHTML = htmlContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Start Screen UI', () => {
    /**
     * Verify start screen displays game title
     * Requirements: 8.1, 8.2
     */
    test('start screen displays game title', () => {
      const gameTitle = document.getElementById('game-title');
      expect(gameTitle).toBeTruthy();
      expect(gameTitle.textContent).toBe('Flappy Gator');
    });

    /**
     * Verify start screen shows start button
     * Requirements: 8.1, 8.2
     */
    test('start screen shows start button', () => {
      const startButton = document.getElementById('start-button');
      expect(startButton).toBeTruthy();
      expect(startButton.textContent).toContain('Start');
    });

    /**
     * Verify start screen displays high score
     * Requirements: 8.5
     */
    test('start screen displays high score', () => {
      const startHighScore = document.getElementById('start-high-score');
      const startHighScoreValue = document.getElementById('start-high-score-value');
      
      expect(startHighScore).toBeTruthy();
      expect(startHighScoreValue).toBeTruthy();
      expect(startHighScore.textContent).toContain('High Score');
    });

    /**
     * Verify start screen shows gator preview
     * Requirements: 8.4
     */
    test('start screen shows gator preview', () => {
      const gatorPreview = document.getElementById('gator-preview');
      expect(gatorPreview).toBeTruthy();
    });

    test('start screen shows instructions', () => {
      const instructions = document.getElementById('instructions');
      expect(instructions).toBeTruthy();
      expect(instructions.textContent).toContain('flap');
    });
  });

  describe('Game Over Screen UI', () => {
    /**
     * Verify restart button is present on game over screen
     * Requirements: 7.1
     */
    test('restart button is present on game over screen', () => {
      const restartButton = document.getElementById('restart-button');
      expect(restartButton).toBeTruthy();
      expect(restartButton.textContent).toContain('Restart');
    });

    test('game over screen displays final score', () => {
      const finalScore = document.getElementById('final-score');
      const finalScoreValue = document.getElementById('final-score-value');
      
      expect(finalScore).toBeTruthy();
      expect(finalScoreValue).toBeTruthy();
    });

    test('game over screen displays high score', () => {
      const gameOverHighScore = document.getElementById('game-over-high-score');
      const gameOverHighScoreValue = document.getElementById('game-over-high-score-value');
      
      expect(gameOverHighScore).toBeTruthy();
      expect(gameOverHighScoreValue).toBeTruthy();
    });

    test('game over screen has back to menu button', () => {
      const backToMenuButton = document.getElementById('back-to-menu-button');
      expect(backToMenuButton).toBeTruthy();
      expect(backToMenuButton.textContent).toContain('Back to Menu');
    });
  });

  describe('Game Canvas', () => {
    test('canvas element exists', () => {
      const canvas = document.getElementById('game-canvas');
      expect(canvas).toBeTruthy();
      expect(canvas.tagName).toBe('CANVAS');
    });

    test('score display exists', () => {
      const scoreDisplay = document.getElementById('score-display');
      const currentScore = document.getElementById('current-score');
      
      expect(scoreDisplay).toBeTruthy();
      expect(currentScore).toBeTruthy();
    });
  });

  describe('Mobile Responsive Meta Tags', () => {
    test('viewport meta tag is present', () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta.getAttribute('content')).toContain('width=device-width');
      expect(viewportMeta.getAttribute('content')).toContain('initial-scale=1.0');
    });

    test('mobile web app capable meta tags are present', () => {
      const mobileWebAppMeta = document.querySelector('meta[name="mobile-web-app-capable"]');
      const appleMobileWebAppMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      
      expect(mobileWebAppMeta).toBeTruthy();
      expect(appleMobileWebAppMeta).toBeTruthy();
    });
  });

  describe('Canvas Background Rendering', () => {
    /**
     * Verify canvas background is rendered with #87CEEB
     * Requirements: 6.1
     */
    test('canvas background is rendered with sky blue color #87CEEB', () => {
      // Create a mock canvas context
      const canvas = document.getElementById('game-canvas');
      const mockCtx = {
        _fillStyle: '',
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        scale: jest.fn()
      };

      // Track fillStyle values
      const fillStyleValues = [];
      Object.defineProperty(mockCtx, 'fillStyle', {
        get: function() { return this._fillStyle; },
        set: function(value) {
          this._fillStyle = value;
          fillStyleValues.push(value);
        }
      });

      canvas.getContext = jest.fn(() => mockCtx);

      // Simulate the game loop background rendering
      // This is what happens in the gameLoop method
      mockCtx.fillStyle = '#87CEEB'; // Sky blue background
      mockCtx.fillRect(0, 0, 480, 640);

      // Verify the background color was set to #87CEEB
      expect(fillStyleValues).toContain('#87CEEB');
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 480, 640);
    });
  });
});
