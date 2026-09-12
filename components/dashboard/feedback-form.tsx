"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, Loader2, Star } from "lucide-react";

const TAGS = [
  { id: "J'adore", label: "🔥 J'adore" },
  { id: "Idée", label: "💡 Idée" },
  { id: "Bug", label: "⚠️ Bug" },
  { id: "Autre", label: "💬 Autre" },
];

interface FeedbackFormProps {
  onClose?: () => void;
  hideHeader?: boolean;
}

export function FeedbackForm({ onClose, hideHeader = false }: FeedbackFormProps = {}) {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [selectedTag, setSelectedTag] = useState<string>("J'adore");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("loreno_user_email");
      if (stored) {
        setEmail(stored);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage("Écris un petit message avant d'envoyer.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          rating,
          tag: selectedTag,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSubmitted(true);
      setMessage("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-center space-y-2.5 animate-in fade-in duration-300">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-black">Merci pour ton retour !</h3>
          <p className="text-xs text-zinc-600 max-w-xs mx-auto">
            Ton message a bien été transmis directement à Julien par email.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-1.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition"
            >
              Fermer
            </button>
          )}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs text-zinc-500 hover:text-black underline pt-1"
          >
            Envoyer un autre retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full space-y-3.5 select-none">
      {/* En-tête conditionnel */}
      {!hideHeader && (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-black">Donne ton avis sur Loreno</h2>
            <p className="text-[11px] text-zinc-500">
              Une idée, un ressenti ou un bug ? Julien lit tous les retours.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        {/* Sélecteur de Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTag(tag.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                selectedTag === tag.id
                  ? "bg-black text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Notation étoiles */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-zinc-500 font-medium">Note générale :</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-zinc-300 hover:text-black transition"
                aria-label={`Noter ${star} sur 5`}
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= rating ? "fill-black text-black" : "text-zinc-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Dis-nous ce que tu penses de l'app, ce qui t'aide ou ce qu'on peut améliorer..."
            rows={3}
            required
            className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition resize-none"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Email optionnel */}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ton email (pour qu'on te réponde)"
            className="w-full h-10 bg-white border border-zinc-200 rounded-xl px-3 text-xs text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition"
            style={{ fontSize: "16px" }}
          />
        </div>

        {errorMessage && (
          <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg text-center">
            {errorMessage}
          </p>
        )}

        {/* Bouton Envoi */}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full h-11 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer à Julien</span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
