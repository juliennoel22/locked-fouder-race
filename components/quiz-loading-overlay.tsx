import { Loader2 } from "lucide-react";

interface QuizLoadingOverlayProps {
  message: string;
  progress: number;
}

export function QuizLoadingOverlay({ message, progress }: QuizLoadingOverlayProps) {
  return (
    <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-center items-center p-6 bg-white text-black text-center">
      <div className="w-full space-y-6">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-black" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{message}</h2>
          <p className="text-xs text-zinc-500">Patiente 2 à 3 secondes...</p>
        </div>
        <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
          <div
            className="bg-black h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs font-mono text-zinc-500">{progress}%</p>
      </div>
    </div>
  );
}
