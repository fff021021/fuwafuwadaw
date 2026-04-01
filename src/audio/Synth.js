/**
 * DAW Virtual Instrument - Basic Synth
 */
class Synth {
  constructor(audioCtx, destination) {
    this.ctx = audioCtx;
    this.destination = destination;
    this.oscType = 'sawtooth';
    this.envelope = {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.5
    };
  }

  /**
   * Trigger a note
   * @param {number} freq - Frequency in Hz
   * @param {number} velocity - 0.0 to 1.0
   * @param {number} time - context time to start
   */
  playNote(freq, velocity, time = this.ctx.currentTime) {
    const osc = this.ctx.createOscillator();
    const vca = this.ctx.createGain();
    
    osc.type = this.oscType;
    osc.frequency.setValueAtTime(freq, time);
    
    // ADSR Envelope
    vca.gain.setValueAtTime(0, time);
    vca.gain.linearRampToValueAtTime(velocity, time + this.envelope.attack);
    vca.gain.exponentialRampToValueAtTime(
      this.envelope.sustain * velocity, 
      time + this.envelope.attack + this.envelope.decay
    );

    osc.connect(vca);
    vca.connect(this.destination);

    osc.start(time);
    
    return { osc, vca };
  }

  /**
   * Stop a note with release
   */
  stopNote(voice, time = this.ctx.currentTime) {
    const { osc, vca } = voice;
    vca.gain.cancelScheduledValues(time);
    vca.gain.setValueAtTime(vca.gain.value, time);
    vca.gain.exponentialRampToValueAtTime(0.001, time + this.envelope.release);
    
    osc.stop(time + this.envelope.release + 0.1);
  }
}

export default Synth;
