/**
 * DAW Precise Scheduler
 * Uses the "Look-Ahead" pattern for rock-solid timing.
 */
class Scheduler {
  constructor() {
    this.bpm = 120;
    this.nextNoteTime = 0.0;
    this.timerID = null;
    this.lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)
    this.currentStep = 0;
    this.isPlaying = false;
    this.onStepChange = null; // Callback for UI
    this.tracks = [];
    this.maxSteps = 64;
  }

  start(ctx, tracks, onStep, maxSteps = 64, initialStep = 0) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.tracks = tracks;
    this.onStepChange = onStep;
    this.maxSteps = maxSteps;
    this.currentStep = initialStep;
    this.nextNoteTime = ctx.currentTime;
    this.scheduler(ctx);
  }

  updateTracks(tracks) {
    this.tracks = tracks;
  }

  updateMaxSteps(steps) {
    this.maxSteps = steps;
  }

  seek(step) {
    this.currentStep = step;
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this.timerID);
  }

  scheduler(ctx) {
    // While there are notes that will need to play before the next interval, schedule them
    while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.nextStep();
    }
    this.timerID = setTimeout(() => this.scheduler(ctx), this.lookahead);
  }

  scheduleNote(step, time) {
    // Notify UI
    if (this.onStepChange) {
      this.onStepChange(step, time);
    }

    // Play notes from all tracks that have data for this step
    this.tracks.forEach(track => {
      if (track.sequence && track.sequence[step]) {
        track.sequence[step].forEach(note => {
          track.synth.playNote(note.freq, note.velocity, time);
          // Auto-stop for short notes or handle duration
          setTimeout(() => {
            // This is a bit loose for stopNote, but works for basic sequencing
            // Future improvement: use ctx.currentTime to schedule stop
          }, note.duration * (60 / this.bpm) * 1000);
        });
      }
    });
  }

  nextStep() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last note time (16th notes)
    this.currentStep++;
    if (this.currentStep >= this.maxSteps) {
      this.currentStep = 0; 
    }
  }
}

const scheduler = new Scheduler();
export default scheduler;
