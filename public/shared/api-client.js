/**
 * Shared API Client for multi-game system
 * Handles communication with the backend for high scores and game history
 */
class APIClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    /**
     * Get high scores for a specific game type
     * @param {string} gameType - The game type identifier (e.g., 'pac-gator', 'flappy-gator')
     * @returns {Promise<Array>} Array of high score objects
     */
    async getHighScores(gameType) {
        try {
            const response = await fetch(`${this.baseURL}/api/highscores`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const scores = await response.json();
            
            // Filter by game type if provided
            if (gameType) {
                return scores.filter(score => score.game_type === gameType);
            }
            
            return scores;
        } catch (error) {
            console.error('Error fetching high scores:', error);
            return [];
        }
    }

    /**
     * Submit a score for a specific game type
     * @param {string} gameType - The game type identifier (e.g., 'pac-gator', 'flappy-gator')
     * @param {string} playerName - The player's name
     * @param {number} score - The score to submit
     * @returns {Promise<Object>} Response object with success status and isNewHighScore flag
     */
    async submitScore(gameType, playerName, score) {
        try {
            const response = await fetch(`${this.baseURL}/api/highscores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    game_type: gameType,
                    name: playerName, 
                    score: score 
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get game history for a specific game type
     * @param {string} gameType - The game type identifier (e.g., 'pac-gator', 'flappy-gator')
     * @returns {Promise<Array>} Array of game history objects sorted by timestamp
     */
    async getHistory(gameType) {
        try {
            const response = await fetch(`${this.baseURL}/api/history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const history = await response.json();
            
            // Filter by game type if provided
            if (gameType) {
                return history.filter(entry => entry.game_type === gameType);
            }
            
            return history;
        } catch (error) {
            console.error('Error fetching game history:', error);
            return [];
        }
    }

    /**
     * Update player name for an existing score
     * @param {number} scoreId - The ID of the score to update
     * @param {string} playerName - The new player name
     * @returns {Promise<Object>} Response object with success status
     */
    async updateScoreName(scoreId, playerName) {
        try {
            const response = await fetch(`${this.baseURL}/api/highscores/${scoreId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating score name:', error);
            return { success: false, error: error.message };
        }
    }
}
