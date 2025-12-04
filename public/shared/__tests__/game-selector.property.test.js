/**
 * Property-based tests for GameSelector
 * **Feature: flappy-gator-game, Property 1: Game selection loads correct game**
 * **Validates: Requirements 1.2**
 * 
 * **Feature: flappy-gator-game, Property 26: Dynamic game loading**
 * **Validates: Requirements 10.4**
 */

const fc = require('fast-check');
const GameSelector = require('../game-selector.js');

describe('GameSelector Property Tests', () => {
  let container;
  let gameSelector;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="game-selector" class="game-selector-container">
        <h1>KIRO GAMES</h1>
        <div class="games-grid">
          <div class="game-card" data-game="pac-gator">
            <h2>PAC-GATOR</h2>
          </div>
          <div class="game-card" data-game="flappy-gator">
            <h2>FLAPPY GATOR</h2>
          </div>
        </div>
      </div>
    `;
    container = document.getElementById('game-selector');
    gameSelector = new GameSelector(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Property 1: Game selection loads correct game
   * For any game selection (Pac-Gator or Flappy Gator), clicking the game option 
   * should load that game's JavaScript and hide the game selector
   * **Validates: Requirements 1.2**
   */
  test('Property 1: Game selection loads correct game', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('pac-gator', 'flappy-gator'),
        (gameName) => {
          // Reset state
          gameSelector.showSelector();
          
          // Load the game
          gameSelector.loadGame(gameName);
          
          // Verify the correct game is loaded
          expect(gameSelector.getCurrentGame()).toBe(gameName);
          
          // Verify game container is visible
          const gameContainer = document.getElementById('game-container');
          expect(gameContainer.style.display).toBe('block');
          
          // Verify iframe contains correct game path
          const iframe = gameContainer.querySelector('iframe');
          expect(iframe).toBeTruthy();
          expect(iframe.src).toContain(`/${gameName}/${gameName}.html`);
          
          // Verify selector is hidden
          expect(container.style.display).toBe('none');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26: Dynamic game loading
   * For any game selection, the Game System should load only the JavaScript files 
   * specific to that game
   * **Validates: Requirements 10.4**
   */
  test('Property 26: Dynamic game loading', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('pac-gator', 'flappy-gator'),
        (gameName) => {
          // Reset state
          gameSelector.showSelector();
          
          // Load the game
          gameSelector.loadGame(gameName);
          
          // Verify only the selected game's files are loaded (via iframe)
          const gameContainer = document.getElementById('game-container');
          const iframe = gameContainer.querySelector('iframe');
          
          // The iframe should load the game-specific HTML file
          expect(iframe.src).toContain(`/${gameName}/`);
          
          // Verify the game name matches what was requested
          expect(gameSelector.getCurrentGame()).toBe(gameName);
          
          // Verify no other game is loaded (only one iframe should exist)
          const allIframes = document.querySelectorAll('iframe');
          expect(allIframes.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
