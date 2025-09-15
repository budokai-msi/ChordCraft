import { getNoteFrequency } from '../chordcraftUtils';

let instance = null;

class AudioEngine {
  constructor() {
    if (instance) {
      return instance;
    }
    
    this.audioContext = null;
    this.mainGainNode = null;
    this.scheduledNotes = new Map();
    this.tempo = 120;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.animationFrame = null;
    
    instance = this;
  }

  async initialize() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.mainGainNode = this.audioContext.createGain();
      this.mainGainNode.connect(this.audioContext.destination);
      this.mainGainNode.gain.value = 0.5;
      
      console.log('AudioEngine initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error);
      return false;
    }
  }

  setTempo(newTempo) {
    this.tempo = Math.max(60, Math.min(200, newTempo));
  }

  createOscillator(frequency, type = 'sine') {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    return oscillator;
  }

  createGain() {
    return this.audioContext.createGain();
  }

  createADSREnvelope(attackTime = 0.1, decayTime = 0.1, sustainLevel = 0.7, releaseTime = 0.3) {
    const gainNode = this.createGain();
    const now = this.audioContext.currentTime;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    
    return {
      gainNode,
      release: (releaseTime) => {
        const releaseStart = this.audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(releaseStart);
        gainNode.gain.setValueAtTime(gainNode.gain.value, releaseStart);
        gainNode.gain.linearRampToValueAtTime(0, releaseStart + releaseTime);
      }
    };
  }

  scheduleNote(note) {
    if (!this.audioContext || !this.mainGainNode) return;
    
    const frequency = getNoteFrequency(note.pitch);
    const startTime = this.audioContext.currentTime + (note.startTime || 0);
    const duration = note.duration || 1;
    
    // Create oscillator
    const oscillator = this.createOscillator(frequency, 'sine');
    
    // Create ADSR envelope
    const envelope = this.createADSREnvelope(0.05, 0.1, 0.7, 0.2);
    
    // Connect audio graph
    oscillator.connect(envelope.gainNode);
    envelope.gainNode.connect(this.mainGainNode);
    
    // Schedule playback
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    // Schedule release
    setTimeout(() => {
      envelope.release(0.2);
    }, (startTime - this.audioContext.currentTime + duration - 0.2) * 1000);
    
    // Store reference for cleanup
    const noteId = note.id || `note-${Date.now()}`;
    this.scheduledNotes.set(noteId, { oscillator, envelope });
    
    return noteId;
  }

  play(notes) {
    if (!this.audioContext || !this.mainGainNode) {
      console.warn('AudioEngine not initialized');
      return;
    }
    
    this.stop();
    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime;
    
    // Schedule all notes
    notes.forEach(note => {
      this.scheduleNote(note);
    });
    
    // Start animation loop for visual feedback
    this.startAnimationLoop();
  }

  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    
    // Stop all scheduled notes
    this.scheduledNotes.forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.scheduledNotes.clear();
    
    // Stop animation loop
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  stop() {
    this.isPlaying = false;
    this.pauseTime = 0;
    
    // Stop all scheduled notes
    this.scheduledNotes.forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.scheduledNotes.clear();
    
    // Stop animation loop
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  startAnimationLoop() {
    const updateTime = () => {
      if (!this.isPlaying) return;
      
      const currentTime = this.audioContext.currentTime - this.startTime + this.pauseTime;
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('audioTimeUpdate', {
        detail: { currentTime }
      }));
      
      this.animationFrame = requestAnimationFrame(updateTime);
    };
    
    this.animationFrame = requestAnimationFrame(updateTime);
  }

  getCurrentTime() {
    if (!this.audioContext) return 0;
    return this.audioContext.currentTime - this.startTime + this.pauseTime;
  }

  setVolume(volume) {
    if (this.mainGainNode) {
      this.mainGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getVolume() {
    return this.mainGainNode ? this.mainGainNode.gain.value : 0;
  }

  // Advanced synthesis methods
  createFilter(type = 'lowpass', frequency = 1000, Q = 1) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    return filter;
  }

  createDelay(delayTime = 0.3, feedback = 0.3) {
    const delay = this.audioContext.createDelay();
    const feedbackGain = this.audioContext.createGain();
    
    delay.delayTime.value = delayTime;
    feedbackGain.gain.value = feedback;
    
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    
    return { delay, feedbackGain };
  }

  createReverb(roomSize = 0.5, dampening = 0.5) {
    const convolver = this.audioContext.createConvolver();
    
    // Create impulse response for reverb
    const length = this.audioContext.sampleRate * 2;
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, dampening);
      }
    }
    
    convolver.buffer = impulse;
    return convolver;
  }

  // Cleanup
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.mainGainNode = null;
    this.scheduledNotes.clear();
  }
}

export const audioEngine = new AudioEngine();
