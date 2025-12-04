/**
 * Property-Based Tests for API Client
 * Feature: flappy-gator-game, Property 2: High score data isolation
 * Validates: Requirements 1.4
 */

const fc = require('fast-check');

// Mock fetch globally
global.fetch = jest.fn();

// Import the APIClient class
const APIClient = require('../api-client-node');

describe('APIClient Property-Based Tests', () => {
    let apiClient;

    beforeEach(() => {
        apiClient = new APIClient();
        jest.clearAllMocks();
    });

    /**
     * Property 2: High score data isolation
     * For any sequence of game switches between Pac-Gator and Flappy Gator,
     * each game's high score data should remain unchanged and independent
     */
    test('Property 2: High score data isolation - game scores remain independent', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate arrays of scores for two different games
                fc.array(fc.record({
                    name: fc.string({ minLength: 1, maxLength: 15 }),
                    score: fc.integer({ min: 0, max: 999999 }),
                }), { minLength: 1, maxLength: 10 }),
                fc.array(fc.record({
                    name: fc.string({ minLength: 1, maxLength: 15 }),
                    score: fc.integer({ min: 0, max: 999999 }),
                }), { minLength: 1, maxLength: 10 }),
                async (pacGatorScores, flappyGatorScores) => {
                    // Create mock database with both game types
                    const mockDatabase = [
                        ...pacGatorScores.map(s => ({ ...s, game_type: 'pac-gator', timestamp: Date.now() })),
                        ...flappyGatorScores.map(s => ({ ...s, game_type: 'flappy-gator', timestamp: Date.now() }))
                    ];

                    // Mock fetch to return filtered results based on game_type
                    global.fetch.mockImplementation((url) => {
                        if (url.includes('/api/highscores')) {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve(mockDatabase.sort((a, b) => b.score - a.score))
                            });
                        }
                        return Promise.reject(new Error('Unknown endpoint'));
                    });

                    // Get scores for pac-gator
                    const pacGatorResults = await apiClient.getHighScores('pac-gator');
                    
                    // Get scores for flappy-gator
                    const flappyGatorResults = await apiClient.getHighScores('flappy-gator');

                    // Property: Each game's scores should only contain that game's data
                    const allPacGatorScoresCorrect = pacGatorResults.every(
                        score => score.game_type === 'pac-gator'
                    );
                    const allFlappyGatorScoresCorrect = flappyGatorResults.every(
                        score => score.game_type === 'flappy-gator'
                    );

                    // Property: The number of scores should match the input
                    const pacGatorCountCorrect = pacGatorResults.length === pacGatorScores.length;
                    const flappyGatorCountCorrect = flappyGatorResults.length === flappyGatorScores.length;

                    // Property: No cross-contamination between games
                    const noCrossContamination = 
                        !pacGatorResults.some(s => s.game_type === 'flappy-gator') &&
                        !flappyGatorResults.some(s => s.game_type === 'pac-gator');

                    return allPacGatorScoresCorrect && 
                           allFlappyGatorScoresCorrect && 
                           pacGatorCountCorrect && 
                           flappyGatorCountCorrect &&
                           noCrossContamination;
                }
            ),
            { numRuns: 100 } // Run 100 iterations as specified in design
        );
    });

    test('Property 2 (variant): Submitting scores to one game does not affect another game', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 15 }), // player name
                fc.integer({ min: 0, max: 999999 }), // score
                fc.constantFrom('pac-gator', 'flappy-gator'), // game type
                async (playerName, score, gameType) => {
                    // Mock initial state - both games have some scores
                    const initialPacGatorScores = [
                        { name: 'Player1', score: 1000, game_type: 'pac-gator', timestamp: Date.now() }
                    ];
                    const initialFlappyGatorScores = [
                        { name: 'Player2', score: 500, game_type: 'flappy-gator', timestamp: Date.now() }
                    ];

                    let mockDatabase = [...initialPacGatorScores, ...initialFlappyGatorScores];

                    // Mock fetch for both GET and POST
                    global.fetch.mockImplementation((url, options) => {
                        if (url.includes('/api/highscores')) {
                            if (options && options.method === 'POST') {
                                // Add new score to mock database
                                const body = JSON.parse(options.body);
                                mockDatabase.push({
                                    name: body.name,
                                    score: body.score,
                                    game_type: body.game_type,
                                    timestamp: Date.now()
                                });
                                return Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ success: true, isNewHighScore: false })
                                });
                            } else {
                                // GET request
                                return Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve(mockDatabase.sort((a, b) => b.score - a.score))
                                });
                            }
                        }
                        return Promise.reject(new Error('Unknown endpoint'));
                    });

                    // Get initial counts
                    const initialPacGatorCount = mockDatabase.filter(s => s.game_type === 'pac-gator').length;
                    const initialFlappyGatorCount = mockDatabase.filter(s => s.game_type === 'flappy-gator').length;

                    // Submit score to one game
                    await apiClient.submitScore(gameType, playerName, score);

                    // Get updated counts
                    const updatedPacGatorCount = mockDatabase.filter(s => s.game_type === 'pac-gator').length;
                    const updatedFlappyGatorCount = mockDatabase.filter(s => s.game_type === 'flappy-gator').length;

                    // Property: Only the target game's count should increase
                    if (gameType === 'pac-gator') {
                        return updatedPacGatorCount === initialPacGatorCount + 1 &&
                               updatedFlappyGatorCount === initialFlappyGatorCount;
                    } else {
                        return updatedFlappyGatorCount === initialFlappyGatorCount + 1 &&
                               updatedPacGatorCount === initialPacGatorCount;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
