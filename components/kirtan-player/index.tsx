"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

export interface DriveKirtanTrack {
  id: string;
  title: string;
  ragi: string;
  streamUrl: string;
  source: "google-drive";
  size?: number;
  mimeType?: string;
}

interface KirtanPlayerContextValue {
  tracks: DriveKirtanTrack[];
  loadingTracks: boolean;
  configured: boolean;
  tracksError: string | null;
  activeTrack: DriveKirtanTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: DriveKirtanTrack) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  closePlayer: () => void;
  refreshTracks: () => Promise<void>;
}

const KirtanPlayerContext = createContext<KirtanPlayerContextValue | null>(null);

export const AUDIO_FOCUS_EVENT = "learnsikhi-audio-focus";

function formatPlayerTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function cleanDisplayTitle(raw: string): string {
  return raw
    .replace(/\.(mp3|m4a|wav|ogg|flac|aac|webm)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function EqualizerBars({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-end gap-[2.5px] h-3.5 w-4 shrink-0"
    >
      <span
        className={`w-[3px] rounded-full bg-amber-400 transition-all ${
          active ? "kirtan-eq-bar h-full" : "h-1.5 opacity-60"
        }`}
      />
      <span
        className={`w-[3px] rounded-full bg-amber-300 transition-all ${
          active ? "kirtan-eq-bar h-full" : "h-2.5 opacity-70"
        }`}
      />
      <span
        className={`w-[3px] rounded-full bg-amber-400 transition-all ${
          active ? "kirtan-eq-bar h-full" : "h-2 opacity-60"
        }`}
      />
    </span>
  );
}

export function KirtanPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tracks, setTracks] = useState<DriveKirtanTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  const [activeTrack, setActiveTrack] = useState<DriveKirtanTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef<DriveKirtanTrack[]>([]);
  const activeTrackRef = useRef<DriveKirtanTrack | null>(null);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  const refreshTracks = useCallback(async () => {
    setLoadingTracks(true);
    setTracksError(null);
    try {
      const res = await fetch("/api/kirtan-list", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        configured?: boolean;
        tracks?: DriveKirtanTrack[];
        error?: string;
      } | null;

      if (!res.ok || !data) {
        setConfigured(true);
        setTracksError(data?.error || "Unable to load Kirtan library.");
        return;
      }
      if (data.configured === false) {
        setConfigured(false);
        setTracks([]);
        return;
      }
      setConfigured(true);
      if (Array.isArray(data.tracks)) {
        setTracks(
          data.tracks.map((t) => ({
            ...t,
            title: cleanDisplayTitle(t.title),
          }))
        );
      }
    } catch {
      setConfigured(true);
      setTracksError("Network error while syncing Kirtan library.");
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  useEffect(() => {
    void refreshTracks();
  }, [refreshTracks]);

  const playTrack = useCallback((track: DriveKirtanTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(AUDIO_FOCUS_EVENT, { detail: { owner: "drive-kirtan" } })
      );
    }

    const isSame = activeTrackRef.current?.id === track.id;
    if (isSame && audio.src) {
      if (audio.paused) {
        setIsBuffering(true);
        setPlaybackError(null);
        void audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsBuffering(false);
            setPlaybackError("Playback was blocked or stream could not start.");
          });
      } else {
        audio.pause();
        setIsPlaying(false);
      }
      return;
    }

    setActiveTrack(track);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError(null);
    setIsBuffering(true);

    audio.pause();
    audio.src = track.streamUrl;
    audio.load();
    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
        setPlaybackError("Could not start audio stream.");
      });
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    const current = activeTrackRef.current;
    if (!audio || !current) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(AUDIO_FOCUS_EVENT, { detail: { owner: "drive-kirtan" } })
      );
    }

    if (!audio.src) {
      audio.src = current.streamUrl;
      audio.load();
    }

    setIsBuffering(true);
    setPlaybackError(null);
    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
        setPlaybackError("Unable to resume audio stream.");
      });
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    const maxVal =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : seconds;
    const clamped = Math.max(0, Math.min(seconds, maxVal));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const nextTrack = useCallback(() => {
    const list = tracksRef.current;
    const current = activeTrackRef.current;
    if (list.length === 0) return;
    const idx = current ? list.findIndex((t) => t.id === current.id) : -1;
    const next = list[(idx + 1) % list.length];
    if (next) playTrack(next);
  }, [playTrack]);

  const prevTrack = useCallback(() => {
    const list = tracksRef.current;
    const current = activeTrackRef.current;
    if (list.length === 0) return;
    const idx = current ? list.findIndex((t) => t.id === current.id) : 0;
    const prev = list[(idx - 1 + list.length) % list.length];
    if (prev) playTrack(prev);
  }, [playTrack]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setActiveTrack(null);
    setIsPlaying(false);
    setIsBuffering(false);
    setPlaybackError(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      const list = tracksRef.current;
      const cur = activeTrackRef.current;
      if (list.length > 1 && cur) {
        const idx = list.findIndex((t) => t.id === cur.id);
        if (idx !== -1 && idx + 1 < list.length) {
          playTrack(list[idx + 1]);
        }
      }
    };
    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setPlaybackError("Stream interrupted. Please try again.");
    };

    const onAudioFocus = (e: Event) => {
      const owner = (e as CustomEvent<{ owner?: string }>).detail?.owner;
      if (owner && owner !== "drive-kirtan" && !audio.paused) {
        audio.pause();
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("durationchange", onMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    window.addEventListener(AUDIO_FOCUS_EVENT, onAudioFocus);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("durationchange", onMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      window.removeEventListener(AUDIO_FOCUS_EVENT, onAudioFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playTrack]);

  const value = useMemo<KirtanPlayerContextValue>(
    () => ({
      tracks,
      loadingTracks,
      configured,
      tracksError,
      activeTrack,
      isPlaying,
      isBuffering,
      playbackError,
      currentTime,
      duration,
      volume,
      playTrack,
      togglePlayPause,
      seekTo,
      setVolume,
      nextTrack,
      prevTrack,
      closePlayer,
      refreshTracks,
    }),
    [
      tracks,
      loadingTracks,
      configured,
      tracksError,
      activeTrack,
      isPlaying,
      isBuffering,
      playbackError,
      currentTime,
      duration,
      volume,
      playTrack,
      togglePlayPause,
      seekTo,
      setVolume,
      nextTrack,
      prevTrack,
      closePlayer,
      refreshTracks,
    ]
  );

  return (
    <MotionConfig reducedMotion="user">
      <KirtanPlayerContext.Provider value={value}>
        {children}
        <span className="sr-only" aria-live="polite">
          {activeTrack
            ? `${isPlaying ? "Playing" : "Paused"}: ${activeTrack.title} by ${activeTrack.ragi}`
            : ""}
        </span>
        <AnimatePresence>
          {activeTrack && <StickyDriveMiniPlayer key="drive-mini-player" />}
        </AnimatePresence>
      </KirtanPlayerContext.Provider>
    </MotionConfig>
  );
}

export function useKirtanPlayer(): KirtanPlayerContextValue {
  const ctx = useContext(KirtanPlayerContext);
  if (!ctx) {
    throw new Error("useKirtanPlayer must be used within a KirtanPlayerProvider");
  }
  return ctx;
}

export function useKirtanPlayerOptional(): KirtanPlayerContextValue | null {
  return useContext(KirtanPlayerContext);
}

function StickyDriveMiniPlayer() {
  const {
    activeTrack,
    isPlaying,
    isBuffering,
    playbackError,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seekTo,
    setVolume,
    nextTrack,
    prevTrack,
    closePlayer,
  } = useKirtanPlayer();

  if (!activeTrack) return null;

  const progressPct =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <motion.aside
      initial={{ y: 84, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 84, opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform, opacity" }}
      aria-label="Kirtan Now Playing Bar"
      onKeyDown={(e) => {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.code === "Space") {
          e.preventDefault();
          togglePlayPause();
        } else if (e.code === "ArrowRight") {
          e.preventDefault();
          seekTo(currentTime + 10);
        } else if (e.code === "ArrowLeft") {
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 10));
        }
      }}
      className="dark-surface sanctuary-glass fixed bottom-0 inset-x-0 z-40 border-t border-amber-400/45 bg-gradient-to-r from-[#111914]/96 via-[#161f18]/96 to-[#0d131d]/96 text-amber-50 shadow-2xl"
    >
      {/* Subtle top progress shimmer bar */}
      <div className="h-[2px] w-full bg-white/10 overflow-hidden">
        <div
          style={{
            transform: `scaleX(${progressPct / 100})`,
            transformOrigin: "left center",
          }}
          className="h-full w-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 transition-transform duration-150"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Info & Play/Pause */}
        <div className="flex items-center gap-3.5 min-w-0 w-full md:w-auto md:max-w-xs lg:max-w-sm">
          <button
            type="button"
            onClick={togglePlayPause}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className="sanctuary-interactive h-11 w-11 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md hover:brightness-105"
          >
            {isBuffering ? "•••" : isPlaying ? "⏸" : "▶"}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <EqualizerBars active={isPlaying && !isBuffering} />
              <p className="text-sm font-serif font-bold text-white truncate">
                {cleanDisplayTitle(activeTrack.title)}
              </p>
            </div>
            <p className="text-xs text-amber-200/90 truncate mt-0.5">
              {playbackError ? (
                <span role="alert" className="text-red-300 font-semibold">
                  {playbackError}
                </span>
              ) : (
                activeTrack.ragi
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close Kirtan mini-player"
            className="md:hidden h-8 w-8 rounded-full border border-white/25 text-xs text-zinc-200 hover:text-white flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Transport & Scrubbable Progress Bar */}
        <div className="flex items-center gap-2.5 w-full md:max-w-lg">
          <button
            type="button"
            onClick={prevTrack}
            aria-label="Previous track"
            className="sanctuary-interactive h-8 w-8 rounded-full border border-amber-300/40 bg-white/5 text-xs text-amber-200 hover:border-amber-300 flex items-center justify-center shrink-0"
          >
            ⏮
          </button>

          <span className="text-[11px] font-mono tabular-nums text-zinc-200 shrink-0 w-10 text-right">
            {formatPlayerTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={1}
            value={duration > 0 ? Math.min(currentTime, duration) : 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek track position"
            aria-valuetext={`${formatPlayerTime(currentTime)} of ${formatPlayerTime(duration)}`}
            className="w-full accent-amber-400 cursor-pointer h-1.5"
          />

          <span className="text-[11px] font-mono tabular-nums text-zinc-200 shrink-0 w-10">
            {formatPlayerTime(duration)}
          </span>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next track"
            className="sanctuary-interactive h-8 w-8 rounded-full border border-amber-300/40 bg-white/5 text-xs text-amber-200 hover:border-amber-300 flex items-center justify-center shrink-0"
          >
            ⏭
          </button>
        </div>

        {/* Volume & Dismiss */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span aria-hidden="true" className="text-xs text-amber-200">
            🔊
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Playback volume"
            aria-valuetext={`${Math.round(volume * 100)} percent`}
            className="w-20 accent-amber-400 cursor-pointer h-1.5"
          />
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close Kirtan mini-player"
            className="sanctuary-interactive h-8 w-8 rounded-full border border-white/25 bg-white/5 text-xs text-zinc-200 hover:text-white hover:border-amber-300 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export function GoogleDriveKirtanTracklist() {
  const {
    tracks,
    loadingTracks,
    configured,
    tracksError,
    activeTrack,
    isPlaying,
    isBuffering,
    playTrack,
    refreshTracks,
  } = useKirtanPlayer();

  const [query, setQuery] = useState("");
  const [selectedRagi, setSelectedRagi] = useState<string>("All");

  const ragiOptions = useMemo(() => {
    const unique = Array.from(new Set(tracks.map((t) => t.ragi))).filter(
      Boolean
    );
    return ["All", ...unique];
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesRagi = selectedRagi === "All" || track.ragi === selectedRagi;
      if (!matchesRagi) return false;
      if (!q) return true;
      return (
        track.title.toLowerCase().includes(q) ||
        track.ragi.toLowerCase().includes(q)
      );
    });
  }, [tracks, query, selectedRagi]);

  return (
    <section
      aria-label="Gurbani Kirtan Streaming Player"
      className="dark-surface sanctuary-glass rounded-[var(--radius-card)] border border-amber-400/35 bg-gradient-to-br from-[#17241c] via-[#111a15] to-[#0c121a] text-amber-50 shadow-2xl overflow-hidden"
    >
      {/* Header + Search + Ragi Pills */}
      <div className="p-5 sm:p-6 border-b border-amber-400/20 bg-gradient-to-r from-[#1d2d22]/90 via-[#18251d]/85 to-[#141c24]/90 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
              <EqualizerBars active={isPlaying} />
              <span>Gurbani Kirtan Radio</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-50">
              Sacred Kirtan Stream
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              {configured
                ? `${tracks.length} Shabad${tracks.length === 1 ? "" : "s"} ready for uninterrupted listening`
                : "Connect your Kirtan archive to stream Shabads seamlessly."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshTracks()}
            disabled={loadingTracks}
            aria-label="Refresh Kirtan library"
            className="sanctuary-interactive rounded-full border border-amber-300/50 bg-black/40 px-3.5 py-1.5 text-xs font-bold text-amber-200/90 hover:text-amber-100 hover:border-amber-300 disabled:opacity-50"
          >
            {loadingTracks ? "Syncing…" : "↻ Sync Library"}
          </button>
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Shabad title or Ragi…"
            aria-label="Search Kirtan tracks by Ragi or Shabad title"
            className="dark-input flex-1 rounded-2xl border border-amber-400/35 bg-black/45 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-400 focus:border-amber-300"
          />
          {ragiOptions.length > 6 && (
            <select
              value={selectedRagi}
              onChange={(e) => setSelectedRagi(e.target.value)}
              aria-label="Filter by Ragi"
              className="dark-input rounded-2xl border border-amber-400/35 bg-black/45 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-amber-300"
            >
              {ragiOptions.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "All Ragis" : r}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Shared-element sliding Ragi filter pills (when 2–6 Ragis) */}
        {ragiOptions.length > 2 && ragiOptions.length <= 6 && (
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="tablist"
            aria-label="Filter Kirtan by Ragi"
          >
            {ragiOptions.map((ragi) => {
              const active = selectedRagi === ragi;
              return (
                <button
                  key={ragi}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedRagi(ragi)}
                  className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "text-zinc-950"
                      : "text-zinc-200 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="kirtan-ragi-active-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                    />
                  )}
                  <span className="relative z-10">
                    {ragi === "All" ? "All Ragis" : ragi}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Streaming Tracklist Body (stable min-height prevents CLS) */}
      <div className="divide-y divide-white/[0.08] min-h-[14rem] max-h-[32rem] overflow-y-auto">
        {loadingTracks && tracks.length === 0 ? (
          <div className="p-5 space-y-3" aria-busy="true">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 animate-pulse py-1.5"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <span className="h-10 w-10 rounded-full bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-2/3 rounded bg-white/15" />
                    <div className="h-2.5 w-1/3 rounded bg-white/10" />
                  </div>
                </div>
                <span className="h-8 w-16 rounded-full bg-amber-400/20" />
              </div>
            ))}
          </div>
        ) : tracksError ? (
          <div className="p-6 text-center space-y-2 text-xs text-amber-200">
            <p className="font-bold text-amber-100">Could not load Kirtan stream</p>
            <p className="text-zinc-300">{tracksError}</p>
          </div>
        ) : !configured ? (
          <div className="p-6 text-center space-y-2 text-xs text-zinc-300">
            <p className="font-serif text-sm font-bold text-amber-200">
              Kirtan Archive Ready to Connect
            </p>
            <p className="max-w-md mx-auto leading-relaxed text-zinc-300">
              Add <code className="text-amber-200">KIRTAN_DRIVE_FOLDER_ID</code>{" "}
              and <code className="text-amber-200">GOOGLE_DRIVE_API_KEY</code>{" "}
              in your environment settings to auto-sync your Kirtan collection.
            </p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-300">
            {tracks.length === 0
              ? "No Shabads are synced in this library yet. Click Sync Library after adding tracks."
              : "No Shabads match your search filter."}
          </div>
        ) : (
          filteredTracks.map((track, idx) => {
            const isCurrent = activeTrack?.id === track.id;
            const isActivePlaying = isCurrent && isPlaying;
            const displayTitle = cleanDisplayTitle(track.title);

            return (
              <div
                key={track.id}
                className={`tracklist-row group px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 transition-all duration-150 ${
                  isCurrent
                    ? "bg-gradient-to-r from-amber-400/20 via-[#1d2e23]/90 to-transparent border-l-4 border-l-amber-300"
                    : "hover:bg-white/[0.06] hover:-translate-y-[1px]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => playTrack(track)}
                    aria-pressed={isActivePlaying}
                    aria-label={
                      isActivePlaying
                        ? `Pause ${displayTitle} by ${track.ragi}`
                        : `Play ${displayTitle} by ${track.ragi}`
                    }
                    className={`sanctuary-interactive h-10 w-10 rounded-full border flex items-center justify-center shrink-0 text-xs font-extrabold transition ${
                      isActivePlaying
                        ? "bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 border-amber-200 shadow-md"
                        : "bg-black/40 border-amber-300/45 text-amber-200 group-hover:bg-amber-300 group-hover:text-zinc-950 group-hover:border-amber-200"
                    }`}
                  >
                    {isCurrent && isBuffering
                      ? "•••"
                      : isActivePlaying
                        ? "⏸"
                        : "▶"}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      {isCurrent ? (
                        <EqualizerBars active={isActivePlaying && !isBuffering} />
                      ) : (
                        <span className="text-[11px] font-mono tabular-nums text-zinc-400 shrink-0 w-4">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => playTrack(track)}
                        className={`text-left font-serif text-sm sm:text-base font-bold truncate hover:underline ${
                          isCurrent ? "text-amber-200" : "text-white"
                        }`}
                      >
                        {displayTitle}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 truncate mt-0.5 pl-6">
                      {track.ragi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => playTrack(track)}
                    className={`sanctuary-interactive rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                      isActivePlaying
                        ? "bg-gradient-to-r from-amber-300 to-amber-500 text-zinc-950"
                        : "border border-amber-300/45 bg-black/35 text-amber-200/90 hover:text-amber-100 hover:border-amber-300 hover:bg-amber-400/15"
                    }`}
                  >
                    {isActivePlaying ? "Playing" : isCurrent ? "Resume" : "Play"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
