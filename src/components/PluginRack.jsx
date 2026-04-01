import React, { useState } from 'react';
import pluginLoader from '../audio/PluginLoader';
import '../styles/PluginRack.css';

const PluginRack = ({ track, onPluginAdded, onOpenPlugin }) => {
  const [loading, setLoading] = useState(false);

  if (!track || !track.plugins) return <div className="rack-empty">プラグインなし</div>;

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const plugin = await pluginLoader.loadFromFile(file, track.plugins[0].ctx);
    if (plugin) {
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
        FX SLOTS: {track.name}
        <label className="add-vst-btn">
          + VST {loading ? '...' : ''}
          <input type="file" hidden onChange={handleImport} accept=".js" />
        </label>
      </div>
      <div className="plugin-slots">
        {track.plugins.map((plugin, idx) => (
          <div 
            key={idx} 
            className={`plugin-slot ${plugin.enabled ? '' : 'disabled'}`}
            onClick={() => onOpenPlugin(plugin)}
          >
            <div className="slot-number">{idx + 1}</div>
            <div className="slot-name">{plugin.name}</div>
            <div className="slot-indicator" />
          </div>
        ))}
        <div className="plugin-slot empty">
          <div className="slot-number">+</div>
          <div className="slot-name">EMPTY</div>
        </div>
      </div>
    </div>
  );
};

export default PluginRack;
