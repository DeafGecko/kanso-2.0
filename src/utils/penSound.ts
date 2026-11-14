let ctx: AudioContext | null = null;
let lastPlayed = 0;

// One click burst: a short, decaying noise transient through a bandpass filter.
function playClick(audio: AudioContext, when: number, frequency: number, peak: number) {
  const duration = 0.025;
  const length = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 4;
  }

  const source = audio.createBufferSource();
  source.buffer = buffer;

  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = 2;

  const gain = audio.createGain();
  gain.gain.value = peak;

  source.connect(filter).connect(gain).connect(audio.destination);
  source.start(when);
}

// Ballpoint "click": a press and a release transient, synthesized so no audio asset is needed.
// Throttled so moving across the logo doesn't stack sounds.
export function playPenHoverSound() {
  const now = performance.now();
  if (now - lastPlayed < 250) return;
  lastPlayed = now;

  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();

    const t = ctx.currentTime;
    playClick(ctx, t, 3200, 0.18);
    playClick(ctx, t + 0.045, 2200, 0.1);
  } catch {
    // Audio unavailable or blocked by the browser; the hover still works silently.
  }
}
