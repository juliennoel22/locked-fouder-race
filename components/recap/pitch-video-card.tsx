"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";

interface PitchVideoCardProps {
  src?: string;
  poster?: string;
}

export function PitchVideoCard({
  src = "/recap/pitch-stream.mp4",
  poster,
}: PitchVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col items-center">
      {/* Video Smartphone Mockup Container */}
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-3xl bg-zinc-950 border-[3px] border-zinc-900 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-3 z-30 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-800 mr-2" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
          </div>
        </div>

        {/* HTML5 Video element with stream support */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play Overlay when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-20 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-[#4457f4] text-white flex items-center justify-center shadow-lg shadow-[#4457f4]/40 hover:scale-105 active:scale-95 transition-transform">
              <Play className="w-7 h-7 fill-white ml-1" />
            </div>
            <span className="mt-3 text-xs font-bold text-white tracking-wide uppercase">
              Lancer le Pitch
            </span>
          </div>
        )}

        {/* Floating Quick Action Controls when playing */}
        {isPlaying && (
          <div className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-white/10 text-white shadow-lg">
            <button
              onClick={togglePlay}
              type="button"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={handleRestart}
              type="button"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Recommencer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              type="button"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
