"use client";

import { useEffect, useRef, useState, useCallback, ReactNode, TouchEvent } from "react";
import { X } from "lucide-react";

interface MobileBottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  headerRight?: ReactNode;
  maxHeight?: string;
  showGrabHandle?: boolean;
}

export function MobileBottomDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  headerRight,
  maxHeight = "90dvh",
  showGrabHandle = true,
}: MobileBottomDrawerProps) {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragOffset(0);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsClosing(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || startY.current === null) return;
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const onTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset > 90) {
      handleClose();
    } else {
      setDragOffset(0);
    }
    startY.current = null;
    currentY.current = null;
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end select-none pointer-events-auto">
      {/* Backdrop sombre flouté */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Conteneur Drawer Mobile Shell */}
      <div
        className={`relative w-full max-w-md mx-auto bg-white rounded-t-[28px] border-t border-zinc-200/90 shadow-2xl flex flex-col overflow-hidden transition-transform duration-200 ease-out z-10 ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
        style={{
          maxHeight,
          transform: isClosing ? "translateY(100%)" : `translateY(${dragOffset}px)`,
        }}
      >
        {/* Poignée de préhension pour swipe vers le bas */}
        {showGrabHandle && (
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="w-full pt-3 pb-1.5 flex justify-center cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="w-12 h-1.5 rounded-full bg-zinc-300 active:bg-zinc-400 transition-colors" />
          </div>
        )}

        {/* En-tête du Drawer */}
        {(title || headerRight) && (
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-zinc-100">
            <div className="truncate flex-1 pr-2">
              {title && <h2 className="text-sm font-black text-zinc-900 truncate">{title}</h2>}
              {description && <p className="text-[11px] text-zinc-500 truncate">{description}</p>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {headerRight}
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition active:scale-95 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Contenu déroulable du Drawer */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
