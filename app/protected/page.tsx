import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, BookOpen, PlusCircle } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="text-sm">
      Connecté en tant que <span className="font-semibold text-primary">{data.claims.email}</span>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-4">
      <div className="bg-accent/50 border border-accent text-sm p-4 rounded-xl text-foreground flex gap-3 items-center">
        <InfoIcon size="18" className="text-primary flex-shrink-0" />
        <span>Espace membre Loreno — Tes decks sauvegardés et ton historique de révision.</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Mes Decks de Révision</h1>
          <Suspense fallback={<div className="h-4 w-40 bg-muted animate-pulse rounded mt-1" />}>
            <UserDetails />
          </Suspense>
        </div>
        <Button asChild className="gap-2">
          <Link href="/">
            <PlusCircle className="w-4 h-4" />
            Nouveau Scan
          </Link>
        </Button>
      </div>

      <div className="border border-dashed border-border/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center bg-card/30">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-lg">Aucun cours scanné pour le moment</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          Prends en photo tes notes de cours depuis la page d&apos;accueil pour générer ton premier deck de flashcards.
        </p>
        <Button asChild>
          <Link href="/">Scanner un cours maintenant</Link>
        </Button>
      </div>
    </div>
  );
}
