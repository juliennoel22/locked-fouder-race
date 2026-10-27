"use client";

import React from "react";
import katex from "katex";

export function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Découpage : display math ($$...$$), inline math ($...$), bold (**...**), italic (*...*), inline code (`...`)
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // 1. Display math inline $$...$$
    if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
      const math = part.slice(2, -2).trim();
      try {
        const html = katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
        return (
          <span
            key={i}
            className="my-1.5 block overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <code key={i} className="font-mono text-xs">{part}</code>;
      }
    }

    // 2. Inline math $...$
    if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
      const math = part.slice(1, -1).trim();
      try {
        const html = katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
        return (
          <span
            key={i}
            className="inline-block px-0.5 align-middle select-text"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <code key={i} className="font-mono text-xs">{part}</code>;
      }
    }

    // 3. Bold **...**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-zinc-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 4. Italic *...*
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-zinc-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    // 5. Code `...`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-mono text-[11px] text-zinc-900 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}
