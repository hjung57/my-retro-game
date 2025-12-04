/**
 * GameSelector - Manages game selection and navigation between games
 * Requirements: 1.1, 1.2, 1.3
 */
class GameSelector {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentGame = null;
    this.gameContainer = null;
    this.backButton = null;
    this.init();
  }

  init() {
    // Create game container for dynamically loaded games
    this.gameContainer = document.createElement('div');
    this.gameContainer.id = 'game-container';
    this.gameContainer.style.display = 'none';
    document.body.appendChild(this.gameContainer);

    // Create back to menu button
    this.backButton = document.createElement('button');
    this.backButton.id = 'back-to-menu';
    this.backButton.textContent = '← BACK TO MENU';
    this.backButton.style.display = 'none';
    this.backButton.onclick = () => this.showSelector();
    document.body.appendChild(this.backButton);

    // Add styles for back button
    this.addBackButtonStyles();

    // Set up click handlers for game cards
    this.setupGameCards();

    // Listen for messages from iframe games
    window.addEventListener('message', (event) => {
      if (event.data && event.data.action === 'showSelector') {
        this.showSelector();
      }
    });
  }

  addBackButtonStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #back-to-menu {
        position: fixed;
        top: 20px;
        left: 20px;
        background: #5CB54D;
        color: #1a1a1a;
        border: none;
        padding: 12px 24px;
        font-family: 'Press Start 2P', cursive;
        font-size: 0.7rem;
        cursor: pointer;
        border-radius: 5px;
        z-index: 1000;
        transition: all 0.3s ease;
      }

      #back-to-menu:hover {
        background: #7dd968;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(92, 181, 77, 0.4);
      }

      #game-container {
        width: 100%;
        height: 100vh;
      }

      #game-container iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    `;
    document.head.appendChild(style);
  }

  setupGameCards() {
    // Find all game cards that are not "coming soon"
    const gameCards = this.container.querySelectorAll('.game-card:not(.coming-soon)');
    
    gameCards.forEach(card => {
      // Remove the href attribute to prevent default navigation
      const gameName = card.getAttribute('href')?.replace('/', '') || card.dataset.game;
      card.removeAttribute('href');
      card.dataset.game = gameName;
      
      card.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadGame(gameName);
      });
    });
  }

  /**
   * Display the game selection menu
   * Requirements: 1.1, 1.3
   */
  showSelector() {
    // Hide game container and back button
    if (this.gameContainer) {
      this.gameContainer.style.display = 'none';
      this.gameContainer.innerHTML = '';
    }
    
    if (this.backButton) {
      this.backButton.style.display = 'none';
    }

    // Show the game selector
    if (this.container) {
      this.container.style.display = 'block';
    }

    // Clear current game
    this.currentGame = null;
  }

  /**
   * Hide the game selector menu
   * Requirements: 1.2
   */
  hideSelector() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Load and display the selected game
   * Requirements: 1.2
   * @param {string} gameName - The name of the game to load (e.g., 'pac-gator', 'flappy-gator')
   */
  loadGame(gameName) {
    if (!gameName) {
      console.error('Game name is required');
      return;
    }

    // Hide the selector
    this.hideSelector();

    // Set current game
    this.currentGame = gameName;

    // Load game in iframe
    this.gameContainer.innerHTML = `<iframe src="/${gameName}/${gameName}.html"></iframe>`;
    this.gameContainer.style.display = 'block';

    // Show back button
    this.backButton.style.display = 'block';
  }

  /**
   * Get the currently loaded game
   * @returns {string|null} The name of the current game or null
   */
  getCurrentGame() {
    return this.currentGame;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameSelector;
}
