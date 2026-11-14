import { NextRequest } from "next/server";
import {
  classify,
  ErrorCode,
  FRIENDLY,
  generateAnswer,
  getApiLogs,
  SIKHI_SOURCES,
} from "@/lib/deepseek";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(code: ErrorCode, detail?: string) {
  const entry = FRIENDLY[String(code)] || {
    status: 500,
    message: detail || "An unexpected error occurred.",
  };

  return Response.json(
    {
      ok: false,
      error: detail || entry.message,
      message: detail || entry.message,
      code: String(code),
      logs: getApiLogs(),
    },
    { status: entry.status }
  );
}

// GET /api/ask returns live logs and sources for the Front Page & Logs Drawer
export async function GET() {
  return Response.json({
    ok: true,
    logs: getApiLogs(),
    sources: SIKHI_SOURCES,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("BAD_REQUEST", "Request body must be valid JSON.");
  }

  const rawQuestion =
    body?.question ?? body?.query ?? body?.prompt ?? body?.text ?? "";

  if (typeof rawQuestion !== "string" || !rawQuestion.trim()) {
    return fail("BAD_REQUEST", "Please enter a question.");
  }

  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim() ||
    "";

  if (!apiKey) {
    return fail("NO_API_KEY", "Add GEMINI_API_KEY to your .env.local file.");
  }

  try {
    const result = await generateAnswer(apiKey, rawQuestion.trim());
    return Response.json(result, { status: 200 });
  } catch (err) {
    const e = classify(err);
    return fail(e.code, e.message);
  }
}
