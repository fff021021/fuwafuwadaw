import React, { useState } from 'react';
import pluginLoader from '../audio/PluginLoader';
import '../styles/PluginRack.css';

const PluginRack = ({ track, onPluginAdded }) => {
  const [loading, setLoading] = useState(false);

  if (!track || !track.plugins) return <div className="rack-empty">プラグインなし</div>;

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const plugin = await pluginLoader.loadFromFile(file, track.plugins[0].ctx);
    if (plugin) {
      // Connect to the chain (insert before the last plugin)
      const last = track.plugins[track.plugins.length - 1];
      const secondLast = track.plugins[track.plugins.length - 2];
      
      secondLast.disconnect();
      secondLast.connect(plugin.input);
      plugin.connect(last.input);
      
      onPluginAdded(plugin);
    }
    setLoading(false);
  };

  return (
    <div className="plugin-rack glass">
      <div className="rack-header">
        FX RACK: {track.name}
        <label className="add-vst-btn">
          + VST {loading ? '...' : ''}
          <input type="file" hidden onChange={handleImport} accept=".js" />
        </label>
      </div>
      <div className="plugins-list">
        {track.plugins.map((plugin, idx) => (
          <div key={idx} className="plugin-item">
            <div className="plugin-item-header">
              <span className="plugin-name">{plugin.name}</span>
              <input type="checkbox" defaultChecked={plugin.enabled} />
            </div>
            <div className="plugin-params">
              {Object.keys(plugin.params).map(paramKey => (
                <div key={paramKey} className="param-row">
                  <label>{paramKey}</label>
                  <input 
                    type="range" 
                    min={paramKey === 'threshold' ? -60 : 0} 
                    max={paramKey === 'threshold' ? 0 : (paramKey === 'ratio' ? 20 : 10)} 
                    step="0.01"
                    defaultValue={plugin.params[paramKey].value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      plugin.params[paramKey].setTargetAtTime(val, plugin.ctx.currentTime, 0.05);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginRack;
