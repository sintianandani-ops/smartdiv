/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Layanan Audio untuk SMART-DIV:
 * - Web Speech API (SpeechSynthesis) dengan bahasa id-ID dan pengubah simbol matematika ke lisan
 * - Penyesuaian intonasi, kecepatan, dan jeda alami ramah anak SD kelas 4 (~300ms antar kalimat)
 * - Dukungan Mode Tenang (Quiet Mode) untuk siswa sensitif sensori
 * - Web Audio API untuk efek suara ceria ramah anak (tanpa file eksternal)
 * - Musik latar lembut prosedural dengan auto-ducking saat narasi berbicara
 */

// Konversi teks ekspresi matematika menjadi kalimat lisan ramah anak
export function convertMathToSpokenText(text: string): string {
  if (!text) return '';
  return text
    // Simbol perkalian
    .replace(/(\d+)\s*[x×]\s*(\d+)/g, '$1 kali $2')
    .replace(/[x×]/g, ' kali ')
    // Simbol pembagian
    .replace(/(\d+)\s*:\s*(\d+)/g, '$1 dibagi $2')
    .replace(/:/g, ' dibagi ')
    // Simbol sama dengan
    .replace(/=/g, ' sama dengan ')
    // Simbol tambah dan kurang
    .replace(/\+/g, ' ditambah ')
    .replace(/-/g, ' dikurang ')
    // Tanda lebih kecil / besar
    .replace(/</g, ' lebih kecil dari ')
    .replace(/>/g, ' lebih besar dari ')
    // Sisa pembagian
    .replace(/\bsisa\b/gi, ' sisa ')
    // Hilangkan spasi berlebih
    .replace(/\s+/g, ' ')
    .trim();
}

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private indonesianVoice: SpeechSynthesisVoice | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isQuietMode: boolean = false;
  private volume: number = 1.0;
  private speechRate: number = 0.88; // Sedikit santai ramah anak SD
  private speechPitch: number = 1.08; // Nada ceria hangat
  private selectedVoiceUri: string | null = null;
  private bgmGainNode: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private speechTimeouts: number[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Load saved settings
      try {
        const savedMute = localStorage.getItem('smart_div_is_muted');
        if (savedMute !== null) this.isMuted = savedMute === 'true';
        const savedQuiet = localStorage.getItem('smart_div_quiet_mode');
        if (savedQuiet !== null) this.isQuietMode = savedQuiet === 'true';
        const savedRate = localStorage.getItem('smart_div_speech_rate');
        if (savedRate) this.speechRate = parseFloat(savedRate) || 0.88;
        const savedPitch = localStorage.getItem('smart_div_speech_pitch');
        if (savedPitch) this.speechPitch = parseFloat(savedPitch) || 1.08;
        this.selectedVoiceUri = localStorage.getItem('smart_div_voice_uri');
      } catch {
        // Ignore localStorage errors
      }

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  // Inisialisasi AudioContext setelah interaksi pengguna pertama kali
  public initAudioContext(): void {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (this.selectedVoiceUri) {
      const match = voices.find((v) => v.voiceURI === this.selectedVoiceUri);
      if (match) {
        this.indonesianVoice = match;
        return;
      }
    }
    // Cari suara bahasa Indonesia terbaik (preferensi Google id-ID atau natural)
    const idVoices = voices.filter(
      (v) => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia')
    );
    const googleIdVoice = idVoices.find((v) => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural'));
    this.indonesianVoice = googleIdVoice || idVoices[0] || null;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public setVoiceByUri(uri: string): void {
    this.selectedVoiceUri = uri;
    try {
      localStorage.setItem('smart_div_voice_uri', uri);
    } catch {}
    this.loadVoices();
  }

  public getSelectedVoiceUri(): string | null {
    return this.selectedVoiceUri || (this.indonesianVoice ? this.indonesianVoice.voiceURI : null);
  }

  public setSpeechSettings(rate: number, pitch: number): void {
    this.speechRate = Math.max(0.5, Math.min(1.5, rate));
    this.speechPitch = Math.max(0.5, Math.min(1.8, pitch));
    try {
      localStorage.setItem('smart_div_speech_rate', this.speechRate.toString());
      localStorage.setItem('smart_div_speech_pitch', this.speechPitch.toString());
    } catch {}
  }

  public getSpeechSettings(): { rate: number; pitch: number } {
    return { rate: this.speechRate, pitch: this.speechPitch };
  }

  public setQuietMode(quiet: boolean): void {
    this.isQuietMode = quiet;
    try {
      localStorage.setItem('smart_div_quiet_mode', quiet ? 'true' : 'false');
    } catch {}
    if (quiet && this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  public getIsQuietMode(): boolean {
    return this.isQuietMode;
  }

  public hasIndonesianVoice(): boolean {
    return this.indonesianVoice !== null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('smart_div_is_muted', muted ? 'true' : 'false');
    } catch {}
    if (muted && this.synth) {
      this.synth.cancel();
    }
    if (this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(muted ? 0 : this.volume * 0.08, this.audioCtx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.bgmGainNode && this.audioCtx && !this.isMuted && !this.isQuietMode) {
      this.bgmGainNode.gain.setValueAtTime(this.volume * 0.08, this.audioCtx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  private activeUtterance: SpeechSynthesisUtterance | null = null;

  // Bersihkan jadwal antrian suara
  private clearSpeechQueue(): void {
    this.speechTimeouts.forEach((t) => clearTimeout(t));
    this.speechTimeouts = [];
  }

  // Hentikan bicara aktif
  public stopSpeaking(): void {
    this.clearSpeechQueue();
    if (this.synth) {
      try {
        if (this.synth.speaking || this.synth.pending) {
          this.synth.cancel();
        }
      } catch {}
    }
    this.activeUtterance = null;
    this.duckBgm(false);
  }

  // Bicara narasi tanpa terpotong (GC-safe & intonasi ramah)
  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      rate?: number;
      pitch?: number;
    }
  ): void {
    if (typeof window === 'undefined' || !this.synth) {
      options?.onEnd?.();
      return;
    }

    if (this.isMuted) {
      options?.onEnd?.();
      return;
    }

    // Inisialisasi AudioContext jika belum
    this.initAudioContext();

    // Pastikan resume jika engine browser tersuspensi
    if (this.synth.paused) {
      try {
        this.synth.resume();
      } catch {}
    }

    // Ubah ekspresi matematika ke bentuk lisan
    const spokenText = convertMathToSpokenText(text);
    if (!spokenText.trim()) {
      options?.onEnd?.();
      return;
    }

    // Batalkan suara sebelumnya jika sedang berbicara
    if (this.synth.speaking || this.synth.pending) {
      try {
        this.synth.cancel();
      } catch {}
    }

    // Jeda 40ms (microtick) sangat krusial di Chrome agar pembatalan tuntas
    // sebelum utterance baru dimasukkan, mencegah bug Chrome yang membatalkan suara baru secara senyap
    const speakTimer = window.setTimeout(() => {
      if (!this.synth) {
        options?.onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      this.activeUtterance = utterance;

      // KUNCI PERBAIKAN: Simpan referensi global agar tidak di-garbage-collect oleh Chrome di tengah jalan
      const win = window as unknown as { _smartDivSpeechQueue?: SpeechSynthesisUtterance[] };
      if (!win._smartDivSpeechQueue) win._smartDivSpeechQueue = [];
      win._smartDivSpeechQueue.push(utterance);

      utterance.lang = 'id-ID';
      utterance.rate = options?.rate || this.speechRate;
      utterance.pitch = options?.pitch || this.speechPitch;
      utterance.volume = this.isQuietMode ? this.volume * 0.7 : this.volume;

      if (this.indonesianVoice) {
        utterance.voice = this.indonesianVoice;
      }

      let isFinished = false;
      const cleanup = () => {
        if (isFinished) return;
        isFinished = true;
        if (win._smartDivSpeechQueue) {
          win._smartDivSpeechQueue = win._smartDivSpeechQueue.filter((u) => u !== utterance);
        }
        this.activeUtterance = null;
        this.duckBgm(false);
      };

      utterance.onstart = () => {
        this.duckBgm(true);
        options?.onStart?.();
      };

      utterance.onend = () => {
        cleanup();
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech error:', e.error);
        }
        cleanup();
        options?.onEnd?.();
      };

      // Watchdog pengaman jika browser berhenti menembak onend
      const estimatedDurationMs = Math.max(2500, (spokenText.split(' ').length / (this.speechRate * 2.5)) * 1000 + 1500);
      const watchdog = window.setTimeout(() => {
        if (!isFinished) {
          cleanup();
          options?.onEnd?.();
        }
      }, estimatedDurationMs);

      const originalOnEnd = utterance.onend;
      utterance.onend = (ev) => {
        clearTimeout(watchdog);
        if (originalOnEnd) originalOnEnd.call(utterance, ev);
      };

      try {
        this.synth.speak(utterance);
        // Resume lagi untuk memastikan tidak ter-freeze oleh Chrome
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch (err) {
        console.warn('Synth speak error:', err);
        clearTimeout(watchdog);
        cleanup();
        options?.onEnd?.();
      }
    }, 40);

    this.speechTimeouts.push(speakTimer);
  }

  // Suara apresiasi jawaban benar (Validator 1 Komentar E.4)
  public playAppreciation(customPraise?: string, onEnd?: () => void): void {
    this.playStarSound();
    const praises = [
      'Hebat sekali! Jawabanmu tepat!',
      'Wah pintar sekali! Kamu berhasil menemukan jawabannya!',
      'Luar biasa! Benar sekali!',
      'Keren banget! Kamu semakin paham pembagian!',
    ];
    const praiseText = customPraise || praises[Math.floor(Math.random() * praises.length)];
    this.speak(praiseText, { onEnd });
  }

  // Uji Suara untuk Panel Guru/Peneliti
  public testVoice(sampleText?: string): void {
    const msg = sampleText || 'Halo! Ini contoh suara narasi Kak Bagi. Dua belas dibagi empat sama dengan tiga!';
    this.speak(msg);
  }

  // Auto-ducking BGM
  public duckBgm(duck: boolean): void {
    if (!this.bgmGainNode || !this.audioCtx || this.isMuted || this.isQuietMode) return;
    const targetGain = duck ? this.volume * 0.015 : this.volume * 0.06;
    try {
      this.bgmGainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.bgmGainNode.gain.linearRampToValueAtTime(targetGain, this.audioCtx.currentTime + 0.3);
    } catch {
      // Ignore timing errors
    }
  }

  // Efek Suara Prosedural
  public playTapSound(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);

      const amp = this.isQuietMode ? this.volume * 0.12 : this.volume * 0.25;
      gain.gain.setValueAtTime(amp, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch (e) {
      console.debug(e);
    }
  }

  public playSuccessSound(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (chord mayor ceria)
      notes.forEach((freq, index) => {
        const startTime = this.audioCtx!.currentTime + index * 0.09;
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        const amp = this.isQuietMode ? this.volume * 0.1 : this.volume * 0.2;
        gain.gain.setValueAtTime(amp, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch (e) {
      console.debug(e);
    }
  }

  public playStarSound(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, i) => {
        const startTime = this.audioCtx!.currentTime + i * 0.08;
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        const amp = this.isQuietMode ? this.volume * 0.12 : this.volume * 0.22;
        gain.gain.setValueAtTime(amp, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch (e) {
      console.debug(e);
    }
  }

  public playHintSound(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, this.audioCtx.currentTime); // G4
      osc.frequency.exponentialRampToValueAtTime(587.33, this.audioCtx.currentTime + 0.18); // D5
      const amp = this.isQuietMode ? this.volume * 0.1 : this.volume * 0.2;
      gain.gain.setValueAtTime(amp, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.22);
    } catch (e) {
      console.debug(e);
    }
  }

  // Nada lembut saat mencoba lagi (bukan suara dengung silang merah!)
  public playGentleRetrySound(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, this.audioCtx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(293.66, this.audioCtx.currentTime + 0.16); // D4
      const amp = this.isQuietMode ? this.volume * 0.08 : this.volume * 0.15;
      gain.gain.setValueAtTime(amp, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch (e) {
      console.debug(e);
    }
  }

  // Suara memasukkan kelereng/permen ke wadah (pop lembut)
  public playDropSound(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.audioCtx.currentTime + 0.06);
      const amp = this.isQuietMode ? this.volume * 0.08 : this.volume * 0.18;
      gain.gain.setValueAtTime(amp, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      console.debug(e);
    }
  }

  // Musik latar lembut prosedural (calm pentatonic marimba / music box)
  public startGentleBgm(): void {
    if (this.isBgmPlaying || typeof window === 'undefined' || this.isQuietMode) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    this.isBgmPlaying = true;
    this.bgmGainNode = this.audioCtx.createGain();
    this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.06, this.audioCtx.currentTime);
    this.bgmGainNode.connect(this.audioCtx.destination);

    // Skala pentatonik hangat: C4, D4, E4, G4, A4, C5
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    let noteIndex = 0;

    const playNextChord = () => {
      if (!this.isBgmPlaying || !this.audioCtx || !this.bgmGainNode) return;

      const freq = scale[noteIndex % scale.length];
      noteIndex = (noteIndex + 1) % scale.length;

      try {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        noteGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.2);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGainNode);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 1.25);
      } catch (err) {
        console.debug(err);
      }

      this.bgmTimer = window.setTimeout(playNextChord, 1400);
    };

    playNextChord();
  }

  public stopGentleBgm(): void {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const audioService = new AudioService();
