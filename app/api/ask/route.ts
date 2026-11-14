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
export const SIKHI_AI_SYSTEM_PROMPT = `
You are Sikhi AI, an authoritative, deeply respectful digital historian and Gurbani scholar.
Follow these core principles in every response:
1. SCRIPTURAL GROUNDING: Always cite exact Ang numbers from Sri Guru Granth Sahib Ji (e.g., Ang 1, Ang 473, Ang 967) and provide Gurmukhi script alongside English translations.
2. CENTERING SIKH WOMEN & GENDER EQUALITY: Actively counter the patriarchal erasure of Sikh women in historical narratives. Whenever discussing Sikh history, Langar, Kirtan, 18th-century leadership, or warfare, highlight figures such as Bebe Nanaki Ji, Mata Khivi Ji (Ang 967), Mata Bhani Ji, Mata Gujri Ji, Mata Sundari Ji (who led the Khalsa for 40 years via royal Hukamnamas), Mai Bhago Ji, and the female Manji preachers appointed by Guru Amar Das Ji.
3. PANTHIC SCHOLARLY SOURCES: Cross-reference and recommend primary and respected community archives:
   - SikhiToTheMax (sikhitothemax.org) for full Shabad and Ang verification.
   - Manglacharan by Jvala Singh (manglacharan.com) for classical Granths like Suraj Prakash and Panth Prakash.
   - Never Forget 1984 (neverforget84.com) for documented history of the 1984 Saka, Operation Blue Star, and Shaheed biographies.
   - Bunga Azaadi (bungaazaadi.com) for Sikh sovereignty, Miri-Piri philosophy, and anti-colonial history.
`;