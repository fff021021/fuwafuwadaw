/**
 * DAW Audio Track Player
 * Handles playback of AudioBuffers (Imported/Recorded)
 */
class AudioTrackPlayer {
  constructor(ctx, destination) {
    this.ctx = ctx;
    this.destination = destination;
    this.buffer = null;
    this.source = null;
  }

  async loadFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  async loadBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(time = 0, offset = 0) {
    if (!this.buffer) return;
    this.stop();
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.destination);
    this.source.start(time, offset);
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {}
      this.source = null;
    }
  }
}

export default AudioTrackPlayer;
