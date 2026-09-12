import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_URL = "https://bfxbrveuwyiidfthevdn.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeGJydmV1d3lpaWRmdGhldmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTI3ODMsImV4cCI6MjEwNDc2ODc4M30.YohfDMZLWTQx3LZg25z2sXRaCqZTt_q0HziS_IRqZhg";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_KEY;

  return createBrowserClient(url, key);
}
