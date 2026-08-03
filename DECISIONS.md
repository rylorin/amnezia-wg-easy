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

## À venir

- Décisions sur le framework HTTP si un changement est nécessaire.
- Décisions sur la structure des types partagés.
- Décisions sur les limites du support Amnezia vs WireGuard brut.
