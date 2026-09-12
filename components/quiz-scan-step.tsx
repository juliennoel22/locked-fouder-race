import { RefObject } from "react";
import { Camera, Upload } from "lucide-react";

interface QuizScanStepProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage: string | null;
}

export function QuizScanStep({
  fileInputRef,
  onFileSelect,
  errorMessage,
}: QuizScanStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-black">Scanne ton cours</h2>
        <p className="text-sm text-zinc-600 max-w-xs mx-auto">
          Prends en photo une page de ton cours (manuscrit ou imprimé). Notre IA extrait l&apos;essentiel et génère tes fiches.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileSelect}
        className="hidden"
      />

      <div className="space-y-3 pt-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-16 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition shadow-md"
        >
          <Camera className="w-5 h-5" />
          Prendre une photo
        </button>

        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute("capture");
              fileInputRef.current.click();
            }
          }}
          className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-medium text-sm flex items-center justify-center gap-2 transition"
        >
          <Upload className="w-4 h-4" />
          Importer un fichier
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
