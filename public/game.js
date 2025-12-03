const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highScoreEl = document.getElementById('highScore');
const messageEl = document.getElementById('message');

// Mobile zoom settings
let isMobile = window.innerWidth <= 768;
let cameraX = 0;
let cameraY = 0;
const ZOOM_TILES = 15; // Show 15x15 tiles on mobile

window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
});

// Game constants
const TILE_SIZE = 25;
const COLS = 28;
const ROWS = 31;

// Movement timing
const KIRO_SPEED = 8; // frames between moves
const GHOST_SPEED = 18; // frames between moves (slower)
const SCARED_GHOST_SPEED = 24; // slower when scared

// Game state
let gameState = 'menu'; // Changed from 'start' to 'menu'
let score = 0;
let lives = 3;
let highScore = 0;
let frameCount = 0;
let powerPelletActive = false;
let powerPelletTimer = 0;
let isPaused = false;
let waitingForRespawn = false;
let deathAnimationTimer = 0;
let soundEnabled = true;
let musicEnabled = true;
let difficulty = 'normal';
let currentLevel = 1;
let endlessMode = false;
let randomDotTimer = 0;
const POWER_PELLET_DURATION = 300; // frames
const POWER_PELLET_RESPAWN_TIME = 600; // frames (10 seconds at 60fps)
const MAX_POWER_PELLETS = 4;
const DEATH_ANIMATION_DELAY = 60; // frames (~1 second at 60fps)
const RANDOM_DOT_SPAWN_INTERVAL = 120; // frames (2 seconds at 60fps)
const ENDLESS_MODE_LEVEL = 4; // Switch to endless mode after level 3
const GHOST_RESPAWN_DELAY = 180; // frames (3 seconds at 60fps)

// Power pellet positions (from original maze)
const powerPelletPositions = [
    { x: 1, y: 3 },
    { x: 26, y: 3 },
    { x: 1, y: 23 },
    { x: 26, y: 23 }
];
let powerPelletRespawnTimers = [0, 0, 0, 0];

// Original maze template (never modified)
const originalMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Working maze (gets modified during gameplay)
let maze = [];

// Kiro character
let kiro = {
    x: 14,
    y: 23,
    direction: null,
    nextDirection: null,
    moveTimer: 0,
    img: new Image(),
    imgLoaded: false
};
kiro.img.src = '/kiro-logo.png';
kiro.img.onload = () => { kiro.imgLoaded = true; };
kiro.img.onerror = () => { console.error('Failed to load kiro-logo.png'); };

// Ghosts
let ghosts = [];

// Ghost colors using Kiro brand palette
const ghostColors = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'];

// Particle system
const particleSystem = new ParticleSystem();

// Audio Manager
class AudioManager {
    constructor() {
        this.sounds = {
            'dot': null,
            'powerPellet': null,
            'eatGhost': null,
            'death': null,
            'gameStart': null
        };
        this.loaded = false;
        this.loadingSounds = 0;
        this.totalSounds = Object.keys(this.sounds).length;
    }

    initAudio() {
        // Preload all sound files
        const soundFiles = {
            'dot': '/sounds/dot.wav',
            'powerPellet': '/sounds/power-pellet.wav',
            'eatGhost': '/sounds/eat-ghost.wav',
            'death': '/sounds/death.wav',
            'gameStart': '/sounds/game-start.wav'
        };

        Object.keys(soundFiles).forEach(soundName => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                this.loadingSounds++;
                if (this.loadingSounds === this.totalSounds) {
                    this.loaded = true;
                    console.log('All audio files loaded successfully');
                }
            }, { once: true });

            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load sound: ${soundName}`, e);
                this.loadingSounds++;
                if (this.loadingSounds === this.totalSounds) {
                    this.loaded = true;
                }
            });

            audio.src = soundFiles[soundName];
            this.sounds[soundName] = audio;
        });
    }

    playSound(soundName) {
        if (!soundEnabled) return; // Check if sound is enabled
        
        if (!this.sounds[soundName]) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        try {
            // Clone the audio element to allow overlapping sounds
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = 0.3; // Set volume to 30% to avoid being too loud
            
            // Play the sound
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error playing sound ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }

    isReady() {
        return this.loaded;
    }
}

const audioManager = new AudioManager();

// Difficulty settings
const difficultySettings = {
    easy: { kiroSpeed: 6, ghostSpeed: 20, scaredSpeed: 28 },
    normal: { kiroSpeed: 8, ghostSpeed: 18, scaredSpeed: 24 },
    hard: { kiroSpeed: 10, ghostSpeed: 14, scaredSpeed: 18 }
};

function getSpeed(type) {
    const settings = difficultySettings[difficulty];
    let speed;
    
    if (type === 'kiro') {
        speed = settings.kiroSpeed;
    } else if (type === 'ghost') {
        speed = settings.ghostSpeed;
    } else if (type === 'scared') {
        speed = settings.scaredSpeed;
    } else {
        return KIRO_SPEED;
    }
    
    // Apply level-based speed increase (ghosts get faster each level)
    if (type === 'ghost' || type === 'scared') {
        const levelMultiplier = Math.max(0.5, 1 - ((currentLevel - 1) * 0.08)); // Max 50% faster
        speed = Math.floor(speed * levelMultiplier);
    }
    
    return speed;
}

function initGhosts() {
    // Spawn all ghosts in the same row inside the ghost house
    ghosts = [
        { x: 12, y: 14, direction: 'up', moveTimer: 0, color: ghostColors[0], scared: false, startX: 12, startY: 14, inHouse: true, respawnTimer: 0, isRespawning: false },
        { x: 13, y: 14, direction: 'up', moveTimer: 40, color: ghostColors[1], scared: false, startX: 13, startY: 14, inHouse: true, respawnTimer: 0, isRespawning: false },
        { x: 14, y: 14, direction: 'up', moveTimer: 80, color: ghostColors[2], scared: false, startX: 14, startY: 14, inHouse: true, respawnTimer: 0, isRespawning: false },
        { x: 15, y: 14, direction: 'up', moveTimer: 120, color: ghostColors[3], scared: false, startX: 15, startY: 14, inHouse: true, respawnTimer: 0, isRespawning: false }
    ];
}

function copyMaze() {
    maze = originalMaze.map(row => [...row]);
}

function init() {
    copyMaze();
    kiro.x = 14;
    kiro.y = 23;
    kiro.direction = null;
    kiro.nextDirection = null;
    kiro.moveTimer = 0;
    initGhosts();
    score = 0;
    lives = 3;
    frameCount = 0;
    powerPelletActive = false;
    powerPelletTimer = 0;
    currentLevel = 1;
    endlessMode = false;
    randomDotTimer = 0;
    updateUI();
    loadHighScore();
}

function spawnRandomDot() {
    // Find all empty spaces in the maze
    const emptySpaces = [];
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            // Only spawn in empty spaces (not walls, not existing dots/pellets)
            if (maze[y][x] === 0) {
                // Don't spawn too close to Kiro or ghosts
                const tooCloseToKiro = Math.abs(x - kiro.x) < 3 && Math.abs(y - kiro.y) < 3;
                const tooCloseToGhost = ghosts.some(g => Math.abs(x - g.x) < 2 && Math.abs(y - g.y) < 2);
                
                if (!tooCloseToKiro && !tooCloseToGhost) {
                    emptySpaces.push({ x, y });
                }
            }
        }
    }
    
    // Spawn a dot in a random empty space
    if (emptySpaces.length > 0) {
        const randomSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
        maze[randomSpace.y][randomSpace.x] = 2; // Spawn a regular dot
        
        // Create particle effect at spawn location
        particleSystem.createPowerEffect(randomSpace.x, randomSpace.y, TILE_SIZE);
    }
}

function loadHighScore() {
    fetch('/api/highscores')
        .then(res => res.json())
        .then(scores => {
            if (scores.length > 0) {
                highScore = scores[0].score;
                highScoreEl.textContent = highScore;
            }
        })
        .catch(err => console.error('Error loading high scores:', err));
}

function saveGameSession() {
    // Always save game session on game over
    return fetch('/api/highscores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score, name: 'Player' })
    })
    .then(res => res.json())
    .then(data => {
        if (data.isNewHighScore) {
            // Trigger confetti for new high score
            particleSystem.createConfetti(50, canvas.width);
            highScore = score;
            highScoreEl.textContent = highScore;
        }
        return data;
    })
    .catch(err => {
        console.error('Error saving game session:', err);
        return null;
    });
}

function loadGameHistory() {
    fetch('/api/history')
        .then(res => res.json())
        .then(history => {
            displayGameHistory(history);
        })
        .catch(err => console.error('Error loading game history:', err));
}

function displayGameHistory(history) {
    const historyContainer = document.getElementById('gameHistory');
    if (!historyContainer) return;
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No games played yet</p>';
        return;
    }
    
    const historyHTML = history.slice(0, 10).map((session, index) => {
        const date = new Date(session.timestamp * 1000);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const highScoreBadge = session.isHighScore ? '<span class="high-score-badge">🏆 High Score!</span>' : '';
        
        return `
            <div class="history-item ${session.isHighScore ? 'is-high-score' : ''}">
                <span class="rank">#${index + 1}</span>
                <span class="player-name">${session.name}</span>
                <span class="score">${session.score}</span>
                <span class="date">${dateStr}</span>
                ${highScoreBadge}
            </div>
        `;
    }).join('');
    
    historyContainer.innerHTML = historyHTML;
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    const levelEl = document.getElementById('level');
    if (levelEl) {
        levelEl.textContent = endlessMode ? '∞' : currentLevel;
    }
}

function canMove(x, y, isGhost = false, ghostObj = null) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    const tile = maze[y][x];
    
    // Kiro cannot move through walls
    if (!isGhost) {
        return tile !== 1;
    }
    
    // Ghosts can move anywhere except walls
    if (tile === 1) return false;
    
    // Prevent ghosts from re-entering the ghost house once they've exited
    if (ghostObj && !ghostObj.inHouse) {
        // Ghost house area is roughly x: 10-17, y: 12-16
        if (x >= 10 && x <= 17 && y >= 12 && y <= 16) {
            return false; // Can't go back into ghost house
        }
    }
    
    return true;
}

function moveKiro() {
    if (kiro.moveTimer > 0) {
        kiro.moveTimer--;
        return;
    }

    // Try to change direction
    if (kiro.nextDirection) {
        const { dx, dy } = getDirectionDelta(kiro.nextDirection);
        if (canMove(kiro.x + dx, kiro.y + dy)) {
            kiro.direction = kiro.nextDirection;
            kiro.nextDirection = null;
        }
    }

    // Move in current direction
    if (kiro.direction) {
        const { dx, dy } = getDirectionDelta(kiro.direction);
        let newX = kiro.x + dx;
        let newY = kiro.y + dy;

        // Wraparound tunnel on row 14 (center horizontal lane)
        if (newY === 14 || kiro.y === 14) {
            if (newX < 0) {
                newX = COLS - 1; // Wrap to right side
            } else if (newX >= COLS) {
                newX = 0; // Wrap to left side
            }
        }

        if (canMove(newX, newY)) {
            kiro.x = newX;
            kiro.y = newY;
            kiro.moveTimer = getSpeed('kiro');

            // Collect dots
            const tile = maze[kiro.y][kiro.x];
            if (tile === 2) {
                maze[kiro.y][kiro.x] = 0;
                score += 10;
                audioManager.playSound('dot');
                updateUI();
            } else if (tile === 3) { // Power pellet
                maze[kiro.y][kiro.x] = 0;
                score += 50;
                powerPelletActive = true;
                powerPelletTimer = POWER_PELLET_DURATION;
                ghosts.forEach(g => g.scared = true);
                audioManager.playSound('powerPellet');
                
                // Start respawn timer for this pellet
                powerPelletPositions.forEach((pos, index) => {
                    if (pos.x === kiro.x && pos.y === kiro.y) {
                        powerPelletRespawnTimers[index] = 0;
                    }
                });
                
                updateUI();
            }

            // Check win condition
            if (checkWin()) {
                if (currentLevel < ENDLESS_MODE_LEVEL) {
                    // Structured levels 1-3
                    gameState = 'levelComplete';
                    messageEl.textContent = `Level ${currentLevel} Complete! Press any arrow key to continue`;
                } else if (currentLevel === ENDLESS_MODE_LEVEL && !endlessMode) {
                    // Transition to endless mode
                    gameState = 'levelComplete';
                    messageEl.textContent = 'Entering Endless Mode! Dots will respawn randomly!';
                } else {
                    // Already in endless mode, shouldn't happen but just in case
                    endlessMode = true;
                }
            }
        }
    }
}

function getDirectionDelta(dir) {
    switch(dir) {
        case 'up': return { dx: 0, dy: -1 };
        case 'down': return { dx: 0, dy: 1 };
        case 'left': return { dx: -1, dy: 0 };
        case 'right': return { dx: 1, dy: 0 };
        default: return { dx: 0, dy: 0 };
    }
}

function isGhostAt(x, y, excludeIndex) {
    return ghosts.some((g, i) => i !== excludeIndex && g.x === x && g.y === y);
}

function moveGhosts() {
    ghosts.forEach((ghost, index) => {
        // Handle respawn timer
        if (ghost.isRespawning) {
            ghost.respawnTimer--;
            if (ghost.respawnTimer <= 0) {
                // Respawn ghost at starting position
                ghost.x = ghost.startX;
                ghost.y = ghost.startY;
                ghost.scared = false;
                ghost.inHouse = true;
                ghost.direction = 'up';
                ghost.isRespawning = false;
                ghost.respawnTimer = 0;
            }
            return; // Don't move while respawning
        }
        
        // Always decrement timer
        if (ghost.moveTimer > 0) {
            ghost.moveTimer--;
        }
        
        // Only move when timer reaches 0
        if (ghost.moveTimer > 0) {
            return;
        }

        const speed = ghost.scared ? getSpeed('scared') : getSpeed('ghost');
        
        // Special logic for exiting ghost house
        if (ghost.inHouse) {
            // Step 1: Move horizontally to center columns (x=13 or x=14)
            if (ghost.x < 13) {
                ghost.x++;
                ghost.direction = 'right';
                ghost.moveTimer = speed;
                return;
            } else if (ghost.x > 14) {
                ghost.x--;
                ghost.direction = 'left';
                ghost.moveTimer = speed;
                return;
            }
            
            // Step 2: Now at center column (x=13 or x=14), move up to exit
            if (ghost.y <= 11) {
                // Successfully exited the house
                ghost.inHouse = false;
                // Don't return, let normal AI take over
            } else {
                // Still inside, move up
                ghost.y--;
                ghost.direction = 'up';
                ghost.moveTimer = speed;
                return;
            }
        }
        
        // Get opposite direction to avoid immediate backtracking
        const oppositeDir = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        }[ghost.direction];
        
        // Try all directions
        const directions = ['up', 'down', 'left', 'right'];
        const validMoves = [];
        
        directions.forEach(dir => {
            // Skip going backwards unless it's the only option
            if (dir === oppositeDir) return;
            
            const { dx, dy } = getDirectionDelta(dir);
            const newX = ghost.x + dx;
            const newY = ghost.y + dy;

            // Check if move is valid
            if (canMove(newX, newY, true, ghost)) {
                const dist = Math.abs(newX - kiro.x) + Math.abs(newY - kiro.y);
                const hasGhost = isGhostAt(newX, newY, index);
                
                validMoves.push({
                    dir: dir,
                    x: newX,
                    y: newY,
                    dist: dist,
                    hasGhost: hasGhost
                });
            }
        });
        
        // If no valid moves (dead end), allow going backwards
        if (validMoves.length === 0) {
            const { dx, dy } = getDirectionDelta(oppositeDir);
            const newX = ghost.x + dx;
            const newY = ghost.y + dy;
            if (canMove(newX, newY, true, ghost)) {
                validMoves.push({
                    dir: oppositeDir,
                    x: newX,
                    y: newY,
                    dist: Math.abs(newX - kiro.x) + Math.abs(newY - kiro.y),
                    hasGhost: isGhostAt(newX, newY, index)
                });
            }
        }
        
        if (validMoves.length > 0) {
            // Prefer moves without other ghosts
            let movesWithoutGhosts = validMoves.filter(m => !m.hasGhost);
            if (movesWithoutGhosts.length === 0) {
                movesWithoutGhosts = validMoves; // Use all moves if all have ghosts
            }
            
            // Sort by distance (closest for chase, farthest for scared)
            movesWithoutGhosts.sort((a, b) => {
                if (ghost.scared) {
                    return b.dist - a.dist; // Farthest first when scared
                } else {
                    return a.dist - b.dist; // Closest first when chasing
                }
            });
            
            // Add some randomness: 80% best move, 20% random valid move
            let chosenMove;
            if (Math.random() < 0.8) {
                chosenMove = movesWithoutGhosts[0]; // Best move
            } else {
                chosenMove = movesWithoutGhosts[Math.floor(Math.random() * movesWithoutGhosts.length)]; // Random
            }
            
            // Double-check the move is still valid with ghost house restriction
            if (canMove(chosenMove.x, chosenMove.y, true, ghost)) {
                ghost.direction = chosenMove.dir;
                let finalX = chosenMove.x;
                let finalY = chosenMove.y;
                
                // Wraparound tunnel on row 14 (center horizontal lane)
                if (finalY === 14 || ghost.y === 14) {
                    if (finalX < 0) {
                        finalX = COLS - 1; // Wrap to right side
                    } else if (finalX >= COLS) {
                        finalX = 0; // Wrap to left side
                    }
                }
                
                ghost.x = finalX;
                ghost.y = finalY;
                ghost.moveTimer = speed;
            }
        }
    });
}

function checkCollisions() {
    ghosts.forEach((ghost) => {
        // Skip collision check if ghost is respawning
        if (ghost.isRespawning) return;
        
        if (ghost.x === kiro.x && ghost.y === kiro.y) {
            if (powerPelletActive && ghost.scared) {
                // Eat ghost
                score += 200;
                audioManager.playSound('eatGhost');
                updateUI();
                
                // Start respawn timer
                ghost.isRespawning = true;
                ghost.respawnTimer = GHOST_RESPAWN_DELAY;
                
                // Create particle effect at eaten location
                particleSystem.createExplosion(ghost.x, ghost.y, 15, TILE_SIZE);
            } else if (!ghost.scared && deathAnimationTimer === 0) {
                // Only trigger death once
                // Create explosion effect on collision
                particleSystem.createExplosion(kiro.x, kiro.y, 20, TILE_SIZE);
                audioManager.playSound('death');
                
                // Lose life
                lives--;
                updateUI();
                
                // Start death animation timer
                deathAnimationTimer = DEATH_ANIMATION_DELAY;
                
                if (lives <= 0) {
                    gameState = 'gameOver';
                    // Save session will be called after animation
                }
            }
        }
    });
}

function checkWin() {
    // Only check for regular dots (2), not power pellets (3)
    // Power pellets respawn, so they shouldn't prevent level completion
    for (let row of maze) {
        for (let tile of row) {
            if (tile === 2) return false;
        }
    }
    return true;
}

function drawGhost(ctx, x, y, color, scared, direction, frameCount) {
    const centerX = x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2 - 2;
    
    // Ghost body color
    if (scared) {
        // Flashing effect when power pellet is about to end
        const timeLeft = powerPelletTimer;
        if (timeLeft < 100 && Math.floor(frameCount / 10) % 2 === 0) {
            ctx.fillStyle = '#FFFFFF'; // Flash white
        } else {
            ctx.fillStyle = '#2563eb'; // Blue when scared
        }
    } else {
        ctx.fillStyle = color;
    }
    
    // Draw rounded top (semi-circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY - 2, radius, Math.PI, 0, false);
    
    // Draw body rectangle
    ctx.lineTo(centerX + radius, centerY + radius);
    
    // Draw wavy bottom (classic ghost shape)
    const waveWidth = radius / 2;
    const waveHeight = 4;
    const animOffset = Math.sin(frameCount * 0.1) * 2; // Animate the waves
    
    // Right wave
    ctx.lineTo(centerX + radius, centerY + radius - waveHeight);
    ctx.quadraticCurveTo(
        centerX + waveWidth, centerY + radius + animOffset,
        centerX, centerY + radius - waveHeight
    );
    
    // Left wave
    ctx.quadraticCurveTo(
        centerX - waveWidth, centerY + radius + animOffset,
        centerX - radius, centerY + radius - waveHeight
    );
    
    ctx.lineTo(centerX - radius, centerY - 2);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle shadow/gradient effect
    const gradient = ctx.createRadialGradient(centerX, centerY - 4, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    if (scared) {
        // Scared face - wobbly mouth
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 6, centerY + 4);
        ctx.lineTo(centerX - 3, centerY + 6);
        ctx.lineTo(centerX, centerY + 4);
        ctx.lineTo(centerX + 3, centerY + 6);
        ctx.lineTo(centerX + 6, centerY + 4);
        ctx.stroke();
        
        // Simple scared eyes
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 2, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5, centerY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Normal eyes - white with pupils
        ctx.fillStyle = '#ffffff';
        
        // Eye direction based on movement
        let eyeOffsetX = 0;
        let eyeOffsetY = 0;
        if (direction === 'left') eyeOffsetX = -2;
        if (direction === 'right') eyeOffsetX = 2;
        if (direction === 'up') eyeOffsetY = -2;
        if (direction === 'down') eyeOffsetY = 2;
        
        // Left eye white
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye white
        ctx.beginPath();
        ctx.arc(centerX + 5, centerY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(centerX - 5 + eyeOffsetX, centerY - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5 + eyeOffsetX, centerY - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAlligatorHead(ctx, x, y, frameCount, mouthOpen, rotation) {
    const centerX = x;
    const centerY = y;
    const size = 50;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    // Alligator colors (matching the image)
    const gatorGreen = '#5CB54D';
    const darkOutline = '#2a4a3a';
    
    // Draw outline/shadow first
    ctx.fillStyle = darkOutline;
    ctx.strokeStyle = darkOutline;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Main body outline path
    ctx.beginPath();
    // Back of head (rounded)
    ctx.arc(-size * 0.3, 0, size * 0.6, Math.PI * 0.6, Math.PI * 1.4);
    // Top bumpy ridge
    ctx.lineTo(-size * 0.2, -size * 0.6);
    ctx.lineTo(0, -size * 0.5);
    ctx.lineTo(size * 0.2, -size * 0.55);
    ctx.lineTo(size * 0.4, -size * 0.5);
    // Top of snout
    ctx.lineTo(size * 1.2, -size * 0.25);
    // Snout tip with teeth
    ctx.lineTo(size * 1.3, -size * 0.15);
    ctx.lineTo(size * 1.35, 0);
    ctx.lineTo(size * 1.3, size * 0.15);
    ctx.lineTo(size * 1.2, size * 0.25);
    // Bottom of snout
    ctx.lineTo(size * 0.4, size * 0.4);
    ctx.lineTo(-size * 0.2, size * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    
    // Draw main green body
    ctx.fillStyle = gatorGreen;
    ctx.beginPath();
    // Back of head
    ctx.arc(-size * 0.3, 0, size * 0.55, Math.PI * 0.6, Math.PI * 1.4);
    // Top bumpy ridge
    ctx.lineTo(-size * 0.2, -size * 0.55);
    ctx.lineTo(0, -size * 0.45);
    ctx.lineTo(size * 0.2, -size * 0.5);
    ctx.lineTo(size * 0.4, -size * 0.45);
    // Top of snout
    ctx.lineTo(size * 1.2, -size * 0.2);
    // Snout tip
    ctx.lineTo(size * 1.3, -size * 0.1);
    ctx.lineTo(size * 1.35, 0);
    ctx.lineTo(size * 1.3, size * 0.1);
    ctx.lineTo(size * 1.2, size * 0.2);
    // Bottom of snout
    ctx.lineTo(size * 0.4, size * 0.35);
    ctx.lineTo(-size * 0.2, size * 0.45);
    ctx.closePath();
    ctx.fill();
    
    // Draw eye socket bump
    ctx.fillStyle = gatorGreen;
    ctx.beginPath();
    ctx.arc(size * 0.1, -size * 0.3, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = darkOutline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw eye (dark oval)
    ctx.fillStyle = darkOutline;
    ctx.beginPath();
    ctx.ellipse(size * 0.1, -size * 0.3, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw nostril
    ctx.fillStyle = darkOutline;
    ctx.beginPath();
    ctx.arc(size * 1.15, -size * 0.05, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw mouth line and teeth
    if (mouthOpen > 0.2) {
        // Mouth opening
        ctx.fillStyle = darkOutline;
        ctx.beginPath();
        ctx.moveTo(size * 0.3, 0);
        ctx.lineTo(size * 1.2, 0);
        ctx.lineTo(size * 1.2, size * 0.15 * mouthOpen);
        ctx.lineTo(size * 0.3, size * 0.1 * mouthOpen);
        ctx.closePath();
        ctx.fill();
        
        // Teeth (triangular)
        ctx.fillStyle = '#ffffff';
        const teethPositions = [0.5, 0.7, 0.9, 1.1];
        teethPositions.forEach(pos => {
            // Upper teeth
            ctx.beginPath();
            ctx.moveTo(size * pos, -size * 0.02);
            ctx.lineTo(size * pos - size * 0.08, size * 0.08);
            ctx.lineTo(size * pos + size * 0.08, size * 0.08);
            ctx.closePath();
            ctx.fill();
        });
    } else {
        // Closed mouth line
        ctx.strokeStyle = darkOutline;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size * 0.3, 0);
        ctx.lineTo(size * 1.25, 0);
        ctx.stroke();
    }
    
    // Draw leg/arm bumps at bottom
    ctx.fillStyle = gatorGreen;
    ctx.strokeStyle = darkOutline;
    ctx.lineWidth = 3;
    // First leg
    ctx.beginPath();
    ctx.arc(-size * 0.4, size * 0.4, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Second leg
    ctx.beginPath();
    ctx.arc(size * 0.1, size * 0.45, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function drawKiroWithPowerEffect(ctx, x, y, frameCount) {
    const centerX = x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2 - 2;
    
    // Draw pulsing border when powered
    if (powerPelletActive) {
        const pulseSpeed = 0.05;
        const pulseSize = 3 + Math.sin(frameCount * pulseSpeed) * 2;
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + pulseSize, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Mouth animation - snaps open and closed
    const mouthCycle = Math.floor(frameCount / 8) % 2;
    const mouthOpen = kiro.direction ? (mouthCycle === 0 ? 0.7 : 0.3) : 0.2;
    
    // Determine rotation and flip based on direction
    let rotation = 0;
    let flipX = 1;
    let flipY = 1;
    
    if (kiro.direction === 'right') {
        rotation = 0;
    } else if (kiro.direction === 'down') {
        rotation = Math.PI / 2;
    } else if (kiro.direction === 'left') {
        rotation = 0;
        flipX = -1; // Flip horizontally instead of rotating
    } else if (kiro.direction === 'up') {
        rotation = -Math.PI / 2;
    }
    
    // Scale down for game tile
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(0.4 * flipX, 0.4 * flipY);
    drawAlligatorHead(ctx, 0, 0, frameCount, mouthOpen, rotation);
    ctx.restore();
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate camera position for mobile zoom
    if (isMobile) {
        // Center camera on Kiro
        cameraX = Math.max(0, Math.min(COLS - ZOOM_TILES, kiro.x - ZOOM_TILES / 2));
        cameraY = Math.max(0, Math.min(ROWS - ZOOM_TILES, kiro.y - ZOOM_TILES / 2));
    } else {
        cameraX = 0;
        cameraY = 0;
    }

    ctx.save();
    
    if (isMobile) {
        // Zoom in on mobile
        const scale = canvas.width / (ZOOM_TILES * TILE_SIZE);
        ctx.scale(scale, scale);
        ctx.translate(-cameraX * TILE_SIZE, -cameraY * TILE_SIZE);
    }

    // Draw maze
    const startX = isMobile ? Math.floor(cameraX) : 0;
    const startY = isMobile ? Math.floor(cameraY) : 0;
    const endX = isMobile ? Math.ceil(cameraX + ZOOM_TILES) : COLS;
    const endY = isMobile ? Math.ceil(cameraY + ZOOM_TILES) : ROWS;
    
    for (let y = startY; y < endY && y < ROWS; y++) {
        for (let x = startX; x < endX && x < COLS; x++) {
            const tile = maze[y][x];
            if (tile === 1) {
                // Wall
                ctx.fillStyle = '#2563eb';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) {
                // Dot
                ctx.fillStyle = '#5CB54D';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 3) {
                // Power pellet
                ctx.fillStyle = '#5CB54D';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Draw Kiro with power-up effect if active
    drawKiroWithPowerEffect(ctx, kiro.x, kiro.y, frameCount);

    // Draw ghosts (skip if respawning)
    ghosts.forEach(ghost => {
        if (!ghost.isRespawning) {
            drawGhost(ctx, ghost.x, ghost.y, ghost.color, ghost.scared, ghost.direction, frameCount);
        }
    });
    
    // Draw particles
    particleSystem.drawParticles(ctx);
    
    ctx.restore();
    
    // Draw minimap on mobile
    if (isMobile && minimapCtx) {
        drawMinimap();
    }
}

function drawMinimap() {
    const minimapWidth = 120;
    const minimapHeight = 120;
    const tileWidth = minimapWidth / COLS;
    const tileHeight = minimapHeight / ROWS;
    
    // Clear and fill background
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    minimapCtx.fillRect(0, 0, minimapWidth, minimapHeight);
    
    // Draw maze on minimap
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = maze[y][x];
            if (tile === 1) {
                // Walls
                minimapCtx.fillStyle = '#2563eb';
                minimapCtx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            } else if (tile === 2) {
                // Dots
                minimapCtx.fillStyle = '#5CB54D';
                minimapCtx.fillRect(x * tileWidth + tileWidth/3, y * tileHeight + tileHeight/3, tileWidth/3, tileHeight/3);
            } else if (tile === 3) {
                // Power pellets
                minimapCtx.fillStyle = '#FFD700';
                minimapCtx.beginPath();
                minimapCtx.arc(x * tileWidth + tileWidth/2, y * tileHeight + tileHeight/2, Math.max(tileWidth, tileHeight) * 0.4, 0, Math.PI * 2);
                minimapCtx.fill();
            }
        }
    }
    
    // Draw ghosts on minimap (skip if respawning)
    ghosts.forEach(ghost => {
        if (ghost.isRespawning) return;
        
        if (ghost.scared) {
            // Scared ghosts: bright cyan with white outline
            minimapCtx.fillStyle = '#00FFFF';
            minimapCtx.strokeStyle = '#FFFFFF';
            minimapCtx.lineWidth = 1.5;
        } else {
            // Normal ghosts: their color
            minimapCtx.fillStyle = ghost.color;
            minimapCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            minimapCtx.lineWidth = 1;
        }
        
        minimapCtx.beginPath();
        minimapCtx.arc(
            ghost.x * tileWidth + tileWidth/2, 
            ghost.y * tileHeight + tileHeight/2, 
            Math.max(tileWidth, tileHeight) * 0.6, 
            0, Math.PI * 2
        );
        minimapCtx.fill();
        minimapCtx.stroke();
    });
    
    // Draw Kiro on minimap (on top)
    minimapCtx.fillStyle = '#5CB54D';
    minimapCtx.strokeStyle = '#FFD700';
    minimapCtx.lineWidth = 1;
    minimapCtx.beginPath();
    minimapCtx.arc(
        kiro.x * tileWidth + tileWidth/2, 
        kiro.y * tileHeight + tileHeight/2, 
        Math.max(tileWidth, tileHeight) * 0.7, 
        0, Math.PI * 2
    );
    minimapCtx.fill();
    minimapCtx.stroke();
    
    // Draw camera view rectangle
    minimapCtx.strokeStyle = '#FFD700';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(
        cameraX * tileWidth,
        cameraY * tileHeight,
        ZOOM_TILES * tileWidth,
        ZOOM_TILES * tileHeight
    );
}

function update() {
    // Always update particles even during death animation
    particleSystem.updateParticles();
    
    // Handle death animation delay
    if (deathAnimationTimer > 0) {
        deathAnimationTimer--;
        if (deathAnimationTimer === 0) {
            // Animation finished, now pause for respawn
            if (gameState === 'gameOver') {
                // Save session first, then show game over screen with updated leaderboard
                saveGameSession().then(() => {
                    showGameOver();
                });
            } else {
                waitingForRespawn = true;
                messageEl.textContent = 'Press any arrow key to continue';
                // Reset positions
                kiro.x = 14;
                kiro.y = 23;
                kiro.direction = null;
                kiro.moveTimer = 0;
                initGhosts();
            }
        }
        return; // Don't update game logic during death animation
    }
    
    if (gameState !== 'playing' || isPaused || waitingForRespawn) return;

    frameCount++;
    
    // Create power effect particles around Kiro when powered
    if (powerPelletActive && frameCount % 5 === 0) {
        particleSystem.createPowerEffect(kiro.x, kiro.y, TILE_SIZE);
    }
    
    // Update power pellet timer
    if (powerPelletActive) {
        powerPelletTimer--;
        if (powerPelletTimer <= 0) {
            powerPelletActive = false;
            ghosts.forEach(g => g.scared = false);
        }
    }
    
    // Update power pellet respawn timers
    let activePellets = 0;
    powerPelletPositions.forEach((pos) => {
        if (maze[pos.y][pos.x] === 3) {
            activePellets++;
        }
    });
    
    // Respawn power pellets if under max
    if (activePellets < MAX_POWER_PELLETS) {
        powerPelletPositions.forEach((pos, index) => {
            if (maze[pos.y][pos.x] !== 3) {
                powerPelletRespawnTimers[index]++;
                if (powerPelletRespawnTimers[index] >= POWER_PELLET_RESPAWN_TIME) {
                    maze[pos.y][pos.x] = 3; // Respawn power pellet
                    powerPelletRespawnTimers[index] = 0;
                }
            }
        });
    }

    // Endless mode: spawn random dots
    if (endlessMode) {
        randomDotTimer++;
        if (randomDotTimer >= RANDOM_DOT_SPAWN_INTERVAL) {
            spawnRandomDot();
            randomDotTimer = 0;
        }
    }

    // Move Kiro and ghosts independently
    moveKiro();
    moveGhosts(); // Ghosts always move, regardless of Kiro
    checkCollisions();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Pause menu functions
function togglePause() {
    // Allow pause in both 'playing' and 'start' states
    if (gameState !== 'playing' && gameState !== 'start') return;
    
    isPaused = !isPaused;
    const pauseMenu = document.getElementById('pauseMenu');
    
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
    } else {
        pauseMenu.classList.add('hidden');
    }
}

function resumeGame() {
    isPaused = false;
    document.getElementById('pauseMenu').classList.add('hidden');
}

function restartGame() {
    isPaused = false;
    waitingForRespawn = false;
    document.getElementById('pauseMenu').classList.add('hidden');
    init();
    gameState = 'playing';
    messageEl.textContent = '';
}

function quitToStart() {
    isPaused = false;
    waitingForRespawn = false;
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    init();
    gameState = 'menu';
    messageEl.textContent = '';
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // Escape key for pause menu - works in any state
    if (key === 'Escape') {
        if (gameState === 'playing') {
            if (isPaused) {
                resumeGame();
            } else {
                // Clear waiting for respawn state if active
                if (waitingForRespawn) {
                    waitingForRespawn = false;
                    messageEl.textContent = '';
                }
                togglePause();
            }
            e.preventDefault();
        } else if (gameState === 'start') {
            // Allow escape to open pause menu from start state too
            togglePause();
            e.preventDefault();
        }
        return;
    }
    
    if (gameState === 'start') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            gameState = 'playing';
            messageEl.textContent = '';
            audioManager.playSound('gameStart');
            e.preventDefault();
        }
    } else if (gameState === 'gameOver') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            init();
            gameState = 'playing';
            messageEl.textContent = '';
            e.preventDefault();
        }
    } else if (gameState === 'levelComplete') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            currentLevel++;
            
            // Reset character positions
            kiro.x = 14;
            kiro.y = 23;
            kiro.direction = null;
            kiro.nextDirection = null;
            kiro.moveTimer = 0;
            initGhosts();
            
            // Clear power pellet state
            powerPelletActive = false;
            powerPelletTimer = 0;
            
            if (currentLevel <= ENDLESS_MODE_LEVEL) {
                // Restore the dots but keep score and lives
                copyMaze();
                
                // Increase difficulty: make ghosts faster
                const speedMultiplier = 1 - (currentLevel * 0.1); // 10% faster each level
                // This will be applied through the getSpeed function
            }
            
            if (currentLevel > ENDLESS_MODE_LEVEL) {
                // Enter endless mode
                endlessMode = true;
                randomDotTimer = 0;
                // Clear all dots, they'll spawn randomly
                for (let y = 0; y < ROWS; y++) {
                    for (let x = 0; x < COLS; x++) {
                        if (maze[y][x] === 2) {
                            maze[y][x] = 0;
                        }
                    }
                }
            }
            
            gameState = 'playing';
            messageEl.textContent = endlessMode ? 'Endless Mode Active!' : `Level ${currentLevel}`;
            updateUI(); // Make sure UI updates with new level
            setTimeout(() => {
                if (gameState === 'playing') messageEl.textContent = '';
            }, 2000);
            e.preventDefault();
        }
    } else if (gameState === 'playing') {
        // Resume from death pause
        if (waitingForRespawn && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            waitingForRespawn = false;
            messageEl.textContent = '';
            e.preventDefault();
            return;
        }
        
        // Don't process movement if paused
        if (isPaused) return;
        
        if (key === 'ArrowUp') {
            kiro.nextDirection = 'up';
            e.preventDefault();
        } else if (key === 'ArrowDown') {
            kiro.nextDirection = 'down';
            e.preventDefault();
        } else if (key === 'ArrowLeft') {
            kiro.nextDirection = 'left';
            e.preventDefault();
        } else if (key === 'ArrowRight') {
            kiro.nextDirection = 'right';
            e.preventDefault();
        }
    }
});

// Mobile touch controls
function setupMobileControls() {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    if (upBtn) {
        upBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDirectionInput('up');
        });
        upBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleDirectionInput('up');
        });
    }
    
    if (downBtn) {
        downBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDirectionInput('down');
        });
        downBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleDirectionInput('down');
        });
    }
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDirectionInput('left');
        });
        leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleDirectionInput('left');
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDirectionInput('right');
        });
        rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleDirectionInput('right');
        });
    }
}

function handleDirectionInput(direction) {
    if (gameState === 'start') {
        gameState = 'playing';
        messageEl.textContent = '';
        audioManager.playSound('gameStart');
    } else if (gameState === 'gameOver') {
        init();
        gameState = 'playing';
        messageEl.textContent = '';
    } else if (gameState === 'levelComplete') {
        currentLevel++;
        
        // Reset character positions
        kiro.x = 14;
        kiro.y = 23;
        kiro.direction = null;
        kiro.nextDirection = null;
        kiro.moveTimer = 0;
        initGhosts();
        
        // Clear power pellet state
        powerPelletActive = false;
        powerPelletTimer = 0;
        
        if (currentLevel <= ENDLESS_MODE_LEVEL) {
            copyMaze();
        }
        
        if (currentLevel > ENDLESS_MODE_LEVEL) {
            endlessMode = true;
            randomDotTimer = 0;
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (maze[y][x] === 2) {
                        maze[y][x] = 0;
                    }
                }
            }
        }
        
        gameState = 'playing';
        messageEl.textContent = endlessMode ? 'Endless Mode Active!' : `Level ${currentLevel}`;
        updateUI();
        setTimeout(() => {
            if (gameState === 'playing') messageEl.textContent = '';
        }, 2000);
    } else if (gameState === 'playing') {
        if (waitingForRespawn) {
            waitingForRespawn = false;
            messageEl.textContent = '';
            return;
        }
        
        if (!isPaused) {
            if (direction === 'up') kiro.nextDirection = 'up';
            else if (direction === 'down') kiro.nextDirection = 'down';
            else if (direction === 'left') kiro.nextDirection = 'left';
            else if (direction === 'right') kiro.nextDirection = 'right';
        }
    }
}

// Initialize and start
init();
audioManager.initAudio();
setupMobileControls();

// Show start screen on load
document.getElementById('startScreen').classList.remove('hidden');

// Draw animated gator logo on start screen
const logoCanvas = document.getElementById('gatorLogoCanvas');
if (logoCanvas) {
    const logoCtx = logoCanvas.getContext('2d');
    let logoFrame = 0;
    
    function animateLogo() {
        logoCtx.clearRect(0, 0, 120, 120);
        const mouthCycle = Math.floor(logoFrame / 30) % 2;
        const mouthOpen = mouthCycle === 0 ? 0.6 : 0.2;
        drawAlligatorHead(logoCtx, 60, 60, logoFrame, mouthOpen, 0);
        logoFrame++;
        requestAnimationFrame(animateLogo);
    }
    animateLogo();
}

// Start background music after user interaction
document.addEventListener('click', function startMusicOnInteraction() {
    if (musicEnabled) {
        backgroundMusic.start();
    }
    // Remove listener after first interaction
    document.removeEventListener('click', startMusicOnInteraction);
}, { once: true });



// Start screen handlers
document.getElementById('startGameBtn').addEventListener('click', () => {
    document.getElementById('startScreen').classList.add('hidden');
    gameState = 'start';
    messageEl.textContent = 'Use arrow keys to move! Press any arrow key to start';
});

document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
document.getElementById('howToPlayBtn').addEventListener('click', showHowToPlay);
document.getElementById('settingsBtn').addEventListener('click', showSettings);

// Modal close handlers
document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
    document.getElementById('leaderboardScreen').classList.add('hidden');
});

document.getElementById('closeHowToPlayBtn').addEventListener('click', () => {
    document.getElementById('howToPlayScreen').classList.add('hidden');
});

document.getElementById('closeSettingsBtn').addEventListener('click', () => {
    document.getElementById('settingsScreen').classList.add('hidden');
    // If game is paused, show pause menu again
    if (isPaused && gameState === 'playing') {
        document.getElementById('pauseMenu').classList.remove('hidden');
    }
});

// Game over screen handler
document.getElementById('backToMenuBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    init();
    gameState = 'menu';
    messageEl.textContent = '';
});

// Settings handlers
document.getElementById('soundToggle').addEventListener('click', function() {
    soundEnabled = !soundEnabled;
    this.classList.toggle('active');
    this.textContent = soundEnabled ? 'ON' : 'OFF';
});

document.getElementById('musicToggle').addEventListener('click', function() {
    musicEnabled = !musicEnabled;
    this.classList.toggle('active');
    this.textContent = musicEnabled ? 'ON' : 'OFF';
    
    if (musicEnabled) {
        backgroundMusic.start();
    } else {
        backgroundMusic.stop();
    }
});

document.getElementById('difficultySelect').addEventListener('change', function() {
    difficulty = this.value;
});

// Pause menu button handlers
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('pauseSettingsBtn').addEventListener('click', () => {
    document.getElementById('pauseMenu').classList.add('hidden');
    showSettings();
});
document.getElementById('quitBtn').addEventListener('click', quitToStart);

// Menu functions
function showLeaderboard() {
    fetch('/api/highscores')
        .then(res => res.json())
        .then(scores => {
            const leaderboardList = document.getElementById('leaderboardList');
            if (scores.length === 0) {
                leaderboardList.innerHTML = '<p class="no-history">No scores yet. Be the first!</p>';
            } else {
                leaderboardList.innerHTML = scores.map((entry, index) => `
                    <div class="leaderboard-entry ${index < 3 ? 'top-3' : ''}">
                        <span class="leaderboard-rank">#${index + 1}</span>
                        <span class="leaderboard-name">${entry.name}</span>
                        <span class="leaderboard-score">${entry.score}</span>
                    </div>
                `).join('');
            }
            document.getElementById('leaderboardScreen').classList.remove('hidden');
        })
        .catch(err => {
            console.error('Error loading leaderboard:', err);
            document.getElementById('leaderboardList').innerHTML = '<p class="no-history">Error loading scores</p>';
            document.getElementById('leaderboardScreen').classList.remove('hidden');
        });
}

function showHowToPlay() {
    document.getElementById('howToPlayScreen').classList.remove('hidden');
}

function showSettings() {
    document.getElementById('settingsScreen').classList.remove('hidden');
}

function showGameOver() {
    // Display final score
    document.getElementById('finalScore').textContent = score;
    
    // Load and display leaderboard
    fetch('/api/highscores')
        .then(res => res.json())
        .then(scores => {
            const leaderboardList = document.getElementById('gameOverLeaderboardList');
            if (scores.length === 0) {
                leaderboardList.innerHTML = '<p class="no-history">No scores yet</p>';
            } else {
                // Find current score's rank
                let currentRank = scores.findIndex(entry => entry.score === score) + 1;
                if (currentRank === 0) {
                    // Score not in list yet, find where it would be
                    currentRank = scores.filter(entry => entry.score > score).length + 1;
                }
                
                leaderboardList.innerHTML = scores.slice(0, 5).map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentScore = entry.score === score && rank === currentRank;
                    const highlightClass = isCurrentScore ? 'current-score' : (index < 3 ? 'top-3' : '');
                    
                    return `
                        <div class="leaderboard-entry ${highlightClass}">
                            <span class="leaderboard-rank">#${rank}</span>
                            <span class="leaderboard-name">${entry.name}${isCurrentScore ? ' (You)' : ''}</span>
                            <span class="leaderboard-score">${entry.score}</span>
                        </div>
                    `;
                }).join('');
            }
            document.getElementById('gameOverScreen').classList.remove('hidden');
        })
        .catch(err => {
            console.error('Error loading leaderboard:', err);
            document.getElementById('gameOverLeaderboardList').innerHTML = '<p class="no-history">Error loading scores</p>';
            document.getElementById('gameOverScreen').classList.remove('hidden');
        });
}

gameLoop();
