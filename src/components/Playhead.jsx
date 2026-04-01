import React from 'react';

const Playhead = ({ currentStep, projectLength, zoom = 1, onSeek, style }) => {
  const PIXELS_PER_STEP = 40;
  const width = projectLength * PIXELS_PER_STEP * zoom;
  const position = (currentStep / projectLength) * width;

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const step = Math.floor((x / width) * projectLength);
    if (onSeek) onSeek(Math.max(0, step));
  };

  return (
    <div 
      className="playhead" 
      onClick={handleMouseDown}
      style={{ 
        ...style,
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: `${width}px`, 
        height: '100%', 
        cursor: 'pointer',
        zIndex: 100
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
