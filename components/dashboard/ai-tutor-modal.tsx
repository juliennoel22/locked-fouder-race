"use client";

import { useState } from "react";
import { X, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { NotebookItem } from "@/types/loreno";

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebook: NotebookItem;
}

interface Message {
  role: "user" | "model";
  text: string;
}

export function AiTutorModal({ isOpen, onClose, notebook }: AiTutorModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Salut ! Je suis ton tuteur IA pour "${notebook.title}". Pose-moi n'importe quelle question ou demande-moi de te tester sur une notion piège d'examen !`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input.trim();
    if (!textToSend || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notebook.title,
          subject: notebook.subject,
          summary: notebook.deck.summary,
          flashcards: notebook.deck.flashcards,
          messages: newMessages,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: "model", text: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "model", text: "Je n'ai pas pu générer de réponse. Réessaie." },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "model", text: "Erreur de connexion. Vérifie ton réseau." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[90dvh] sm:h-[650px] bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-black flex items-center gap-1.5">
                <span>Tuteur IA Partiels</span>
                <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-mono">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                {notebook.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "model" && (
                <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-black" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                  m.role === "user"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-zinc-400 text-xs">
              <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              </div>
              <span>Le tuteur prépare sa réponse...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-3 py-1.5 border-t border-zinc-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSend("Pose-moi une question piège d'examen sur ce cours.")}
            className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0"
          >
            🎯 Question piège
          </button>
          <button
            onClick={() => handleSend("Donne-moi un moyen mnémotechnique pour retenir les définitions.")}
            className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0"
          >
            💡 Moyen mnémotechnique
          </button>
          <button
            onClick={() => handleSend("Résume les 3 points qui rapportent le plus de points à l'épreuve.")}
            className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0"
          >
            ⚡ 3 points clés
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-zinc-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose une question sur ton cours..."
            className="flex-1 text-base sm:text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-40 transition active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
