"use client";

import {
  FileText,
  Image as ImageIcon,
  RotateCw,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { CourseDoc } from "./types";

interface MirrorDocCardProps {
  doc: CourseDoc;
  index: number;
  totalDocs: number;
  rotation: number;
  title: string;
  onRotate: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
}

export function MirrorDocCard({
  doc,
  index,
  totalDocs,
  rotation,
  title,
  onRotate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: MirrorDocCardProps) {
  return (
    <div className="relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Badge & Contrôles de page */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xs pointer-events-auto">
          {doc.isPdf ? (
            <FileText className="w-3 h-3 text-red-400" />
          ) : (
            <ImageIcon className="w-3 h-3 text-amber-400" />
          )}
          <span>Page {index + 1}</span>
          {doc.isNew && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px]">
              Nouveau
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 pointer-events-auto bg-black/80 backdrop-blur-xs p-1 rounded-xl shadow-xs">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1.5 rounded-lg text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            title="Monter cette page"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalDocs - 1}
            className="p-1.5 rounded-lg text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            title="Descendre cette page"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {!doc.isPdf && (
            <button
              onClick={() => onRotate(doc.id)}
              className="p-1.5 rounded-lg text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Pivoter la photo à 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {doc.isPdf && (
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-white hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
              title="Ouvrir le PDF dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onDelete(doc.id)}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition cursor-pointer"
            title="Supprimer ce document du cours"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rendu Document Image (avec rotation CSS) ou PDF */}
      <div className="w-full flex items-center justify-center bg-zinc-50 min-h-[320px] p-2 overflow-hidden">
        {doc.isPdf ? (
          <div className="w-full space-y-2 pt-10">
            <object
              data={doc.url}
              type="application/pdf"
              className="w-full h-[520px] border-0 rounded-xl bg-white"
            >
              <div className="text-center p-6 space-y-3 bg-white rounded-xl border border-zinc-200">
                <FileText className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-xs text-zinc-600 font-medium">
                  Visualisation du PDF intégrée
                </p>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white text-xs font-semibold"
                >
                  <span>Ouvrir le PDF original</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </object>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={doc.url}
            alt={`Document ${title} - Page ${index + 1}`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
            }}
            className="w-full h-auto object-contain select-none max-h-[70vh] rounded-lg"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
