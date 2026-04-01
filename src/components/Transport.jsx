import React, { useState } from 'react';
import engine from '../audio/Engine';
import '../styles/Transport.css';

const Transport = ({ onTogglePlay, zoom, setZoom, projectLength, setProjectLength, bpm, onBpmChange, currentStep }) => {
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

  const formatTime = (step) => {
    if (step < 0) return "00:00.00";
    const secondsPerStep = (60 / bpm) / 4;
    const totalSeconds = step * secondsPerStep;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const formatBarBeat = (step) => {
    if (step < 0) return "1.1.1";
    const bar = Math.floor(step / 16) + 1;
    const beat = Math.floor((step % 16) / 4) + 1;
    const sixteenth = (step % 4) + 1;
    return `${bar}.${beat}.${sixteenth}`;
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
        <span className="bar-beat">{formatBarBeat(currentStep)}</span>
        <span className="seconds">{formatTime(currentStep)}</span>
      </div>

      <div className="transport-group">
        <label>LENGTH (Bars)</label>
        <input 
          type="number" 
          value={Math.floor(projectLength / 16)} 
          onChange={(e) => setProjectLength(Math.max(1, parseInt(e.target.value) || 0) * 16)}
          style={{ width: '40px' }}
        />
      </div>

      <div className="transport-group">
        <label>ZOOM</label>
        <input 
          type="range" 
          min="0.1" 
          max="3.0" 
          step="0.1" 
          value={zoom} 
          onChange={(e) => setZoom(parseFloat(e.target.value))}
        />
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
