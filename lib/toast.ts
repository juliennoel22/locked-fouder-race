"use client";

import { useState, useEffect } from "react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "error";
  icon?: string;
}

type Listener = (toasts: ToastItem[]) => void;
let listeners: Listener[] = [];
let toastQueue: ToastItem[] = [];

export function showToast(toast: Omit<ToastItem, "id">) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newToast: ToastItem = { ...toast, id };
  toastQueue = [...toastQueue, newToast];
  listeners.forEach((l) => l(toastQueue));

  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toastQueue));
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastQueue);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = (id: string) => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toastQueue));
  };

  return { toasts, dismiss, showToast };
}
