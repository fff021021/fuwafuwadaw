import React, { useRef, useEffect } from 'react';
import engine from '../audio/Engine';

const Visualizer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      const data = engine.getFrequencyData();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00e5ff';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width="200" 
      height="40" 
      style={{ borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
    />
  );
};

export default Visualizer;
