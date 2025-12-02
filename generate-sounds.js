// This script generates placeholder sound files for the game
// Run with: node generate-sounds.js

const fs = require('fs');
const path = require('path');

// Create a simple WAV file with a sine wave tone
function generateWavFile(frequency, duration, filename) {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const numChannels = 1;
    const bitsPerSample = 16;
    
    // WAV file header
    const header = Buffer.alloc(44);
    
    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + numSamples * 2, 4);
    header.write('WAVE', 8);
    
    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size
    header.writeUInt16LE(1, 20); // AudioFormat (PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, 28); // ByteRate
    header.writeUInt16LE(numChannels * bitsPerSample / 8, 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34);
    
    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(numSamples * 2, 40);
    
    // Generate audio samples
    const samples = Buffer.alloc(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const value = Math.sin(2 * Math.PI * frequency * t) * 0.3; // 30% volume
        const sample = Math.floor(value * 32767);
        samples.writeInt16LE(sample, i * 2);
    }
    
    // Write file
    const wavData = Buffer.concat([header, samples]);
    fs.writeFileSync(filename, wavData);
    console.log(`Generated: ${filename}`);
}

// Generate sound effects
const soundsDir = path.join(__dirname, 'public', 'sounds');

// Dot collection - short high beep
generateWavFile(800, 0.05, path.join(soundsDir, 'dot.wav'));

// Power pellet - longer ascending tone
generateWavFile(600, 0.25, path.join(soundsDir, 'power-pellet.wav'));

// Eat ghost - mid-range tone
generateWavFile(500, 0.4, path.join(soundsDir, 'eat-ghost.wav'));

// Death - descending tone (we'll use a low tone)
generateWavFile(200, 1.0, path.join(soundsDir, 'death.wav'));

// Game start - cheerful tone
generateWavFile(700, 0.5, path.join(soundsDir, 'game-start.wav'));

console.log('All sound files generated successfully!');
