import React, { useEffect, useRef } from 'react';

const WaveformView = ({ buffer, regions = [], onUpdateRegions }) => {
  const canvasRef = useRef(null);

  // Auto-generate regions if empty (Initial segmentation)
  useEffect(() => {
    if (buffer && regions.length === 0) {
      const data = buffer.getChannelData(0);
      const newRegions = [];
      const threshold = 0.1;
      let inRegion = false;
      let start = 0;

      // Simple onset detection
      for (let i = 0; i < data.length; i += 1000) {
        const amp = Math.abs(data[i]);
        if (!inRegion && amp > threshold) {
          inRegion = true;
          start = i / buffer.sampleRate;
        } else if (inRegion && amp < threshold / 2) {
          inRegion = false;
          const end = i / buffer.sampleRate;
          if (end - start > 0.1) {
            newRegions.push({
              id: Date.now() + i,
              start,
              duration: end - start,
              pitchOffset: 0,
              timeStretch: 1.0
            });
          }
        }
      }
      if (newRegions.length > 0) onUpdateRegions(newRegions);
    }
  }, [buffer]);

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

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const amp = rect.height / 2;

    const clickedRegion = regions.find(r => {
      const rx = (r.start / buffer.duration) * width;
      const rw = (r.duration / buffer.duration) * width;
      const ry = amp - (r.pitchOffset * 10);
      return x >= rx && x <= rx + rw && y >= ry - 15 && y <= ry + 15;
    });

    if (clickedRegion) {
      const startY = e.clientY;
      const handleMouseMove = (moveEvent) => {
        const deltaY = startY - moveEvent.clientY;
        const newPitch = Math.round(deltaY / 5); // 5px per semitone
        onUpdateRegions(regions.map(r => r.id === clickedRegion.id ? { ...r, pitchOffset: newPitch } : r));
      };
      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <div className="waveform-container glass" style={{ height: '300px', width: '100%', overflow: 'hidden', cursor: 'ns-resize' }}>
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={300} 
        style={{ width: '100%', height: '100%' }} 
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default WaveformView;
