import PluginModule from './Module';

class EQ extends PluginModule {
  constructor(ctx) {
    super(ctx, 'EQ');
    
    this.low = ctx.createBiquadFilter();
    this.mid = ctx.createBiquadFilter();
    this.high = ctx.createBiquadFilter();

    this.low.type = 'lowshelf';
    this.mid.type = 'peaking';
    this.high.type = 'highshelf';

    // Default settings
    this.low.frequency.setValueAtTime(200, ctx.currentTime);
    this.mid.frequency.setValueAtTime(1000, ctx.currentTime);
    this.high.frequency.setValueAtTime(5000, ctx.currentTime);

    this.input.connect(this.low);
    this.low.connect(this.mid);
    this.mid.connect(this.high);
    this.high.connect(this.output);

    this.params = {
      lowGain: this.low.gain,
      midGain: this.mid.gain,
      highGain: this.high.gain
    };
  }
}

export default EQ;
