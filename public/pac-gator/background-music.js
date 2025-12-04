// Background Music Generator using Web Audio API
class BackgroundMusicPlayer {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.oscillators = [];
        this.currentNoteIndex = 0;
        this.tempo = 120; // BPM
        this.intervalId = null;
        
        // Simple retro melody pattern (frequencies in Hz)
        this.melody = [
            { freq: 523.25, duration: 0.3 }, // C5
            { freq: 587.33, duration: 0.3 }, // D5
            { freq: 659.25, duration: 0.3 }, // E5
            { freq: 587.33, duration: 0.3 }, // D5
            { freq: 523.25, duration: 0.3 }, // C5
            { freq: 392.00, duration: 0.3 }, // G4
            { freq: 440.00, duration: 0.3 }, // A4
            { freq: 493.88, duration: 0.3 }, // B4
            { freq: 523.25, duration: 0.6 }, // C5 (longer)
            { freq: 0, duration: 0.3 },      // Rest
            { freq: 659.25, duration: 0.3 }, // E5
            { freq: 698.46, duration: 0.3 }, // F5
            { freq: 783.99, duration: 0.3 }, // G5
            { freq: 698.46, duration: 0.3 }, // F5
            { freq: 659.25, duration: 0.3 }, // E5
            { freq: 523.25, duration: 0.6 }, // C5 (longer)
        ];
    }
    
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.15; // Low volume for background music
        }
    }
    
    playNote(frequency, duration) {
        if (frequency === 0) return; // Rest
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Use square wave for retro sound
        oscillator.type = 'square';
        oscillator.frequency.value = frequency;
        
        // ADSR envelope for retro feel
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // Decay
        gainNode.gain.setValueAtTime(0.2, now + duration - 0.05); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        this.oscillators.push(oscillator);
        
        // Clean up old oscillators
        setTimeout(() => {
            const index = this.oscillators.indexOf(oscillator);
            if (index > -1) {
                this.oscillators.splice(index, 1);
            }
        }, duration * 1000 + 100);
    }
    
    playMelody() {
        if (!this.isPlaying) return;
        
        const note = this.melody[this.currentNoteIndex];
        this.playNote(note.freq, note.duration);
        
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
        
        // Schedule next note
        const nextNoteTime = (note.duration * 1000);
        this.intervalId = setTimeout(() => this.playMelody(), nextNoteTime);
    }
    
    start() {
        if (this.isPlaying) return;
        
        this.init();
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.currentNoteIndex = 0;
        this.playMelody();
    }
    
    stop() {
        this.isPlaying = false;
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        
        // Stop all playing oscillators
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.oscillators = [];
    }
    
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
}

// Create global instance
const backgroundMusic = new BackgroundMusicPlayer();
