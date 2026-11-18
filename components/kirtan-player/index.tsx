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

function formatBytes(bytes?: number): string | null {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function KirtanPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tracks, setTracks] = useState<DriveKirtanTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
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
      const res = await fetch("/api/kirtan-list");
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        configured?: boolean;
        tracks?: DriveKirtanTrack[];
        error?: string;
      } | null;

      if (!res.ok || !data) {
        setTracksError(data?.error || "Unable to load Google Drive Kirtan list.");
        return;
      }
      setConfigured(data.configured !== false);
      if (Array.isArray(data.tracks)) {
        setTracks(data.tracks);
      }
    } catch {
      setTracksError("Network error while loading Kirtan folder.");
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
        setPlaybackError("Could not stream track from Google Drive.");
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
      setPlaybackError("Stream error. Verify file sharing permissions on Google Drive.");
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
    <KirtanPlayerContext.Provider value={value}>
      {children}
      {activeTrack && <StickyDriveMiniPlayer />}
    </KirtanPlayerContext.Provider>
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

  return (
    <aside
      aria-label="Google Drive Kirtan Mini-Player"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-amber-400/50 bg-[#090d16]/95 text-[#f8fafc] shadow-2xl backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Info & Play/Pause */}
        <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause track" : "Play track"}
            className="h-10 w-10 rounded-xl bg-amber-400 text-[#090d16] font-extrabold text-sm flex items-center justify-center shrink-0 shadow hover:bg-amber-300 transition"
          >
            {isBuffering ? "•••" : isPlaying ? "⏸" : "▶"}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-serif font-bold text-white truncate">
              {activeTrack.title}
            </p>
            <p className="text-[11px] text-amber-300/90 truncate">
              {playbackError ? (
                <span className="text-red-300 font-semibold">{playbackError}</span>
              ) : (
                `🎙️ ${activeTrack.ragi} • Google Drive Kirtan`
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close Kirtan mini-player"
            className="md:hidden px-2 py-1 rounded-lg border border-white/20 text-xs text-slate-300 hover:text-white"
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
            className="px-2 py-1 rounded-lg border border-amber-400/35 text-xs text-amber-200 hover:border-amber-400 transition"
          >
            ⏮
          </button>

          <span className="text-[11px] font-mono tabular-nums text-slate-300 shrink-0 w-10 text-right">
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
            className="w-full accent-amber-400 cursor-pointer h-1.5"
          />

          <span className="text-[11px] font-mono tabular-nums text-slate-300 shrink-0 w-10">
            {formatPlayerTime(duration)}
          </span>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next track"
            className="px-2 py-1 rounded-lg border border-amber-400/35 text-xs text-amber-200 hover:border-amber-400 transition"
          >
            ⏭
          </button>
        </div>

        {/* Volume & Dismiss */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <span aria-hidden="true" className="text-xs text-amber-300">
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
            className="w-20 accent-amber-400 cursor-pointer h-1.5"
          />
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close Kirtan mini-player"
            className="px-2.5 py-1 rounded-lg border border-white/20 text-xs text-slate-300 hover:text-white hover:border-amber-400 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
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
    const unique = Array.from(new Set(tracks.map((t) => t.ragi))).filter(Boolean);
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
      aria-label="Google Drive Kirtan Auto-Sync Playlist"
      className="rounded-3xl border border-[#C59B27]/45 bg-[#121C15] text-[#FAF6EE] shadow-2xl overflow-hidden"
    >
      {/* Header + Filter Controls */}
      <div className="p-5 sm:p-6 border-b border-[#C59B27]/25 bg-[#1B2A20]/80 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#E5C158]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-Synced Google Drive Kirtan Folder
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FAF6EE]">
              Gurbani Kirtan Tracklist
            </h2>
            <p className="text-xs text-[#CBD5E1]">
              {configured
                ? `${tracks.length} audio track${tracks.length === 1 ? "" : "s"} synced automatically from Google Drive • Range-scrubbing enabled`
                : "Connect KIRTAN_DRIVE_FOLDER_ID & GOOGLE_DRIVE_API_KEY to auto-sync your MP3 folder."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshTracks()}
            disabled={loadingTracks}
            className="px-3 py-1.5 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold text-[#E5C158] hover:border-amber-400 transition disabled:opacity-50"
          >
            {loadingTracks ? "Syncing..." : "↻ Refresh Folder"}
          </button>
        </div>

        {/* Search & Ragi Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by Ragi or Shabad title..."
            aria-label="Filter Google Drive Kirtan tracks by Ragi or title"
            className="flex-1 rounded-xl border border-[#C59B27]/40 bg-[#090d16]/85 px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
          />
          {ragiOptions.length > 2 && (
            <select
              value={selectedRagi}
              onChange={(e) => setSelectedRagi(e.target.value)}
              aria-label="Filter by Ragi"
              className="rounded-xl border border-[#C59B27]/40 bg-[#090d16]/85 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              {ragiOptions.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "All Ragis" : r}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tracklist Body */}
      <div className="divide-y divide-white/10 max-h-[32rem] overflow-y-auto">
        {loadingTracks && tracks.length === 0 ? (
          <div className="p-5 space-y-3" aria-busy="true">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 animate-pulse py-1"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="h-9 w-9 rounded-xl bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-2/3 rounded bg-white/15" />
                    <div className="h-2.5 w-1/3 rounded bg-white/10" />
                  </div>
                </div>
                <span className="h-7 w-16 rounded-lg bg-amber-400/20" />
              </div>
            ))}
          </div>
        ) : tracksError ? (
          <div className="p-6 text-center space-y-2 text-xs text-amber-200">
            <p className="font-bold">Could not load Google Drive folder</p>
            <p className="text-slate-300">{tracksError}</p>
          </div>
        ) : !configured ? (
          <div className="p-6 text-center space-y-2 text-xs text-slate-300">
            <p className="font-serif text-sm font-bold text-amber-300">
              Google Drive Folder Ready to Connect
            </p>
            <p className="max-w-md mx-auto leading-relaxed">
              Add <code className="text-amber-200">KIRTAN_DRIVE_FOLDER_ID</code> and{" "}
              <code className="text-amber-200">GOOGLE_DRIVE_API_KEY</code> in your
              environment settings, then drop MP3s (e.g.{" "}
              <code className="text-amber-200">
                Bhai.Avtar.Singh--Asa.Di.Vaar.Part.01.mp3
              </code>
              ) into the public folder to auto-sync here.
            </p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-300">
            {tracks.length === 0
              ? "No audio files found in the Google Drive folder yet. Drop an MP3 into the folder and click Refresh."
              : "No tracks match your search filter."}
          </div>
        ) : (
          filteredTracks.map((track, idx) => {
            const isCurrent = activeTrack?.id === track.id;
            const isActivePlaying = isCurrent && isPlaying;
            const sizeLabel = formatBytes(track.size);

            return (
              <div
                key={track.id}
                className={`group px-4 sm:px-5 py-3 flex items-center justify-between gap-3 transition ${
                  isCurrent
                    ? "bg-[#1B2A20] border-l-4 border-l-amber-400"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => playTrack(track)}
                    aria-label={
                      isActivePlaying
                        ? `Pause ${track.title} by ${track.ragi}`
                        : `Play ${track.title} by ${track.ragi}`
                    }
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 text-xs font-extrabold transition ${
                      isActivePlaying
                        ? "bg-amber-400 text-[#090d16] border-amber-300"
                        : "bg-black/40 border-[#C59B27]/45 text-amber-300 hover:bg-amber-400 hover:text-[#090d16]"
                    }`}
                  >
                    {isCurrent && isBuffering ? (
                      "•••"
                    ) : isActivePlaying ? (
                      "⏸"
                    ) : (
                      "▶"
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => playTrack(track)}
                        className={`text-left font-serif text-sm sm:text-base font-bold truncate hover:underline ${
                          isCurrent ? "text-amber-300" : "text-[#FAF6EE]"
                        }`}
                      >
                        {track.title}
                      </button>
                    </div>
                    <p className="text-xs text-[#CBD5E1] truncate mt-0.5">
                      <span aria-hidden="true">🎙️ </span>
                      {track.ragi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {sizeLabel && (
                    <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
                      {sizeLabel}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => playTrack(track)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition ${
                      isActivePlaying
                        ? "bg-amber-400 text-[#090d16]"
                        : "border border-[#C59B27]/45 bg-black/35 text-[#E5C158] hover:border-amber-400"
                    }`}
                  >
                    {isActivePlaying ? "Pause" : "Play"}
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
