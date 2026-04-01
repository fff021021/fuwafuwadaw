import PluginModule from './Module';

class DeEsser extends PluginModule {
  constructor(ctx) {
    super(ctx, 'De-Esser');
    
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'peaking';
    this.filter.frequency.setValueAtTime(6000, ctx.currentTime);
    this.filter.Q.setValueAtTime(2, ctx.currentTime);
    this.filter.gain.setValueAtTime(0, ctx.currentTime);

    this.input.connect(this.filter);
    this.filter.connect(this.output);

    this.params = {
      freq: this.filter.frequency,
      reduction: this.filter.gain
    };
  }
}

export default DeEsser;
