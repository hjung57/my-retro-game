/**
 * Unit tests for GameSelector
 * Requirements: 1.1, 1.3
 */

const GameSelector = require('../game-selector.js');

describe('GameSelector', () => {
  let container;
  let gameSelector;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="game-selector" class="game-selector-container">
        <h1>NCINO ARCADES</h1>
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
   * Verify game selector displays both game options on load
   * Requirements: 1.1
   */
  test('game selector displays both game options on load', () => {
    const gameCards = container.querySelectorAll('.game-card');
    expect(gameCards.length).toBe(2);
    
    const pacGatorCard = container.querySelector('[data-game="pac-gator"]');
    const flappyGatorCard = container.querySelector('[data-game="flappy-gator"]');
    
    expect(pacGatorCard).toBeTruthy();
    expect(flappyGatorCard).toBeTruthy();
    expect(pacGatorCard.textContent).toContain('PAC-GATOR');
    expect(flappyGatorCard.textContent).toContain('FLAPPY GATOR');
  });

  /**
   * Verify back button exists when game is active
   * Requirements: 1.3
   */
  test('back button exists when game is active', () => {
    // Load a game
    gameSelector.loadGame('pac-gator');
    
    // Check that back button is displayed
    const backButton = document.getElementById('back-to-menu');
    expect(backButton).toBeTruthy();
    expect(backButton.style.display).toBe('block');
    expect(backButton.textContent).toContain('BACK TO MENU');
  });

  test('back button is hidden when selector is shown', () => {
    // Load a game first
    gameSelector.loadGame('pac-gator');
    
    // Then show selector
    gameSelector.showSelector();
    
    // Back button should be hidden
    const backButton = document.getElementById('back-to-menu');
    expect(backButton.style.display).toBe('none');
  });
});
