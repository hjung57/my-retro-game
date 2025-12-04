/**
 * Shared Audio Manager
 * Manages audio playback for all games with volume control and muting
 */
class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.defaultVolume = 0.3;
    }

    /**
     * Load a sound file
     * @param {string} name - Unique identifier for the sound
     * @param {string} url - Path to the audio file
     * @returns {Promise} - Resolves when sound is loaded
     */
    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds[name] = audio;
                resolve();
            }, { once: true });

            audio.addEventListener('error', (error) => {
                console.error(`Failed to load sound: ${name} from ${url}`, error);
                reject(error);
            });

            audio.src = url;
        });
    }

    /**
     * Play a loaded sound
     * @param {string} name - Identifier of the sound to play
     * @param {number} volume - Volume level (0.0 to 1.0), defaults to 0.3
     */
    playSound(name, volume = this.defaultVolume) {
        if (this.muted) return;
        
        if (!this.sounds[name]) {
            console.warn(`Sound not found: ${name}`);
            return;
        }

        try {
            // Clone the audio element to allow overlapping sounds
            const sound = this.sounds[name].cloneNode();
            sound.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
            
            // Play the sound
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    // Silently handle autoplay restrictions
                    console.debug('Audio playback prevented:', error);
                });
            }
        } catch (error) {
            console.error(`Error playing sound: ${name}`, error);
        }
    }

    /**
     * Set muted state
     * @param {boolean} isMuted - Whether audio should be muted
     */
    setMuted(isMuted) {
        this.muted = Boolean(isMuted);
    }

    /**
     * Get current muted state
     * @returns {boolean} - Current muted state
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Stop a currently playing sound
     * @param {string} name - Identifier of the sound to stop
     */
    stopSound(name) {
        if (!this.sounds[name]) return;
        
        try {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        } catch (error) {
            console.error(`Error stopping sound: ${name}`, error);
        }
    }

    /**
     * Set default volume for all sounds
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setDefaultVolume(volume) {
        this.defaultVolume = Math.max(0, Math.min(1, volume));
    }
}
