import { getNoteFrequency } from '../chordcraftUtils';
import { loggerService } from './loggerService';

let instance = null;

class EnhancedAudioEngine {
  constructor() {
    if (instance) {
      return instance;
    }
    
    this.audioContext = null;
    this.mainGainNode = null;
    this.masterCompressor = null;
    this.masterReverb = null;
    this.masterDelay = null;
    this.scheduledNotes = new Map();
    this.activeTracks = new Map();
    this.effectsChain = new Map();
    this.tempo = 120;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.animationFrame = null;
    this.metronomeEnabled = false;
    this.metronomeGain = null;
    this.recordingEnabled = false;
    this.recordingData = [];
    this.recordingStartTime = 0;
    
    // Advanced synthesis parameters
    this.synthesisParams = {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.7,
      release: 0.3,
      filterCutoff: 1000,
      filterResonance: 1,
      reverbAmount: 0.3,
      delayAmount: 0.2,
      distortionAmount: 0
    };
    
    instance = this;
  }

  async initialize() {
    if (this.audioContext) return true;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master effects chain
      this.setupMasterEffectsChain();
      
      loggerService.info('Enhanced AudioEngine initialized successfully');
      return true;
    } catch (error) {
      loggerService.error('Failed to initialize Enhanced AudioEngine:', error);
      return false;
    }
  }

  setupMasterEffectsChain() {
    // Master gain
    this.mainGainNode = this.audioContext.createGain();
    this.mainGainNode.gain.value = 0.7;
    
    // Master compressor
    this.masterCompressor = this.audioContext.createDynamicsCompressor();
    this.masterCompressor.threshold.value = -24;
    this.masterCompressor.knee.value = 30;
    this.masterCompressor.ratio.value = 12;
    this.masterCompressor.attack.value = 0.003;
    this.masterCompressor.release.value = 0.25;
    
    // Master reverb
    this.masterReverb = this.createReverb(0.5, 0.5);
    
    // Master delay
    this.masterDelay = this.createDelay(0.3, 0.2);
    
    // Connect effects chain
    this.mainGainNode.connect(this.masterCompressor);
    this.masterCompressor.connect(this.masterReverb);
    this.masterReverb.connect(this.masterDelay);
    this.masterDelay.connect(this.audioContext.destination);
    
    // Metronome setup
    this.setupMetronome();
  }

  setupMetronome() {
    this.metronomeGain = this.audioContext.createGain();
    this.metronomeGain.gain.value = 0;
    this.metronomeGain.connect(this.audioContext.destination);
  }

  // Advanced synthesis methods
  createAdvancedOscillator(frequency, type = 'sine', detune = 0) {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    return oscillator;
  }

  createLFO(frequency = 1, amplitude = 1) {
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    
    lfo.frequency.value = frequency;
    lfo.type = 'sine';
    lfoGain.gain.value = amplitude;
    
    lfo.connect(lfoGain);
    return { lfo, lfoGain };
  }

  createAdvancedFilter(type = 'lowpass', frequency = 1000, Q = 1, detune = 0) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    filter.detune.value = detune;
    return filter;
  }

  createDistortion(amount = 0) {
    const distortion = this.audioContext.createWaveShaper();
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    distortion.curve = curve;
    distortion.oversample = '4x';
    return distortion;
  }

  createChorus(rate = 1, depth = 0.002, delay = 0.003) {
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const delayNode = this.audioContext.createDelay();
    const lfo = this.createLFO(rate, depth);
    
    delayNode.delayTime.value = delay;
    dryGain.gain.value = 0.5;
    wetGain.gain.value = 0.5;
    
    input.connect(dryGain);
    input.connect(delayNode);
    lfo.lfo.connect(delayNode.delayTime);
    delayNode.connect(wetGain);
    dryGain.connect(output);
    wetGain.connect(output);
    
    lfo.lfo.start();
    
    return { input, output, lfo };
  }

  createPhaser(rate = 0.5, depth = 0.8, feedback = 0.3) {
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const filter1 = this.createAdvancedFilter('allpass', 1000, 1);
    const filter2 = this.createAdvancedFilter('allpass', 1000, 1);
    const lfo = this.createLFO(rate, depth);
    const feedbackGain = this.audioContext.createGain();
    
    feedbackGain.gain.value = feedback;
    dryGain.gain.value = 0.5;
    wetGain.gain.value = 0.5;
    
    input.connect(dryGain);
    input.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(wetGain);
    filter2.connect(feedbackGain);
    feedbackGain.connect(input);
    
    lfo.lfo.connect(filter1.frequency);
    lfo.lfo.connect(filter2.frequency);
    
    lfo.lfo.start();
    
    return { input, output, lfo };
  }

  createDelay(delayTime = 0.3, feedback = 0.3, wet = 0.5) {
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    const delay = this.audioContext.createDelay();
    const feedbackGain = this.audioContext.createGain();
    
    delay.delayTime.value = delayTime;
    feedbackGain.gain.value = feedback;
    dryGain.gain.value = 1 - wet;
    wetGain.gain.value = wet;
    
    input.connect(dryGain);
    input.connect(delay);
    delay.connect(wetGain);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    
    dryGain.connect(output);
    wetGain.connect(output);
    
    return { input, output, delay, feedbackGain };
  }

  createReverb(dampening = 0.5) {
    const convolver = this.audioContext.createConvolver();
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    
    dryGain.gain.value = 0.7;
    wetGain.gain.value = 0.3;
    
    // Create impulse response
    const length = this.audioContext.sampleRate * 2;
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, dampening);
      }
    }
    
    convolver.buffer = impulse;
    
    input.connect(dryGain);
    input.connect(convolver);
    convolver.connect(wetGain);
    
    dryGain.connect(output);
    wetGain.connect(output);
    
    return { input, output, convolver };
  }

  createADSREnvelope(attackTime = 0.1, decayTime = 0.1, sustainLevel = 0.7) {
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    
    return {
      gainNode,
      release: (releaseTime = 0.3) => {
        const releaseStart = this.audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(releaseStart);
        gainNode.gain.setValueAtTime(gainNode.gain.value, releaseStart);
        gainNode.gain.linearRampToValueAtTime(0, releaseStart + releaseTime);
      }
    };
  }

  // Track management
  createTrack(trackId, name, type = 'synthesizer') {
    const track = {
      id: trackId,
      name,
      type,
      gain: this.audioContext.createGain(),
      filter: this.createAdvancedFilter(),
      effects: new Map(),
      muted: false,
      solo: false,
      volume: 1.0
    };
    
    track.gain.connect(this.mainGainNode);
    this.activeTracks.set(trackId, track);
    
    return track;
  }

  updateTrackVolume(trackId, volume) {
    const track = this.activeTracks.get(trackId);
    if (track) {
      track.volume = Math.max(0, Math.min(1, volume));
      track.gain.gain.value = track.volume;
    }
  }

  muteTrack(trackId, muted) {
    const track = this.activeTracks.get(trackId);
    if (track) {
      track.muted = muted;
      track.gain.gain.value = muted ? 0 : track.volume;
    }
  }

  soloTrack(trackId, solo) {
    const track = this.activeTracks.get(trackId);
    if (track) {
      track.solo = solo;
      
      // If any track is soloed, mute all others
      if (solo) {
        this.activeTracks.forEach((otherTrack, otherId) => {
          if (otherId !== trackId) {
            otherTrack.gain.gain.value = 0;
          }
        });
      } else {
        // Restore all track volumes
        this.activeTracks.forEach(otherTrack => {
          otherTrack.gain.gain.value = otherTrack.muted ? 0 : otherTrack.volume;
        });
      }
    }
  }

  // Advanced note scheduling
  scheduleNote(note, trackId = 'default') {
    if (!this.audioContext || !this.mainGainNode) return;
    
    const track = this.activeTracks.get(trackId) || this.createTrack(trackId, 'Default Track');
    if (track.muted) return;
    
    const frequency = getNoteFrequency(note.pitch);
    const startTime = this.audioContext.currentTime + (note.startTime || 0);
    const duration = note.duration || 1;
    const velocity = note.velocity || 0.8;
    
    // Create oscillator with detune for more interesting sound
    const detune = (Math.random() - 0.5) * 10; // Slight detune for character
    const oscillator = this.createAdvancedOscillator(frequency, 'sawtooth', detune);
    
    // Create ADSR envelope
    const envelope = this.createADSREnvelope(
      this.synthesisParams.attack,
      this.synthesisParams.decay,
      this.synthesisParams.sustain * velocity,
      this.synthesisParams.release
    );
    
    // Create filter with LFO modulation
    const filter = this.createAdvancedFilter(
      'lowpass',
      this.synthesisParams.filterCutoff,
      this.synthesisParams.filterResonance
    );
    
    const lfo = this.createLFO(2, 200);
    lfo.lfo.connect(filter.frequency);
    lfo.lfo.start();
    
    // Create distortion if enabled
    let distortion = null;
    if (this.synthesisParams.distortionAmount > 0) {
      distortion = this.createDistortion(this.synthesisParams.distortionAmount);
    }
    
    // Connect audio graph
    oscillator.connect(envelope.gainNode);
    envelope.gainNode.connect(filter);
    
    if (distortion) {
      filter.connect(distortion);
      distortion.connect(track.gain);
    } else {
      filter.connect(track.gain);
    }
    
    // Schedule playback
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    // Schedule release
    setTimeout(() => {
      envelope.release(this.synthesisParams.release);
      lfo.lfo.stop();
    }, (startTime - this.audioContext.currentTime + duration - this.synthesisParams.release) * 1000);
    
    // Store reference for cleanup
    const noteId = note.id || `note-${Date.now()}-${Math.random()}`;
    this.scheduledNotes.set(noteId, { 
      oscillator, 
      envelope, 
      filter, 
      lfo, 
      distortion,
      trackId 
    });
    
    return noteId;
  }

  // Metronome functionality
  enableMetronome(enabled) {
    this.metronomeEnabled = enabled;
    this.metronomeGain.gain.value = enabled ? 0.3 : 0;
  }

  playMetronomeTick(beat = 1) {
    if (!this.metronomeEnabled || !this.audioContext) return;
    
    const frequency = beat === 1 ? 1000 : 800; // Higher pitch for downbeat
    const oscillator = this.createAdvancedOscillator(frequency, 'sine');
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.metronomeGain);
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Recording functionality
  startRecording() {
    this.recordingEnabled = true;
    this.recordingData = [];
    this.recordingStartTime = this.audioContext.currentTime;
  }

  stopRecording() {
    this.recordingEnabled = false;
    return this.recordingData;
  }

  // Playback control
  play(notes, tracks = []) {
    if (!this.audioContext || !this.mainGainNode) {
      loggerService.warn('AudioEngine not initialized');
      return;
    }
    
    this.stop();
    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime;
    
    // Create tracks
    tracks.forEach(track => {
      this.createTrack(track.id, track.name, track.type);
    });
    
    // Schedule all notes
    notes.forEach(note => {
      this.scheduleNote(note, note.trackId || 'default');
    });
    
    // Start metronome if enabled
    if (this.metronomeEnabled) {
      this.startMetronome();
    }
    
    // Start animation loop for visual feedback
    this.startAnimationLoop();
  }

  startMetronome() {
    if (!this.metronomeEnabled) return;
    
    const beatInterval = 60 / this.tempo; // Beat interval in seconds
    const startTime = this.audioContext.currentTime;
    
    for (let i = 0; i < 32; i++) { // 32 beats ahead
      const beatTime = startTime + (i * beatInterval);
      const beat = (i % 4) + 1;
      
      setTimeout(() => {
        this.playMetronomeTick(beat);
      }, (beatTime - this.audioContext.currentTime) * 1000);
    }
  }

  pause() {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    
    // Stop all scheduled notes
    this.scheduledNotes.forEach(({ oscillator, lfo }) => {
      try {
        oscillator.stop();
        if (lfo) lfo.lfo.stop();
      } catch {
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
    this.scheduledNotes.forEach(({ oscillator, lfo }) => {
      try {
        oscillator.stop();
        if (lfo) lfo.lfo.stop();
      } catch {
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
        detail: { 
          currentTime,
          tempo: this.tempo,
          isPlaying: this.isPlaying,
          metronomeEnabled: this.metronomeEnabled
        }
      }));
      
      this.animationFrame = requestAnimationFrame(updateTime);
    };
    
    this.animationFrame = requestAnimationFrame(updateTime);
  }

  // Utility methods
  getCurrentTime() {
    if (!this.audioContext) return 0;
    return this.audioContext.currentTime - this.startTime + this.pauseTime;
  }

  setTempo(newTempo) {
    this.tempo = Math.max(60, Math.min(200, newTempo));
  }

  setVolume(volume) {
    if (this.mainGainNode) {
      this.mainGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  getVolume() {
    return this.mainGainNode ? this.mainGainNode.gain.value : 0;
  }

  updateSynthesisParams(params) {
    this.synthesisParams = { ...this.synthesisParams, ...params };
  }

  // Cleanup
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.mainGainNode = null;
    this.masterCompressor = null;
    this.masterReverb = null;
    this.masterDelay = null;
    this.scheduledNotes.clear();
    this.activeTracks.clear();
    this.effectsChain.clear();
  }
}

export const enhancedAudioEngine = new EnhancedAudioEngine();
