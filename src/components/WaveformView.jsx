import React, { useEffect, useRef } from 'react';

const WaveformView = ({ buffer, regions = [], onUpdateRegions, zoom = 1.0, bpm = 120 }) => {
  const canvasRef = useRef(null);
  const PIXELS_PER_STEP = 40;
  const secondsPerStep = (60 / bpm) / 4;
  const canvasWidth = (buffer ? (buffer.duration / secondsPerStep) * PIXELS_PER_STEP * zoom : 1000); 

  // Default to one full region if empty
  useEffect(() => {
    if (buffer && regions.length === 0) {
      onUpdateRegions([{
        id: Date.now(),
        start: 0,
        duration: buffer.duration,
        pitchOffset: 0,
        timeStretch: 1.0
      }]);
    }
  }, [buffer]);

  const autoSegment = () => {
    if (!buffer) return;
    const data = buffer.getChannelData(0);
    const newRegions = [];
    const threshold = 0.1;
    let inRegion = false;
    let start = 0;

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
  };

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

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    for (let i = 0; i < width; i += 40 * zoom) { // Grid lines per step
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
    }
    ctx.stroke();

    // Draw Waveform
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      const startIdx = Math.floor(i * step);
      for (let j = 0; j < step; j++) {
        const datum = data[startIdx + j] || 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();

    // Draw Melodyne-style "Blobs"
    regions.forEach(region => {
      const x = (region.start / buffer.duration) * width;
      const w = (region.duration / buffer.duration) * width;
      const y = amp - (region.pitchOffset * 5);
      
      ctx.fillStyle = 'rgba(255, 171, 0, 0.6)';
      ctx.strokeStyle = '#ffab00';
      ctx.lineWidth = 1; // Thinner border
      ctx.beginPath();
      // Add 1px padding to make splits visible
      ctx.roundRect(x + 1, y - 10, w - 2, 20, 10);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = '9px Arial';
      ctx.fillText(`${region.pitchOffset > 0 ? '+' : ''}${region.pitchOffset}`, x + 5, y + 4);
    });

  }, [buffer, regions, zoom, canvasWidth]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const amp = rect.height / 2;
    const clickTime = (x / width) * buffer.duration;

    // Split logic if Shift key is pressed
    if (e.shiftKey) {
      console.log('Split attempt at:', clickTime);
      const targetIndex = regions.findIndex(r => 
        clickTime >= r.start && clickTime <= r.start + r.duration
      );
      if (targetIndex > -1) {
        const r = regions[targetIndex];
        const r1 = { ...r, duration: clickTime - r.start };
        const r2 = { 
          ...r, 
          id: Date.now() + Math.random(), 
          start: clickTime, 
          duration: (r.start + r.duration) - clickTime 
        };
        const nextRegions = [...regions];
        nextRegions.splice(targetIndex, 1, r1, r2);
        onUpdateRegions(nextRegions);
        console.log('Split successful. New count:', nextRegions.length);
        return;
      }
    }

    const clickedRegion = regions.find(r => {
      const rx = (r.start / buffer.duration) * width;
      const rw = (r.duration / buffer.duration) * width;
      const ry = amp - (r.pitchOffset * 5);
      return x >= rx && x <= rx + rw && y >= ry - 15 && y <= ry + 15;
    });

    if (clickedRegion) {
      const startX = e.clientX;
      const startY = e.clientY;
      const initialStart = clickedRegion.start;
      const initialPitch = clickedRegion.pitchOffset;

      const handleMouseMove = (moveEvent) => {
        const deltaX = (moveEvent.clientX - startX) / width * buffer.duration;
        const deltaY = startY - moveEvent.clientY;
        
        const newPitch = initialPitch + Math.round(deltaY / 10);
        const newStart = Math.max(0, initialStart + deltaX);

        onUpdateRegions(regions.map(r => 
          r.id === clickedRegion.id 
            ? { ...r, pitchOffset: newPitch, start: newStart } 
            : r
        ));
      };
      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const resetToFull = () => {
    if (!buffer) return;
    onUpdateRegions([{
      id: Date.now(),
      start: 0,
      duration: buffer.duration,
      pitchOffset: 0,
      timeStretch: 1.0
    }]);
  };

  return (
    <div className="waveform-outer" style={{ position: 'relative' }}>
      <div className="waveform-header" style={{ position: 'absolute', top: '-30px', left: 0, zIndex: 5 }}>
        AUDIO EDITOR: {regions.length} blobs
        <button className="small-btn" style={{ marginLeft: '10px' }} onClick={resetToFull}>全体を一括 (全選択)</button>
        <button className="small-btn" style={{ marginLeft: '5px' }} onClick={autoSegment}>自動解析 (アタック検出)</button>
        <span style={{ fontSize: '10px', marginLeft: '10px', color: '#888' }}>SHIFT+クリックで分割 / ドラッグで補正</span>
      </div>
      <div className="waveform-container" style={{ margin: 0, padding: 0 }}>
        <canvas 
          ref={canvasRef} 
          width={canvasWidth} 
          height={250} 
          onMouseDown={handleMouseDown}
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};

export default WaveformView;
