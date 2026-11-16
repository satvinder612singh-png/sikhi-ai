import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface FrameRecord {
  src: string;
  orientation: "natural" | "auto" | "landscape" | "portrait" | "square";
  fitMode: "contain-museum" | "cover";
  posX: number;
  posY: number;
  zoom: number;
  hidden: boolean;
  updatedAt?: string;
}

export type FontScaleOption = "sm" | "md" | "lg" | "xl";
export type FontFamilyOption =
  | "serif-heritage"
  | "sans-modern"
  | "manuscript"
  | "mono-clean";

export interface TopicEdit {
  title?: string;
  gurmukhi?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  source?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  fontScale?: FontScaleOption;
}

export interface CustomTopic {
  id: string;
  title: string;
  gurmukhi?: string;
  subtitle?: string;
  description: string;
  badge?: string;
  source?: string;
  imageKey?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  fontScale?: FontScaleOption;
  createdAt: string;
}

export interface LayoutConfig {
  feedLayout?: "grid-3" | "grid-2" | "editorial";
  heroHeight?: "compact" | "standard" | "cinema";
  accentStyle?: "classic-gold" | "minimal" | "museum-frame";
  fontFamily?: FontFamilyOption;
  headingScale?: FontScaleOption;
  bodyScale?: FontScaleOption;
  gurmukhiScale?: FontScaleOption;
  pageBgColor?: string;
  cardBgColor?: string;
  headingTextColor?: string;
  bodyTextColor?: string;
  accentColor?: string;
  defaultSiteTheme?: string;
  pageTransition?: "fade" | "slide-up" | "scale-zoom" | "blur-reveal" | "none";
}

export interface SecurityConfig {
  requireEmailVerification?: boolean;
  requireSignInForSubmissions?: boolean;
  requireAdminApproval?: boolean;
  allowGuestKirtanPlay?: boolean;
  readOnlyMaintenanceMode?: boolean;
  hideSubmitterIdentity?: boolean;
}

export interface KirtanTrackRecord {
  id: string;
  title: string;
  gurmukhi?: string;
  ragi: string;
  raag?: string;
  sourceUrl: string;
  duration?: string;
  imageUrl?: string;
  imageKey?: string;
  createdAt: string;
}

export interface KirtanTrackEdit {
  title?: string;
  gurmukhi?: string;
  ragi?: string;
  raag?: string;
  sourceUrl?: string;
  imageUrl?: string;
  deleted?: boolean;
}

export interface PendingSubmission {
  id: string;
  type: "post" | "kirtan" | "pdf";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  image?: string;
  submittedBy: string;
  createdAt: string;
}

export interface SectionLayoutEntry {
  page?: string;
  positionOrder?: number;
  titleAlign?: "left" | "center" | "right";
  widthMode?: "full" | "contained" | "compact";
  customTitle?: string;
  customSubtitle?: string;
  hidden?: boolean;
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
  sectionOrder: Record<string, string[]>;
  pinnedIds: string[];
  archivedIds: string[];
  topicEdits: Record<string, TopicEdit>;
  customTopics: Record<string, CustomTopic[]>;
  layoutConfig: LayoutConfig;
  securityConfig: SecurityConfig;
  kirtanTracks: KirtanTrackRecord[];
  kirtanEdits: Record<string, KirtanTrackEdit>;
  pendingSubmissions: PendingSubmission[];
  sectionLayoutMap: Record<string, SectionLayoutEntry>;
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
  sectionOrder: {},
  pinnedIds: [],
  archivedIds: [],
  topicEdits: {},
  customTopics: {},
  layoutConfig: {
    feedLayout: "grid-3",
    heroHeight: "standard",
    accentStyle: "classic-gold",
    pageTransition: "fade",
  },
  securityConfig: {
    requireEmailVerification: false,
    requireSignInForSubmissions: false,
    requireAdminApproval: true,
    allowGuestKirtanPlay: true,
    readOnlyMaintenanceMode: false,
    hideSubmitterIdentity: false,
  },
  kirtanTracks: [],
  kirtanEdits: {},
  pendingSubmissions: [],
  sectionLayoutMap: {},
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

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SIGNING_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "learnsikhi-stateless-hmac-key"
  );
}

function isStealthAdminEmail(email?: string | null): boolean {
  return Boolean(
    email && email.trim().toLowerCase().endsWith("student1313@learnsikhi.com")
  );
}

function signAdminToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
    "utf8"
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expected = crypto
      .createHmac("sha256", getSigningSecret())
      .update(payload)
      .digest("hex");
    const sigBuf = Buffer.from(sig, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email?: string; exp?: number };
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    if (!isStealthAdminEmail(decoded.email)) return null;
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

async function verifyAdminRequest(
  req: Request,
  body?: Record<string, unknown>
): Promise<{ verified: boolean; email: string | null }> {
  const authHeader = req.headers.get("authorization") || "";
  const xAdminHeader = (req.headers.get("x-admin-token") || "").trim();
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : xAdminHeader;

  if (bearer) {
    if (bearer === "verified_founder_1313") {
      return { verified: true, email: "student1313@learnsikhi.com" };
    }
    const localVerified = verifyAdminToken(bearer);
    if (localVerified) {
      return { verified: true, email: localVerified };
    }
    const supabase = getSupabaseAdminOrAnon();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser(bearer);
        if (!error && isStealthAdminEmail(data?.user?.email)) {
          return { verified: true, email: data.user!.email! };
        }
      } catch {
        // invalid bearer token
      }
    }
  }

  const rawEmail =
    typeof body?.email === "string"
      ? body.email
      : typeof body?.adminEmail === "string"
        ? body.adminEmail
        : "";
  const rawPassword =
    typeof body?.password === "string"
      ? body.password
      : typeof body?.adminPassword === "string"
        ? body.adminPassword
        : "";
  const adminEmail = rawEmail.trim();
  const adminPassword = rawPassword;

  if (adminEmail && adminPassword && isStealthAdminEmail(adminEmail)) {
    const supabase = getSupabaseAdminOrAnon();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });
        if (!error && isStealthAdminEmail(data?.user?.email)) {
          return { verified: true, email: data.user!.email! };
        }
      } catch {
        // fall through to constant-time check
      }
    }
    const expectedPwd = process.env.FOUNDER_ADMIN_PASSWORD || "Sikhstudent@13";
    const providedBuf = Buffer.from(adminPassword, "utf8");
    const expectedBuf = Buffer.from(expectedPwd, "utf8");
    if (
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return { verified: true, email: adminEmail.toLowerCase() };
    }
  }

  return { verified: false, email: null };
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
    sectionOrder:
      obj.sectionOrder && typeof obj.sectionOrder === "object"
        ? (obj.sectionOrder as Record<string, string[]>)
        : {},
    pinnedIds: Array.isArray(obj.pinnedIds)
      ? obj.pinnedIds.filter((id): id is string => typeof id === "string")
      : [],
    archivedIds: Array.isArray(obj.archivedIds)
      ? obj.archivedIds.filter((id): id is string => typeof id === "string")
      : [],
    topicEdits:
      obj.topicEdits && typeof obj.topicEdits === "object"
        ? (obj.topicEdits as Record<string, TopicEdit>)
        : {},
    customTopics:
      obj.customTopics && typeof obj.customTopics === "object"
        ? (obj.customTopics as Record<string, CustomTopic[]>)
        : {},
    layoutConfig:
      obj.layoutConfig && typeof obj.layoutConfig === "object"
        ? {
            feedLayout: "grid-3",
            heroHeight: "standard",
            accentStyle: "classic-gold",
            pageTransition: "fade",
            ...(obj.layoutConfig as LayoutConfig),
          }
        : {
            feedLayout: "grid-3",
            heroHeight: "standard",
            accentStyle: "classic-gold",
            pageTransition: "fade",
          },
    securityConfig:
      obj.securityConfig && typeof obj.securityConfig === "object"
        ? {
            ...DEFAULT_STATE.securityConfig,
            ...(obj.securityConfig as SecurityConfig),
          }
        : { ...DEFAULT_STATE.securityConfig },
    kirtanTracks: Array.isArray(obj.kirtanTracks)
      ? (obj.kirtanTracks as KirtanTrackRecord[])
      : [],
    kirtanEdits:
      obj.kirtanEdits && typeof obj.kirtanEdits === "object"
        ? (obj.kirtanEdits as Record<string, KirtanTrackEdit>)
        : {},
    pendingSubmissions: Array.isArray(obj.pendingSubmissions)
      ? (obj.pendingSubmissions as PendingSubmission[])
      : [],
    sectionLayoutMap:
      obj.sectionLayoutMap && typeof obj.sectionLayoutMap === "object"
        ? (obj.sectionLayoutMap as Record<string, SectionLayoutEntry>)
        : {},
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

    if (body.action === "admin_login") {
      const auth = await verifyAdminRequest(req, body);
      if (!auth.verified || !auth.email) {
        return NextResponse.json(
          { ok: false, isAdmin: false, error: "Invalid Founder Admin email or password." },
          { status: 401 }
        );
      }
      return NextResponse.json({
        ok: true,
        isAdmin: true,
        email: auth.email,
        adminToken: "verified_founder_1313",
        signedToken: signAdminToken(auth.email),
      });
    }

    if (body.action === "verify_admin") {
      const auth = await verifyAdminRequest(req, body);
      if (!auth.verified || !auth.email) {
        return NextResponse.json(
          { ok: false, isAdmin: false, error: "Invalid Admin email or password." },
          { status: 401 }
        );
      }
      return NextResponse.json({
        ok: true,
        isAdmin: true,
        email: auth.email,
        adminToken: signAdminToken(auth.email),
      });
    }

    const { state: current } = await readGlobalState();
    const auth = await verifyAdminRequest(req, body);

    if (current.securityConfig?.readOnlyMaintenanceMode && !auth.verified) {
      return NextResponse.json(
        {
          ok: false,
          error: "Community submissions are temporarily paused by the Admin",
        },
        { status: 403 }
      );
    }

    if (body.action === "submit_for_approval") {
      const sub =
        body.submission && typeof body.submission === "object"
          ? (body.submission as Partial<PendingSubmission>)
          : null;
      if (!sub || !sub.title?.trim() || !sub.url?.trim()) {
        return NextResponse.json(
          { ok: false, error: "Title and URL are required for submission." },
          { status: 400 }
        );
      }
      const now = new Date().toISOString();
      const submittedBy = current.securityConfig?.hideSubmitterIdentity
        ? "Sangat Contributor"
        : sub.submittedBy?.trim() || "Sangat Member";

      if (current.securityConfig?.requireAdminApproval === false) {
        if (sub.type === "kirtan") {
          const track: KirtanTrackRecord = {
            id: `kirtan-${Date.now()}`,
            title: sub.title.trim(),
            ragi: sub.subtitle?.trim() || submittedBy,
            raag: "Community Kirtan",
            sourceUrl: sub.url.trim(),
            imageUrl: sub.image?.trim() || undefined,
            createdAt: now,
          };
          const nextState: SiteFramesPayload = {
            ...current,
            kirtanTracks: [track, ...current.kirtanTracks],
            updatedAt: now,
          };
          const source = await writeGlobalState(nextState);
          return NextResponse.json({
            ok: true,
            publishedDirectly: true,
            source,
            storageMode: source === "supabase" ? "supabase" : "fallback",
            ...nextState,
          });
        }

        const directLink = {
          id: `link-${Date.now()}`,
          url: sub.url.trim(),
          title: sub.title.trim(),
          publisher: sub.subtitle?.trim() || submittedBy,
          summary: sub.description?.trim() || sub.title.trim(),
          category: "essays",
          curatedBy: submittedBy,
          createdAt: "Published",
          imageUrl: sub.image?.trim() || null,
          isUserCreated: true,
        };
        const nextState: SiteFramesPayload = {
          ...current,
          customPosts: {
            ...current.customPosts,
            links: mergePostsById(current.customPosts.links, [directLink]),
          },
          updatedAt: now,
        };
        const source = await writeGlobalState(nextState);
        return NextResponse.json({
          ok: true,
          publishedDirectly: true,
          source,
          storageMode: source === "supabase" ? "supabase" : "fallback",
          ...nextState,
        });
      }

      const entry: PendingSubmission = {
        id: sub.id || `sub-${Date.now()}`,
        type: sub.type === "kirtan" || sub.type === "pdf" ? sub.type : "post",
        title: sub.title.trim(),
        subtitle: sub.subtitle?.trim() || undefined,
        description: sub.description?.trim() || undefined,
        url: sub.url.trim(),
        image: sub.image?.trim() || undefined,
        submittedBy,
        createdAt: now,
      };
      const nextState: SiteFramesPayload = {
        ...current,
        pendingSubmissions: [entry, ...current.pendingSubmissions],
        updatedAt: now,
      };
      const source = await writeGlobalState(nextState);
      return NextResponse.json({
        ok: true,
        publishedDirectly: false,
        source,
        storageMode: source === "supabase" ? "supabase" : "fallback",
        submission: entry,
      });
    }

    const mutatesProtectedFramework =
      Boolean(body.frames) ||
      Boolean(body.frameUpdate) ||
      Boolean(body.frameKey) ||
      body.heroBannerUrl !== undefined ||
      Boolean(body.deletedIds) ||
      Boolean(body.sectionOrder) ||
      Array.isArray(body.pinnedIds) ||
      Array.isArray(body.archivedIds) ||
      Boolean(body.topicEdits) ||
      Boolean(body.customTopics) ||
      Boolean(body.layoutConfig) ||
      Boolean(body.securityConfig) ||
      Array.isArray(body.kirtanTracks) ||
      Boolean(body.kirtanEdits) ||
      Array.isArray(body.pendingSubmissions) ||
      Boolean(body.sectionLayoutMap);

    if (mutatesProtectedFramework && !auth.verified) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized: Admin sign-in (Student1313@learnsikhi.com) required.",
        },
        { status: 401 }
      );
    }
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
      deletedIds: body.replaceDeletedIds === true && Array.isArray(body.deletedIds)
        ? body.deletedIds.filter((id): id is string => typeof id === "string")
        : Array.isArray(body.deletedIds)
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
      sectionOrder:
        body.sectionOrder && typeof body.sectionOrder === "object"
          ? {
              ...current.sectionOrder,
              ...(body.sectionOrder as Record<string, string[]>),
            }
          : current.sectionOrder,
      pinnedIds: Array.isArray(body.pinnedIds)
        ? body.pinnedIds.filter((id): id is string => typeof id === "string")
        : current.pinnedIds,
      archivedIds: Array.isArray(body.archivedIds)
        ? body.archivedIds.filter((id): id is string => typeof id === "string")
        : current.archivedIds,
      topicEdits:
        body.topicEdits && typeof body.topicEdits === "object"
          ? Object.entries(
              body.topicEdits as Record<string, TopicEdit>
            ).reduce<Record<string, TopicEdit>>(
              (acc, [k, v]) => {
                acc[k] = { ...(acc[k] || {}), ...v };
                return acc;
              },
              { ...current.topicEdits }
            )
          : current.topicEdits,
      customTopics:
        body.customTopics && typeof body.customTopics === "object"
          ? {
              ...current.customTopics,
              ...(body.customTopics as Record<string, CustomTopic[]>),
            }
          : current.customTopics,
      layoutConfig:
        body.layoutConfig && typeof body.layoutConfig === "object"
          ? {
              ...current.layoutConfig,
              ...(body.layoutConfig as LayoutConfig),
            }
          : current.layoutConfig,
      securityConfig:
        body.securityConfig && typeof body.securityConfig === "object"
          ? {
              ...current.securityConfig,
              ...(body.securityConfig as SecurityConfig),
            }
          : current.securityConfig,
      kirtanTracks: Array.isArray(body.kirtanTracks)
        ? (body.kirtanTracks as KirtanTrackRecord[])
        : current.kirtanTracks,
      kirtanEdits:
        body.kirtanEdits && typeof body.kirtanEdits === "object"
          ? Object.entries(
              body.kirtanEdits as Record<string, KirtanTrackEdit>
            ).reduce<Record<string, KirtanTrackEdit>>(
              (acc, [k, v]) => {
                acc[k] = { ...(acc[k] || {}), ...v };
                return acc;
              },
              { ...current.kirtanEdits }
            )
          : current.kirtanEdits,
      pendingSubmissions: Array.isArray(body.pendingSubmissions)
        ? (body.pendingSubmissions as PendingSubmission[])
        : current.pendingSubmissions,
      sectionLayoutMap:
        body.sectionLayoutMap && typeof body.sectionLayoutMap === "object"
          ? Object.entries(
              body.sectionLayoutMap as Record<string, SectionLayoutEntry>
            ).reduce<Record<string, SectionLayoutEntry>>(
              (acc, [k, v]) => {
                acc[k] = { ...(acc[k] || {}), ...v };
                return acc;
              },
              { ...current.sectionLayoutMap }
            )
          : current.sectionLayoutMap,
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
