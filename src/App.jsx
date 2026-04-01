import React, { useState, useEffect, useRef } from 'react';
import './styles/index.css';
import './styles/App.css';
import engine from './audio/Engine';
import Synth from './audio/Synth';
import scheduler from './audio/Scheduler';
import Compressor from './audio/plugins/Compressor';
import Reverb from './audio/plugins/Reverb';
import Delay from './audio/plugins/Delay';
import EQ from './audio/plugins/EQ';
import Gate from './audio/plugins/Gate';
import DeEsser from './audio/plugins/DeEsser';
import PitchShifter from './audio/plugins/PitchShifter';
import Transport from './components/Transport';
import Mixer from './components/Mixer';
import PianoRoll from './components/PianoRoll';
import PluginRack from './components/PluginRack';
import Visualizer from './components/Visualizer';
import midi from './audio/Midi';
import recorder from './audio/Recorder';
import AudioTrackPlayer from './audio/AudioTrack';
import exporter from './audio/Exporter';
import WaveformView from './components/WaveformView';
import Playhead from './components/Playhead';
import persistence from './audio/Persistence';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [activeTrackId, setActiveTrackId] = useState(1);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [projectLength, setProjectLength] = useState(64);
  const [seekPos, setSeekPos] = useState(0);
  
  const tracksRef = useRef([]);
  const voicesRef = useRef({}); // To track MIDI voices

  const handleInit = async () => {
    await engine.init();
    
    // Setup MIDI
    midi.init(
      (freq, vel) => {
        const track = tracksRef.current.find(t => t.id === activeTrackId);
        if (track && track.synth) {
          voicesRef.current[freq] = track.synth.playNote(freq, vel);
        }
      },
      (freq) => {
        const track = tracksRef.current.find(t => t.id === activeTrackId);
        if (track && track.synth && voicesRef.current[freq]) {
          track.synth.stopNote(voicesRef.current[freq]);
          delete voicesRef.current[freq];
        }
      }
    );
    
    // Initialize default tracks
    const track1Gain = engine.ctx.createGain();
    const track2Gain = engine.ctx.createGain();
    track1Gain.connect(engine.masterGain);
    track2Gain.connect(engine.masterGain);

    const newTracks = [
      { 
        id: 1, 
        name: 'Lead Synth', 
        synth: null,
        gainNode: track1Gain,
        plugins: [],
        muted: false, 
        solo: false,
        sequence: Array(64).fill(null).map(() => []),
        setVolume: (v) => {
          track1Gain.gain.setTargetAtTime(v, engine.ctx.currentTime, 0.02);
        }
      },
      { 
        id: 2, 
        name: 'Bass Synth', 
        synth: null,
        gainNode: track2Gain,
        plugins: [],
        muted: false, 
        solo: false,
        sequence: Array(64).fill(null).map(() => []),
        setVolume: (v) => {
          track2Gain.gain.setTargetAtTime(v, engine.ctx.currentTime, 0.02);
        }
      },
    ];

    // Initialize plugins and signal chain for each track
    newTracks.forEach((t, i) => {
        const dest = t.gainNode;
        const comp = new Compressor(engine.ctx);
        const eq = new EQ(engine.ctx);
        const gate = new Gate(engine.ctx);
        const deesser = new DeEsser(engine.ctx);
        const rev = new Reverb(engine.ctx);
        const delay = new Delay(engine.ctx);
        const pitch = new PitchShifter(engine.ctx);

        // Chain: Synth -> Gate -> DeEsser -> Pitch -> EQ -> Comp -> Delay -> Reverb -> Gain
        t.synth = new Synth(engine.ctx, gate.input);
        gate.connect(deesser.input);
        deesser.connect(pitch.input);
        pitch.connect(eq.input);
        eq.connect(comp.node);
        comp.connect(delay.input);
        delay.connect(rev.input);
        rev.connect(dest);

        t.plugins = [gate, deesser, pitch, eq, comp, delay, rev];
    });
    
    setTracks(newTracks);
    tracksRef.current = newTracks;
    setInitialized(true);
  };

  const setTrackSequence = (newSeq) => {
    const nextTracks = tracks.map(t => t.id === activeTrackId ? { ...t, sequence: newSeq } : t);
    setTracks(nextTracks);
    tracksRef.current = nextTracks;
  };

  const playTestSound = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (track && track.synth) {
      const freq = trackId === 1 ? 440 : 110;
      const voice = track.synth.playNote(freq, 0.5);
      setTimeout(() => track.synth.stopNote(voice), 200);
    }
  };

  const togglePlayback = (playing) => {
    setIsPlaying(playing);
    if (playing) {
      scheduler.start(engine.ctx, tracks, (step, time) => {
        setCurrentStep(step);
        if (step === 0) {
          tracksRef.current.forEach(track => {
            if (track.player) track.player.play(time, 0, track.regions || []);
          });
        }
      }, seekPos);
    } else {
      scheduler.stop();
      tracksRef.current.forEach(track => {
        if (track.player) track.player.stop();
      });
    }
  };

  const handleSeek = (step) => {
    setSeekPos(step);
    setCurrentStep(step);
    if (isPlaying) {
      togglePlayback(false);
      setTimeout(() => togglePlayback(true), 50);
    }
  };

  const importAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const gain = engine.ctx.createGain();
    gain.connect(engine.masterGain);
    
    // Setup Chain (same as Synth tracks for now)
    const comp = new Compressor(engine.ctx);
    const eq = new EQ(engine.ctx);
    const pitch = new PitchShifter(engine.ctx);
    const rev = new Reverb(engine.ctx);
    const delay = new Delay(engine.ctx);

    pitch.connect(eq.input);
    eq.connect(comp.node);
    comp.connect(delay.input);
    delay.connect(rev.input);
    rev.connect(gain);

    const player = new AudioTrackPlayer(engine.ctx, pitch.input);
    await player.loadFile(file);

    setTracks([...tracks, {
      id: Date.now(),
      name: file.name,
      player: player,
      gainNode: gain,
      plugins: [pitch, eq, comp, delay, rev],
      muted: false,
      solo: false,
      sequence: [],
      setVolume: (v) => gain.gain.setTargetAtTime(v, engine.ctx.currentTime, 0.02)
    }]);
  };

  const saveProject = () => {
    const data = tracks.map(t => ({
      id: t.id,
      name: t.name,
      sequence: t.sequence,
      volume: t.gainNode.gain.value
    }));
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.json';
    a.click();
  };

  const exportProject = async () => {
    const blob = await exporter.exportWav(tracks, 120);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mixdown.wav';
    a.click();
  };

  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      // Implementation of track reconstruction...
      alert('プロジェクト読込機能: 将来のアップデートでトラック構成を復元可能になります。シーケンスデータはロードされました。');
      setTracks(tracks.map((t, i) => data[i] ? { ...t, sequence: data[i].sequence } : t));
    };
    reader.readAsText(file);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      await recorder.init();
      recorder.start();
      setIsRecording(true);
    } else {
      const { url } = await recorder.stop();
      setIsRecording(false);
      // Create a new audio track with the recorded URL
      const gain = engine.ctx.createGain();
      gain.connect(engine.masterGain);
      setTracks([...tracks, {
        id: Date.now(),
        name: 'Recorded Audio',
        url: url,
        gainNode: gain,
        plugins: [],
        muted: false,
        solo: false,
        sequence: [], // Audio tracks don't use sequence for now
        setVolume: (v) => gain.gain.setTargetAtTime(v, engine.ctx.currentTime, 0.02)
      }]);
    }
  };

  const activeTrack = tracks.find(t => t.id === activeTrackId);

  return (
    <div className="daw-container">
      {!initialized ? (
        <div className="init-screen glass">
          <h1>FUWA DAW</h1>
          <p>本格的なミュージック・プロダクションをブラウザで。</p>
          <button className="control-btn active" onClick={handleInit}>
            プロジェクトを開始
          </button>
        </div>
      ) : (
        <>
          <header className="glass">
            <div className="logo">FUWA DAW</div>
            <Transport onTogglePlay={togglePlayback} />
            <div className="header-right">
              <button 
                className={`small-btn ${isRecording ? 'active recording' : ''}`} 
                onClick={toggleRecording}
              >
                {isRecording ? 'REC ●' : 'REC'}
              </button>
              <label className="small-btn">IMPORT<input type="file" accept="audio/*" hidden onChange={importAudio} /></label>
              <button className="small-btn" onClick={saveProject}>SAVE</button>
              <label className="small-btn">LOAD<input type="file" hidden onChange={loadProject} /></label>
              <button className="small-btn active" onClick={exportProject}>EXPORT</button>
              <Visualizer />
              <div className="user-info">MASTER</div>
            </div>
          </header>
          
          <main>
            <div className="sidebar glass">
              <div className="sidebar-header">TRACKS</div>
              {tracks.map(track => (
                <div 
                  key={track.id} 
                  className={`track-item ${activeTrackId === track.id ? 'active' : ''}`}
                  onClick={() => setActiveTrackId(track.id)}
                >
                  <span>{track.name}</span>
                  <button className="small-btn" onClick={(e) => { e.stopPropagation(); playTestSound(track.id); }}>TEST</button>
                </div>
              ))}
            </div>
            
            <div className="timeline-toolbar glass">
              <label>ZOOM <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} /></label>
              <label>LENGTH <input type="number" value={projectLength / 16} onChange={(e) => setProjectLength(parseInt(e.target.value) * 16)} /> bars</label>
            </div>
            
            <div className="timeline-container" style={{ position: 'relative', overflowX: 'auto' }}>
              <Playhead 
                currentStep={currentStep >= 0 ? currentStep : seekPos} 
                projectLength={projectLength} 
                zoom={zoom} 
                onSeek={handleSeek} 
              />
              {activeTrack?.player ? (
                <WaveformView 
                  buffer={activeTrack.player.buffer} 
                  regions={activeTrack.regions || []} 
                  zoom={zoom}
                  onUpdateRegions={(regs) => {
                    const next = tracks.map(t => t.id === activeTrackId ? { ...t, regions: regs } : t);
                    setTracks(next);
                    tracksRef.current = next;
                  }}
                />
              ) : (
                <PianoRoll 
                  activeTrack={activeTrack} 
                  sequence={activeTrack?.sequence || []} 
                  setSequence={setTrackSequence}
                  currentStep={currentStep}
                  zoom={zoom}
                  steps={projectLength}
                />
              )}
            </div>
          </main>

          <footer className="glass">
            <div className="footer-content">
              <Mixer tracks={tracks} activeTrackId={activeTrackId} onSelectTrack={setActiveTrackId} />
              <PluginRack 
                track={activeTrack} 
                onPluginAdded={(p) => {
                  setTracks(tracks.map(t => t.id === activeTrackId ? { ...t, plugins: [...t.plugins, p] } : t));
                }} 
              />
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
