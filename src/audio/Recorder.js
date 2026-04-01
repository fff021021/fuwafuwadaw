/**
 * DAW Audio Recorder Module
 */
class AudioRecorder {
  constructor() {
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.isRecording = false;
  }

  async init() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Audio Stream Initialized");
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  }

  start() {
    if (!this.stream) return;
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.start();
    this.isRecording = true;
    console.log("Recording Started");
  }

  async stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm; codecs=opus' });
        const url = URL.createObjectURL(blob);
        this.isRecording = false;
        console.log("Recording Stopped");
        resolve({ blob, url });
      };
      this.mediaRecorder.stop();
    });
  }
}

const recorder = new AudioRecorder();
export default recorder;
