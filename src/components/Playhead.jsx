import React from 'react';

const Playhead = ({ currentStep, projectLength, zoom, onSeek }) => {
  const PIXELS_PER_STEP = 40;
  const width = projectLength * PIXELS_PER_STEP * zoom; 
  const position = (currentStep / projectLength) * width;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newStep = Math.floor(x / (PIXELS_PER_STEP * zoom));
    onSeek(Math.max(0, Math.min(projectLength - 1, newStep)));
  };

  return (
    <div 
      className="playhead-overlay" 
      style={{ width: `${width}px`, position: 'absolute', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
      onClick={handleClick}
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
