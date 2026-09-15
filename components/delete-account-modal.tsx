"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export function DeleteAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText.trim() !== "SUPPRIMER") {
      setErrorMsg("Veuillez taper exactement 'SUPPRIMER' en majuscules.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText: "SUPPRIMER" }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Échec de la suppression du compte");
      }

      // Redirection après suppression réussie
      window.location.href = "/?deleted=true";
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 transition-colors text-xs font-semibold"
      >
        <span className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Supprimer mon compte (RGPD)
        </span>
        <span className="text-[10px] text-rose-500/80 font-mono">Droit à l'oubli</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-rose-900/50 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white">Supprimer mon compte ?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cette action est <strong className="text-rose-400 font-semibold">définitive et irréversible</strong>. Tous vos cours scannés, fiches et photos stockées seront purgés sous 24h conformément au RGPD.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-medium text-zinc-300">
                Tapez <span className="text-rose-400 font-bold font-mono">SUPPRIMER</span> pour valider :
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 text-sm font-mono text-center tracking-widest uppercase"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 text-center font-medium bg-rose-950/40 p-2 rounded-xl border border-rose-900/30">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setConfirmText("");
                  setErrorMsg(null);
                }}
                disabled={loading}
                className="w-1/2 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={loading || confirmText.trim() !== "SUPPRIMER"}
                className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
