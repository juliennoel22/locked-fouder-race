-- ==============================================================================
-- SNAPSTUDY — SUPABASE SCHEMA & STORAGE (HACKATHON FOUNDERRACE 24H)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DECKS (Ensembles de flashcards par cours scanné)
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Cours sans titre',
    subject TEXT,
    summary TEXT,
    initial_quiz_question TEXT,
    image_url TEXT, -- Lien direct vers la photo originale compressée dans Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE FLASHCARDS (Cartes mémoire individuelles)
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS) SUR LES TABLES
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Policies Decks
CREATE POLICY "Users can select own decks" ON public.decks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decks" ON public.decks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decks" ON public.decks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own decks" ON public.decks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies Flashcards (via deck ownership)
CREATE POLICY "Users can select own flashcards" ON public.flashcards FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.decks WHERE public.decks.id = public.flashcards.deck_id AND public.decks.user_id = auth.uid()));
CREATE POLICY "Users can insert own flashcards" ON public.flashcards FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.decks WHERE public.decks.id = public.flashcards.deck_id AND public.decks.user_id = auth.uid()));
CREATE POLICY "Users can update own flashcards" ON public.flashcards FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.decks WHERE public.decks.id = public.flashcards.deck_id AND public.decks.user_id = auth.uid()));
CREATE POLICY "Users can delete own flashcards" ON public.flashcards FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.decks WHERE public.decks.id = public.flashcards.deck_id AND public.decks.user_id = auth.uid()));

-- 5. INDEXES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);

-- ==============================================================================
-- 6. SUPABASE STORAGE (BUCKET PRIVÉ 'course-scans')
-- ==============================================================================

-- Création du bucket privé pour stocker les photos de cours
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-scans', 'course-scans', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policies Storage Privé
CREATE POLICY "Authenticated users read own course-scans" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'course-scans' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Authenticated users upload own course-scans" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-scans' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Authenticated users delete own course-scans" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-scans' AND (storage.foldername(name))[1] = auth.uid()::text);

