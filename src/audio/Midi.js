/**
 * DAW Web MIDI API Integration
 */
class MidiManager {
  constructor() {
    this.onNoteOn = null;
    this.onNoteOff = null;
  }

  async init(onNoteOn, onNoteOff) {
    if (!navigator.requestMIDIAccess) {
      console.warn("Web MIDI API is not supported in this browser.");
      return;
    }

    this.onNoteOn = onNoteOn;
    this.onNoteOff = onNoteOff;

    try {
      const access = await navigator.requestMIDIAccess();
      const inputs = access.inputs.values();
      for (let input of inputs) {
        input.onmidimessage = this.handleMidiMessage.bind(this);
      }
      
      access.onstatechange = (e) => {
        if (e.port.type === 'input' && e.port.state === 'connected') {
          e.port.onmidimessage = this.handleMidiMessage.bind(this);
        }
      };
      
      console.log("MIDI Access Granted");
    } catch (err) {
      console.error("MIDI Access Denied:", err);
    }
  }

  handleMidiMessage(msg) {
    const [command, note, velocity] = msg.data;
    
    // Command 144: Note On, 128: Note Off
    if (command === 144 && velocity > 0) {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      if (this.onNoteOn) this.onNoteOn(freq, velocity / 127);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      const freq = 440 * Math.pow(2, (note - 69) / 12);
      if (this.onNoteOff) this.onNoteOff(freq);
    }
  }
}

const midi = new MidiManager();
export default midi;
