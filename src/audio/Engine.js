/**
 * DAW Core Audio Engine
 * Manages AudioContext, Master Chain, and Global Timing.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyzer = null;
    this.initialized = false;
  }

  /**
   * Initializes the AudioContext. Must be triggered by a user gesture.
   */
  async init() {
    if (this.initialized) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5; // Default 50%
    
    // Analyzer for Visualizer
    this.analyzer = this.ctx.createAnalyser();
    this.analyzer.fftSize = 256;
    
    // Connections: [Source] -> [MasterGain] -> [Analyzer] -> [Destination]
    this.masterGain.connect(this.analyzer);
    this.analyzer.connect(this.ctx.destination);

    this.initialized = true;
    console.log("AudioEngine Initialized:", this.ctx.sampleRate, "Hz");

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Returns current AudioContext time
   */
  getCurrentTime() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  /**
   * Central Master Gain control
   * @param {number} value (0.0 to 1.0)
   */
  setMasterVolume(value) {
    if (!this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  /**
   * Get frequency data for visualization
   */
  getFrequencyData() {
    if (!this.analyzer) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
    this.analyzer.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

// Export as Singleton
const engine = new AudioEngine();
export default engine;
