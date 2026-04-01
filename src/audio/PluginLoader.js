/**
 * DAW Plugin Loader (VST-style)
 */
class PluginLoader {
  async loadFromUrl(url, ctx) {
    try {
      const module = await import(/* @vite-ignore */ url);
      if (module.default) {
        return new module.default(ctx);
      }
      throw new Error("Module must export a default class inheriting from PluginModule");
    } catch (err) {
      console.error("Failed to load external plugin:", err);
      return null;
    }
  }

  async loadFromFile(file, ctx) {
    const url = URL.createObjectURL(file);
    return this.loadFromUrl(url, ctx);
  }
}

const pluginLoader = new PluginLoader();
export default pluginLoader;
