"use client";

import { BookOpen, Check, Lightbulb } from "lucide-react";
import { ReviewQueueItem } from "./review-types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReviewConceptStepProps {
  item: ReviewQueueItem;
  subjectTitle: string;
  onValidate: () => void;
}

export function ReviewConceptStep({
  item,
  subjectTitle,
  onValidate,
}: ReviewConceptStepProps) {
  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 text-left animate-in fade-in duration-300 select-none">
      <Card className="w-full p-6 space-y-5 shadow-xs border-border/80">
        {/* En-tête Badges */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" size="sm" className="gap-1.5 font-semibold text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 text-[#4457f4]" />
            <span>Lecture active • {subjectTitle}</span>
          </Badge>
          <Badge variant="secondary" size="sm" className="font-semibold text-xs text-foreground">
            Concept clé
          </Badge>
        </div>

        {/* Titre / Concept */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight leading-snug">
            {item.front}
          </h2>
        </div>

        {/* Définition / Explication */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/60 text-sm sm:text-base text-foreground leading-relaxed">
          <p className="whitespace-pre-line font-normal">{item.back}</p>
        </div>

        {/* Conseil mnémotechnique Coss UI style */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <p className="italic leading-normal">
            Lis attentivement avant de passer au rappel 3D actif.
          </p>
        </div>
      </Card>

      {/* Bouton d'action principal dans la Thumb Zone */}
      <div className="pt-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
        <Button
          type="button"
          size="xl"
          onClick={onValidate}
          className="w-full h-14 rounded-full font-black text-sm sm:text-base gap-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] bg-neutral-900 border-t-2 border-white/30 border-b-4 border-b-black text-white hover:bg-neutral-800 active:border-b-0 active:translate-y-1 transition-all duration-100"
        >
          <Check className="w-4 h-4 stroke-[3.5]" />
          <span className="tracking-wide">J&apos;ai assimilé ce concept</span>
        </Button>
      </div>
    </div>
  );
}
