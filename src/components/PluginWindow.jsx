import React, { useState, useEffect, useRef } from 'react';
import '../styles/PluginWindow.css';

const PluginWindow = ({ id, title, children, onClose, initialPos = { x: 100, y: 100 } }) => {
  const [pos, setPos] = useState(initialPos);
  const dragRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.className !== 'plugin-window-header') return;
    
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const handleMouseMove = (moveEvent) => {
      setPos({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className="plugin-window glass" 
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="plugin-window-header">
        <span className="plugin-title">{title}</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="plugin-window-content">
        {children}
      </div>
    </div>
  );
};

export default PluginWindow;
