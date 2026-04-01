import PluginModule from './Module';

class Reverb extends PluginModule {
  constructor(ctx) {
    super(ctx, 'Reverb');
    
    this.node = ctx.createConvolver();
    this.mix = ctx.createGain();
    this.dry = ctx.createGain();
    
    this.setImpulse(2, 2); // 2 sec tail, 2 sec decay

    this.input.connect(this.dry);
    this.input.connect(this.node);
    this.node.connect(this.mix);
    
    this.dry.connect(this.output);
    this.mix.connect(this.output);
    
    this.mix.gain.setValueAtTime(0.3, ctx.currentTime); // 30% wet
  }

  setImpulse(duration, decay) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let i = 0; i < 2; i++) {
        const channeling = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
            channeling[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
        }
    }
    this.node.buffer = impulse;
  }
}

export default Reverb;
