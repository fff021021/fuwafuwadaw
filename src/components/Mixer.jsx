import React from 'react';
import '../styles/Mixer.css';

const Mixer = ({ tracks, activeTrackId, onSelectTrack }) => {
  return (
    <div className="mixer">
      {tracks.map(track => (
        <div 
          key={track.id} 
          className={`mixer-strip ${activeTrackId === track.id ? 'active' : ''}`}
          onClick={() => onSelectTrack(track.id)}
        >
          <div className="strip-name">{track.name}</div>
          
          <div className="fader-container">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              defaultValue="0.7"
              onChange={(e) => track.setVolume(parseFloat(e.target.value))}
            />
          </div>

          <div className="strip-controls">
            <button className={`small-btn mute ${track.muted ? 'active' : ''}`}>M</button>
            <button className={`small-btn solo ${track.solo ? 'active' : ''}`}>S</button>
          </div>
        </div>
      ))}
      
      {/* Master Strip */}
      <div className="mixer-strip master">
        <div className="strip-name">MASTER</div>
        <div className="fader-container">
          <input type="range" min="0" max="1" step="0.01" defaultValue="0.7" />
        </div>
      </div>
    </div>
  );
};

export default Mixer;
