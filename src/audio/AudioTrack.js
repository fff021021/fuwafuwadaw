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
    this.currentRegions = [];
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
    this.rawBlob = blob;
    const arrayBuffer = await blob.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(time = 0, offset = 0, regions = [], bpm = 120) {
    if (!this.buffer) return;
    this.stop();
    this.currentRegions = regions;

    if (regions.length === 0) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffer;
      source.connect(this.destination);
      source.start(time, offset);
      this.activeSources.push({ node: source, regionId: 'full' });
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
            this.activeSources.push({ node: source, regionId: r.id });
          }
        }
      });
    }
  }

  updateParams(regions) {
    this.currentRegions = regions;
    this.activeSources.forEach(s => {
      const region = regions.find(r => r.id === s.regionId);
      if (region && s.node.detune) {
        // Smoothly update pitch in real-time
        s.node.detune.setTargetAtTime(region.pitchOffset * 100, this.ctx.currentTime, 0.05);
      }
    });
  }

  stop() {
    this.activeSources.forEach(s => {
      try {
        s.node.stop();
      } catch (e) {}
    });
    this.activeSources = [];
  }
}

export default AudioTrackPlayer;
