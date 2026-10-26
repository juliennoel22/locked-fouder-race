-- Migration : Ajout de la réponse officielle à la question piège d'examen
ALTER TABLE public.decks 
ADD COLUMN IF NOT EXISTS initial_quiz_answer TEXT;
