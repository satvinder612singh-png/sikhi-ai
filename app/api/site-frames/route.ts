import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface FrameRecord {
  src: string;
  orientation: "auto" | "landscape" | "portrait" | "square";
  fitMode: "contain-museum" | "cover";
  posX: number;
  posY: number;
  zoom: number;
  hidden: boolean;
  updatedAt?: string;
}

export interface SiteFramesPayload {
  frames: Record<string, FrameRecord>;
  customPosts: {
    links: unknown[];
    blogs: unknown[];
    pins: unknown[];
  };
  deletedIds: string[];
  heroBannerUrl: string | null;
  updatedAt: string;
}

const DEFAULT_STATE: SiteFramesPayload = {
  frames: {},
  customPosts: {
    links: [],
    blogs: [],
    pins: [],
  },
  deletedIds: [],
  heroBannerUrl: null,
  updatedAt: new Date(0).toISOString(),
};

const STATE_KEY = "learnsikhi_global_site_frames_v1";
const FALLBACK_FILE = path.join(os.tmpdir(), "learnsikhi-site-frames.json");

const globalStore = globalThis as unknown as {
  __learnsikhiSiteFrames?: SiteFramesPayload;
};

function getSupabaseAdminOrAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function normalizeState(raw: unknown): SiteFramesPayload {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const cp =
    obj.customPosts && typeof obj.customPosts === "object"
      ? (obj.customPosts as Record<string, unknown>)
      : {};
  return {
    frames:
      obj.frames && typeof obj.frames === "object"
        ? (obj.frames as Record<string, FrameRecord>)
        : {},
    customPosts: {
      links: Array.isArray(cp.links) ? cp.links : [],
      blogs: Array.isArray(cp.blogs) ? cp.blogs : [],
      pins: Array.isArray(cp.pins) ? cp.pins : [],
    },
    deletedIds: Array.isArray(obj.deletedIds)
      ? obj.deletedIds.filter((id): id is string => typeof id === "string")
      : [],
    heroBannerUrl:
      typeof obj.heroBannerUrl === "string" ? obj.heroBannerUrl : null,
    updatedAt:
      typeof obj.updatedAt === "string"
        ? obj.updatedAt
        : new Date().toISOString(),
  };
}

async function readLocalFallback(): Promise<SiteFramesPayload> {
  if (globalStore.__learnsikhiSiteFrames) {
    return globalStore.__learnsikhiSiteFrames;
  }
  try {
    const raw = await fs.readFile(FALLBACK_FILE, "utf8");
    const parsed = normalizeState(JSON.parse(raw));
    globalStore.__learnsikhiSiteFrames = parsed;
    return parsed;
  } catch {
    globalStore.__learnsikhiSiteFrames = { ...DEFAULT_STATE };
    return globalStore.__learnsikhiSiteFrames;
  }
}

async function writeLocalFallback(state: SiteFramesPayload): Promise<void> {
  globalStore.__learnsikhiSiteFrames = state;
  try {
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(state), "utf8");
  } catch {
    // ignore read-only filesystem errors (e.g. serverless read-only dir)
  }
}

async function readGlobalState(): Promise<{
  state: SiteFramesPayload;
  source: "supabase" | "local";
}> {
  const supabase = getSupabaseAdminOrAnon();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("site_state")
        .select("value")
        .eq("key", STATE_KEY)
        .maybeSingle();

      if (!error && data?.value) {
        const normalized = normalizeState(data.value);
        await writeLocalFallback(normalized);
        return { state: normalized, source: "supabase" };
      }
    } catch {
      // Fall back to local store if table doesn't exist yet
    }
  }
  return { state: await readLocalFallback(), source: "local" };
}

async function writeGlobalState(state: SiteFramesPayload): Promise<"supabase" | "local"> {
  await writeLocalFallback(state);
  const supabase = getSupabaseAdminOrAnon();
  if (supabase) {
    try {
      const { error } = await supabase.from("site_state").upsert(
        {
          key: STATE_KEY,
          value: state,
          updated_at: state.updatedAt,
        },
        { onConflict: "key" }
      );
      if (!error) return "supabase";
    } catch {
      // Fall back silently if site_state table is absent
    }
  }
  return "local";
}

export async function GET() {
  const { state, source } = await readGlobalState();
  const storageMode = source === "supabase" ? "supabase" : "fallback";
  return NextResponse.json(
    { ok: true, source, storageMode, ...state },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

function mergePostsById(existing: unknown[], incoming?: unknown[]): unknown[] {
  if (!Array.isArray(incoming) || incoming.length === 0) return existing;
  const map = new Map<string, unknown>();
  for (const item of incoming) {
    const id =
      item && typeof item === "object" && "id" in item
        ? String((item as { id: unknown }).id)
        : "";
    if (id) map.set(id, item);
  }
  for (const item of existing) {
    const id =
      item && typeof item === "object" && "id" in item
        ? String((item as { id: unknown }).id)
        : "";
    if (id && !map.has(id)) map.set(id, item);
  }
  return Array.from(map.values());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { state: current } = await readGlobalState();
    const now = new Date().toISOString();

    const nextFrames: Record<string, FrameRecord> = { ...current.frames };

    if (body.frameUpdate && typeof body.frameUpdate === "object") {
      const fu = body.frameUpdate as {
        imageKey?: string;
        settings?: FrameRecord | null;
      };
      if (fu.imageKey) {
        if (fu.settings === null) {
          delete nextFrames[fu.imageKey];
        } else if (fu.settings && typeof fu.settings === "object") {
          nextFrames[fu.imageKey] = {
            ...fu.settings,
            updatedAt: now,
          };
        }
      }
    }

    if (typeof body.frameKey === "string" && body.frameKey) {
      if (body.frameData === null) {
        delete nextFrames[body.frameKey];
      } else if (body.frameData && typeof body.frameData === "object") {
        nextFrames[body.frameKey] = {
          ...(body.frameData as FrameRecord),
          updatedAt: now,
        };
      }
    }

    if (body.frames && typeof body.frames === "object") {
      for (const [k, v] of Object.entries(body.frames as Record<string, FrameRecord | null>)) {
        if (v === null) {
          delete nextFrames[k];
        } else if (v && typeof v === "object") {
          nextFrames[k] = { ...v, updatedAt: now };
        }
      }
    }

    const incomingPosts =
      body.customPosts && typeof body.customPosts === "object"
        ? (body.customPosts as {
            links?: unknown[];
            blogs?: unknown[];
            pins?: unknown[];
          })
        : null;

    const nextState: SiteFramesPayload = {
      frames: nextFrames,
      customPosts: {
        links: mergePostsById(current.customPosts.links, incomingPosts?.links),
        blogs: mergePostsById(current.customPosts.blogs, incomingPosts?.blogs),
        pins: mergePostsById(current.customPosts.pins, incomingPosts?.pins),
      },
      deletedIds: Array.isArray(body.deletedIds)
        ? Array.from(
            new Set([
              ...current.deletedIds,
              ...body.deletedIds.filter((id): id is string => typeof id === "string"),
            ])
          )
        : current.deletedIds,
      heroBannerUrl:
        body.heroBannerUrl !== undefined
          ? typeof body.heroBannerUrl === "string"
            ? body.heroBannerUrl
            : null
          : current.heroBannerUrl,
      updatedAt: now,
    };

    const source = await writeGlobalState(nextState);
    const storageMode = source === "supabase" ? "supabase" : "fallback";
    console.log("[site-frames]", req.method, {
      storageMode,
      frameKeys: Object.keys(
        (body?.frames && typeof body.frames === "object"
          ? body.frames
          : nextState.frames) as Record<string, unknown>
      ),
      postCount:
        nextState.customPosts.links.length +
        nextState.customPosts.blogs.length +
        nextState.customPosts.pins.length,
    });
    return NextResponse.json({ ok: true, source, storageMode, ...nextState });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
