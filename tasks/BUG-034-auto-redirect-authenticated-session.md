---
id: BUG-034
type: bug
priority: P0
author: Baptiste
title: Redirection automatique à la racine (/) pour les utilisateurs déjà connectés
status: resolved
resolved_at: 2026-10-27
created_at: 2026-10-27
files_impacted:
  - lib/supabase/middleware.ts
  - app/page.tsx
acceptance_criteria:
  - "Un utilisateur déjà authentifié (session Supabase valide) qui navigue sur loreno.app (/) est automatiquement redirigé vers /dashboard (ou /quiz si onboarding incomplet)"
  - "L'utilisateur n'a plus besoin de voir l'écran d'accueil ni de cliquer sur 'Déjà un compte ? Connexion' pour accéder à ses cours"
  - "Les nouveaux visiteurs ou utilisateurs non connectés continuent d'arriver normalement sur la landing page d'accueil"
  - "npm run build passe avec 0 erreur"
---

# BUG-034 : Redirection automatique à la racine (/) pour les utilisateurs déjà connectés

## 1. Contexte & Problème Observé
Retours vocaux de Baptiste (27/10/2026) :
> *"À chaque fois que je vais sur Loreno, ça me renvoie vers la page pour se connecter. Donc quand je clique sur 'J'ai déjà un compte', ça me connecte automatiquement sans passer par la page de connexion, mais ça me met sur la page d'onboarding comme si je venais pour la première fois... Il faudrait que je sois automatiquement connecté si je me suis déjà connecté avant."*

## 2. Cause Racine Identifiée
Dans `lib/supabase/middleware.ts` :
- La redirection automatique des utilisateurs connectés n'est active que sur les pages d'authentification (`pathname === "/auth" || "/auth/login" || ...`).
- Sur la racine (`pathname === "/"`), le middleware laisse passer la requête sans redirection.
- `app/page.tsx` est un composant serveur statique qui affiche toujours la landing page aux visiteurs.
- Lorsque l'utilisateur clique sur le lien `"Déjà un compte ? Connexion →"` (`/auth/login`), le middleware intercepte la route `/auth/login`, constate que `user` existe, et le redirige enfin vers `/dashboard`.
- Résultat : l'utilisateur a l'impression d'être déconnecté et doit cliquer inutilement à chaque ouverture de `loreno.app`.

## 3. Solution Ciblée (Prête pour implémentation)
1. Dans `lib/supabase/middleware.ts`, ajouter la racine `/` à la logique de redirection si `user` est connecté :
   ```typescript
   if (user && (isAuthPage || pathname === "/")) {
     const url = request.nextUrl.clone();
     url.pathname = isOnboardingCompleted ? "/dashboard" : "/quiz";
     // ...
   }
   ```
2. Prévoir une exception si un paramètre d'URL explicite (ex: `?welcome=true` ou navigation voulue) nécessite de voir la landing.
3. Valider avec `npm run build`.
