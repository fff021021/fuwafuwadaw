import React, { useEffect, useRef } from 'react';

const WaveformView = ({ buffer, regions = [], onUpdateRegion }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!buffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Draw baseline
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.lineTo(width, amp);
    ctx.stroke();

    // Draw Waveform
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();

    // Draw Melodyne-style "Blobs" (Placeholder for manual segments)
    regions.forEach(region => {
      const x = (region.start / buffer.duration) * width;
      const w = (region.duration / buffer.duration) * width;
      const y = amp - (region.pitchOffset * 10); // Simple pitch-to-Y mapping
      
      ctx.fillStyle = 'rgba(255, 171, 0, 0.6)';
      ctx.strokeStyle = '#ffab00';
      ctx.lineWidth = 2;
      ctx.roundRect(x, y - 10, w, 20, 10);
      ctx.fill();
      ctx.stroke();
    });

  }, [buffer, regions]);

  return (
    <div className="waveform-container glass" style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={1000} height={300} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default WaveformView;
