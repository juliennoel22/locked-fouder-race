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
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer group"
      >
        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span>Supprimer définitivement mon compte (RGPD)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-zinc-200 p-6 shadow-2xl space-y-4 text-black">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-black">Supprimer mon compte ?</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Cette action est <strong className="text-rose-600 font-semibold">définitive et irréversible</strong>. Tous vos cours scannés, fiches et photos stockées seront purgés conformément au RGPD.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-semibold text-zinc-700 block">
                Tapez <span className="text-rose-600 font-bold font-mono">SUPPRIMER</span> pour valider :
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-black placeholder-zinc-400 focus:outline-none focus:border-rose-500 focus:bg-white text-sm font-mono text-center tracking-widest uppercase transition"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 text-center font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
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
                className="w-1/2 border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDelete}
                disabled={loading || confirmText.trim() !== "SUPPRIMER"}
                className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-40"
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
