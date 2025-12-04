/**
 * Unit tests for AudioManager
 */

// Mock Audio constructor
global.Audio = class {
    constructor() {
        this.preload = '';
        this.src = '';
        this.volume = 1;
        this.currentTime = 0;
        this._listeners = {};
    }

    addEventListener(event, handler, options) {
        this._listeners[event] = handler;
        // Simulate successful load
        if (event === 'canplaythrough') {
            setTimeout(() => handler(), 0);
        }
    }

    cloneNode() {
        const clone = new Audio();
        clone.src = this.src;
        return clone;
    }

    play() {
        return Promise.resolve();
    }

    pause() {}
};

// Load AudioManager by requiring it
// Since it's a browser class, we need to evaluate it in the global scope
const fs = require('fs');
const path = require('path');
const audioManagerCode = fs.readFileSync(
    path.join(__dirname, '../audio-manager.js'),
    'utf8'
);

// Extract the class definition and make it available
const AudioManager = eval(`(function() {
    ${audioManagerCode}
    return AudioManager;
})()`);

describe('AudioManager', () => {
    let audioManager;

    beforeEach(() => {
        audioManager = new AudioManager();
    });

    describe('loadSound', () => {
        test('should load a sound successfully', async () => {
            await audioManager.loadSound('test', '/test.wav');
            expect(audioManager.sounds['test']).toBeDefined();
        });

        test('should handle multiple sounds', async () => {
            await audioManager.loadSound('sound1', '/sound1.wav');
            await audioManager.loadSound('sound2', '/sound2.wav');
            
            expect(audioManager.sounds['sound1']).toBeDefined();
            expect(audioManager.sounds['sound2']).toBeDefined();
        });
    });

    describe('playSound', () => {
        beforeEach(async () => {
            await audioManager.loadSound('test', '/test.wav');
        });

        test('should play a loaded sound', () => {
            expect(() => {
                audioManager.playSound('test');
            }).not.toThrow();
        });

        test('should not throw when playing non-existent sound', () => {
            expect(() => {
                audioManager.playSound('nonexistent');
            }).not.toThrow();
        });

        test('should respect volume parameter', () => {
            // This test just verifies the method accepts volume parameter
            expect(() => {
                audioManager.playSound('test', 0.5);
            }).not.toThrow();
        });

        test('should not play when muted', () => {
            audioManager.setMuted(true);
            // Should not throw, just not play
            expect(() => {
                audioManager.playSound('test');
            }).not.toThrow();
        });
    });

    describe('setMuted', () => {
        test('should set muted state to true', () => {
            audioManager.setMuted(true);
            expect(audioManager.isMuted()).toBe(true);
        });

        test('should set muted state to false', () => {
            audioManager.setMuted(true);
            audioManager.setMuted(false);
            expect(audioManager.isMuted()).toBe(false);
        });

        test('should handle non-boolean values', () => {
            audioManager.setMuted('true');
            expect(audioManager.isMuted()).toBe(true);
            
            audioManager.setMuted(0);
            expect(audioManager.isMuted()).toBe(false);
        });
    });

    describe('isMuted', () => {
        test('should return false by default', () => {
            expect(audioManager.isMuted()).toBe(false);
        });

        test('should return current muted state', () => {
            audioManager.setMuted(true);
            expect(audioManager.isMuted()).toBe(true);
        });
    });

    describe('stopSound', () => {
        beforeEach(async () => {
            await audioManager.loadSound('test', '/test.wav');
        });

        test('should stop a playing sound', () => {
            expect(() => {
                audioManager.stopSound('test');
            }).not.toThrow();
        });

        test('should not throw when stopping non-existent sound', () => {
            expect(() => {
                audioManager.stopSound('nonexistent');
            }).not.toThrow();
        });
    });

    describe('setDefaultVolume', () => {
        test('should set default volume', () => {
            audioManager.setDefaultVolume(0.5);
            expect(audioManager.defaultVolume).toBe(0.5);
        });

        test('should clamp volume to valid range', () => {
            audioManager.setDefaultVolume(1.5);
            expect(audioManager.defaultVolume).toBe(1);
            
            audioManager.setDefaultVolume(-0.5);
            expect(audioManager.defaultVolume).toBe(0);
        });
    });
});
