// Audio synthesis using standard Web Audio API (no external asset dependencies)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Pleasant melodic chime for medicine reminders
 */
export function playMedicineAlarmChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (warm arpeggio)

  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.18);

    gain.gain.setValueAtTime(0, now + index * 0.18);
    gain.gain.linearRampToValueAtTime(0.25, now + index * 0.18 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.18 + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.18);
    osc.stop(now + index * 0.18 + 0.95);
  });
}

/**
 * Distinct pulsing chime for emergency SOS alerts
 */
export function playSOSAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Pulsing two-tone alert
  const tones = [880, 698.46, 880, 698.46];

  tones.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.22);

    gain.gain.setValueAtTime(0, now + idx * 0.22);
    gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.22 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.22);
    osc.stop(now + idx * 0.22 + 0.38);
  });
}

/**
 * Gentle warm confirmation chime when medicine is marked taken
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const frequencies = [587.33, 880.00]; // D5 -> A5

  frequencies.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.12);

    gain.gain.setValueAtTime(0, now + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.2, now + index * 0.12 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.65);
  });
}
