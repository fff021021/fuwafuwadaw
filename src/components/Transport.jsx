import React, { useState } from 'react';
import engine from '../audio/Engine';
import '../styles/Transport.css';

const Transport = ({ onTogglePlay, zoom, setZoom, projectLength, setProjectLength, bpm, onBpmChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (onTogglePlay) onTogglePlay(newState);
  };

  const handleBpmChange = (e) => {
    const value = Math.max(20, Math.min(300, parseInt(e.target.value) || 0));
    if (onBpmChange) onBpmChange(value);
  };

  return (
    <div className="transport">
      <button 
        className={`control-btn play-btn ${isPlaying ? 'active' : ''}`}
        onClick={togglePlay}
      >
        {isPlaying ? '■ STOP' : '▶ PLAY'}
      </button>
      
      <div className="bpm-control">
        <label>BPM</label>
        <input 
          type="number" 
          value={bpm} 
          onChange={handleBpmChange}
        />
      </div>

      <div className="time-display">
        {engine.getCurrentTime().toFixed(2)}s
      </div>

      <style jsx>{`
        .transport {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--bg-secondary);
          padding: 4px 12px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }

        .play-btn {
          min-width: 100px;
          justify-content: center;
        }

        .transport-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .transport-group label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
        }

        .transport-group input {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--accent-primary);
          width: 50px;
          padding: 4px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          text-align: center;
        }

        .transport-group input[type="range"] {
          width: 80px;
          cursor: pointer;
        }

        .time-display {
          font-family: 'JetBrains Mono', monospace;
          color: var(--accent-success);
          font-size: 14px;
          min-width: 80px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default Transport;
