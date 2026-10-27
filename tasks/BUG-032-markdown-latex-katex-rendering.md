---
id: BUG-032
type: bug
priority: P1
author: Baptiste / Julien
title: Rendu KaTeX des formules mathématiques et scientifiques dans les fiches de cours
status: resolved
resolved_at: 2026-10-27
created_at: 2026-10-27
files_impacted:
  - components/markdown-view.tsx
  - lib/markdown-inline.tsx
  - lib/markdown-parser.ts
  - app/layout.tsx
  - package.json
acceptance_criteria:
  - "Les expressions mathématiques inline ($...$) et block ($$...$$) sont rendues proprement via KaTeX au lieu d'afficher du code LaTeX brut ($X = f(C)$, \\Delta X, \\frac{m}{M}, \\lambda)"
  - "Les styles CSS KaTeX sont chargés de manière fiable sans bloquer le rendu"
  - "Aucune régression sur le rendu des tableaux, callouts et code blocks existants"
  - "Build npm run build valide avec 0 erreur"
---

# BUG-032 : Rendu KaTeX des formules mathématiques et scientifiques dans les fiches de cours

## 1. Contexte & Problème Observé
Sur `loreno.app`, lors de l'affichage de fiches de cours scientifiques (ex: cours de chimie/physique avec loi de Beer-Lambert, longueurs d'ondes $\lambda$, quantités de matière $n = C \times V$, fractions $\frac{m}{M}$), les formules LaTeX générées par l'IA s'affichent sous forme brute non interprétée :
- `$X = f(C)$`
- `$\$400\text{ nm} \le \lambda \le 800\text{ nm}\$`
- `$\$n = \frac{m}{M}\$`
- `$\$C_m = C \times M\$$`

Voir capture utilisateur : `media_1793115745575_0673bfe3.png`.

## 2. Cause Racine
Dans `components/markdown-view.tsx` :
- La fonction `renderInline(text)` découpe le texte uniquement par regex sur le gras (`**`), l'italique (`*`) et le code (`\``).
- Aucun parseur de mathématiques (`katex` ou plugin KaTeX) n'est branché pour détecter les délimiteurs mathématiques `$...$` ou `$$...$$`.
- Le CSS de KaTeX n'est pas importé.

## 3. Solution Ciblée (Prête pour implémentation)
1. Intégrer `katex` (ou parseur léger KaTeX inline / display) dans `components/markdown-view.tsx`.
2. Détecter les formules inline `\$([^\$]+)\$` et les blocs `\$\$([^\$]+)\$\$` dans `renderInline` et les blocs de syntaxe.
3. Rendre les formules avec `katex.renderToString(mathStr, { throwOnError: false })` et `dangerouslySetInnerHTML`.
4. Importer `katex/dist/katex.min.css` globalement (dans `app/layout.tsx` ou `components/markdown-view.tsx`).
5. Valider avec `npm run build`.
