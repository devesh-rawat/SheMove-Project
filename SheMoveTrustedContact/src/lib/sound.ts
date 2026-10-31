// Audio synthesizer for Police Command Center using Web Audio API

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentSirenOsc: OscillatorNode | null = null;
  private currentSirenGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('safejourney_sound_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('safejourney_sound_muted', String(muted));
    }
    if (muted) {
      this.stopSiren();
    }
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Play oscillating emergency police siren for CRITICAL alerts (SOS)
  public playCriticalAlertSiren() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Emergency two-tone frequency sweep: 960Hz to 770Hz
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.linearRampToValueAtTime(770, now + 0.25);
      osc.frequency.linearRampToValueAtTime(960, now + 0.5);
      osc.frequency.linearRampToValueAtTime(770, now + 0.75);
      osc.frequency.linearRampToValueAtTime(960, now + 1.0);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.15);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Double pulse sonar beep for HIGH alerts (Missed Checkin, Unreachable)
  public playHighAlertBeep() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Pulse 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Pulse 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174, now + 0.2);
      gain2.gain.setValueAtTime(0.25, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Affirmative chime when an alert is acknowledged
  public playAcknowledgeChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Tactical radio chirp for unit dispatch
  public playDispatchRadioChirp() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  public stopSiren() {
    if (this.currentSirenOsc) {
      try {
        this.currentSirenOsc.stop();
        this.currentSirenOsc.disconnect();
      } catch {
        // ignore
      }
      this.currentSirenOsc = null;
    }
  }
}

export const soundManager = new SoundManager();
