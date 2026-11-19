"use client";

import React from "react";

const GURMUKHI_RE = /[\u0A00-\u0A7F]/;

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const tokenRe = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRe.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`b-${key++}`} className="font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={`i-${key++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`c-${key++}`}
          style={{
            backgroundColor: "var(--theme-card-darker)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded px-1.5 py-0.5 text-[0.9em] font-mono border"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }
  return parts;
}

export function ArticleMarkdownRenderer({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(
        <hr
          key={`hr-${blockKey++}`}
          style={{ borderColor: "var(--border-subtle)" }}
          className="my-8 border-t"
        />
      );
      i += 1;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const hasGurmukhi = GURMUKHI_RE.test(headingText);
      if (level === 1) {
        blocks.push(
          <h2
            key={`h1-${blockKey++}`}
            lang={hasGurmukhi ? "pa" : undefined}
            className={`${
              hasGurmukhi ? "font-gurmukhi" : "font-serif"
            } text-2xl sm:text-3xl font-bold tracking-tight pt-4`}
          >
            {renderInlineMarkdown(headingText)}
          </h2>
        );
      } else if (level === 2) {
        blocks.push(
          <h3
            key={`h2-${blockKey++}`}
            lang={hasGurmukhi ? "pa" : undefined}
            className={`${
              hasGurmukhi ? "font-gurmukhi" : "font-serif"
            } text-xl sm:text-2xl font-bold tracking-tight pt-3`}
          >
            {renderInlineMarkdown(headingText)}
          </h3>
        );
      } else {
        blocks.push(
          <h4
            key={`h3-${blockKey++}`}
            lang={hasGurmukhi ? "pa" : undefined}
            className={`${
              hasGurmukhi ? "font-gurmukhi" : "font-serif"
            } text-lg sm:text-xl font-bold pt-2`}
          >
            {renderInlineMarkdown(headingText)}
          </h4>
        );
      }
      i += 1;
      continue;
    }

    // Gurbani Pankti / Editorial Blockquote (> ...)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      const combined = quoteLines.join("\n");
      const hasGurmukhi = GURMUKHI_RE.test(combined);
      blocks.push(
        <blockquote
          key={`bq-${blockKey++}`}
          style={{
            backgroundColor: "var(--theme-card-darker)",
            borderColor: "var(--border-subtle)",
          }}
          className="my-5 rounded-2xl border border-l-4 border-l-[#C59B27] px-5 py-4 space-y-2"
        >
          {quoteLines.map((qLine, idx) => {
            const lineIsGurmukhi = GURMUKHI_RE.test(qLine);
            return (
              <p
                key={idx}
                lang={lineIsGurmukhi ? "pa" : undefined}
                className={
                  lineIsGurmukhi
                    ? "font-gurmukhi text-xl sm:text-2xl font-bold leading-relaxed"
                    : hasGurmukhi
                      ? "text-sm sm:text-base italic leading-relaxed"
                      : "font-serif text-lg sm:text-xl italic leading-relaxed"
                }
              >
                {renderInlineMarkdown(qLine)}
              </p>
            );
          })}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${blockKey++}`} className="my-4 space-y-2.5 pl-1">
          {listItems.map((item, idx) => {
            const hasPa = GURMUKHI_RE.test(item);
            return (
              <li
                key={idx}
                lang={hasPa ? "pa" : undefined}
                className={`flex items-start gap-3 text-base sm:text-lg leading-relaxed ${
                  hasPa ? "font-gurmukhi" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  style={{ color: "var(--accent-text, var(--accent-primary))" }}
                  className="mt-1 font-bold"
                >
                  •
                </span>
                <span>{renderInlineMarkdown(item)}</span>
              </li>
            );
          })}
        </ul>
      );
      continue;
    }

    // Standard paragraph (collect consecutive non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s+|>|[-*•]\s+|-{3,}|\*{3,})/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    const paraText = paraLines.join(" ");
    const isGurmukhi = GURMUKHI_RE.test(paraText);
    blocks.push(
      <p
        key={`p-${blockKey++}`}
        lang={isGurmukhi ? "pa" : undefined}
        className={`text-base sm:text-[1.08rem] leading-[1.85] ${
          isGurmukhi ? "font-gurmukhi text-lg sm:text-xl" : ""
        }`}
      >
        {renderInlineMarkdown(paraText)}
      </p>
    );
  }

  return <div className="space-y-4">{blocks}</div>;
}
