# PLAN.md

## Vision

Transformer le projet en une base Node.js maintenable, indépendante du packaging actuel, avec migration progressive vers TypeScript.

## Phase 0 - Audit

- [x] Identifier l'état réel du code et du packaging.
- [x] Repérer les points d'entrée de l'application.
- [x] Lister les dépendances actuelles.
- [x] Identifier les parties liées à Amnezia et celles réutilisables pour WireGuard brut.

## Phase 1 - Remise en ordre du projet Node

- [x] Créer un `package.json` correct et complet.
- [x] Définir les scripts de base.
- [x] Clarifier le mode de démarrage local.
- [x] Supprimer les bricolages de packaging inutiles.
- [x] Vérifier que l'application démarre de façon reproductible.

## Phase 2 - Instrumentation

- [x] Ajouter des logs utiles.
- [x] Identifier les routes et flux critiques.
- [x] Ajouter des traces minimales sur les points d'entrée.
- [x] Rendre le diagnostic plus facile.

## Phase 3 - TypeScript incrémental

- [x] Ajouter `tsconfig.json` avec coexistence JS/TS.
- [x] Commencer avec `allowJs: true`.
- [ ] Migrer les modules les plus simples en premier.
- [ ] Introduire les types aux frontières du système.
- [ ] Renforcer progressivement la configuration TypeScript.

## Phase 4 - Simplification du packaging

- [x] Réduire le Dockerfile au strict nécessaire.
- [x] Préparer une exécution via Node standard.
- [x] Garder une image Docker fine, simple et lisible.

## Phase 5 - Stabilisation

- [ ] Nettoyer les avertissements.
- [ ] Documenter les choix structurants.
- [ ] Fixer les règles d'évolution du projet.
- [ ] Préparer les releases futures.

## Règles d'exécution

- Une seule intention par PR.
- Un changement doit être réversible.
- Toute étape doit laisser le projet en état exécutable.
- Pas de migration TypeScript massive d'un seul coup.
