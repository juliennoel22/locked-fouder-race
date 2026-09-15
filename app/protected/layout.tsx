import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">

              </span>
              <span>Loreno</span>
            </Link>
            <div className="flex items-center gap-3">
              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <Suspense fallback={<div className="h-8 w-24 bg-muted animate-pulse rounded-md" />}>
                  <AuthButton />
                </Suspense>
              )}
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col max-w-5xl w-full p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t border-border/40 text-xs text-muted-foreground gap-4 py-8">
          <p>Loreno  (loreno.app) • Hackathon FounderRace 2026</p>
        </footer>
      </div>
    </main>
  );
}
