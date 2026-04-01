import PluginModule from './Module';

class Delay extends PluginModule {
  constructor(ctx) {
    super(ctx, 'Delay');
    
    this.delayNode = ctx.createDelay(2.0); // Max 2 seconds
    this.feedback = ctx.createGain();
    this.mix = ctx.createGain();
    
    // Default settings
    this.delayNode.delayTime.setValueAtTime(0.3, ctx.currentTime);
    this.feedback.gain.setValueAtTime(0.4, ctx.currentTime);
    this.mix.gain.setValueAtTime(0.3, ctx.currentTime);

    this.input.connect(this.delayNode);
    this.delayNode.connect(this.feedback);
    this.feedback.connect(this.delayNode); // Loop
    this.delayNode.connect(this.mix);
    
    this.input.connect(this.output); // Dry
    this.mix.connect(this.output);   // Wet

    this.params = {
      time: this.delayNode.delayTime,
      feedback: this.feedback.gain,
      mix: this.mix.gain
    };
  }
}

export default Delay;
