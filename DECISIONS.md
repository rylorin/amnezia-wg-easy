# DECISIONS.md

## Format

Ce fichier enregistre les arbitrages structurants du projet.

## Décisions prises

### 1. Fork de la base existante

Date: à compléter

Décision:
Partir du projet initial et reprendre seulement les modifications utiles provenant d'autres forks.

Motif:
Conserver une base lisible et un historique exploitable.

### 2. Migration TypeScript incrémentale

Date: à compléter

Décision:
Faire coexister JavaScript et TypeScript pendant la migration.

Motif:
Éviter une réécriture massive et garder le projet fonctionnel pendant la transition.

### 3. Packaging Node.js standard

Date: à compléter

Décision:
Refaire le packaging pour obtenir un vrai projet Node.js exécutable directement.

Motif:
Simplifier la maintenance, la compréhension du projet et le suivi des versions.

### 4. Docker minimal

Date: à compléter

Décision:
Conserver Docker comme moyen de déploiement, mais avec une image simple.

Motif:
Réduire la dette de packaging et faciliter le diagnostic.

### 5. Migration vers h3 v2 RC

Date: 2026-08-05

Décision:
Migrer le serveur HTTP vers `h3@2.0.1-rc.26`, en utilisant l'API `H3`, les adaptateurs Node v2, les sessions h3 natives et `serveStatic` v2.

Motif:
Éliminer les incompatibilités observées avec h3 v1 et éviter de conserver des adaptations Node/Express qui contournent le modèle de réponse h3.

Limite:
La version h3 v2 utilisée est une release candidate. Les tests de non-régression doivent être réalisés avant de considérer cette décision comme définitive.

## À venir

- Décisions sur la structure des types partagés.
- Décisions sur les limites du support Amnezia vs WireGuard brut.
