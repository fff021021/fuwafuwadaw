/**
 * DAW Audio Track Player
 * Handles playback of AudioBuffers (Imported/Recorded)
 */
class AudioTrackPlayer {
  constructor(ctx, destination) {
    this.ctx = ctx;
    this.destination = destination;
    this.buffer = null;
    this.activeSources = [];
    this.rawBlob = null;
  }

  async loadFile(file) {
    this.rawBlob = file;
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  async loadBlob(blob) {
    this.rawBlob = blob;
    const arrayBuffer = await blob.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  async loadBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(time = 0, offset = 0, regions = []) {
    if (!this.buffer) return;
    this.stop();

    if (regions.length === 0) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.destination);
      source.start(time, offset);
      this.activeSources.push(source);
    } else {
      regions.forEach(r => {
        const rEnd = r.start + r.duration;
        if (rEnd > offset) {
          const source = this.ctx.createBufferSource();
          source.buffer = this.buffer;
          source.detune.value = r.pitchOffset * 100;
          source.connect(this.destination);
          
          const startDelay = Math.max(0, r.start - offset);
          const playOffset = Math.max(r.start, offset);
          const playDuration = r.duration - (playOffset - r.start);
          
          if (playDuration > 0) {
            source.start(time + startDelay, playOffset, playDuration);
            this.activeSources.push(source);
          }
        }
      });
    }
  }

  stop() {
    this.activeSources.forEach(s => {
      try {
        s.stop();
      } catch (e) {}
    });
    this.activeSources = [];
  }
}

export default AudioTrackPlayer;
