import PluginModule from './Module';

/**
 * Basic Pitch Shifter using Delay Node modulation
 * (Frequency domain shifting is complex in JS, this is a time-domain approximation)
 */
class PitchShifter extends PluginModule {
  constructor(ctx) {
    super(ctx, 'Pitch Shifter');
    
    this.pitch = 0; // semitones
    
    // Simplest approach: use a DelayNode and a sawtooth LFO to shift pitch
    // Note: For higher quality, a Phase Vocoder is needed, but this is a prototype.
    this.delayNode = ctx.createDelay();
    this.lfo = ctx.createOscillator();
    this.lfo.type = 'sawtooth';
    this.lfoGain = ctx.createGain();
    
    this.lfoGain.connect(this.delayNode.delayTime);
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.output);
    
    this.updateParams();
    this.lfo.start();

    this.params = {
      pitch: { 
        value: 0,
        setTargetAtTime: (val, time) => {
          this.pitch = val;
          this.updateParams();
        }
      }
    };
  }

  updateParams() {
    // Very basic approximation of pitch shifting via delay modulation
    const frequency = Math.abs(this.pitch) * 0.1; 
    const depth = this.pitch * 0.01;
    this.lfo.frequency.setTargetAtTime(frequency, this.ctx.currentTime, 0.1);
    this.lfoGain.gain.setTargetAtTime(depth, this.ctx.currentTime, 0.1);
  }
}

export default PitchShifter;
