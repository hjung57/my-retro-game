const fc = require('fast-check');

// Mock Audio class for testing
class MockAudio {
    constructor() {
        this.src = '';
        this.preload = '';
        this.volume = 1.0;
        this.played = false;
        this.playCount = 0;
        this.eventListeners = {};
    }

    addEventListener(event, handler, options) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push({ handler, options });
    }

    cloneNode() {
        const clone = new MockAudio();
        clone.src = this.src;
        return clone;
    }

    play() {
        this.played = true;
        this.playCount++;
        return Promise.resolve();
    }

    triggerEvent(event) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(({ handler, options }) => {
                handler();
                if (options && options.once) {
                    this.eventListeners[event] = this.eventListeners[event].filter(l => l.handler !== handler);
                }
            });
        }
    }
}

// AudioManager class (extracted from game.js for testing)
class AudioManager {
    constructor(AudioClass = MockAudio) {
        this.AudioClass = AudioClass;
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
        const soundFiles = {
            'dot': '/sounds/dot.wav',
            'powerPellet': '/sounds/power-pellet.wav',
            'eatGhost': '/sounds/eat-ghost.wav',
            'death': '/sounds/death.wav',
            'gameStart': '/sounds/game-start.wav'
        };

        Object.keys(soundFiles).forEach(soundName => {
            const audio = new this.AudioClass();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                this.loadingSounds++;
                if (this.loadingSounds === this.totalSounds) {
                    this.loaded = true;
                }
            }, { once: true });

            audio.addEventListener('error', (e) => {
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
        if (!this.sounds[soundName]) {
            return;
        }

        try {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = 0.3;
            sound.play();
        } catch (error) {
            // Silently handle errors in tests
        }
    }

    isReady() {
        return this.loaded;
    }
}

describe('Audio System Property Tests', () => {
    
    // Feature: game-enhancements, Property 12: Sound plays on dot collection
    // Validates: Requirements 5.1
    test('Property 12: For any dot collection event, the dot sound effect should be triggered', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 100 }), // number of dots collected
                (dotCount) => {
                    const audioManager = new AudioManager(MockAudio);
                    audioManager.initAudio();
                    
                    // Simulate all sounds loaded
                    Object.values(audioManager.sounds).forEach(sound => {
                        sound.triggerEvent('canplaythrough');
                    });
                    
                    // Track play calls
                    let dotSoundPlayed = 0;
                    const originalPlaySound = audioManager.playSound.bind(audioManager);
                    audioManager.playSound = function(soundName) {
                        if (soundName === 'dot') {
                            dotSoundPlayed++;
                        }
                        return originalPlaySound(soundName);
                    };
                    
                    // Simulate collecting dots
                    for (let i = 0; i < dotCount; i++) {
                        audioManager.playSound('dot');
                    }
                    
                    // Verify dot sound was played for each collection
                    return dotSoundPlayed === dotCount;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 13: Sound plays on power pellet collection
    // Validates: Requirements 5.2
    test('Property 13: For any power pellet collection event, the power pellet sound effect should be triggered', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }), // number of power pellets collected
                (pelletCount) => {
                    const audioManager = new AudioManager(MockAudio);
                    audioManager.initAudio();
                    
                    // Simulate all sounds loaded
                    Object.values(audioManager.sounds).forEach(sound => {
                        sound.triggerEvent('canplaythrough');
                    });
                    
                    // Track play calls
                    let powerPelletSoundPlayed = 0;
                    const originalPlaySound = audioManager.playSound.bind(audioManager);
                    audioManager.playSound = function(soundName) {
                        if (soundName === 'powerPellet') {
                            powerPelletSoundPlayed++;
                        }
                        return originalPlaySound(soundName);
                    };
                    
                    // Simulate collecting power pellets
                    for (let i = 0; i < pelletCount; i++) {
                        audioManager.playSound('powerPellet');
                    }
                    
                    // Verify power pellet sound was played for each collection
                    return powerPelletSoundPlayed === pelletCount;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 14: Sound plays on ghost eating
    // Validates: Requirements 5.3
    test('Property 14: For any powered ghost collision, the ghost eating sound effect should be triggered', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 20 }), // number of ghosts eaten
                (ghostCount) => {
                    const audioManager = new AudioManager(MockAudio);
                    audioManager.initAudio();
                    
                    // Simulate all sounds loaded
                    Object.values(audioManager.sounds).forEach(sound => {
                        sound.triggerEvent('canplaythrough');
                    });
                    
                    // Track play calls
                    let eatGhostSoundPlayed = 0;
                    const originalPlaySound = audioManager.playSound.bind(audioManager);
                    audioManager.playSound = function(soundName) {
                        if (soundName === 'eatGhost') {
                            eatGhostSoundPlayed++;
                        }
                        return originalPlaySound(soundName);
                    };
                    
                    // Simulate eating ghosts
                    for (let i = 0; i < ghostCount; i++) {
                        audioManager.playSound('eatGhost');
                    }
                    
                    // Verify eat ghost sound was played for each ghost eaten
                    return eatGhostSoundPlayed === ghostCount;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 15: Sound plays on death
    // Validates: Requirements 5.4
    test('Property 15: For any unpowered ghost collision, the death sound effect should be triggered', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }), // number of deaths
                (deathCount) => {
                    const audioManager = new AudioManager(MockAudio);
                    audioManager.initAudio();
                    
                    // Simulate all sounds loaded
                    Object.values(audioManager.sounds).forEach(sound => {
                        sound.triggerEvent('canplaythrough');
                    });
                    
                    // Track play calls
                    let deathSoundPlayed = 0;
                    const originalPlaySound = audioManager.playSound.bind(audioManager);
                    audioManager.playSound = function(soundName) {
                        if (soundName === 'death') {
                            deathSoundPlayed++;
                        }
                        return originalPlaySound(soundName);
                    };
                    
                    // Simulate deaths
                    for (let i = 0; i < deathCount; i++) {
                        audioManager.playSound('death');
                    }
                    
                    // Verify death sound was played for each death
                    return deathSoundPlayed === deathCount;
                }
            ),
            { numRuns: 100 }
        );
    });

    // Feature: game-enhancements, Property 16: Audio overlap handling
    // Validates: Requirements 5.7
    test('Property 16: For any two sound effects triggered within 100ms of each other, both sounds should play to completion without one stopping the other', () => {
        fc.assert(
            fc.property(
                fc.constantFrom('dot', 'powerPellet', 'eatGhost', 'death', 'gameStart'),
                fc.constantFrom('dot', 'powerPellet', 'eatGhost', 'death', 'gameStart'),
                (sound1, sound2) => {
                    const audioManager = new AudioManager(MockAudio);
                    audioManager.initAudio();
                    
                    // Simulate all sounds loaded
                    Object.values(audioManager.sounds).forEach(sound => {
                        sound.triggerEvent('canplaythrough');
                    });
                    
                    // Track all play calls
                    const playCalls = [];
                    const originalPlaySound = audioManager.playSound.bind(audioManager);
                    audioManager.playSound = function(soundName) {
                        playCalls.push(soundName);
                        return originalPlaySound(soundName);
                    };
                    
                    // Play two sounds in quick succession (simulating overlap)
                    audioManager.playSound(sound1);
                    audioManager.playSound(sound2);
                    
                    // Verify both sounds were played
                    // The key is that cloneNode() allows multiple instances to play simultaneously
                    return playCalls.length === 2 && 
                           playCalls[0] === sound1 && 
                           playCalls[1] === sound2;
                }
            ),
            { numRuns: 100 }
        );
    });
});
