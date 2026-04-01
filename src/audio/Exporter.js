/**
 * DAW Audio Exporter
 * Renders the project to a WAV file using OfflineAudioContext.
 */
class Exporter {
  async exportWav(tracks, bpm, duration = 16) { // Default 16 beats = 4 bars
    const sampleRate = 44100;
    const length = (duration * (60 / bpm)) * sampleRate;
    const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

    // Reconstruct the signal chain in the offline context
    for (const track of tracks) {
      if (track.player && track.player.buffer) {
        const gain = offlineCtx.createGain();
        gain.gain.value = track.gainNode.gain.value;
        gain.connect(offlineCtx.destination);

        const regions = track.regions || [];
        if (regions.length === 0) {
          const source = offlineCtx.createBufferSource();
          source.buffer = track.player.buffer;
          source.connect(gain);
          source.start(0);
        } else {
          regions.forEach(r => {
            const source = offlineCtx.createBufferSource();
            source.buffer = track.player.buffer;
            source.detune.value = r.pitchOffset * 100;
            source.connect(gain);
            source.start(r.start, r.start, r.duration);
          });
        }
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(renderedBuffer);
  }

  bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const outBuffer = new ArrayBuffer(length);
    const view = new DataView(outBuffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) { // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // update pos
        pos += 2;
      }
      offset++; // next sample
    }

    return new Blob([view], { type: 'audio/wav' });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }
}

const exporter = new Exporter();
export default exporter;
