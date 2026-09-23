-- Migration : Ajout des fiches développées et de la progression
ALTER TABLE public.decks 
ADD COLUMN IF NOT EXISTS detailed_content TEXT,
ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
