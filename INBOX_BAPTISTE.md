# 📥 INBOX BAPTISTE — RETOURS BRUTS, IDÉES & BUGS

> **Zone de dépôt & de triage des retours de Baptiste (Co-fondateur & Acquisition)**  
> *Dernière mise à jour* : 2026-10-04 (Triage des 18 vocaux + cours d'histoire 11 pages + retours écrits)

---

## ⚡ Synthèse Analytique par Priorité

### 🔴 P0 — Bugs Critiques & Intégrité Pédagogique
1. **[BUG-003] Incohérence et Hallucination des Réponses d'Examen** :
   - *Problème* : L'IA génère des réponses absurdes (ex: à la question sur la réponse des régimes autoritaires à la crise de 1929, l'IA répond "Le krash boursier de Wall Street le 24 octobre 1929", et confusion sur Front populaire / interventionnisme). Destructeur pour la crédibilité de Loreno.
   - *Action* : Revoir le prompting de validation et forcer la pertinence causale Question $\leftrightarrow$ Réponse.
2. **[BUG-004] Blocage de Progression Roadmap (Nœud 2 bloqué)** :
   - *Problème* : Après avoir complété le quiz 1, impossible de cliquer ou de débloquer le palier 2.
   - *Action* : Corriger l'état d'avancement et la condition d'activation des paliers suivants.
3. **[BUG-005] Déconnexion Mobile Systématique (Persistance Auth)** :
   - *Problème* : Baptiste est déconnecté à chaque réouverture du navigateur mobile et doit se reconnecter.
   - *Action* : Audit des cookies de session Supabase SSR et de la politique de rafraîchissement des tokens.
4. **[BUG-006] Affichage du Paywall pour Utilisateurs Pro** :
   - *Problème* : En étant Pro, le bandeau "débloque tes cours, accès illimité à vie à 9,99€" s'affiche encore.
   - *Action* : Masquer tout CTA de paywall si `is_pro` est vrai + nettoyer le wording "à vie" vers l'abonnement.

---

### 🟠 P1 — Conversion, Acquisition & Qualité de Scan
5. **[FEAT-007] Réduction d'Achat pour le Filleul (Affiliation 2 sens)** :
   - *Problème* : L'affilié gagne 3 jours Pro, mais le nouvel arrivant qui achète n'a pas de réduction incitative.
   - *Action* : Appliquer automatiquement un coupon Stripe (ex: -20% ou premier mois remisé) sur le lien affilié.
6. **[FEAT-008] Densité et Richesse des Fiches sur Scan Multi-Pages (11 pages)** :
   - *Problème* : Avec 11 pages de cours scannées, la fiche générée est moins dense et moins complète qu'avec 4 pages.
   - *Action* : Améliorer le prompt de synthèse multi-documents pour forcer une granularité exhaustive.
7. **[UX-009] Auto-Scroll Palier Actuel + Clic sur Fiche de Révision** :
   - *Problème* : La roadmap Duolingo fait atterrir tout en bas de la page au lieu du palier en cours ; la carte d'en-tête ne permet pas d'ouvrir directement la fiche de cours.
   - *Action* : Centrer le viewport sur le palier actif + rendre la carte de cours cliquable pour voir la fiche.

---

### 🟡 P2 — Ergonomie Tactile & Variété des Quiz
8. **[UX-010] Bouton Copier avec Texte Viral + Agrandissement Boutons Flashcards** :
   - *Action* : Rendre les boutons "Je sais / À revoir" plus volumineux (Thumb Zone) ; "Copier le message" copie le pitch viral + lien (comme WhatsApp).
9. **[FEAT-011] Distracteurs QCM Indépendants & Mode Saisie Libre** :
   - *Action* : Éviter les QCM "permutables / relier les points" ; introduire des questions à réponse directe (input texte).

---

## 🎙️ Transcriptions Intégrales des Vocaux de Baptiste (04/10/2026)

- **Vocal 5 (QCM)** : *"OK, c'est cool ce qu'il y a actuellement. Juste le QCM, faudrait que à chaque question, les questions changent, qu'on puisse pas faire... actuellement il y a 4 réponses et 4 questions associées, c'est comme si tu reliais les points. Idéalement, il faudrait une question, une liste de réponses possibles en rapport avec la question, mais qui n'est pas interchangeable avec autre chose."*
- **Vocal 6 (Saisie libre)** : *"Faudrait aussi des questions où tu remplis toi-même la réponse, ça serait très cool."*
- **Vocal 7 (Exemples)** : *"Par exemple en maths, combien font 3 + 2, tu mets 5... faudrait que je teste quand t'implémenteras ça avec l'histoire."*
- **Vocal 8 (Scroll Duolingo)** : *"Quand t'es sur la page de révision, ça te met d'abord tout en bas du graphique au lieu de te mettre là où en est ta progression comme Duolingo."*
- **Vocal 9 (Boutons Flashcards)** : *"Sur les flashcards, rendre les boutons 'je sais / je sais pas' plus grands. Après, c'est vraiment pas mal."*
- **Vocal 10 (Partage)** : *"Quand tu cliques en bas sur copier le message, ce serait bien que ça copie le même texte que WhatsApp ('Viens réviser sur Loreno 2 min...') en plus du lien."*
- **Vocal 11 (Affiliation)** : *"Aussi, il faut vérifier que l'affiliation marche correctement."*
- **Vocal 12 & 13 (Auth)** : *"À chaque fois que je rouvre Loreno, je suis déconnecté. Je dois recliquer sur se connecter."*
- **Vocal 14 (Paywall & Pro)** : *"Sur le screen, c'est écrit 'débloque tes cours, accès illimité à vie à 9,99'. Faut dégager le 'illimité à vie à 9,99', on passe en abonnement. Et surtout, il est pas censé avoir de message du tout vu que je suis en pro."*
- **Vocal 15 (Photos cours)** : *"Je t'envoie mon cours d'histoire comme ça tu pourras faire des tests avec."* (11 photos dans `docs/cours_baptiste/`).
- **Vocal 16 & 17 (Fiche 11 pages)** : *"Là j'ai mis les 11 pages, et c'est beaucoup moins complet que l'autre résultat que j'avais avec 4 ou 5 pages, au niveau de la fiche."*
- **Vocal 18 (Erreur pédagogique)** : *"Point très très grave, y a une erreur là. C'est pas... Le Front populaire c'est pas un interventionnisme d'État. Si on commence à raconter de la m***e, c'est très très grave."*
- **Vocal 19 (Nœud 2 bloqué)** : *"J'ai terminé le premier quiz, j'ai pas la possibilité de passer au second, ça me laisse pas sélectionner la seconde case."*
- **Vocal 20 (Accès Fiche)** : *"Ce serait bien que quand on clique sur le gros bouton vert tout en haut avec le titre du cours, ça nous affiche la fiche de révision."*
- **Vocal 21 & 22 (Cadence & Alerte)** : *"Est-ce que tu pourrais me faire un topo de si t'as avancé et comment t'avances ? Soit on avance vraiment un max, soit on met de côté... j'ai besoin que tu me tiennes au courant par rapport à ce que tu m'as dit (demi-journée mardi et vendredi)."*
