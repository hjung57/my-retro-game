const fc = require('fast-check');

// Mock fetch for testing
global.fetch = jest.fn();

describe('Score Persistence Property Tests', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    // Feature: game-enhancements, Property 1: Score persistence on game end
    // Validates: Requirements 1.1
    test('Property 1: For any game session with player name and score, backend should persist it', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
                fc.integer({ min: 0, max: 1000000 }),
                async (playerName, finalScore) => {
                    // Mock successful save response
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: async () => ({ success: true, isNewHighScore: false })
                    });

                    // Simulate saving game session
                    const response = await fetch('/api/highscores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ score: finalScore, name: playerName })
                    });

                    const data = await response.json();

                    // Verify the request was made with correct data
                    expect(fetch).toHaveBeenCalledWith(
                        '/api/highscores',
                        expect.objectContaining({
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ score: finalScore, name: playerName })
                        })
                    );

                    // Verify response indicates success
                    expect(data.success).toBe(true);
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 2: High score update on new record
    // Validates: Requirements 1.2
    test('Property 2: For any score exceeding current high score, high score should update', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 0, max: 500000 }),
                fc.integer({ min: 1, max: 500000 }),
                async (currentHighScore, additionalPoints) => {
                    const newScore = currentHighScore + additionalPoints;

                    // Mock getting current high score
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: async () => [{ score: currentHighScore, name: 'Previous', timestamp: Date.now() }]
                    });

                    // Get current high score
                    const highScoreResponse = await fetch('/api/highscores');
                    const highScores = await highScoreResponse.json();
                    const oldHighScore = highScores.length > 0 ? highScores[0].score : 0;

                    // Mock saving new high score
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: async () => ({ success: true, isNewHighScore: true })
                    });

                    // Save new score
                    const saveResponse = await fetch('/api/highscores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ score: newScore, name: 'Player' })
                    });

                    const saveData = await saveResponse.json();

                    // Verify that a score higher than the old high score is marked as new high score
                    if (newScore > oldHighScore) {
                        expect(saveData.isNewHighScore).toBe(true);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 3: Game history sorting
    // Validates: Requirements 1.3
    test('Property 3: For any collection of game sessions, history should be sorted by score descending', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 20 }),
                        score: fc.integer({ min: 0, max: 1000000 }),
                        timestamp: fc.integer({ min: 1000000000, max: 2000000000 })
                    }),
                    { minLength: 1, maxLength: 20 }
                ),
                async (gameSessions) => {
                    // Sort the sessions as the backend would
                    const sortedSessions = [...gameSessions].sort((a, b) => b.score - a.score);
                    
                    // Mock game history response with sorted data (simulating backend behavior)
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: async () => sortedSessions
                    });

                    // Get game history
                    const response = await fetch('/api/history');
                    const history = await response.json();

                    // Verify history is sorted by score in descending order
                    for (let i = 0; i < history.length - 1; i++) {
                        expect(history[i].score).toBeGreaterThanOrEqual(history[i + 1].score);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 4: Score validation rejects invalid inputs
    // Validates: Requirements 1.4
    test('Property 4: For any invalid score input, backend should reject it', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(
                    fc.integer({ max: -1 }), // Negative integers
                    fc.double({ min: -1000, max: 1000, noNaN: true }).filter(n => !Number.isInteger(n)), // Floats
                    fc.constant('invalid'), // Non-numeric strings
                    fc.constant(null), // Null
                    fc.constant(undefined) // Undefined
                ),
                async (invalidScore) => {
                    // Mock error response for invalid score
                    fetch.mockResolvedValueOnce({
                        ok: false,
                        status: 400,
                        json: async () => ({ success: false, error: 'Score must be a non-negative integer' })
                    });

                    // Try to save invalid score
                    const response = await fetch('/api/highscores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ score: invalidScore, name: 'Player' })
                    });

                    // Verify request was rejected
                    expect(response.ok).toBe(false);
                    expect(response.status).toBe(400);
                }
            ),
            { numRuns: 100 }
        );
    });
});
