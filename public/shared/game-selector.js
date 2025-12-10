/**
 * GameSelector - Manages game selection and navigation between games
 * Simple navigation-based approach (no iframes)
 */
class GameSelector {
  constructor(containerElement) {
    this.container = containerElement;
    this.init();
  }

  init() {
    // Set up click handlers for game cards
    this.setupGameCards();
  }

  setupGameCards() {
    // Find all game cards that are not "coming soon"
    const gameCards = this.container.querySelectorAll('.game-card:not(.coming-soon)');
    
    gameCards.forEach(card => {
      const gameName = card.dataset.game;
      
      card.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadGame(gameName);
      });
    });
  }

  /**
   * Navigate to the selected game
   * @param {string} gameName - The name of the game to load (e.g., 'pac-gator', 'flappy-gator')
   */
  loadGame(gameName) {
    if (!gameName) {
      console.error('Game name is required');
      return;
    }

    // Navigate to the game page directly
    window.location.href = `/${gameName}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameSelector;
}
