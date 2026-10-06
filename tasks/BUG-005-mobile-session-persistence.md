---
id: BUG-005
title: "Persistance de la session utilisateur sur mobile (Safari / Chrome)"
author: "Baptiste"
type: "bug"
status: "ready"
priority: "p0"
created_at: "2026-10-04"
affected_files:
  - lib/supabase/server.ts
  - lib/supabase/client.ts
  - middleware.ts
acceptance_criteria:
  - "L'utilisateur reste connecté lorsqu'il ferme et rouvre son navigateur mobile"
  - "Les cookies d'authentification Supabase SSR possèdent une durée de vie et des attributs sécurisés adéquats"
  - "Aucune redirection intempestive vers /auth si la session est valide"
  - "npm run build passe avec 0 erreur"
---

# BUG-005 : Persistance de la session utilisateur sur mobile (Safari / Chrome)

## 1. Contexte & Problème Observé
Baptiste indique (Vocaux 12 & 13) qu'à chaque fois qu'il rouvre Loreno sur smartphone, il est déconnecté et doit recliquer sur se connecter. Cela crée une friction inacceptable pour la rétention quotidienne.

## 2. Spécification Technique & Solution 80/20
- Vérifier `middleware.ts` et `lib/supabase/server.ts` :
  - S'assurer que le rafraîchissement des tokens Supabase (`supabase.auth.getUser()`) met correctement à jour les cookies de réponse dans le middleware Next.js.
  - Vérifier que `persistSession: true` et `autoRefreshToken: true` sont actifs sur le client Supabase browser.
  - Tester le stockage des cookies et la gestion de `sameSite: 'lax'`.

## 3. Journal de Résolution (Rempli par l'Agent)
- **Date** : 2026-10-04
- **Statut final** : `ready`
