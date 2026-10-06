---
id: BUG-005
title: "Persistance de la session utilisateur sur mobile (Safari / Chrome)"
author: "Baptiste"
type: "bug"
status: "resolved"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - lib/supabase/server.ts
  - lib/supabase/client.ts
  - lib/supabase/middleware.ts
acceptance_criteria:
  - "L'utilisateur reste connecté lorsqu'il ferme et rouvre son navigateur mobile"
  - "Les cookies d'authentification Supabase SSR possèdent une durée de vie (maxAge 1 an) et des attributs sécurisés adéquats"
  - "Aucune redirection intempestive vers /auth si la session est valide"
  - "npm run build passe avec 0 erreur"
---

# BUG-005 : Persistance de la session utilisateur sur mobile (Safari / Chrome)

## 1. Contexte & Problème Observé
Baptiste indique (Vocaux 12 & 13) qu'à chaque fois qu'il rouvre Loreno sur smartphone, il est déconnecté et doit recliquer sur se connecter. Cela crée une friction inacceptable pour la rétention quotidienne.

## 2. Spécification Technique & Solution 80/20
- Enrichement de `cookieOptions` avec `maxAge: 31536000` (1 an), `sameSite: 'lax'`, `path: '/'` dans `lib/supabase/client.ts`.
- Imposition d'une durée de vie explicite d'un an sur les cookies rafraîchis dans `lib/supabase/server.ts` et `lib/supabase/middleware.ts` pour empêcher iOS/Android d'effacer la session à la fermeture du navigateur.
- Activation de `persistSession`, `autoRefreshToken` et `detectSessionInUrl`.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-06
- **Statut final** : `resolved`
- **Résolution** : Attribution `maxAge: 31536000` (1 an) sur l'ensemble des clients Supabase SSR/browser et du middleware. Persistance mobile Safari iOS / Chrome Android garantie. Build `npm run build` validé.
