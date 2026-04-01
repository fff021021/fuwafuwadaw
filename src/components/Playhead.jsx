import React from 'react';

const Playhead = ({ currentStep, projectLength, zoom = 1, onSeek, style }) => {
  const PIXELS_PER_STEP = 40;
  const position = currentStep * PIXELS_PER_STEP * zoom;

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const step = Math.max(0, Math.floor(x / (PIXELS_PER_STEP * zoom)));
    if (onSeek) onSeek(step);
  };

  return (
    <div 
      className="playhead" 
      onClick={handleMouseDown}
      style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: '100%', 
        height: '100%', 
        cursor: 'pointer',
        zIndex: 50,
        pointerEvents: 'auto',
        ...style
      }}
    >
      <div 
        className="playhead-bar" 
        style={{ 
          position: 'absolute', 
          left: `${position}px`, 
          width: '2px', 
          height: '100%', 
          backgroundColor: '#ff3d00',
          boxShadow: '0 0 10px #ff3d00',
          zIndex: 10
        }} 
      />
    </div>
  );
};

export default Playhead;
