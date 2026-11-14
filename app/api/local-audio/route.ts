import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".ogg"]);
const GURMUKHI_DIGITS = ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"];

function toGurmukhiNumeral(n: number): string {
  return String(n)
    .split("")
    .map((ch) => GURMUKHI_DIGITS[Number(ch)] || ch)
    .join("");
}

function formatFileNameToTitle(fileName: string): {
  title: string;
  ragi: string;
} {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "");
  const normalized = withoutExt.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  if (normalized.includes(" - ")) {
    const [first, ...rest] = normalized.split(" - ");
    return {
      ragi: first.trim(),
      title: rest.join(" — ").trim(),
    };
  }
  return {
    title: normalized,
    ragi: "Local Audio Archive (public/audio)",
  };
}

async function scanAudioDir(
  dirPath: string,
  relativePrefix = ""
): Promise<{ relativePath: string; fileName: string; subfolder: string }[]> {
  const results: { relativePath: string; fileName: string; subfolder: string }[] = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = relativePrefix
        ? `${relativePrefix}/${entry.name}`
        : entry.name;
      if (entry.isDirectory()) {
        const nested = await scanAudioDir(fullPath, relPath);
        results.push(...nested);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext)) {
          results.push({
            relativePath: relPath,
            fileName: entry.name,
            subfolder: relativePrefix.toLowerCase(),
          });
        }
      }
    }
  } catch {
    // Directory may not exist yet; return empty list gracefully
  }
  return results;
}

export async function GET() {
  const audioRoot = path.join(process.cwd(), "public", "audio");
  const files = await scanAudioDir(audioRoot);

  const tracks = files.map((file, idx) => {
    const { title, ragi } = formatFileNameToTitle(file.fileName);
    const isInstrumental = file.subfolder.includes("instrumental");
    const isNitnem = file.subfolder.includes("nitnem") || file.subfolder.includes("bani");
    const isKatha = file.subfolder.includes("katha");

    const category = isInstrumental
      ? "Background Raag Instrumentals"
      : isNitnem
      ? "Complete Nitnem & Sacred Bani"
      : isKatha
      ? "Puratan Katha & Vichaar"
      : "Puratan Kirtan Masters";

    const publicUrl = `/audio/${file.relativePath
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;

    return {
      id: `local-public-${idx}-${file.fileName.replace(/[^a-zA-Z0-9]/g, "")}`,
      numeral: toGurmukhiNumeral(idx + 1),
      category,
      title,
      gurmukhiTitle: isInstrumental
        ? "ਤੰਤੀ ਸਾਜ਼ ਧੁਨ (Background Instrumental)"
        : "ਗੁਰਬਾਣੀ ਕੀਰਤਨ (Local Audio)",
      ragi,
      raag: isInstrumental ? "Instrumental Reading Mode" : "Local Audio Archive",
      angCitation: `public/audio/${file.relativePath}`,
      tantiSaaj: isInstrumental
        ? "Dilruba, Sitar, Veena, Taus & Rabab"
        : "Local MP3 Master",
      timeOfDay: "All Pehars (Continuous Study)",
      durationLabel: "Local MP3",
      durationSec: 600,
      audioUrl: publicUrl,
      directArchiveMp3Url: publicUrl,
      archiveEmbedUrl: publicUrl,
      externalArchiveUrl: publicUrl,
      raagNotes: `Automatically loaded from public/audio/${file.relativePath}.`,
      historicalContext:
        "Local high-resolution audio file served directly from your public/audio directory.",
      isLocalFile: true,
    };
  });

  return Response.json({
    ok: true,
    count: tracks.length,
    tracks,
  });
}
