-- ==============================================================================
-- LORENO — CONSOLIDATED PRODUCTION SCHEMA SYNC (2026-10-26)
-- Synchronizes all columns & tables required by the application in production.
-- Safe to run multiple times (idempotent IF NOT EXISTS).
-- ==============================================================================

-- 1. Columns on public.decks
ALTER TABLE public.decks
  ADD COLUMN IF NOT EXISTS detailed_content TEXT,
  ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initial_quiz_answer TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Columns on public.flashcards
ALTER TABLE public.flashcards
  ADD COLUMN IF NOT EXISTS distractors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 2b. Backfill native columns from lib/db-compat.ts packed delimiters & strip delimiters
UPDATE public.decks
SET
  progress_percent = CASE
    WHEN (progress_percent IS NULL OR progress_percent = 0) AND summary ~ '<!--LORENO_PROGRESS:(\d+)-->$'
    THEN COALESCE( NULLIF(substring(summary FROM '<!--LORENO_PROGRESS:(\d+)-->$'), '')::integer, 0 )
    ELSE COALESCE(progress_percent, 0)
  END,
  detailed_content = CASE
    WHEN (detailed_content IS NULL OR btrim(detailed_content) = '') AND summary LIKE '%<!--LORENO_DETAILED-->%'
    THEN btrim(regexp_replace(split_part(summary, E'\n\n<!--LORENO_DETAILED-->\n', 2), E'\n<!--LORENO_PROGRESS:\\d+-->$', ''))
    ELSE detailed_content
  END,
  summary = btrim(split_part(regexp_replace(summary, E'\n<!--LORENO_PROGRESS:\\d+-->$', ''), E'\n\n<!--LORENO_DETAILED-->\n', 1))
WHERE summary LIKE '%<!--LORENO_DETAILED-->%' OR summary LIKE '%<!--LORENO_PROGRESS:%';

UPDATE public.decks
SET
  initial_quiz_answer = CASE
    WHEN (initial_quiz_answer IS NULL OR btrim(initial_quiz_answer) = '') AND initial_quiz_question LIKE '%<!--LORENO_QUIZ_ANS-->%'
    THEN btrim(split_part(initial_quiz_question, E'\n\n<!--LORENO_QUIZ_ANS-->\n', 2))
    ELSE initial_quiz_answer
  END,
  initial_quiz_question = btrim(split_part(initial_quiz_question, E'\n\n<!--LORENO_QUIZ_ANS-->\n', 1))
WHERE initial_quiz_question LIKE '%<!--LORENO_QUIZ_ANS-->%';

UPDATE public.flashcards
SET
  distractors = CASE
    WHEN (distractors IS NULL OR distractors = '[]'::jsonb) AND back LIKE '%<!--LORENO_DISTRACTORS-->%'
    THEN COALESCE(split_part(back, E'\n\n<!--LORENO_DISTRACTORS-->\n', 2)::jsonb, '[]'::jsonb)
    ELSE COALESCE(distractors, '[]'::jsonb)
  END,
  back = btrim(split_part(back, E'\n\n<!--LORENO_DISTRACTORS-->\n', 1))
WHERE back LIKE '%<!--LORENO_DISTRACTORS-->%';


-- 3. Table public.review_logs (Cross-device SRS & weak cards tracking)
CREATE TABLE IF NOT EXISTS public.review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  card_front TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good')),
  step_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'review_logs' AND policyname = 'Users can manage own review_logs'
  ) THEN
    CREATE POLICY "Users can manage own review_logs" ON public.review_logs
      FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_review_logs_user_deck ON public.review_logs(user_id, deck_id, created_at DESC);

-- 4. Table public.feedback (Student feedback capture)
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NULL,
  message TEXT NOT NULL,
  rating INTEGER NULL,
  tag TEXT DEFAULT 'Avis général',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 5. Table public.user_referrals & public.payout_requests (Affiliate & Referral loop)
CREATE TABLE IF NOT EXISTS public.user_referrals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  invited_count INTEGER DEFAULT 0,
  pro_days_earned INTEGER DEFAULT 0,
  balance_cents INTEGER DEFAULT 0,
  total_earned_cents INTEGER DEFAULT 0,
  iban TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 7000),
  iban TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_payout_requests_user ON public.payout_requests(user_id);
