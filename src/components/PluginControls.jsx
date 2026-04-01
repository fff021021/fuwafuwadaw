import React from 'react';

const PluginControls = ({ plugin }) => {
  if (!plugin || !plugin.params) return null;

  return (
    <div className="plugin-params">
      <div className="plugin-enabled-row">
        <label>ENABLED</label>
        <input 
          type="checkbox" 
          defaultChecked={plugin.enabled} 
          onChange={(e) => plugin.enabled = e.target.checked}
        />
      </div>
      {Object.keys(plugin.params).map(paramKey => (
        <div key={paramKey} className="param-row">
          <div className="param-info">
            <span className="param-label">{paramKey.toUpperCase()}</span>
            <span className="param-value">{plugin.params[paramKey].value.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min={paramKey === 'threshold' ? -60 : 0} 
            max={paramKey === 'threshold' ? 0 : (paramKey === 'ratio' ? 20 : 10)} 
            step="0.01"
            defaultValue={plugin.params[paramKey].value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              plugin.params[paramKey].setTargetAtTime(val, plugin.ctx.currentTime, 0.05);
              // Force update might be needed if value isn't reactive, 
              // but for now we rely on Web Audio's direct parameter update
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PluginControls;
