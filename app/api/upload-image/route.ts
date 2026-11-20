import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyFounderAdminHeader } from "@/lib/articles-store";
import {
  getSupabaseAdminClient,
  getVerifiedSessionUser,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET_NAME = "site-media";
const ALLOWED_MIME_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function sanitizeSegment(raw: string, fallback: string): string {
  const clean = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return clean || fallback;
}

export async function POST(req: Request) {
  const { user: currentUser } = await getVerifiedSessionUser();
  const isFounderAdmin = verifyFounderAdminHeader(req);

  if (!currentUser && !isFounderAdmin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Sign in required to upload images." },
      { status: 401 }
    );
  }

  const admin = getSupabaseAdminClient();
  if (!admin.client) {
    return NextResponse.json(
      { ok: false, error: admin.error },
      { status: 500 }
    );
  }
  const supabase = admin.client;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid multipart form upload." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "No image file provided." },
      { status: 400 }
    );
  }

  const extFromMime = ALLOWED_MIME_MAP[file.type.toLowerCase()];
  if (!extFromMime) {
    return NextResponse.json(
      {
        ok: false,
        error: `Unsupported image type "${file.type || "unknown"}". Please upload JPG, PNG, WebP, GIF, or AVIF.`,
      },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "Image exceeds 10 MB maximum size." },
      { status: 400 }
    );
  }

  const folder = sanitizeSegment(
    String(formData.get("folder") || "uploads"),
    "uploads"
  );
  const recordId = sanitizeSegment(
    String(formData.get("recordId") || "media"),
    "media"
  );
  const timestamp = Date.now();
  const storagePath = `${folder}/${recordId}-${timestamp}.${extFromMime}`;

  // Ensure bucket exists and is public using server-only service-role admin client
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = Array.isArray(buckets)
      ? buckets.some((b) => b.id === BUCKET_NAME)
      : false;
    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: Object.keys(ALLOWED_MIME_MAP),
      });
    }
  } catch {
    // non-fatal
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      console.error("[/api/upload-image] Supabase Storage upload error:", uploadError);
      return NextResponse.json(
        {
          ok: false,
          bucket: BUCKET_NAME,
          path: storagePath,
          error: `Supabase Storage error (${BUCKET_NAME}): ${uploadError.message}. Run migration 004_articles_sources_media.sql to create the public "${BUCKET_NAME}" bucket & RLS policies.`,
        },
        { status: 502 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const basePublicUrl = publicUrlData?.publicUrl || "";
    if (!basePublicUrl) {
      return NextResponse.json(
        { ok: false, error: "Upload succeeded but failed to resolve public URL." },
        { status: 500 }
      );
    }

    // Append explicit cache-busting query string so CDN & browsers always render the fresh image
    const cacheBustedUrl = `${basePublicUrl}?v=${timestamp}`;

    // Invalidate Next.js App Router caches across the platform
    try {
      revalidatePath("/", "layout");
      revalidatePath("/articles");
      revalidatePath("/sangat");
      revalidatePath("/foundations");
      revalidatePath("/granths");
      revalidatePath("/matriarchs");
      revalidatePath("/admin");
    } catch {
      // ignore if outside request context
    }

    return NextResponse.json(
      {
        ok: true,
        bucket: BUCKET_NAME,
        path: storagePath,
        publicUrl: cacheBustedUrl,
        version: timestamp,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected image upload failure.";
    console.error("[/api/upload-image] Unexpected error:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
