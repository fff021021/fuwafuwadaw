/**
 * DAW Plugin Base Module
 */
class PluginModule {
  constructor(ctx, name) {
    this.ctx = ctx;
    this.name = name;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.params = {};
    this.enabled = true;
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  setParam(key, value) {
    if (this.params[key]) {
      this.params[key].setTargetAtTime(value, this.ctx.currentTime, 0.02);
    }
  }

  toggle(state) {
    this.enabled = state;
    // Logic for bypass will go in subclasses or a bypass node
  }
}

export default PluginModule;
