-- ==============================================================================
-- LORENO — MIGRATION SYSTEME D'AFFILIATION VIRALE & CASH (GIVE & GET + VIREMENT 70€)
-- ==============================================================================

-- 1. Table `user_referrals` (Compte d'affiliation par utilisateur)
CREATE TABLE IF NOT EXISTS public.user_referrals (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    invited_count INTEGER DEFAULT 0,
    pro_days_earned INTEGER DEFAULT 0,
    balance_cents INTEGER DEFAULT 0, -- Solde cumulé en centimes (ex: 1400 = 14,00 €)
    total_earned_cents INTEGER DEFAULT 0,
    iban TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table `payout_requests` (Demandes de virement bancaire dès 70 €)
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL CHECK (amount_cents >= 7000), -- Minimum 70,00 €
    iban TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own referral profile" ON public.user_referrals
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referral profile" ON public.user_referrals
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral profile" ON public.user_referrals
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own payout requests" ON public.payout_requests
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payout requests" ON public.payout_requests
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Index de performance
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_payout_requests_user ON public.payout_requests(user_id);
