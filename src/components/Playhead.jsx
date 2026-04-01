import React from 'react';

const Playhead = ({ currentStep, projectLength, zoom, onSeek }) => {
  const width = projectLength * 40 * zoom; // Assuming 40px base width per step
  const position = ((currentStep + 1) / projectLength) * width;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newStep = Math.floor((x / width) * projectLength);
    onSeek(newStep);
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
