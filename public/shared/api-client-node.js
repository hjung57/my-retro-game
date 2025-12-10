/**
 * Node.js compatible version of APIClient for testing
 * This is the same as api-client.js but uses module.exports for Node.js
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
            // Build URL with game_type parameter if provided
            let url = `${this.baseURL}/api/highscores`;
            if (gameType) {
                url += `?game_type=${encodeURIComponent(gameType)}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const scores = await response.json();
            
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

module.exports = APIClient;
