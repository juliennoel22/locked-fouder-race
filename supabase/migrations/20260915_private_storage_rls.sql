-- ==============================================================================
-- LORENO — MIGRATION STORAGE PRIVE & RLS ZEROTRUST
-- ==============================================================================

-- 1. PASSAGE DU BUCKET STORAGE EN MODE PRIVÉ (public = false)
UPDATE storage.buckets
SET public = false
WHERE id = 'course-scans';

-- 2. NETTOYAGE DES ANCIENNES POLICIES PUBLIQUES
DROP POLICY IF EXISTS "Public Access course-scans" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course-scans" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course-scans" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users read own course-scans" ON storage.objects;

-- 3. NOUVELLES POLICIES PRIVÉES RESTREINTES AU PROPRIÉTAIRE (folder = auth.uid())

-- Lecture : Seul le propriétaire peut lire/télécharger ses photos scannées
CREATE POLICY "Authenticated users read own course-scans"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'course-scans' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Écriture : Seul le propriétaire peut uploader dans son propre sous-dossier
CREATE POLICY "Authenticated users upload own course-scans"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'course-scans' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Suppression : Seul le propriétaire peut supprimer ses propres scannes
CREATE POLICY "Authenticated users delete own course-scans"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'course-scans' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. RENFORCEMENT STRICT DES POLICIES TABLES DECKS & FLASHCARDS
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Verrouillage Decks
DROP POLICY IF EXISTS "Users can manage their own decks" ON public.decks;

CREATE POLICY "Users can select own decks"
    ON public.decks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks"
    ON public.decks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
    ON public.decks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
    ON public.decks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Verrouillage Flashcards
DROP POLICY IF EXISTS "Users can manage flashcards of their decks" ON public.flashcards;

CREATE POLICY "Users can select own flashcards"
    ON public.flashcards FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.decks
            WHERE public.decks.id = public.flashcards.deck_id
            AND public.decks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own flashcards"
    ON public.flashcards FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.decks
            WHERE public.decks.id = public.flashcards.deck_id
            AND public.decks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own flashcards"
    ON public.flashcards FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.decks
            WHERE public.decks.id = public.flashcards.deck_id
            AND public.decks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own flashcards"
    ON public.flashcards FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.decks
            WHERE public.decks.id = public.flashcards.deck_id
            AND public.decks.user_id = auth.uid()
        )
    );
