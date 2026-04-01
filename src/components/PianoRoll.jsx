import React from 'react';
import '../styles/PianoRoll.css';

const NOTES = [
  { name: 'C', freq: 261.63 }, { name: 'B', freq: 246.94 }, { name: 'A#', freq: 233.08 },
  { name: 'A', freq: 220.00 }, { name: 'G#', freq: 207.65 }, { name: 'G', freq: 196.00 },
  { name: 'F#', freq: 185.00 }, { name: 'F', freq: 174.61 }, { name: 'E', freq: 164.81 },
  { name: 'D#', freq: 155.56 }, { name: 'D', freq: 146.83 }, { name: 'C#', freq: 138.59 },
  { name: 'C', freq: 130.81 }
];

const PianoRoll = ({ activeTrack, sequence, setSequence, currentStep }) => {
  if (!activeTrack) return <div className="piano-roll-empty">トラックを選択してください</div>;

  const STEPS = 64; // 4 Measures

  const toggleNote = (noteIndex, stepIndex) => {
    const newSeq = [...sequence];
    if (!newSeq[stepIndex]) newSeq[stepIndex] = [];
    
    const notePos = newSeq[stepIndex].findIndex(n => n.freq === NOTES[noteIndex].freq);
    if (notePos > -1) {
      newSeq[stepIndex].splice(notePos, 1);
    } else {
      newSeq[stepIndex].push({ 
        freq: NOTES[noteIndex].freq, 
        velocity: 0.8, 
        duration: 0.25 
      });
      // Preview sound
      activeTrack.synth.playNote(NOTES[noteIndex].freq, 0.5);
    }
    setSequence(newSeq);
  };

  return (
    <div className="piano-roll">
      <div className="piano-keys">
        {NOTES.map((note, i) => (
          <div key={i} className={`key ${note.name.includes('#') ? 'black' : 'white'}`}>
            {note.name}
          </div>
        ))}
      </div>
      
      <div className="grid">
        {NOTES.map((_, noteIdx) => (
          <div key={noteIdx} className="grid-row">
            {[...Array(STEPS)].map((_, stepIdx) => {
              const isActive = (sequence[stepIdx] || []).some(n => n.freq === NOTES[noteIdx].freq);
              const isCurrent = currentStep === stepIdx;
              
              return (
                <div 
                  key={stepIdx} 
                  className={`cell ${isActive ? 'active' : ''} ${isCurrent ? 'playing' : ''}`}
                  onClick={() => toggleNote(noteIdx, stepIdx)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PianoRoll;
