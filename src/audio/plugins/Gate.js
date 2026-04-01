import PluginModule from './Module';

class Gate extends PluginModule {
  constructor(ctx) {
    super(ctx, 'Noise Gate');
    
    // We can simulate a gate using a compressor with a very high ratio 
    // or just a custom script processor. But for simplicity, we'll use 
    // a basic gain node that we could eventually automate.
    // However, Web Audio has no built-in Gate. 
    // Let's use a DynamicsCompressor with positive threshold for a "downward expander" effect
    // Actually, a simple threshold logic in a worklet is better, but let's use 
    // a high-ratio compressor as a proxy for "noise reduction" for now.
    
    this.node = ctx.createDynamicsCompressor();
    this.node.threshold.setValueAtTime(-50, ctx.currentTime);
    this.node.ratio.setValueAtTime(20, ctx.currentTime);
    
    this.input.connect(this.node);
    this.node.connect(this.output);

    this.params = {
      threshold: this.node.threshold,
      ratio: this.node.ratio
    };
  }
}

export default Gate;
