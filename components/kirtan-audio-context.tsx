"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCmsSiteState } from "@/components/editable-heritage-image";

export type KirtanCollectionCategory =
  | "Live 24/7 Gurdwara Broadcasts"
  | "Verified Local & Approved Audio"
  | "Puratan Kirtan Masters"
  | "Complete Nitnem & Sacred Bani"
  | "Puratan Katha & Vichaar"
  | "Background Raag Instrumentals";

export type KirtanTrack = {
  id: string;
  numeral: string;
  category: KirtanCollectionCategory;
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
  directArchiveMp3Url: string;
  archiveEmbedUrl: string;
  externalArchiveUrl: string;
  raagNotes: string;
  historicalContext: string;
  isLiveStream?: boolean;
  isCustomOrLocal?: boolean;
  locationLabel?: string;
};

export type KirtanSubmissionStatus = "pending_review" | "approved" | "rejected";

export type KirtanSubmission = {
  id: string;
  title: string;
  gurmukhiTitle: string;
  ragi: string;
  raag: string;
  category: KirtanCollectionCategory;
  sourceUrl: string;
  authenticityNotes: string;
  submittedBy: string;
  status: KirtanSubmissionStatus;
  createdAt: string;
};

/**
 * Strictly verified working streams:
 * Only the official SGPC 24/7 Sri Harmandir Sahib (Darbar Sahib), Amritsar stream
 * is included by default alongside any local files in `public/audio/` and
 * tracks explicitly verified and approved in the Admin Review Queue.
 */
export const LIVE_GURDWARA_STREAMS: KirtanTrack[] = [];

export const PURATAN_KIRTAN_TRACKS: KirtanTrack[] = [];

const INITIAL_SUBMISSIONS_SEED: KirtanSubmission[] = [];

const SUBMISSIONS_STORAGE_KEY = "learnsikhi_kirtan_submissions_v1";
const REQUESTS_STORAGE_KEY = "learn_sikhi_kirtan_requests_v1";

export function parseLocalAudioFilename(filename: string): {
  ragi: string;
  title: string;
} {
  const withoutExt = filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ").trim();
  const sepMatch = withoutExt.match(/^(.+?)\s*(?:-|—|–)\s*(.+)$/);
  if (sepMatch) {
    return {
      ragi: sepMatch[1].trim() || "Local Audio File",
      title: sepMatch[2].trim() || withoutExt,
    };
  }
  return {
    ragi: "Local Audio File",
    title: withoutExt || "Local Shabad Recording",
  };
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function buildProxiedAudioUrl(sourceUrl: string): string {
  const trimmed = sourceUrl.trim();
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === "gurmatveechar.com" ||
      host.endsWith(".gurmatveechar.com") ||
      host === "archive.org" ||
      host.endsWith(".archive.org") ||
      host === "live.sgpc.net" ||
      host.endsWith(".sgpc.net")
    ) {
      return `/api/audio-proxy?url=${encodeURIComponent(trimmed)}`;
    }
  } catch {
    // Fallback to raw URL
  }
  return trimmed;
}

function submissionToTrack(sub: KirtanSubmission, index: number): KirtanTrack {
  const gurmukhiDigits = ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"];
  const numeral =
    String(index + 2)
      .split("")
      .map((d) => gurmukhiDigits[Number(d)] || d)
      .join("") || "੨";

  const proxiedUrl = buildProxiedAudioUrl(sub.sourceUrl);

  return {
    id: `approved-${sub.id}`,
    numeral,
    category: sub.category || "Verified Local & Approved Audio",
    title: sub.title,
    gurmukhiTitle: sub.gurmukhiTitle || "ਪ੍ਰਮਾਣਿਤ ਗੁਰਮਤਿ ਸੰਗੀਤ",
    ragi: sub.ragi,
    raag: sub.raag || "Admin-Verified Recording",
    angCitation: "ADMIN VERIFIED • SANGAT SUBMISSION",
    tantiSaaj: "Verified Kirtan / Bani Recording",
    timeOfDay: "All Pehars",
    durationLabel: "Verified Audio",
    durationSec: 0,
    audioUrl: proxiedUrl,
    directArchiveMp3Url: sub.sourceUrl,
    archiveEmbedUrl: sub.sourceUrl,
    externalArchiveUrl: sub.sourceUrl,
    raagNotes: sub.authenticityNotes,
    historicalContext: `Submitted by ${sub.submittedBy} and verified by Learn Sikhi Admin Review Queue.`,
    isCustomOrLocal: true,
  };
}

type KirtanAudioContextValue = {
  tracks: KirtanTrack[];
  liveStreams: KirtanTrack[];
  instrumentalTracks: KirtanTrack[];
  localAudioTracks: KirtanTrack[];
  submissions: KirtanSubmission[];
  pendingSubmissionsCount: number;
  currentTrack: KirtanTrack;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  audioError: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isReadingVolumePreset: boolean;
  playerMode: "native" | "embed";
  isMinimized: boolean;
  isMiniPlayerVisible: boolean;
  isCustomModalOpen: boolean;
  playTrack: (track: KirtanTrack) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleReadingVolumePreset: () => void;
  startReadingInstrumental: (trackId?: string) => void;
  setPlayerMode: (mode: "native" | "embed") => void;
  setIsMinimized: (val: boolean) => void;
  setIsCustomModalOpen: (val: boolean) => void;
  submitTrackForReview: (input: {
    title: string;
    gurmukhiTitle?: string;
    ragi: string;
    raag: string;
    category?: KirtanCollectionCategory;
    sourceUrl: string;
    authenticityNotes: string;
    submittedBy?: string;
  }) => Promise<void>;
  approveSubmission: (id: string) => void;
  rejectSubmission: (id: string) => void;
  addLocalAudioFiles: (files: FileList | File[]) => KirtanTrack[];
  showRequestToast: (msg: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
};

const KirtanAudioContext = createContext<KirtanAudioContextValue | null>(null);

export function KirtanAudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cms = useCmsSiteState();
  const [localAudioTracks, setLocalAudioTracks] = useState<KirtanTrack[]>([]);
  const [submissions, setSubmissions] = useState<KirtanSubmission[]>(
    INITIAL_SUBMISSIONS_SEED
  );
  const [requestToast, setRequestToast] = useState<string | null>(null);

  const [currentTrack, setCurrentTrack] = useState<KirtanTrack>(
    LIVE_GURDWARA_STREAMS[0]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasActivatedPlayer, setHasActivatedPlayer] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isReadingVolumePreset, setIsReadingVolumePreset] = useState(false);
  const [playerMode, setPlayerMode] = useState<"native" | "embed">("native");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Auto-discover verified local MP3 files dropped into public/audio/
  useEffect(() => {
    let active = true;
    fetch("/api/local-audio")
      .then((res) => res.json())
      .then((data) => {
        if (!active || !Array.isArray(data?.tracks)) return;
        const mapped: KirtanTrack[] = data.tracks.map(
          (item: {
            id: string;
            numeral: string;
            category: KirtanCollectionCategory;
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
            directArchiveMp3Url: string;
            archiveEmbedUrl: string;
            externalArchiveUrl: string;
            raagNotes: string;
            historicalContext: string;
          }) => ({
            ...item,
            isCustomOrLocal: true,
          })
        );
        setLocalAudioTracks(mapped);
      })
      .catch(() => {
        // Ignore if no local audio directory
      });
    return () => {
      active = false;
    };
  }, []);

  // 2. Load Kirtan Submissions from localStorage + Supabase
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubmissions(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase
        .from("kirtan_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            const remoteMapped: KirtanSubmission[] = data.map(
              (row: Record<string, unknown>) => ({
                id: String(row.id),
                title: String(row.title || ""),
                gurmukhiTitle: String(row.gurmukhi_title || ""),
                ragi: String(row.ragi || ""),
                raag: String(row.raag || ""),
                category:
                  (row.category as KirtanCollectionCategory) ||
                  "Puratan Kirtan Masters",
                sourceUrl: String(row.source_url || ""),
                authenticityNotes: String(row.authenticity_notes || ""),
                submittedBy: String(row.submitted_by || "Sangat Member"),
                status:
                  (row.status as KirtanSubmissionStatus) || "pending_review",
                createdAt: String(
                  row.created_at || new Date().toISOString()
                ),
              })
            );
            setSubmissions((prev) => {
              const existingIds = new Set(remoteMapped.map((r) => r.id));
              return [
                ...remoteMapped,
                ...prev.filter((p) => !existingIds.has(p.id)),
              ];
            });
          }
        });
    }
  }, []);

  const persistSubmissions = useCallback((nextList: KirtanSubmission[]) => {
    setSubmissions(nextList);
    try {
      window.localStorage.setItem(
        SUBMISSIONS_STORAGE_KEY,
        JSON.stringify(nextList)
      );
    } catch {
      // Ignore quota errors
    }
  }, []);

  const cmsUploadedTracks = useMemo<KirtanTrack[]>(() => {
    const raw = Array.isArray(cms.kirtanTracks) ? cms.kirtanTracks : [];
    const deleted = new Set(cms.deletedIds || []);
    const archived = new Set(cms.archivedIds || []);
    const gurmukhiDigits = ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"];
    return raw
      .filter((t) => t && t.id && !deleted.has(t.id) && !archived.has(t.id))
      .map((rt, idx) => {
        const numeral =
          String(idx + 2)
            .split("")
            .map((d) => gurmukhiDigits[Number(d)] || d)
            .join("") || "੨";
        const proxiedUrl = buildProxiedAudioUrl(rt.sourceUrl);
        return {
          id: rt.id,
          numeral,
          category: "Verified Local & Approved Audio",
          title: rt.title,
          gurmukhiTitle: rt.gurmukhi || "ਗੁਰਬਾਣੀ ਕੀਰਤਨ",
          ragi: rt.ragi || "Hazoori Ragi Jatha",
          raag: rt.raag || "Puratan Raag Kirtan",
          angCitation: "SUPABASE AUDIO • VERIFIED KIRTAN",
          tantiSaaj: rt.pehar || "All Pehars",
          timeOfDay: rt.pehar || "All Pehars",
          durationLabel: rt.duration || "Kirtan",
          durationSec: 0,
          audioUrl: proxiedUrl,
          directArchiveMp3Url: rt.sourceUrl,
          archiveEmbedUrl: rt.sourceUrl,
          externalArchiveUrl: rt.sourceUrl,
          raagNotes: `Streamed directly from Learn Sikhi Kirtan Sanctuary (${rt.raag || "Gurmat Sangeet"}).`,
          historicalContext: `Curated by ${rt.ragi || "Hazoori Ragi Jatha"}.`,
          isCustomOrLocal: true,
        };
      });
  }, [cms.kirtanTracks, cms.deletedIds, cms.archivedIds]);

  const approvedTracks = useMemo(
    () =>
      submissions
        .filter((s) => s.status === "approved")
        .map((s, idx) => submissionToTrack(s, idx)),
    [submissions]
  );

  const allTracks = useMemo(
    () => [
      ...LIVE_GURDWARA_STREAMS,
      ...cmsUploadedTracks,
      ...localAudioTracks,
      ...approvedTracks,
    ],
    [cmsUploadedTracks, localAudioTracks, approvedTracks]
  );

  const instrumentalTracks = useMemo(
    () =>
      allTracks.filter((t) => t.category === "Background Raag Instrumentals"),
    [allTracks]
  );

  const pendingSubmissionsCount = useMemo(
    () => submissions.filter((s) => s.status === "pending_review").length,
    [submissions]
  );

  // Initialize HTML5 <audio> element (strictly real streams/files, zero oscillator tone)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoadingAudio(false);
      setAudioError(null);
    };
    const onWaiting = () => setIsLoadingAudio(true);
    const onPlaying = () => {
      setIsLoadingAudio(false);
      setIsPlaying(true);
      setAudioError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setAudioError(
        "Direct stream could not be reached. Use the SGPC Live Theater view or verify the audio URL."
      );
    };

    const onAudioFocus = (e: Event) => {
      const owner = (e as CustomEvent<{ owner?: string }>).detail?.owner;
      if (owner && owner !== "sanctuary-kirtan") {
        audio.pause();
        setIsPlaying(false);
        setHasActivatedPlayer(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    window.addEventListener("learnsikhi-audio-focus", onAudioFocus);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      window.removeEventListener("learnsikhi-audio-focus", onAudioFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAndPlayTrack = useCallback((track: KirtanTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("learnsikhi-audio-focus", {
          detail: { owner: "sanctuary-kirtan" },
        })
      );
    }

    setAudioError(null);
    setIsLoadingAudio(true);
    audio.pause();
    audio.src = track.audioUrl;
    audio.load();

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      })
      .catch(() => {
        if (
          track.directArchiveMp3Url &&
          audio.src !== track.directArchiveMp3Url
        ) {
          audio.src = track.directArchiveMp3Url;
          audio.load();
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoadingAudio(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setIsLoadingAudio(false);
              setAudioError(
                "Stream blocked by browser or unreachable. Try opening the official SGPC stream link."
              );
            });
        } else {
          setIsPlaying(false);
          setIsLoadingAudio(false);
          setAudioError(
            "Stream blocked by browser or unreachable. Try opening the official SGPC stream link."
          );
        }
      });
  }, []);

  const playTrack = useCallback(
    (track: KirtanTrack) => {
      setHasActivatedPlayer(true);
      setIsMinimized(false);
      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(track.durationSec || 0);
      loadAndPlayTrack(track);
    },
    [loadAndPlayTrack]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setHasActivatedPlayer(true);
      if (!audio.src) {
        loadAndPlayTrack(currentTrack);
      } else {
        setIsLoadingAudio(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
          })
          .catch(() => {
            loadAndPlayTrack(currentTrack);
          });
      }
    }
  }, [currentTrack, isPlaying, loadAndPlayTrack]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    try {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    } catch {
      // Live streams do not support seeking
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsReadingVolumePreset(Math.abs(clamped - 0.25) < 0.02);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleReadingVolumePreset = useCallback(() => {
    if (isReadingVolumePreset) {
      setVolume(0.8);
      setIsReadingVolumePreset(false);
    } else {
      setVolume(0.25);
      setIsReadingVolumePreset(true);
    }
  }, [isReadingVolumePreset, setVolume]);

  const showRequestToast = useCallback((msg: string) => {
    setRequestToast(msg);
    window.setTimeout(() => {
      setRequestToast((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  const addLocalAudioFiles = useCallback(
    (files: FileList | File[]): KirtanTrack[] => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return [];

      const created: KirtanTrack[] = fileArray.map((file, idx) => {
        const objectUrl = URL.createObjectURL(file);
        const { ragi, title } = parseLocalAudioFilename(file.name);
        return {
          id: `local-file-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          numeral: "੧",
          category: "Verified Local & Approved Audio",
          title,
          gurmukhiTitle: "ਲੋਕਲ ਗੁਰਮਤਿ ਕੀਰਤਨ ਫ਼ਾਈਲ",
          ragi,
          raag: "Local MP3 Recording",
          angCitation: "LOCAL FILE • BROWSER SESSION",
          tantiSaaj: "User / Admin Local Audio",
          timeOfDay: "All Pehars",
          durationLabel: "Local Audio",
          durationSec: 0,
          audioUrl: objectUrl,
          directArchiveMp3Url: objectUrl,
          archiveEmbedUrl: objectUrl,
          externalArchiveUrl: objectUrl,
          raagNotes: `Playing local file "${file.name}" directly in browser.`,
          historicalContext: "Loaded locally via File API (URL.createObjectURL).",
          isCustomOrLocal: true,
        };
      });

      setLocalAudioTracks((prev) => [...created, ...prev]);
      playTrack(created[0]);
      return created;
    },
    [playTrack]
  );

  const startReadingInstrumental = useCallback(
    (trackId?: string) => {
      setVolume(0.25);
      setIsReadingVolumePreset(true);
      const target =
        (trackId ? allTracks.find((t) => t.id === trackId) : undefined) ||
        instrumentalTracks[0] ||
        LIVE_GURDWARA_STREAMS[0];
      playTrack(target);
    },
    [allTracks, instrumentalTracks, playTrack, setVolume]
  );

  const submitTrackForReview = useCallback(
    async (input: {
      title: string;
      gurmukhiTitle?: string;
      ragi: string;
      raag: string;
      category?: KirtanCollectionCategory;
      sourceUrl: string;
      authenticityNotes: string;
      submittedBy?: string;
    }) => {
      const newSub: KirtanSubmission = {
        id: `sub-${Date.now()}`,
        title: input.title.trim(),
        gurmukhiTitle:
          input.gurmukhiTitle?.trim() || "ਸੰਗਤ ਵੱਲੋਂ ਭੇਜੀ ਗਈ ਬਾਣੀ / ਕੀਰਤਨ",
        ragi: input.ragi.trim() || "Sangat Submission",
        raag: input.raag.trim() || "Gurmat Kirtan / Bani",
        category: input.category || "Puratan Kirtan Masters",
        sourceUrl: input.sourceUrl.trim(),
        authenticityNotes:
          input.authenticityNotes.trim() ||
          "Submitted for admin audio verification.",
        submittedBy: input.submittedBy?.trim() || "Sangat Member",
        status: "pending_review",
        createdAt: new Date().toISOString(),
      };

      persistSubmissions([newSub, ...submissions]);

      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        try {
          await supabase.from("kirtan_submissions").insert({
            title: newSub.title,
            gurmukhi_title: newSub.gurmukhiTitle,
            ragi: newSub.ragi,
            raag: newSub.raag,
            category: newSub.category,
            source_url: newSub.sourceUrl,
            authenticity_notes: newSub.authenticityNotes,
            submitted_by: newSub.submittedBy,
            status: "pending_review",
          });
        } catch {
          // LocalStorage fallback already saved
        }
      }
    },
    [persistSubmissions, submissions]
  );

  const approveSubmission = useCallback(
    (id: string) => {
      const updated = submissions.map((s) =>
        s.id === id ? { ...s, status: "approved" as const } : s
      );
      persistSubmissions(updated);

      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        void supabase
          .from("kirtan_submissions")
          .update({ status: "approved" })
          .eq("id", id);
      }
    },
    [persistSubmissions, submissions]
  );

  const rejectSubmission = useCallback(
    (id: string) => {
      const updated = submissions.map((s) =>
        s.id === id ? { ...s, status: "rejected" as const } : s
      );
      persistSubmissions(updated);

      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        void supabase
          .from("kirtan_submissions")
          .update({ status: "rejected" })
          .eq("id", id);
      }
    },
    [persistSubmissions, submissions]
  );

  const nextTrack = useCallback(() => {
    if (allTracks.length === 0) return;
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    const next = allTracks[(idx + 1) % allTracks.length];
    playTrack(next);
  }, [allTracks, currentTrack.id, playTrack]);

  const prevTrack = useCallback(() => {
    if (allTracks.length === 0) return;
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    const prev = allTracks[(idx - 1 + allTracks.length) % allTracks.length];
    playTrack(prev);
  }, [allTracks, currentTrack.id, playTrack]);

  const value = useMemo(
    () => ({
      tracks: allTracks,
      liveStreams: LIVE_GURDWARA_STREAMS,
      instrumentalTracks,
      localAudioTracks,
      submissions,
      pendingSubmissionsCount,
      currentTrack,
      isPlaying,
      isLoadingAudio,
      audioError,
      currentTime,
      duration,
      volume,
      isReadingVolumePreset,
      playerMode,
      isMinimized,
      isMiniPlayerVisible: (hasActivatedPlayer || isPlaying) && !isMinimized,
      isCustomModalOpen,
      playTrack,
      togglePlayPause,
      seekTo,
      setVolume,
      toggleReadingVolumePreset,
      startReadingInstrumental,
      setPlayerMode,
      setIsMinimized,
      setIsCustomModalOpen,
      submitTrackForReview,
      approveSubmission,
      rejectSubmission,
      addLocalAudioFiles,
      showRequestToast,
      nextTrack,
      prevTrack,
    }),
    [
      allTracks,
      instrumentalTracks,
      localAudioTracks,
      submissions,
      pendingSubmissionsCount,
      currentTrack,
      isPlaying,
      isLoadingAudio,
      audioError,
      currentTime,
      duration,
      volume,
      isReadingVolumePreset,
      playerMode,
      isMinimized,
      hasActivatedPlayer,
      isCustomModalOpen,
      playTrack,
      togglePlayPause,
      seekTo,
      setVolume,
      toggleReadingVolumePreset,
      startReadingInstrumental,
      submitTrackForReview,
      approveSubmission,
      rejectSubmission,
      addLocalAudioFiles,
      showRequestToast,
      nextTrack,
      prevTrack,
    ]
  );

  return (
    <KirtanAudioContext.Provider value={value}>
      {children}
      {(hasActivatedPlayer || isPlaying) && <GlobalKirtanMiniPlayer />}
      <SuggestKirtanModal />
      {requestToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 z-[60] max-w-sm rounded-2xl border-2 border-[#C59B27] bg-[#1B2A20] px-4 py-3 text-xs font-semibold text-[#FAF6EE] shadow-2xl"
        >
          ✓ {requestToast}
        </div>
      )}
    </KirtanAudioContext.Provider>
  );
}

export function useKirtanAudio() {
  const ctx = useContext(KirtanAudioContext);
  if (!ctx) {
    throw new Error("useKirtanAudio must be used within a KirtanAudioProvider");
  }
  return ctx;
}

/**
 * Modal allowing users to submit a Kirtan or Bani track for Admin Review
 * before it goes live on the site.
 */
function SuggestKirtanModal() {
  const {
    isCustomModalOpen,
    setIsCustomModalOpen,
    submitTrackForReview,
    addLocalAudioFiles,
    showRequestToast,
  } = useKirtanAudio();

  const [shabadOrRagi, setShabadOrRagi] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!isCustomModalOpen) return null;

  const handleClose = () => {
    setFormError(null);
    setIsCustomModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTitle =
      shabadOrRagi.trim() ||
      (selectedFile ? parseLocalAudioFilename(selectedFile.name).title : "");
    const cleanedUrl = sourceUrl.trim();

    if (!cleanedTitle && !selectedFile && !cleanedUrl) {
      setFormError("Please enter a Shabad / Raagi name, attach an audio file, or paste a link.");
      return;
    }

    const requestRecord = {
      id: `req-${Date.now()}`,
      shabadOrRagi: cleanedTitle || "Shabad Request",
      sourceUrl: cleanedUrl || (selectedFile ? `local-file://${selectedFile.name}` : ""),
      fileName: selectedFile?.name || null,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const existingRaw = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const nextList = Array.isArray(existing)
        ? [requestRecord, ...existing]
        : [requestRecord];
      window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(nextList));
    } catch {
      // Ignore storage quota errors
    }

    if (selectedFile) {
      addLocalAudioFiles([selectedFile]);
    } else if (cleanedUrl) {
      await submitTrackForReview({
        title: cleanedTitle || "Suggested Shabad",
        ragi: "Sangat Request",
        raag: "Gurmat Kirtan",
        sourceUrl: cleanedUrl,
        authenticityNotes: notes.trim() || "Suggested via Shabad Request modal.",
      });
    }

    setShabadOrRagi("");
    setSourceUrl("");
    setSelectedFile(null);
    setNotes("");
    setFormError(null);
    setIsCustomModalOpen(false);
    showRequestToast(
      selectedFile
        ? `Playing "${requestRecord.shabadOrRagi}" and saved request for /admin review.`
        : `Saved Shabad request "${requestRecord.shabadOrRagi}" for review. Thank you!`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Suggest a Shabad"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--accent-primary)",
          color: "var(--text-primary)",
        }}
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border-2 shadow-2xl overflow-hidden"
      >
        <div className="shrink-0 px-6 py-4 border-b border-[#C59B27]/25 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
              SHABAD REQUEST &amp; LOCAL PLAYBACK
            </span>
            <h3 className="text-xl font-serif font-bold mt-0.5">
              Suggest a Shabad
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold hover:border-[#C59B27]"
          >
            ✕ Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {formError && (
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-400">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5">
              1. Shabad or Raagi Name
            </label>
            <input
              type="text"
              value={shabadOrRagi}
              onChange={(e) => setShabadOrRagi(e.target.value)}
              placeholder='e.g., "Bhai Avtar Singh — Aaj More Aaye Hai"'
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold">
              2. Upload Audio File (.mp3) OR Paste YouTube / SoundCloud / Archive Link
            </label>
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
                if (file && !shabadOrRagi.trim()) {
                  const parsed = parseLocalAudioFilename(file.name);
                  setShabadOrRagi(
                    parsed.ragi === "Local Audio File"
                      ? parsed.title
                      : `${parsed.ragi} — ${parsed.title}`
                  );
                }
              }}
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="w-full rounded-xl border px-3 py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#C59B27] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#18181B]"
            />
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Or paste YouTube / SoundCloud / Archive.org / GurmatVeechar link..."
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              3. Optional Note / Feedback
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any Raag notes, recording era, or feedback..."
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Persistent Bottom Mini-Player so users can listen to the verified SGPC live
 * Darbar Sahib stream (or admin-approved/local tracks) while browsing any route.
 */
export function GlobalKirtanMiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoadingAudio,
    audioError,
    currentTime,
    duration,
    volume,
    isReadingVolumePreset,
    isMinimized,
    setIsMinimized,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleReadingVolumePreset,
    setIsCustomModalOpen,
    nextTrack,
    prevTrack,
  } = useKirtanAudio();

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--accent-primary)",
            color: "var(--text-primary)",
          }}
          className="flex items-center gap-2.5 rounded-full border-2 px-4 py-2.5 shadow-xl transition hover:scale-[1.02]"
        >
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              isPlaying ? "bg-red-500 animate-ping" : "bg-[#C59B27]"
            }`}
          />
          <span className="text-xs font-serif font-bold">
            {isPlaying ? `Playing: ${currentTrack.title}` : "Darbar Sahib Live Audio"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Persistent Gurbani Kirtan & Live Broadcast Audio Player"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="fixed bottom-0 inset-x-0 z-30 border-t shadow-2xl backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause Kirtan" : "Play Kirtan"}
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm hover:brightness-105 transition"
          >
            {isLoadingAudio ? "•••" : isPlaying ? "⏸" : "▶"}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {currentTrack.isLiveStream && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  LIVE 24/7
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27] truncate">
                {currentTrack.raag}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif font-bold truncate">
              {currentTrack.title}
            </p>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-[11px] truncate"
            >
              {audioError ? (
                <span className="text-amber-600 font-semibold">{audioError}</span>
              ) : (
                `${currentTrack.ragi} • ${currentTrack.tantiSaaj}`
              )}
            </p>
          </div>
        </div>

        {/* Transport & Progress Bar */}
        <div className="flex items-center gap-2.5 w-full md:max-w-md">
          <button
            type="button"
            onClick={prevTrack}
            aria-label="Previous Track"
            className="px-2 py-1 rounded-lg border border-[#C59B27]/35 text-xs font-semibold hover:border-[#C59B27] transition"
          >
            ⏮
          </button>

          {currentTrack.isLiveStream ? (
            <div className="flex-1 text-center py-1 px-3 rounded-lg bg-[#C59B27]/10 border border-[#C59B27]/30 text-[11px] font-bold text-[#C59B27]">
              Official SGPC Live Broadcast • Sri Harmandir Sahib, Amritsar
            </div>
          ) : (
            <>
              <span className="text-[11px] font-mono tabular-nums shrink-0">
                {formatAudioTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 1800}
                value={currentTime}
                onChange={(e) => seekTo(Number(e.target.value))}
                aria-label="Seek audio position"
                className="w-full accent-[#C59B27] cursor-pointer h-1.5"
              />
              <span className="text-[11px] font-mono tabular-nums shrink-0">
                {formatAudioTime(duration)}
              </span>
            </>
          )}

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next Track"
            className="px-2 py-1 rounded-lg border border-[#C59B27]/35 text-xs font-semibold hover:border-[#C59B27] transition"
          >
            ⏭
          </button>
        </div>

        {/* Quick Actions: 25% Reading Vol, Suggest Track, Minimize */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleReadingVolumePreset}
            title="Set volume to 25% for peaceful background listening while reading"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
              isReadingVolumePreset
                ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                : "border-[#C59B27]/40 text-[#C59B27] hover:border-[#C59B27]"
            }`}
          >
            🔉 25% Vol
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Audio volume"
            className="w-16 accent-[#C59B27] cursor-pointer h-1.5"
          />

          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="px-2.5 py-1 rounded-lg border border-[#C59B27]/45 text-[11px] font-bold text-[#C59B27] hover:border-[#C59B27]"
          >
            + Suggest Kirtan
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label="Minimize audio player"
            className="text-xs px-2 py-1 rounded-lg border border-[#C59B27]/35 hover:border-[#C59B27]"
          >
            Minimize
          </button>
        </div>
      </div>
    </aside>
  );
}
