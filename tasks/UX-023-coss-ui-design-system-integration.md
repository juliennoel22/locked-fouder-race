---
id: UX-023
type: ux
priority: P0
title: Intégration complète du Design System Coss UI (Base UI + Tactile Physics)
author: Julien
status: resolved
created_at: 2026-10-15
resolved_at: 2026-10-15
files_impacted:
  - components/ui/button.tsx
  - components/ui/badge.tsx
  - components/ui/card.tsx
  - components/ui/input.tsx
  - components/ui/label.tsx
  - components/ui/checkbox.tsx
  - components/ui/spinner.tsx
  - components/ui/dialog.tsx
  - package.json
---

# UX-023 : Intégration complète du Design System Coss UI (Base UI + Tactile Physics)

## 🎯 Objectif
Migrer le design system de Loreno vers les primitives et conventions officielles de **Coss UI** (`https://coss.com/ui`), construites sur `@base-ui/react` (Base UI) et Tailwind CSS.

## 🛠️ Réalisations
1. **Installation des Skills Officielles Coss UI** :
   - `.agents/skills/coss/` (Règles architecturales, primitives, imports canoniques, conventions d'accessibilité).
   - `.agents/skills/coss-particles/` (Catalogue de 520+ compositions et micro-patterns interactifs).
2. **Installation de la dépendance de base** :
   - Ajout de `@base-ui/react` (MUI / floating-ui) compatible React 19 et Next.js 16.
3. **Refactorisation intégrale des composants UI** :
   - `Button` : Primitives Coss UI avec `useRender` & `mergeProps`, support de la prop `render` et compatibilité `asChild`, gestion du `loading` avec indicateur spinner intégré, micro-relief physique (`not-disabled:inset-shadow`, `data-pressed:inset-shadow`), et cibles tactiles de 44px garanties via `pointer-coarse:after:min-h-11`.
   - `Badge` : Variants sémantiques (default, secondary, destructive, error, info, success, warning, brand) avec cibles tactiles interactives `pointer-coarse:after:min-h-11`.
   - `Card` : Architecture complète Coss UI (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardPanel`/`CardContent`, `CardFooter`, `CardAction`).
   - `Input` : Primitives Coss UI basées sur `@base-ui/react/input` avec rings subtils et protection autofill.
   - `Label` : Primitives Coss UI basées sur `@base-ui/react` `useRender`.
   - `Checkbox` : Primitives Coss UI avec `@base-ui/react/checkbox` et icônes d'état fluides.
   - `Spinner` : Primitives Coss UI avec `Loader2Icon` et rôle `status`.
   - `Dialog` : Modale Coss UI avec comportement "bottomStickOnMobile" (drawer collé en bas sur mobile, centré sur desktop).
4. **Vérification et Contrôle** :
   - Strict respect de la règle `< 300 lignes` sur chaque fichier.
   - `npm run lint` 100% vert (0 erreurs).
   - `npm run build` 100% vert (44/44 routes compilées avec succès).
