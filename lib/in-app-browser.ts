/**
 * Détection des navigateurs in-app (TikTok, Instagram, Facebook, Snapchat, etc.)
 * où l'authentification Google OAuth est bloquée avec l'erreur 403 "disallowed_useragent".
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined" || !window.navigator) return false;

  const ua = (window.navigator.userAgent || window.navigator.vendor || "").toLowerCase();

  const inAppSignatures = [
    "instagram",
    "fban",
    "fbav",
    "musical_ly",
    "bytedance",
    "tiktok",
    "snapchat",
    "twitter",
    "linkedinapp",
    "threads",
    "pinterest",
    "micromessenger",
    "line/",
    "wv",
  ];

  return inAppSignatures.some((sig) => ua.includes(sig));
}
