/**
 * Moteur Audio-Haptique Léger pour Loreno (UX-015)
 * Utilise l'API Web Audio native (synthèse immédiate, 0 téléchargement)
 * et navigator.vibrate pour un feedback tactile smartphone immersif.
 */

type HapticType = "tap" | "success" | "error" | "milestone";
type SoundType = "success" | "error" | "milestone";

export function triggerHaptic(type: HapticType): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    switch (type) {
      case "tap":
        navigator.vibrate(10);
        break;
      case "success":
        navigator.vibrate(25);
        break;
      case "error":
        navigator.vibrate([35, 50, 35]);
        break;
      case "milestone":
        navigator.vibrate([30, 40, 50, 40, 70]);
        break;
    }
  } catch {
    // Silencieux si permissions refusées
  }
}

// AudioContext singleton paresseux
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playAudioChime(type: SoundType): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Bip ascendant cristallin (Dopamine hit)
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "error") {
      // Son sourd descendant discret
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.15); // D3
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "milestone") {
      // Accord triomphal court (Arpège C5-E5-G5)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(freq, now + i * 0.06);
        subGain.gain.setValueAtTime(0.07, now + i * 0.06);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        subOsc.start(now + i * 0.06);
        subOsc.stop(now + i * 0.06 + 0.25);
      });
    }
  } catch {
    // Silencieux si audio bloqué par autoplay policy
  }
}

export function triggerFeedback(type: "success" | "error" | "milestone"): void {
  triggerHaptic(type);
  playAudioChime(type);
}
