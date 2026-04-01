import React, { useState } from 'react';
import engine from '../audio/Engine';
import '../styles/Transport.css';

const Transport = ({ onTogglePlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (onTogglePlay) onTogglePlay(newState);
  };

  const handleBpmChange = (e) => {
    const value = Math.max(20, Math.min(300, parseInt(e.target.value) || 0));
    setBpm(value);
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

        .bpm-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bpm-control label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
        }

        .bpm-control input {
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
