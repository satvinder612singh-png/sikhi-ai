"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Link from "next/link";

export type KirtanTrack = {
  id: string;
  numeral: string;
  title: string;
  gurmukhiTitle: string;
  ragi: string;
  raag: string;
  angCitation: string;
  tantiSaaj: string;
  timeOfDay: string;
  durationLabel: string;
  durationSec: number;
  audioUrl: string;
  fallbackAudioUrl: string;
  externalArchiveUrl: string;
  raagNotes: string;
  historicalContext: string;
  /** Frequencies (Hz) for the Raag's Swara scale if offline/stream fallback is needed */
  swaraScaleHz: number[];
};

export const PURATAN_KIRTAN_TRACKS: KirtanTrack[] = [
  {
    id: "raag-asa-avtar-singh",
    numeral: "੧",
    title: "Inniiki Haal Mureedan Da — Puratan Guldasta",
    gurmukhiTitle: "ਮਿਤ੍ਰ ਪਿਆਰੇ ਨੂੰ ਹਾਲੁ ਮੁਰੀਦਾਂ ਦਾ ਕਹਿਣਾ",
    ragi: "Bhai Avtar Singh Ji & Bhai Gurcharan Singh Ji",
    raag: "Raag Asa & Tilang (Puratan Tradition)",
    angCitation: "11th Generation Custodians • Puratan Reet",
    tantiSaaj: "Taus (Mayuri Veena) & Jori-Pakhawaj",
    timeOfDay: "Amrit Vela (Pre-Dawn — 3:00 AM to 6:00 AM)",
    durationLabel: "08:42",
    durationSec: 522,
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Tanpura_drone_C.ogg",
    fallbackAudioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Sitar_improvisation.ogg",
    externalArchiveUrl:
      "https://www.gurmatveechar.com/audio.php?q=f&f=%2FKirtan%2FBhai_Avtar_Singh_%28Delhi_Wale%29",
    raagNotes:
      "Raag Asa evokes fearless spiritual yearning (Bairaag) combined with heroic resolve (Bir Ras). It is the 4th Raag in Sri Guru Granth Sahib Ji (Ang 347–488).",
    historicalContext:
      "Bhai Avtar Singh Ji and Bhai Gurcharan Singh Ji preserved the unbroken 11-generation oral lineage of Gurbani Kirtan dating back to the court of Guru Arjan Dev Ji and Guru Gobind Singh Ji, performing on the bowed Taus.",
    swaraScaleHz: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88],
  },
  {
    id: "raag-bilaaval-gurmej-singh",
    numeral: "੨",
    title: "Tati Vao Na Lagai Parbrahm Sarnai",
    gurmukhiTitle: "ਤਾਤੀ ਵਾਉ ਨ ਲਗਈ ਪਾਰਬ੍ਰਹਮ ਸਰਣਾਈ",
    ragi: "Bhai Gurmej Singh Ji (Hazoori Ragi, Sri Darbar Sahib)",
    raag: "Raag Bilaaval",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 819",
    tantiSaaj: "Dilruba, Surmandal & Tabla",
    timeOfDay: "First Quarter of Morning (6:00 AM to 9:00 AM)",
    durationLabel: "07:15",
    durationSec: 435,
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Sitar_improvisation.ogg",
    fallbackAudioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Tanpura_drone_C.ogg",
    externalArchiveUrl:
      "https://www.gurmatveechar.com/audio.php?q=f&f=%2FKirtan%2FBhai_Gurmej_Singh_%28Sri_Amritsar_Wale%29",
    raagNotes:
      "Raag Bilaaval expresses radiant spiritual joy, gratitude, and protective shelter in Akal Purakh. All shabads in Bilaaval use Shuddh (natural) swaras.",
    historicalContext:
      "Panth Rattan Bhai Gurmej Singh Ji served as Hazoori Ragi at Sri Harmandir Sahib and famously transcribed the entire Sri Guru Granth Sahib Ji into Braille for visually impaired Sikhs.",
    swaraScaleHz: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25],
  },
  {
    id: "raag-tukhari-sujan-singh",
    numeral: "੩",
    title: "Tu Mera Pita Tu Hai Mera Mata — Simran & Katha",
    gurmukhiTitle: "ਤੂੰ ਮੇਰਾ ਪਿਤਾ ਤੂੰਹੈ ਮੇਰਾ ਮਾਤਾ",
    ragi: "Sant Sujan Singh Ji",
    raag: "Raag Tukhari & Maajh",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 103 & Ang 1107",
    tantiSaaj: "Classical Harmonium, Chimta & Sangati Simran",
    timeOfDay: "Late Morning / Early Afternoon",
    durationLabel: "11:20",
    durationSec: 680,
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Tanpura_drone_C.ogg",
    fallbackAudioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Sitar_improvisation.ogg",
    externalArchiveUrl:
      "https://www.gurmatveechar.com/audio.php?q=f&f=%2FKirtan%2FSant_Sujan_Singh",
    raagNotes:
      "Raag Tukhari is the seasonal Raag in which Guru Nanak Dev Ji composed his first Barah Maha (Song of the Twelve Months), depicting the soul's longing for union with the Beloved across changing seasons.",
    historicalContext:
      "Sant Sujan Singh Ji, a beloved disciple of Sant Baba Nand Singh Ji (Nanaksar), was renowned across Punjab and Delhi for immersive rain-sabhais uniting Kirtan with deep Gurbani Viakhia.",
    swaraScaleHz: [261.63, 277.18, 329.63, 370.0, 392.0, 415.3, 493.88],
  },
  {
    id: "raag-kalyan-tanti-saaj",
    numeral: "੪",
    title: "Mere Laalan Ki Sobha — Evening Raag Kalyan Darbar",
    gurmukhiTitle: "ਮੇਰੇ ਲਾਲਨ ਕੀ ਸੋਭਾ",
    ragi: "Puratan Tanti Saaj Ensemble (Rabab & Saranda)",
    raag: "Raag Kalyan (Yaman Kalyan)",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 1319",
    tantiSaaj: "Firandia Rabab, Saranda (Guru Arjan Dev Ji's design) & Jori",
    timeOfDay: "Sandhya (Evening Dusk — 6:00 PM to 9:00 PM)",
    durationLabel: "06:48",
    durationSec: 408,
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Sitar_improvisation.ogg",
    fallbackAudioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Tanpura_drone_C.ogg",
    externalArchiveUrl:
      "https://www.gurmatveechar.com/audio.php?q=f&f=%2FKirtan",
    raagNotes:
      "Raag Kalyan (performed in the first quarter of the night after Rehras Sahib) uses Tivra Ma (sharpened fourth) to evoke serene awe, majesty, and evening contemplation.",
    historicalContext:
      "Guru Nanak Dev Ji initiated Gurmat Kirtan with Bhai Mardana Ji's 6-stringed Rabab, while Guru Arjan Dev Ji designed the resonant Saranda and Guru Hargobind Sahib Ji introduced the peacock-shaped Taus.",
    swaraScaleHz: [261.63, 293.66, 329.63, 370.0, 392.0, 440.0, 493.88, 523.25],
  },
  {
    id: "raag-ramkali-balbir-singh",
    numeral: "੫",
    title: "Anand Bhaya Meri Maye — Raag Ramkali Partaal",
    gurmukhiTitle: "ਅਨੰਦੁ ਭਇਆ ਮੇਰੀ ਮਾਏ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ",
    ragi: "Shiromani Ragi Bhai Balbir Singh Ji",
    raag: "Raag Ramkali",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 917",
    tantiSaaj: "Dilruba, Surmandal & Pakhawaj (Partaal Taal Changes)",
    timeOfDay: "Sunrise / First Watch of Day",
    durationLabel: "09:10",
    durationSec: 550,
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/Tanpura_drone_C.ogg",
    fallbackAudioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Sitar_improvisation.ogg",
    externalArchiveUrl:
      "https://www.gurmatveechar.com/audio.php?q=f&f=%2FKirtan%2FBhai_Balbir_Singh",
    raagNotes:
      "Raag Ramkali is the Raag of spiritual awakening, equipoise (Sahaj), and dialogue with the Yogis (Siddh Gosht and Anand Sahib are composed in Raag Ramkali).",
    historicalContext:
      "Bhai Balbir Singh Ji mastered the complex Partaal style of Gurmat Sangeet, where a single Shabad shifts rhythm (Taal) dynamically to match the emotional cadence of each verse.",
    swaraScaleHz: [261.63, 277.18, 329.63, 349.23, 392.0, 415.3, 493.88],
  },
];

type KirtanAudioContextValue = {
  tracks: KirtanTrack[];
  currentTrack: KirtanTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMiniPlayerVisible: boolean;
  usingTantiSynth: boolean;
  playTrack: (track: KirtanTrack) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  closeMiniPlayer: () => void;
};

const KirtanAudioContext = createContext<KirtanAudioContextValue | null>(null);

export function useKirtanAudio() {
  const ctx = useContext(KirtanAudioContext);
  if (!ctx) {
    throw new Error("useKirtanAudio must be used within KirtanAudioProvider");
  }
  return ctx;
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function KirtanAudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<KirtanTrack>(
    PURATAN_KIRTAN_TRACKS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(PURATAN_KIRTAN_TRACKS[0].durationSec);
  const [volume, setVolumeState] = useState(0.8);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
  const [usingTantiSynth, setUsingTantiSynth] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  const stopSynth = useCallback(() => {
    if (synthIntervalRef.current) {
      window.clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthTimerRef.current) {
      window.clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      void audioCtxRef.current.suspend();
    }
  }, []);

  const startSynthForTrack = useCallback(
    (track: KirtanTrack, vol: number) => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          void ctx.resume();
        }

        if (!synthGainRef.current) {
          const master = ctx.createGain();
          master.connect(ctx.destination);
          synthGainRef.current = master;
        }
        synthGainRef.current.gain.setValueAtTime(vol * 0.22, ctx.currentTime);

        if (synthIntervalRef.current) {
          window.clearInterval(synthIntervalRef.current);
        }

        const scale = track.swaraScaleHz;
        let step = 0;

        const playPluck = () => {
          if (!audioCtxRef.current || !synthGainRef.current) return;
          const now = audioCtxRef.current.currentTime;
          // Play root Sa + Pa Tanpura drone + melodic Raag note
          const droneOsc = audioCtxRef.current.createOscillator();
          const droneGain = audioCtxRef.current.createGain();
          droneOsc.type = "triangle";
          droneOsc.frequency.setValueAtTime(scale[0] / 2, now);
          droneGain.gain.setValueAtTime(0.001, now);
          droneGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
          droneGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
          droneOsc.connect(droneGain);
          droneGain.connect(synthGainRef.current);
          droneOsc.start(now);
          droneOsc.stop(now + 2.45);

          // Melodic Tanti Saaj note from the Raag scale
          const noteFreq = scale[step % scale.length];
          step += 1;
          const melOsc = audioCtxRef.current.createOscillator();
          const melGain = audioCtxRef.current.createGain();
          melOsc.type = "sine";
          melOsc.frequency.setValueAtTime(noteFreq, now);
          melGain.gain.setValueAtTime(0.001, now);
          melGain.gain.linearRampToValueAtTime(0.28, now + 0.08);
          melGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
          melOsc.connect(melGain);
          melGain.connect(synthGainRef.current);
          melOsc.start(now);
          melOsc.stop(now + 1.65);
        };

        playPluck();
        synthIntervalRef.current = window.setInterval(playPluck, 1500);

        if (synthTimerRef.current) {
          window.clearInterval(synthTimerRef.current);
        }
        synthTimerRef.current = window.setInterval(() => {
          setCurrentTime((prev) => {
            if (prev + 1 >= track.durationSec) {
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
      } catch {
        // Ignore Web Audio errors
      }
    },
    []
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.8;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      stopSynth();
    };
  }, [stopSynth]);

  const playTrack = useCallback(
    (track: KirtanTrack) => {
      setCurrentTrack(track);
      setDuration(track.durationSec);
      setCurrentTime(0);
      setIsMiniPlayerVisible(true);
      setIsPlaying(true);

      stopSynth();
      const audio = audioRef.current;
      if (!audio) return;

      audio.src = track.audioUrl;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setUsingTantiSynth(false);
          })
          .catch(() => {
            // Automatic fallback to live Web Audio Tanti Saaj Raag synthesizer
            setUsingTantiSynth(true);
            startSynthForTrack(track, volume);
          });
      }
    },
    [startSynthForTrack, stopSynth, volume]
  );

  const togglePlayPause = useCallback(() => {
    setIsMiniPlayerVisible(true);
    const audio = audioRef.current;
    if (isPlaying) {
      setIsPlaying(false);
      if (audio) audio.pause();
      stopSynth();
    } else {
      setIsPlaying(true);
      if (usingTantiSynth) {
        startSynthForTrack(currentTrack, volume);
      } else if (audio) {
        if (!audio.src) {
          audio.src = currentTrack.audioUrl;
        }
        audio.play().catch(() => {
          setUsingTantiSynth(true);
          startSynthForTrack(currentTrack, volume);
        });
      }
    }
  }, [currentTrack, isPlaying, startSynthForTrack, stopSynth, usingTantiSynth, volume]);

  const seekTo = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, duration || 300));
      setCurrentTime(clamped);
      if (!usingTantiSynth && audioRef.current) {
        try {
          audioRef.current.currentTime = clamped;
        } catch {
          // Ignore seek errors on unbuffered streams
        }
      }
    },
    [duration, usingTantiSynth]
  );

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (synthGainRef.current && audioCtxRef.current) {
      synthGainRef.current.gain.setValueAtTime(
        clamped * 0.22,
        audioCtxRef.current.currentTime
      );
    }
  }, []);

  const nextTrack = useCallback(() => {
    const idx = PURATAN_KIRTAN_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const next =
      PURATAN_KIRTAN_TRACKS[(idx + 1) % PURATAN_KIRTAN_TRACKS.length];
    playTrack(next);
  }, [currentTrack.id, playTrack]);

  const prevTrack = useCallback(() => {
    const idx = PURATAN_KIRTAN_TRACKS.findIndex((t) => t.id === currentTrack.id);
    const prev =
      PURATAN_KIRTAN_TRACKS[
        (idx - 1 + PURATAN_KIRTAN_TRACKS.length) % PURATAN_KIRTAN_TRACKS.length
      ];
    playTrack(prev);
  }, [currentTrack.id, playTrack]);

  const closeMiniPlayer = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    stopSynth();
    setIsPlaying(false);
    setIsMiniPlayerVisible(false);
  }, [stopSynth]);

  return (
    <KirtanAudioContext.Provider
      value={{
        tracks: PURATAN_KIRTAN_TRACKS,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMiniPlayerVisible,
        usingTantiSynth,
        playTrack,
        togglePlayPause,
        seekTo,
        setVolume,
        nextTrack,
        prevTrack,
        closeMiniPlayer,
      }}
    >
      {children}

      {/* Persistent Bottom Floating Mini-Player Bar */}
      {isMiniPlayerVisible && (
        <div
          role="region"
          aria-label="Puratan Kirtan Mini-Player"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--accent-primary)",
            color: "var(--text-primary)",
          }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t-2 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md px-4 py-3 sm:px-6"
        >
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Track Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <span
                lang="pa"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#FFFFFF",
                }}
                className="h-10 w-10 rounded-xl font-gurmukhi text-base font-bold flex items-center justify-center shrink-0 shadow-sm"
              >
                {currentTrack.numeral}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.18em] truncate"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {currentTrack.raag}
                  </span>
                  {usingTantiSynth && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#C59B27]/40">
                      Tanti Saaj Drone
                    </span>
                  )}
                </div>
                <p className="text-sm font-serif font-bold truncate">
                  {currentTrack.title}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  {currentTrack.ragi}
                </p>
              </div>
            </div>

            {/* Playback & Seek Controls */}
            <div className="flex flex-1 max-w-xl flex-col gap-1.5">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={prevTrack}
                  aria-label="Previous Kirtan track"
                  className="px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs font-semibold hover:border-[#C59B27] transition"
                >
                  ⏮ Prev
                </button>
                <button
                  type="button"
                  onClick={togglePlayPause}
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "#FFFFFF",
                  }}
                  className="px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-110 transition"
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play Kirtan"}
                </button>
                <button
                  type="button"
                  onClick={nextTrack}
                  aria-label="Next Kirtan track"
                  className="px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs font-semibold hover:border-[#C59B27] transition"
                >
                  Next ⏭
                </button>
              </div>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="tabular-nums w-10 text-right">
                  {formatAudioTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 300}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Seek audio position"
                  className="flex-1 accent-[#C59B27] cursor-pointer h-1.5 rounded-lg"
                />
                <span className="tabular-nums w-10">
                  {formatAudioTime(duration)}
                </span>
              </div>
            </div>

            {/* Volume, Full Darbar Link & Close */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-[11px] font-semibold">Vol</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Audio volume"
                  className="w-20 accent-[#C59B27] cursor-pointer h-1.5"
                />
              </div>
              <Link
                href="/granths"
                className="text-xs font-semibold underline hover:opacity-80"
                style={{ color: "var(--accent-primary)" }}
              >
                Raag Darbar →
              </Link>
              <button
                type="button"
                onClick={closeMiniPlayer}
                aria-label="Close mini-player"
                className="px-2 py-1 rounded-lg border border-[#C59B27]/35 text-xs hover:border-[#C59B27]"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </KirtanAudioContext.Provider>
  );
}
