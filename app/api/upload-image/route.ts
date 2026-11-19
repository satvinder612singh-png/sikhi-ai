import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { verifyFounderAdminHeader } from "@/lib/articles-store";

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || (!serviceKey && !anonKey)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Supabase Storage is not configured. Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 }
    );
  }

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

  // Use service role key if available; otherwise forward caller's Supabase bearer JWT if present
  const authHeader = (req.headers.get("authorization") || "").trim();
  const callerJwt = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const isFounderAdmin = verifyFounderAdminHeader(req);

  const clientKey = serviceKey || anonKey!;
  const supabase = createClient(supabaseUrl, clientKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    ...(callerJwt && !serviceKey && !isFounderAdmin
      ? { global: { headers: { Authorization: `Bearer ${callerJwt}` } } }
      : {}),
  });

  // If service role is present, ensure bucket exists and is public
  if (serviceKey) {
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
      // ignore bucket probe errors; upload below will report exact error
    }
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
