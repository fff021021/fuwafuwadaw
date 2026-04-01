import PluginModule from './Module';

class Compressor extends PluginModule {
  constructor(ctx) {
    super(ctx, 'Compressor');
    
    this.node = ctx.createDynamicsCompressor();
    
    // Default settings
    this.node.threshold.setValueAtTime(-24, ctx.currentTime);
    this.node.knee.setValueAtTime(30, ctx.currentTime);
    this.node.ratio.setValueAtTime(12, ctx.currentTime);
    this.node.attack.setValueAtTime(0.003, ctx.currentTime);
    this.node.release.setValueAtTime(0.25, ctx.currentTime);

    this.input.connect(this.node);
    this.node.connect(this.output);

    this.params = {
      threshold: this.node.threshold,
      knee: this.node.knee,
      ratio: this.node.ratio,
      attack: this.node.attack,
      release: this.node.release
    };
  }
}

export default Compressor;
