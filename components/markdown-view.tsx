"use client";

import React from "react";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className = "" }: MarkdownViewProps) {
  if (!content) return null;

  const lines = content.split("\n");

  const renderInline = (text: string): React.ReactNode => {
    // Parser **gras**, *italique*, et `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-black">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-zinc-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-mono text-[11px] text-zinc-900"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-3 text-xs sm:text-sm text-zinc-800 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Titre H1 : # Titre
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={idx}
              className="text-lg sm:text-xl font-black text-black tracking-tight pt-2 pb-1 border-b border-zinc-200"
            >
              {renderInline(trimmed.substring(2))}
            </h1>
          );
        }

        // Titre H2 : ## Titre
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-sm sm:text-base font-bold text-black tracking-tight pt-3 pb-0.5 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-4 rounded-full bg-[#4457f4]" />
              <span>{renderInline(trimmed.substring(3))}</span>
            </h2>
          );
        }

        // Titre H3 : ### Titre
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-xs sm:text-sm font-bold text-zinc-900 pt-2 pb-0.5"
            >
              {renderInline(trimmed.substring(4))}
            </h3>
          );
        }

        // Citations / Pièges d'examen : > Citation
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="p-3 my-1.5 bg-amber-50/70 border-l-3 border-amber-400 rounded-r-xl text-amber-950 text-xs italic"
            >
              {renderInline(trimmed.substring(2))}
            </blockquote>
          );
        }

        // Listes à puces (- ou * ou •)
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="text-[#4457f4] font-bold text-base leading-none select-none">•</span>
              <div className="flex-1">{renderInline(trimmed.substring(2))}</div>
            </div>
          );
        }

        // Listes numérotées : 1. Element
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="font-extrabold text-[#4457f4] text-xs select-none">
                {numMatch[1]}.
              </span>
              <div className="flex-1">{renderInline(numMatch[2])}</div>
            </div>
          );
        }

        // Paragraphe standard
        return (
          <p key={idx} className="text-zinc-700">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}
