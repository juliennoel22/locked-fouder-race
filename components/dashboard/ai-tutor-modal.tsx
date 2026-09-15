"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Bot, User, Loader2, Trash2 } from "lucide-react";
import { NotebookItem } from "@/types/loreno";
import { FormattedAiText } from "./formatted-ai-text";

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebook: NotebookItem;
}

interface Message {
  role: "user" | "model";
  text: string;
  isStreaming?: boolean;
}

export function AiTutorModal({ isOpen, onClose, notebook }: AiTutorModalProps) {
  const defaultGreeting: Message = {
    role: "model",
    text: `Salut ! Je suis ton tuteur IA pour **${notebook.title}**.\n\nPose-moi tes questions ou demande-moi une **question piège** pour t'entraîner !`,
  };

  const [messages, setMessages] = useState<Message[]>([defaultGreeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `loreno_tutor_${notebook.id}`;

  // Chargement de l'historique de discussion spécifique au cours
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch { }
    setMessages([defaultGreeting]);
  }, [isOpen, notebook.id, storageKey]);

  // Sauvegarde persistante des messages
  const persistMessages = useCallback(
    (newMessages: Message[]) => {
      if (typeof window === "undefined") return;
      try {
        const clean = newMessages.map(({ role, text }) => ({ role, text }));
        localStorage.setItem(storageKey, JSON.stringify(clean));
      } catch { }
    },
    [storageKey]
  );

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Réinitialisation / Clear du chat
  const handleClearChat = () => {
    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    setMessages([defaultGreeting]);
    setLoading(false);
  };

  // Effet de streaming mot par mot fluide
  const streamWordByWord = (fullText: string, baseMessages: Message[]) => {
    const words = fullText.split(" ");
    let currentIdx = 0;

    const streamNext = () => {
      currentIdx = Math.min(currentIdx + 2, words.length);
      const displayedText = words.slice(0, currentIdx).join(" ");
      const isDone = currentIdx >= words.length;

      const updated = [
        ...baseMessages,
        {
          role: "model" as const,
          text: displayedText,
          isStreaming: !isDone,
        },
      ];

      setMessages(updated);

      if (!isDone) {
        streamTimeoutRef.current = setTimeout(streamNext, 25);
      } else {
        persistMessages(updated);
        setLoading(false);
      }
    };

    streamNext();
  };

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input.trim();
    if (!textToSend || loading) return;

    if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);

    const updatedUserMessages: Message[] = [...messages, { role: "user", text: textToSend }];
    setMessages(updatedUserMessages);
    persistMessages(updatedUserMessages);
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
          messages: updatedUserMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        "Je n'ai pas pu formuler de réponse pour ce cours. Réessaie dans un instant.";
      streamWordByWord(reply, updatedUserMessages);
    } catch {
      const fallbackMessages: Message[] = [
        ...updatedUserMessages,
        { role: "model", text: "Erreur de connexion. Vérifie ton réseau." },
      ];
      setMessages(fallbackMessages);
      persistMessages(fallbackMessages);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[90dvh] sm:h-[650px] bg-white border border-zinc-200 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-1">
            {messages.length > 1 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                title="Vider la conversation"
                aria-label="Vider la conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message feed avec auto-scroll */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
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
                className={`max-w-[85%] rounded-2xl p-3 ${m.role === "user"
                    ? "bg-black text-white rounded-br-none whitespace-pre-wrap leading-relaxed"
                    : "bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-bl-none shadow-2xs"
                  }`}
              >
                {m.role === "model" ? (
                  <FormattedAiText content={m.text} isStreaming={m.isStreaming} />
                ) : (
                  m.text
                )}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && !messages[messages.length - 1]?.isStreaming && (
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
            className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0 cursor-pointer"
          >
            🎯 Question piège
          </button>
          <button
            onClick={() => handleSend("Donne-moi un moyen mnémotechnique pour retenir les définitions.")}
            className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0 cursor-pointer"
          >
            💡 Moyen mnémotechnique
          </button>
          <button
            onClick={() => handleSend("Résume les 3 points qui rapportent le plus de points à l'épreuve.")}
            className="text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0 cursor-pointer"
          >
            3 points clés
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-zinc-200 bg-white flex items-center gap-2">
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
            className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-40 transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}


