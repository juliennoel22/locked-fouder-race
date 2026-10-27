"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Lightbulb, Target, Sparkles } from "lucide-react";
import katex from "katex";
import { renderInline } from "@/lib/markdown-inline";
import { parseMarkdownBlocks, type ParsedBlock } from "@/lib/markdown-parser";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className = "" }: MarkdownViewProps) {
  const blocks = useMemo<ParsedBlock[]>(() => {
    return parseMarkdownBlocks(content);
  }, [content]);

  if (!content) return null;

  return (
    <div className={`space-y-2.5 text-xs sm:text-sm text-zinc-800 leading-relaxed text-left ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "spacer":
            return <div key={idx} className="h-1.5" />;

          case "h1":
            return (
              <h1 key={idx} className="text-lg sm:text-xl font-black text-black tracking-tight pt-2 pb-1 border-b border-zinc-200">
                {renderInline(block.text)}
              </h1>
            );

          case "h2":
            return (
              <h2 key={idx} className="text-sm sm:text-base font-black text-black tracking-tight pt-3.5 pb-0.5 flex items-center gap-2">
                <span className="w-1.5 h-4.5 rounded-full bg-brand" />
                <span>{renderInline(block.text)}</span>
              </h2>
            );

          case "h3":
            return (
              <h3 key={idx} className="text-xs sm:text-sm font-bold text-zinc-900 pt-2 pb-0.5">
                {renderInline(block.text)}
              </h3>
            );

          case "code":
            return (
              <div key={idx} className="my-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm overflow-hidden text-left">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {block.lang === "mermaid" ? "Diagramme Logique" : "Schéma & Synthèse Visuelle"}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">Flux Conceptuel</span>
                </div>
                <pre className="p-3 sm:p-4 text-[11px] sm:text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed whitespace-pre">
                  {block.code}
                </pre>
              </div>
            );

          case "math": {
            try {
              const html = katex.renderToString(block.math, {
                displayMode: true,
                throwOnError: false,
              });
              return (
                <div
                  key={idx}
                  className="my-3 overflow-x-auto text-center p-3 rounded-2xl bg-zinc-50 border border-zinc-200/90 shadow-2xs text-black"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            } catch {
              return (
                <pre key={idx} className="my-2 p-2 bg-zinc-100 font-mono text-xs overflow-x-auto">
                  {block.math}
                </pre>
              );
            }
          }

          case "table":
            return (
              <div key={idx} className="w-full my-3 overflow-x-auto rounded-xl border border-zinc-200 shadow-2xs bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100/90 border-b border-zinc-200 text-zinc-900 font-bold">
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3 py-2 text-[11px] font-black tracking-tight whitespace-nowrap">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/60 hover:bg-zinc-100/50"}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-xs leading-normal">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "callout": {
            const config = {
              trap: { bg: "bg-amber-500/10", border: "border-amber-500", text: "text-amber-950", titleCol: "text-amber-800", icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />, title: "POINT CRITIQUE DU BARÈME D'EXAMEN" },
              memo: { bg: "bg-emerald-500/10", border: "border-emerald-500", text: "text-emerald-950", titleCol: "text-emerald-800", icon: <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />, title: "MÉMOIRE & MNÉMOTECHNIQUE" },
              app: { bg: "bg-[#4457f4]/10", border: "border-[#4457f4]", text: "text-zinc-900", titleCol: "text-[#4457f4]", icon: <Target className="w-3.5 h-3.5 text-[#4457f4] shrink-0" />, title: "APPLICATION DIRECTE & CAS TYPE" },
            }[block.variant as "trap" | "memo" | "app"];

            if (config) {
              return (
                <div key={idx} className={`p-3.5 my-2.5 rounded-xl border-l-4 ${config.bg} ${config.border} ${config.text} text-xs shadow-2xs`}>
                  <div className={`flex items-center gap-1.5 font-black text-[11px] mb-1 ${config.titleCol}`}>
                    {config.icon}
                    <span>{config.title}</span>
                  </div>
                  <div className="leading-relaxed font-medium">{renderInline(block.text)}</div>
                </div>
              );
            }
            return (
              <blockquote key={idx} className="p-3 my-2 bg-zinc-100/70 border-l-3 border-zinc-400 rounded-r-xl text-zinc-800 text-xs italic">
                {renderInline(block.text)}
              </blockquote>
            );
          }

          case "bullet":
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5 my-0.5">
                <span className="text-brand font-bold text-base leading-none select-none">•</span>
                <div className="flex-1">{renderInline(block.text)}</div>
              </div>
            );

          case "number":
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5 my-0.5">
                <span className="font-extrabold text-brand text-xs select-none">{block.num}.</span>
                <div className="flex-1">{renderInline(block.text)}</div>
              </div>
            );

          case "paragraph":
            return (
              <p key={idx} className="text-zinc-700">
                {renderInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
